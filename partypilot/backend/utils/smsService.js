// backend/utils/smsService.js
const twilio = require('twilio');

let twilioClient = null;

// Initialize Twilio client only if credentials are provided
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    console.log('✅ Twilio SMS service initialized');
  } catch (error) {
    console.warn('⚠️  Twilio initialization failed:', error.message);
  }
} else {
  console.log('ℹ️  Twilio SMS service not configured (optional)');
}

// Send SMS OTP
exports.sendSMSOTP = async (phoneNumber, otp) => {
  if (!twilioClient) {
    console.log(`Mock SMS OTP for ${phoneNumber}: ${otp}`);
    return { success: true, mock: true };
  }

  try {
    const message = await twilioClient.messages.create({
      body: `Your PartyPilot verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    console.log('SMS sent successfully:', message.sid);
    return { success: true, messageSid: message.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
};

// Verify phone number format
exports.validatePhoneNumber = (phoneNumber) => {
  // Basic validation - adjust based on your requirements
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};
