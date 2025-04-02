const express = require("express");
const {
  signup,
  login,
  googleAuth,
  googleCallback,
} = require("../controllers/authController");
const router = express.Router();

// Signup and Login routes
router.post("/signup", signup);
router.post("/login", login);

// Google authentication routes
router.get("/google", googleAuth);
router.post("/google/callback", googleCallback);

module.exports = router;
