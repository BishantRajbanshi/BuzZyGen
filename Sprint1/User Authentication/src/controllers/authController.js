const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const passport = require("../config/passport");

// Signup logic
const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Register user in database
    await userModel.registerUser(name, email, hashedPassword);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login logic
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Google authentication routes
const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const googleCallback = (req, res) => {
  passport.authenticate("google", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Authentication failed" });
    }
    res.json({ token: data.token });
  })(req, res);
};

module.exports = { signup, login, googleAuth, googleCallback };
