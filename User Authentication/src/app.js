const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const passport = require("./config/passport");

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json()); // For parsing JSON bodies
app.use(express.static("public")); // Serve static files (HTML, CSS, JS)

// Initialize passport
app.use(passport.initialize());

// Routes
app.use("/api/auth", authRoutes);

module.exports = app;
