const mongoose = require('mongoose');
const Receipt = require('../models/Receipt');
const User = require('../models/user');
const PremiumUser = require('../models/premium_user');

// Initialize Stripe
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

// Payment Controller Functions
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, plan } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Convert amount to cents for Stripe (amount is in dollars)
    const amountInCents = Math.round(amount * 100);

    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: 'Stripe configuration missing' });
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: {
        userId,
        plan,
      },
      // Enable automatic payment methods for broader payment method support
      automatic_payment_methods: {
        enabled: true,
      },
    });

    if (!paymentIntent) {
      return res.status(500).json({ error: 'Failed to create payment intent' });
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getPaymentPage = async (req, res) => {
  try {
    res.status(200).json({ message: 'Payment page' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const processPayment = async (req, res) => {
  try {
    const { paymentIntentId, plan, amount } = req.body;
    const userId = req.user.id;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    // Fetch user data from database for complete information
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already premium
    const existingPremiumUser = await PremiumUser.findOne({ email: user.email });
    if (existingPremiumUser) {
      return res.status(400).json({ 
        error: 'You are already a premium member. No new payment is required.',
        isPremium: true,
        memberSince: existingPremiumUser.memberSince
      });
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({
        error: 'Payment not confirmed yet',
        status: paymentIntent.status,
      });
    }

    // Convert plan name to match enum values
    const planMap = {
      'monthly': 'Monthly Premium Plan',
      'annual': 'Annual Premium Plan'
    };
    const subscriptionPlan = planMap[plan] || plan;

    // Create receipt in database
    const receipt = new Receipt({
      userId,
      email: user.email,
      firstName: user.firstName || 'User',
      lastName: user.lastName || '',
      phone: user.phone || 'N/A',
      transactionId: paymentIntentId,
      amount,
      subscriptionPlan: subscriptionPlan,
      paymentStatus: 'Completed',
    });

    console.log('[DEBUG] Creating receipt with data:', receipt);
    
    await receipt.save();

    // Create PremiumUser record to mark user as premium
    const premiumUser = new PremiumUser({
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      password: user.password,
      memberSince: new Date()
    });

    await premiumUser.save();

    console.log('[DEBUG] Receipt saved successfully:', receipt._id);
    console.log('[DEBUG] Premium user created:', premiumUser._id);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully! You are now a premium member.',
      receipt: receipt,
      isPremium: true
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getReceipt = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    console.log(`[DEBUG] Fetching receipt for userId: ${userId}`);
    
    const receipt = await Receipt.findOne({ userId }).sort({ createdAt: -1 });

    console.log(`[DEBUG] Receipt found:`, receipt);

    if (!receipt) {
      return res.status(404).json({ error: 'No receipt found', userId: userId });
    }

    res.status(200).json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const receipt = await Receipt.findOne({ userId }).sort({ createdAt: -1 });

    if (!receipt) {
      return res.status(404).json({ subscription: null });
    }

    res.status(200).json({
      subscription: receipt.subscriptionPlan,
      expiryDate: receipt.paymentDate,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTerms = async (req, res) => {
  try {
    res.status(200).json({
      terms: 'Terms and conditions for premium membership',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPrivacy = async (req, res) => {
  try {
    res.status(200).json({
      privacy: 'Privacy policy for GoHire platform',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaymentIntent,
  getPaymentPage,
  processPayment,
  getReceipt,
  getSubscription,
  getTerms,
  getPrivacy
};
