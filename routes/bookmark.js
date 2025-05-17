const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { auth } = require("../middleware/auth");

// POST - Add Bookmark
router.post("/", auth, async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user.id;

  try {
    await pool.query(
      "INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE article_id = article_id",
      [userId, articleId]
    );
    res.status(200).json({ message: "Bookmarked!" });
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ message: "DB error", error: err });
  }
});

// GET - Fetch Bookmarks
router.get("/", auth, async (req, res) => {
  const userId = req.user.id;

  try {
    const [bookmarks] = await pool.query(
      `SELECT n.id, n.title, n.featured_image, n.created_at
       FROM bookmarks b
       JOIN news n ON b.article_id = n.id
       WHERE b.user_id = ?`,
      [userId]
    );

    res.status(200).json(bookmarks);
  } catch (err) {
    console.error("Fetch bookmarks error:", err);
    res.status(500).json({ message: "DB error", error: err });
  }
});

// DELETE - Remove Bookmark
router.delete("/", auth, async (req, res) => {
    const { articleId } = req.body;
    const userId = req.user.id;
  
    try {
      const [result] = await pool.query(
        "DELETE FROM bookmarks WHERE user_id = ? AND article_id = ?",
        [userId, articleId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Bookmark not found" });
      }
  
      res.status(200).json({ message: "Bookmark removed." });
    } catch (err) {
      console.error("Delete bookmark error:", err);
      res.status(500).json({ message: "Failed to delete bookmark", error: err });
    }
  });
  
module.exports = router;
