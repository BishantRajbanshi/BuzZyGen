const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const pool = require("../config/db");
const passport = require("../config/passport");
const { body, validationResult } = require("express-validator");
const emailUtil = require("../utils/email");
const otpUtil = require("../utils/otp");

// Signup route
router.post(
  "/signup",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      const [existingUsers] = await pool.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({
          message:
            "This email is already registered. Please use a different email or login instead.",
          field: "email",
          code: "EMAIL_EXISTS",
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const [result] = await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, hashedPassword, "user"]
      );

      // Generate JWT token with name included
      const token = jwt.sign(
        {
          id: result.insertId,
          email,
          role: "user",
          name: name,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({ token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Check if email exists route
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    // Return whether the email exists (true/false)
    return res.json({ exists: existingUsers.length > 0 });
  } catch (error) {
    console.error("Check email error:", error);
    res.status(500).json({ message: "Server error", exists: false });
  }
});

// Login route
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (users.length === 0) {
        return res.status(400).json({
          message: "Invalid credentials",
          field: "email",
        });
      }

      const user = users[0];

      // Check if user has a password (they might be a Google-only user)
      if (!user.password) {
        // This is a Google-only user who hasn't set a password
        return res.status(400).json({
          message:
            "This account uses Google to sign in. Please use the 'Sign in with Google' option.",
          googleAccount: true,
        });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          message: "Invalid credentials",
          field: "password",
        });
      }

      // Ensure we have a name to include in the token
      const userName = user.name || user.email.split("@")[0];

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          name: userName,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({ token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Google OAuth routes
router.get(
  "/google",
  (req, res, next) => {
    console.log("Starting Google OAuth flow");
    console.log(
      "Google Client ID:",
      process.env.GOOGLE_CLIENT_ID ? "Set" : "Not set"
    );
    console.log(
      "Google Client Secret:",
      process.env.GOOGLE_CLIENT_SECRET ? "Set" : "Not set"
    );
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Google OAuth callback
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("Google OAuth callback received");
    next();
  },
  (req, res, next) => {
    passport.authenticate("google", {
      failureRedirect: "/?auth_error=true",
      session: false,
    })(req, res, next);
  },
  async (req, res) => {
    try {
      // Successful authentication
      const token = req.session.jwt;
      const authAction = req.session.authAction || "login";
      const isNewUser = req.session.isNewUser || false;

      // Log for debugging
      console.log(
        "Authentication successful, token:",
        token ? "Token generated" : "No token"
      );
      console.log("Is new user:", isNewUser);

      // If this is a new user, redirect to complete registration page
      if (isNewUser) {
        // Create a temporary token for the registration page
        const registrationToken = jwt.sign(
          {
            id: req.user.id,
            email: req.user.email,
            name: req.user.name,
            profilePicture: req.user.profile_picture,
            tempAuth: true,
            exp: Math.floor(Date.now() / 1000) + 60 * 30, // 30 minutes expiration
          },
          process.env.JWT_SECRET
        );

        // Clear the jwt from session
        if (req.session) {
          delete req.session.jwt;
          delete req.session.isNewUser;
        }

        // Redirect to complete registration page
        return res.redirect(
          `/complete-registration.html?token=${registrationToken}`
        );
      }

      // For existing users, proceed as normal
      // Clear the jwt from session but keep the session
      if (req.session) {
        delete req.session.jwt;
      }

      // Redirect to the client with the token
      res.redirect(`/auth-success.html?token=${token}`);
    } catch (error) {
      console.error("Error in Google callback:", error);
      res.redirect("/?auth_error=true");
    }
  }
);

// Google login route (for login button)
router.get("/google/login", (req, res) => {
  req.session.authAction = "login";
  res.redirect("/api/auth/google");
});

// Google signup route (for signup button)
router.get("/google/signup", (req, res) => {
  req.session.authAction = "signup";
  res.redirect("/api/auth/google");
});

// Verify token route
router.get("/verify-token", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

// Environment check route for debugging
router.get("/check-env", (req, res) => {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  return res.json({
    googleClientId: googleClientId || false,
    googleClientSecret: googleClientSecret || false,
    callbackUrl: `${req.protocol}://${req.get(
      "host"
    )}/api/auth/google/callback`,
  });
});

// Forgot password route - Step 1: Request OTP
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Please enter a valid email"),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email } = req.body;

      // Check if user exists
      const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      // Don't reveal if user exists or not for security reasons
      if (users.length === 0) {
        return res.status(200).json({
          message:
            "If your email is registered, you will receive an OTP shortly.",
          success: true,
        });
      }

      const user = users[0];

      // Check if user has a password (not a Google user)
      if (user.google_id && !user.password) {
        return res.status(400).json({
          message:
            "This account uses Google to sign in. Please use the 'Sign in with Google' option.",
          googleAccount: true,
        });
      }

      // Generate a 6-digit OTP
      const otp = otpUtil.generateOTP(6);

      // Set expiration time (15 minutes)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15);

      // Delete any existing OTPs for this user
      await pool.query("DELETE FROM password_reset_otps WHERE user_id = ?", [
        user.id,
      ]);

      // Save the OTP in the database
      await pool.query(
        "INSERT INTO password_reset_otps (user_id, email, otp, expires_at) VALUES (?, ?, ?, ?)",
        [user.id, email, otp, expiresAt]
      );

      // Send OTP email
      const emailResult = await emailUtil.sendPasswordResetOTP(email, otp);

      // Check if this is a Gmail account
      const isGmailAccount = email.toLowerCase().endsWith("@gmail.com");

      // In development mode without email credentials, show the OTP in the response
      if (emailResult.simulated) {
        return res.status(200).json({
          message:
            "OTP generated and sent. In development mode, the OTP is included in the response.",
          otp: otp,
          devMode: true,
          success: true,
        });
      } else if (!isGmailAccount) {
        // For non-Gmail accounts, inform the user that the OTP was sent to the admin
        return res.status(200).json({
          message:
            "OTP has been sent to the admin email (skrishals.000@gmail.com). Please contact the admin to get your OTP.",
          success: true,
          adminEmail: true,
        });
      } else {
        // For Gmail accounts, OTP is sent directly to the user
        return res.status(200).json({
          message:
            "If your email is registered, you will receive an OTP shortly.",
          success: true,
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Verify OTP route - Step 2: Verify OTP
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, otp } = req.body;

      // Check if OTP exists and is not expired
      const [otpRecords] = await pool.query(
        "SELECT * FROM password_reset_otps WHERE email = ? AND otp = ? AND expires_at > NOW()",
        [email, otp]
      );

      if (otpRecords.length === 0) {
        return res.status(400).json({
          valid: false,
          message: "Invalid or expired OTP. Please request a new OTP.",
        });
      }

      const otpRecord = otpRecords[0];

      // Generate a temporary token for the reset password step
      const resetToken = jwt.sign(
        {
          userId: otpRecord.user_id,
          email: email,
          otpVerified: true,
          exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes expiration
        },
        process.env.JWT_SECRET
      );

      return res.status(200).json({
        valid: true,
        message: "OTP verified successfully",
        token: resetToken,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

// Reset password route - Step 3: Set new password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { token, password } = req.body;

      // Verify the token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if this is an OTP-verified token
        if (!decoded.otpVerified) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid token. Please complete the OTP verification first.",
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired token. Please request a new password reset.",
        });
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update the user's password
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        decoded.userId,
      ]);

      // Delete any used OTPs for this user
      await pool.query("DELETE FROM password_reset_otps WHERE user_id = ?", [
        decoded.userId,
      ]);

      // Get the user data for generating login token
      const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
        decoded.userId,
      ]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = users[0];

      // Generate a JWT token for automatic login
      const loginToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role || "user",
          name: user.name,
          profile_picture: user.profile_picture,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.status(200).json({
        success: true,
        message: "Password has been reset successfully.",
        token: loginToken,
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// Get Google user data for complete registration page
router.get("/google-user-data", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if this is a temporary auth token
      if (!decoded.tempAuth) {
        return res.status(403).json({
          success: false,
          message: "Invalid token type",
        });
      }

      return res.json({
        success: true,
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        profilePicture: decoded.profilePicture,
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  } catch (error) {
    console.error("Error getting Google user data:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// Complete Google registration (set password)
router.post(
  "/complete-google-registration",
  body("userId").notEmpty().withMessage("User ID is required"),
  body("token").notEmpty().withMessage("Token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { userId, token, password } = req.body;

      // Verify the token
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if this is a temporary auth token and matches the user ID
        if (!decoded.tempAuth || decoded.id != userId) {
          return res.status(403).json({
            success: false,
            message: "Invalid token",
          });
        }
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired token",
        });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Update the user's password
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      // Get the updated user
      const [users] = await pool.query("SELECT * FROM users WHERE id = ?", [
        userId,
      ]);

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const user = users[0];

      // Generate a new JWT token
      const newToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role || "user",
          name: user.name,
          profile_picture: user.profile_picture,
        },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      return res.json({
        success: true,
        message: "Registration completed successfully",
        token: newToken,
        redirectUrl: "/dashboard.html",
      });
    } catch (error) {
      console.error("Error completing Google registration:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;
