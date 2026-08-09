const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const registerUser = async (req, res) => {
    try {
        const { shopName, ownerName, email, password } = req.body;

        if (!shopName || !ownerName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            shopName,
            ownerName,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            _id: user._id,
            shopName: user.shopName,
            ownerName: user.ownerName,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        res.json({
            _id: user._id,
            shopName: user.shopName,
            ownerName: user.ownerName,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route PUT /api/auth/profile
// Lets an existing account add/update ownerName or shopName without re-registering
const updateProfile = async (req, res) => {
    try {
        const { shopName, ownerName } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (shopName) user.shopName = shopName;
        if (ownerName) user.ownerName = ownerName;
        await user.save();

        res.json({
            _id: user._id,
            shopName: user.shopName,
            ownerName: user.ownerName,
            email: user.email,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        // Always respond the same way, whether or not the email exists —
        // this prevents someone from checking which emails are registered
        if (!user) {
            return res.json({
                message: "If that email is registered, a reset link has been sent.",
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await sendEmail({
            to: user.email,
            subject: "Reset your Sinha Drug Agency password",
            html: `
        <p>Hello ${user.ownerName || user.shopName},</p>
        <p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
        });

        res.json({ message: "If that email is registered, a reset link has been sent." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: "Reset link is invalid or has expired" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: "Password reset successful. You can now log in." });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { registerUser, loginUser, updateProfile, forgotPassword, resetPassword };