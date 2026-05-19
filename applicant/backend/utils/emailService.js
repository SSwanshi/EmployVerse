const https = require('https');

// Check if EmailJS is configured
const isEmailConfigured = () => {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  return !!(serviceId && templateId && privateKey && publicKey);
};

// Initialize EmailJS configuration check
if (isEmailConfigured()) {
  console.log('✅ EmailJS configuration detected');
  console.log('✅ EmailJS service is ready to send messages via REST API');
} else {
  console.warn('⚠️  EmailJS credentials not configured. OTP will be logged to console instead of sending emails.');
  console.warn('   To enable email sending, set EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, and EMAILJS_PRIVATE_KEY in your .env file');
}

const sendOtpEmail = async (email, otp) => {
  // Check if EmailJS is properly configured
  if (!isEmailConfigured()) {
    const error = new Error('EmailJS is not properly configured. Please check your environment variables.');
    console.error('❌ EmailJS configuration error:', error.message);
    throw error;
  }

  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  // Template parameters - these should match your EmailJS template variables
  // Variable names for OTP email template:
  // - recipient_email: User's email address
  // - recipient_name: User's name (extracted from email)
  // - otp_code: The 6-digit OTP code
  // - otp_expiry: OTP expiration time (in minutes)
  // - app_name: Application name
  const templateParams = {
    recipient_email: email,
    recipient_name: email.split('@')[0], // Extract name from email
    otp_code: otp,
    otp_expiry: '10', // 10 minutes
    app_name: 'GoHire',
  };

  const publicKey = process.env.EMAILJS_PUBLIC_KEY;

  console.log('📧 Attempting to send OTP email via EmailJS REST API...');
  console.log('Service ID:', serviceId);
  console.log('Template ID:', templateId);
  console.log('User ID (Public Key):', publicKey);
  console.log('Recipient:', email);
  console.log('Template params:', JSON.stringify(templateParams, null, 2));

  // Use EmailJS REST API directly with private key (access token)
  // This bypasses the browser-only restriction
  // Format: https://api.emailjs.com/api/v1.0/email/send
  // Note: Make sure the template_id exists in your EmailJS dashboard
  // and belongs to the same account as the user_id (public key)
  const postData = JSON.stringify({
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey, // Public key (user_id) - must match the account that owns the template
    accessToken: privateKey, // Private key as access token for server-side
    template_params: templateParams
  });

  console.log('Request payload:', postData);

  const options = {
    hostname: 'api.emailjs.com',
    port: 443,
    path: '/api/v1.0/email/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'Origin': 'http://localhost:3000' // Some EmailJS endpoints require origin
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ OTP email sent successfully via EmailJS to:', email);
          console.log('EmailJS response:', responseData);
          resolve({ success: true, messageId: responseData || 'emailjs-sent' });
        } else {
          let errorMessage = 'Failed to send OTP email. ';
          try {
            const errorData = JSON.parse(responseData);
            errorMessage += errorData.text || errorData.message || `HTTP ${res.statusCode}`;
          } catch (e) {
            errorMessage += `HTTP ${res.statusCode}: ${responseData}`;
          }

          console.error('❌ Error sending OTP email via EmailJS');
          console.error('Status Code:', res.statusCode);
          console.error('Response:', responseData);

          const error = new Error(errorMessage);
          error.status = res.statusCode;
          error.response = responseData;
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Network error sending OTP email:', error.message);
      reject(new Error(`Network error: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
};

module.exports = {
  sendOtpEmail,
};

