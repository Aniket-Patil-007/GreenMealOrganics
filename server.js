// Backend server for OTP functionality
const express = require('express');
const twilio = require('twilio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Twilio credentials (use environment variables in production)
const accountSid = process.env.TWILIO_ACCOUNT_SID || 'your_account_sid';
const authToken = process.env.TWILIO_AUTH_TOKEN || 'your_auth_token';
const twilioPhone = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
const client = twilio(accountSid, authToken);

// Store OTPs temporarily (use Redis in production)
const otpStore = {};

// Generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint
app.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
        return res.status(400).json({ error: 'Invalid phone number. Must be 10 digits.' });
    }

    try {
        const otp = generateOTP();
        const fullPhoneNumber = `+91${phoneNumber}`; // India country code

        // Store OTP with 5-minute expiry
        otpStore[phoneNumber] = {
            otp: otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        // Send SMS via Twilio
        await client.messages.create({
            body: `Your GreenMealOrganics OTP is: ${otp}. Valid for 5 minutes.`,
            from: twilioPhone,
            to: fullPhoneNumber
        });

        console.log(`OTP sent to ${fullPhoneNumber}: ${otp}`);
        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
    }
});

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({ error: 'Phone number and OTP required' });
    }

    const storedData = otpStore[phoneNumber];

    // Check if OTP exists and hasn't expired
    if (!storedData) {
        return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
        delete otpStore[phoneNumber];
        return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (storedData.otp !== otp) {
        return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    // OTP verified successfully
    delete otpStore[phoneNumber];
    res.json({ success: true, message: 'Login successful', phoneNumber });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
