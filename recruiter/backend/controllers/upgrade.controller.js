const fs = require('fs');
const path = require('path');
const User = require('../models/User');

// Helper to parse simple key=value .env file
const parseEnvFile = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split(/\r?\n/);
    const env = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const idx = trimmed.indexOf('=');
      if (idx === -1) return;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    });
    return env;
  } catch (err) {
    return null;
  }
};

// Helper to get stripe instance
const getStripe = () => {
  const envPath = path.resolve(__dirname, '..', '..', 'applicant', 'backend', '.env');
  let env = parseEnvFile(envPath);
  if (!env) {
    const altPath = path.resolve(__dirname, '..', '..', '..', 'applicant', 'backend', '.env');
    env = parseEnvFile(altPath);
  }
  const stripeSecret = (env && env.STRIPE_SECRET_KEY) || process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) return null;
  return require('stripe')(stripeSecret);
};

const createCheckoutSession = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe configuration missing' });
    }

    // Only supporting Pro monthly plan for now
    const PRICE_INR = 999;
    const unitAmount = PRICE_INR * 100; // in paise

    const origin = process.env.FRONTEND_URL || req.headers.origin || `http://localhost:5175`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'Recruiter Pro - Monthly',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/upgrade?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade?checkout=cancel`,
      metadata: {
        recruiterId: req.userId ? String(req.userId) : 'unknown'
      }
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// After successful Stripe checkout, frontend calls this to verify and activate premium
const verifySession = async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ success: false, message: 'Session ID is required' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(500).json({ success: false, message: 'Stripe configuration missing' });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    // Verify that this session belongs to the current user
    const recruiterId = session.metadata?.recruiterId;
    const currentUserId = String(req.userId);

    if (recruiterId !== currentUserId && recruiterId !== 'unknown') {
      return res.status(403).json({ success: false, message: 'Session does not belong to this user' });
    }

    // Mark the user as premium
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { isPremium: true },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User ${updatedUser.email} upgraded to Premium`);

    return res.json({
      success: true,
      message: 'Premium activated successfully!',
      isPremium: true
    });
  } catch (error) {
    console.error('Error verifying checkout session:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCheckoutSession,
  verifySession
};
