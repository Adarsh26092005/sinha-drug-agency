const express = require("express");
const {
    registerUser,
    loginUser,
    updateProfile,
    forgotPassword,
    resetPassword,
} = require("../controllers/authController");
const protect = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/profile", protect, updateProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;