const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const OTP = require('../models/OTP');
const { sendOTP } = require('../services/emailService');
const { otpRequestLimiter, otpVerifyLimiter } = require('../middleware/rateLimiter');

const getAdminContactEmail = () => {
    return process.env.ADMIN_EMAIL || 'mohittttttt48@gmail.com';
};

// Phase 1: Request OTP for Signup
router.post('/register-otp', [
    otpRequestLimiter,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'An account with this email already exists and is verified. Please login.' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB (will overwrite any existing OTP for this email due to logic or TTL)
        await OTP.findOneAndUpdate(
            { email: normalizedEmail },
            { otp, createdAt: new Date() },
            { upsert: true, new: true }
        );

        // Send OTP via Email and report delivery status
        const emailResult = await sendOTP(normalizedEmail, otp);
        const isDev = process.env.NODE_ENV !== 'production';

        if (!emailResult.sent) {
            return res.status(503).json({
                error: 'Unable to deliver OTP email right now. Please try again in a minute.',
                ...(isDev ? { emailError: emailResult.error } : {})
            });
        }

        res.status(200).json({
            message: 'OTP sent to your email successfully.',
            emailSent: true
        });
    } catch (error) {
        console.error('Register-OTP Error:', error);
        res.status(500).json({ error: `Server error: ${error.message || 'OTP request failed'}` });
    }
});

// Phase 2: Verify OTP and Create Account
router.post('/register-verify', [
    otpVerifyLimiter,
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['student', 'recruiter']).withMessage('Role must be student or recruiter'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, password, role, otp } = req.body;
        const email = req.body.email.toLowerCase().trim();

        // Check OTP
        const otpRecord = await OTP.findOne({ email, otp });
        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Final duplicate check just in case
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ error: 'Email already verified and registered.' });
        }

        // If unverified user exists, update them, else create new
        let user;
        if (existingUser) {
            existingUser.name = name;
            existingUser.password = password;
            existingUser.role = role;
            existingUser.isVerified = true;
            user = await existingUser.save();
        } else {
            user = new User({ name, email, password, role, isVerified: true });
            await user.save();
        }

        // Delete successful OTP record
        await OTP.deleteOne({ _id: otpRecord._id });

        // Notify Admins of new registration
        const Notification = require('../models/Notification');
        const admins = await User.find({ role: 'admin' });
        for (const admin of admins) {
            await new Notification({
                user: admin._id,
                title: user.role === 'recruiter' ? 'New Recruiter Approval' : 'New Student Registered',
                message: `${user.name} has registered as a ${user.role}.`,
                type: user.role === 'recruiter' ? 'warning' : 'info',
                link: user.role === 'recruiter' ? '/admin/recruiters' : '/admin/students'
            }).save();
        }

        // Phase 11: Do not issue token if recruiter is not approved
        if (user.role === 'recruiter' && user.isApprovedByAdmin !== true) {
            return res.status(201).json({
                user,
                message: 'Account verified! Pending admin approval.',
                adminEmail: getAdminContactEmail()
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

        res.status(201).json({ token, user, message: 'Account verified and created successfully!' });
    } catch (error) {
        console.error('Verify-OTP Error:', error);
        res.status(500).json({ error: 'Server error during verification' });
    }
});

// Login
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Always normalize email to lowercase
        const email = req.body.email.toLowerCase().trim();
        const { password } = req.body;

        console.log(`Login attempt for: ${email}`);

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`Login failed: No user found with email ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Account not verified. Please register again to verify your email.' });
        }

        // Phase 11: Recruiter Approval Block
        // We MUST explicitly check role === 'recruiter' here because old student accounts 
        // will not have isApprovedByAdmin defined in their documents at all.
        if (user.role === 'recruiter') {
            if (user.isApprovedByAdmin !== true) {
                console.log(`Login blocked: Recruiter ${email} is pending admin approval.`);
                return res.status(403).json({ error: 'Your recruiter account is pending Admin approval. You will gain access once verified.' });
            }
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log(`Login failed: Incorrect password for ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        console.log(`Login success for: ${email} (${user.role})`);
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

        res.json({ token, user });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: error.message || 'Server error during login', stack: error.stack });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;

