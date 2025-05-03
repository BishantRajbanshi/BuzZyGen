const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get single article
router.get("/:id", async (req, res) => {
  try {
    const [articles] = await pool.query("SELECT * FROM news WHERE id = ?", [
      req.params.id,
    ]);

    if (articles.length === 0) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.json(articles[0]);
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ message: "Error fetching article" });
  }
});

module.exports = router;
