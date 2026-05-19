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
} else {
    console.warn('⚠️  EmailJS credentials not configured. OTP will be logged to console instead of sending emails.');
}

const sendOtpEmail = async (email, otp) => {
    // Check if EmailJS is properly configured
    if (!isEmailConfigured()) {
        console.warn('⚠️ OTP for ' + email + ': ' + otp); // For testing when not configured
        if (process.env.NODE_ENV === 'production') {
            throw new Error('EmailJS is not properly configured. Please check your environment variables.');
        }

        return {
            success: true,
            delivered: false,
            message: 'EmailJS is not configured. OTP logged to server console for local testing.'
        };
    }

    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    const templateParams = {
        recipient_email: email,
        recipient_name: email.split('@')[0],
        otp_code: otp,
        otp_expiry: '10',
        app_name: 'GoHire Admin',
    };

    const postData = JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: templateParams
    });

    const options = {
        hostname: 'api.emailjs.com',
        port: 443,
        path: '/api/v1.0/email/send',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Origin': 'http://localhost:9000'
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('✅ OTP email sent successfully to:', email);
                    resolve({ success: true, delivered: true });
                } else {
                    console.error('❌ EmailJS Error:', responseData);
                    reject(new Error(`EmailJS Error ${res.statusCode}: ${responseData}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Network error: ${error.message}`));
        });

        req.write(postData);
        req.end();
    });
};

module.exports = {
    sendOtpEmail,
};
