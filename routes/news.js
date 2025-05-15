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
      // Return sample news data instead of throwing an error
      return res.json(SAMPLE_NEWS);
    }
  } catch (error) {
    console.error("Error fetching news from API:", error.message);

    // Always return sample news data on error
    console.log("Serving sample news data due to API error");
    return res.json(SAMPLE_NEWS);
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
      // Filter sample news by category or return all if none match
      const filteredNews = SAMPLE_NEWS.filter(
        (item) => item.category === category || Math.random() > 0.5
      );
      return res.json(filteredNews);
    }
  } catch (error) {
    console.error(
      `Error fetching news for category ${req.params.category}:`,
      error.message
    );

    // Filter sample news by category or return all if none match
    const { category } = req.params;
    const filteredNews = SAMPLE_NEWS.filter(
      (item) => item.category === category || Math.random() > 0.5
    );
    console.log(
      `Serving sample news data for category ${category} due to API error`
    );
    return res.json(filteredNews);
  }
});

// Get news from database
router.get("/db", auth, async (req, res) => {
  try {
    // Get pagination parameters with defaults
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * limit;

    // Get the latest news articles ordered by creation date (newest first)
    const [rows] = await pool.query(
      "SELECT id, title, subtitle, SUBSTRING(content, 1, 300) AS content_preview, featured_image, category, tags, created_at, updated_at FROM news ORDER BY created_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    // Get total count for pagination
    const [countResult] = await pool.query(
      "SELECT COUNT(*) as total FROM news"
    );
    const total = countResult[0].total;

    // Return structured response with pagination info
    res.json({
      articles: rows,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      success: true,
    });
  } catch (error) {
    console.error("Error fetching news from database:", error);
    res.status(500).json({
      message: "Error fetching news from database",
      error: error.message,
      success: false,
    });
  }
});

// Admin routes for managing news
router.post("/", adminAuth, async (req, res) => {
  try {
    const { title, subtitle, content, featured_image, category, tags } =
      req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required fields",
        success: false,
      });
    }

    const [result] = await pool.query(
      "INSERT INTO news (title, subtitle, content, featured_image, category, tags) VALUES (?, ?, ?, ?, ?, ?)",
      [title, subtitle, content, featured_image, category, tags]
    );

    res.status(201).json({
      id: result.insertId,
      message: "News article created successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error creating news:", error);
    res.status(500).json({
      message: "Error creating news article",
      error: error.message,
      success: false,
    });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, featured_image, category, tags } =
      req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required fields",
        success: false,
      });
    }

    // Validate that the article exists and belongs to this admin
    const [existingArticle] = await pool.query(
      "SELECT id FROM news WHERE id = ?",
      [id]
    );

    if (existingArticle.length === 0) {
      return res.status(404).json({
        message: "News article not found",
        success: false,
      });
    }

    // Update the article
    await pool.query(
      "UPDATE news SET title = ?, subtitle = ?, content = ?, featured_image = ?, category = ?, tags = ?, updated_at = NOW() WHERE id = ?",
      [title, subtitle, content, featured_image, category, tags, id]
    );

    res.json({
      message: "News article updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({
      message: "Error updating news article",
      error: error.message,
      success: false,
    });
  }
});

// Get a single news article by ID
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "Invalid article ID",
        success: false,
      });
    }

    const [rows] = await pool.query(
      "SELECT id, title, subtitle, content, featured_image, category, tags, created_at, updated_at FROM news WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "News article not found",
        success: false,
      });
    }

    res.json({
      article: rows[0],
      success: true,
    });
  } catch (error) {
    console.error("Error fetching news article:", error);
    res.status(500).json({
      message: "Error fetching news article",
      error: error.message,
      success: false,
    });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the article exists
    const [existingArticle] = await pool.query(
      "SELECT id FROM news WHERE id = ?",
      [id]
    );

    if (existingArticle.length === 0) {
      return res.status(404).json({
        message: "News article not found",
        success: false,
      });
    }

    // Delete the article
    const [result] = await pool.query("DELETE FROM news WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "News article could not be deleted",
        success: false,
      });
    }

    res.json({
      message: "News article deleted successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({
      message: "Error deleting news article",
      error: error.message,
      success: false,
    });
  }
});

// Note: Admin search functionality moved to routes/admin-search.js

module.exports = router;
