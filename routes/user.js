const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { auth } = require("../middleware/auth");
const bcrypt = require("bcryptjs");


// Get logged-in user profile + saved article count
router.get("/me", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [[user]] = await pool.query(
      "SELECT name, email, role, created_at, profile_picture FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const [[{ count }]] = await pool.query(
      "SELECT COUNT(*) AS count FROM bookmarks WHERE user_id = ?",
      [userId]
    );

    console.log("👉 User found:", user); // 🔥 ADD THIS LINE

    res.status(200).json({
      ...user,
      savedCount: count,
    });
  } catch (err) {
    console.error("User profile fetch error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});


// Configure storage
router.put("/profile-picture", auth, async (req, res) => {
  const { profile_picture } = req.body;
  try {
    await pool.query("UPDATE users SET profile_picture = ? WHERE id = ?", [profile_picture, req.user.id]);
    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (err) {
    console.error("Failed to update profile picture:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/user/delete
router.delete("/delete", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    // Delete related bookmarks and blogs before deleting the user
    await pool.query("DELETE FROM bookmarks WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM blogs WHERE user_id = ?", [userId]);
    await pool.query("DELETE FROM users WHERE id = ?", [userId]);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Change password route
router.put("/change-password", auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // 1. Get current hashed password from DB
    const [[user]] = await pool.query("SELECT password FROM users WHERE id = ?", [userId]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare current password with hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update the password
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password update error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//notification settings
router.put('/notifications', auth, async (req, res) => {
  let { notifications_enabled } = req.body;
  const userId = req.user.id;

  try {
    // Ensure it's a boolean 1 or 0
    const enabled = notifications_enabled === true || notifications_enabled === "true" ? 1 : 0;

    console.log("Toggle value received:", notifications_enabled, "Converted to:", enabled);

    await pool.query(
      "UPDATE users SET notifications_enabled = ? WHERE id = ?",
      [enabled, userId]
    );
    res.json({ message: "Notification updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update setting" });
  }
});

// Get all users with role 'user' (for admin panel)
router.get("/all", auth, async (req, res) => {
  try {
    const [users] = await pool.query(
      "SELECT id, name, email, created_at, profile_picture FROM users WHERE role = 'user'"
    );
    res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching users for admin:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});


module.exports = router;
