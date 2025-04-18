const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../config/db");
const { auth, adminAuth } = require("../middleware/auth");

// Fetch news from external API
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.json(response.data.articles);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ message: "Error fetching news" });
  }
});

// Get news by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`
    );
    res.json(response.data.articles);
  } catch (error) {
    console.error("Error fetching category news:", error);
    res.status(500).json({ message: "Error fetching category news" });
  }
});

// Admin routes for managing news
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, description, content, imageUrl, category } = req.body;
    const [result] = await pool.query(
      "INSERT INTO news (title, description, content, imageUrl, category) VALUES (?, ?, ?, ?, ?)",
      [title, description, content, imageUrl, category]
    );
    res
      .status(201)
      .json({
        id: result.insertId,
        message: "News article created successfully",
      });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({ message: "Error creating news article" });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, imageUrl, category } = req.body;
    await pool.query(
      "UPDATE news SET title = ?, description = ?, content = ?, imageUrl = ?, category = ? WHERE id = ?",
      [title, description, content, imageUrl, category, id]
    );
    res.json({ message: "News article updated successfully" });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ message: "Error updating news article" });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM news WHERE id = ?", [id]);
    res.json({ message: "News article deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ message: "Error deleting news article" });
  }
});

module.exports = router;
