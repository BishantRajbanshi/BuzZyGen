const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { auth } = require("../middleware/auth");

// Get logged-in user profile + saved article count
router.get("/me", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [[user]] = await pool.query(
      "SELECT name, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?",
      [userId]
    );

    res.status(200).json({
      ...user,
      savedCount: count,
    });
  } catch (err) {
    console.error("User profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

module.exports = router;
