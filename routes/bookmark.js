// routes/bookmark.js
const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // ✅ Correct import
const {auth} = require("../middleware/auth"); // ✅ JWT middleware

router.post("/", auth, async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user.id;

  try {
    await pool.query( // ✅ use 'pool', not 'db'
      "INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE article_id = article_id",
      [userId, articleId]
    );
    res.status(200).json({ message: "Bookmarked!" });
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ message: "DB error", error: err });
  }
});


module.exports = router;
