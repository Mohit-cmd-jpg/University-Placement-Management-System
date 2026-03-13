const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"UniPlacements Portal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification – UniPlacements Portal',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                <h2 style="color: #2563eb; text-align: center;">UniPlacements Portal</h2>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p>Hello,</p>
                <p>Your OTP for account verification is:</p>
                <div style="background: #f1f5f9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #0f172a;">${otp}</span>
                </div>
                <p>This OTP will expire in <strong>5 minutes</strong>.</p>
                <p style="color: #64748b; font-size: 14px;">If you did not request this code, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="text-align: center; color: #475569; font-size: 12px;">&copy; 2026 UniPlacements Portal. All rights reserved.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${email}`);
        return {
            sent: true,
            messageId: info?.messageId || null
        };
    } catch (error) {
        console.error('SMTP Connection Blocked:', error.message);
        return {
            sent: false,
            error: error.message || 'Unable to send OTP email'
        };
    }
};

module.exports = { sendOTP };
