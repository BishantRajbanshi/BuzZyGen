const express = require("express");
const router = express.Router();
const axios = require("axios");
const pool = require("../config/db");
const { auth, adminAuth } = require("../middleware/auth");

// Simple in-memory cache
const newsCache = {
  general: {
    data: null,
    timestamp: 0,
  },
  categories: {},
};

// Cache duration in milliseconds (15 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

// Sample news data for fallback
const SAMPLE_NEWS = [
  {
    title: "Technology Trends for 2024",
    description:
      "Discover the latest technology trends that are shaping our future.",
    urlToImage: "https://via.placeholder.com/800x400?text=Technology+Trends",
    publishedAt: new Date().toISOString(),
    category: "technology",
    url: "#",
  },
  {
    title: "Global Economic Outlook",
    description:
      "Experts analyze the current state of the global economy and future projections.",
    urlToImage: "https://via.placeholder.com/800x400?text=Economic+Outlook",
    publishedAt: new Date().toISOString(),
    category: "business",
    url: "#",
  },
  {
    title: "Health and Wellness Tips",
    description:
      "Simple lifestyle changes that can significantly improve your overall health and wellbeing.",
    urlToImage: "https://via.placeholder.com/800x400?text=Health+Tips",
    publishedAt: new Date().toISOString(),
    category: "health",
    url: "#",
  },
  {
    title: "Sports Highlights of the Week",
    description:
      "Catch up on all the major sporting events and highlights from around the world.",
    urlToImage: "https://via.placeholder.com/800x400?text=Sports+Highlights",
    publishedAt: new Date().toISOString(),
    category: "sports",
    url: "#",
  },
  {
    title: "Entertainment News Roundup",
    description:
      "The latest updates from the world of entertainment, movies, music, and celebrity news.",
    urlToImage: "https://via.placeholder.com/800x400?text=Entertainment+News",
    publishedAt: new Date().toISOString(),
    category: "entertainment",
    url: "#",
  },
  {
    title: "Science Breakthroughs This Month",
    description:
      "Exciting new discoveries and advancements in the world of science and research.",
    urlToImage: "https://via.placeholder.com/800x400?text=Science+News",
    publishedAt: new Date().toISOString(),
    category: "science",
    url: "#",
  },
];

// Initialize cache with sample data
newsCache.general.data = SAMPLE_NEWS;
newsCache.general.timestamp = Date.now();

// Initialize category caches
const categories = [
  "business",
  "entertainment",
  "health",
  "science",
  "sports",
  "technology",
];
categories.forEach((category) => {
  newsCache.categories[category] = {
    data: SAMPLE_NEWS.filter(
      (item) => item.category === category || Math.random() > 0.5
    ),
    timestamp: Date.now(),
  };
});

// Fetch news from external API
router.get("/", async (req, res) => {
  try {
    // Always try to fetch fresh data first
    console.log("Fetching fresh news data from API...");
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`,
      {
        headers: {
          "X-Api-Key": process.env.NEWS_API_KEY,
          "User-Agent": "news-portal/1.0",
        },
        timeout: 8000, // 8 second timeout
      }
    );

    if (
      response.data &&
      response.data.articles &&
      response.data.articles.length > 0
    ) {
      // Update cache with fresh data
      const now = Date.now();
      newsCache.general.data = response.data.articles;
      newsCache.general.timestamp = now;
      console.log(
        `Successfully fetched ${response.data.articles.length} articles from News API`
      );

      return res.json(response.data.articles);
    } else {
      console.warn("News API returned empty articles array");
      throw new Error("No articles found in API response");
    }
  } catch (error) {
    console.error("Error fetching news from API:", error.message);

    // If we have cached data, return it as a fallback
    const now = Date.now();
    if (newsCache.general.data) {
      const cacheAge = now - newsCache.general.timestamp;
      console.log(
        `Serving cached data (${Math.round(
          cacheAge / 1000 / 60
        )} minutes old) due to API error`
      );
      return res.json(newsCache.general.data);
    }

    // Handle specific error types
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        message: "News API request timed out",
        error: error.message,
        source: "NewsAPI",
      });
    }

    if (error.response && error.response.status) {
      return res.status(error.response.status).json({
        message: `News API returned ${error.response.status} status`,
        error: error.message || "Unknown error",
        source: "NewsAPI",
      });
    }

    // Return a more descriptive error message for other errors
    res.status(500).json({
      message: "Error fetching news",
      error: error.message || "Unknown error",
      source: "NewsAPI",
    });
  }
});

// Get news by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;

    // Always try to fetch fresh data first
    console.log(`Fetching fresh news data for category: ${category}...`);
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&category=${category}&apiKey=${process.env.NEWS_API_KEY}`,
      {
        headers: {
          "X-Api-Key": process.env.NEWS_API_KEY,
          "User-Agent": "news-portal/1.0",
        },
        timeout: 8000, // 8 second timeout
      }
    );

    if (
      response.data &&
      response.data.articles &&
      response.data.articles.length > 0
    ) {
      // Update cache with fresh data
      const now = Date.now();
      if (!newsCache.categories[category]) {
        newsCache.categories[category] = {};
      }
      newsCache.categories[category].data = response.data.articles;
      newsCache.categories[category].timestamp = now;
      console.log(
        `Successfully fetched ${response.data.articles.length} articles for category: ${category}`
      );

      return res.json(response.data.articles);
    } else {
      console.warn(
        `News API returned empty articles array for category: ${category}`
      );
      throw new Error(
        `No articles found in API response for category: ${category}`
      );
    }
  } catch (error) {
    console.error(
      `Error fetching news for category ${req.params.category}:`,
      error.message
    );

    // If we have cached data for this category, return it as a fallback
    const { category } = req.params;
    const now = Date.now();
    if (newsCache.categories[category] && newsCache.categories[category].data) {
      const cacheAge = now - newsCache.categories[category].timestamp;
      console.log(
        `Serving cached data for category ${category} (${Math.round(
          cacheAge / 1000 / 60
        )} minutes old) due to API error`
      );
      return res.json(newsCache.categories[category].data);
    }

    // Handle specific error types
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return res.status(504).json({
        message: "News API request timed out",
        error: error.message,
        source: "NewsAPI",
        category: req.params.category,
      });
    }

    if (error.response && error.response.status) {
      return res.status(error.response.status).json({
        message: `News API returned ${error.response.status} status`,
        error: error.message || "Unknown error",
        source: "NewsAPI",
        category: req.params.category,
      });
    }

    // Return a more descriptive error message for other errors
    res.status(500).json({
      message: "Error fetching category news",
      error: error.message || "Unknown error",
      source: "NewsAPI",
      category: req.params.category,
    });
  }
});

// Get news from database
router.get("/db", auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM news ORDER BY created_at DESC LIMIT 20"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching news from database:", error);
    res.status(500).json({ message: "Error fetching news from database" });
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
    res.status(201).json({
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
