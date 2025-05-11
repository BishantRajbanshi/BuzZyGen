// routes/blogs.js
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { auth } = require("../middleware/auth");

// GET all blogs
router.get("/", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM blogs ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// GET a single blog by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM blogs WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Blog not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// CREATE a new blog
router.post("/", auth, async (req, res) => {
  const { title, subtitle, content, featured_image, category, tags } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO blogs (title, subtitle, content, featured_image, category, tags, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [title, subtitle, content, featured_image, category, tags]
    );
    const [newBlog] = await db.query("SELECT * FROM blogs WHERE id = ?", [result.insertId]);
    res.status(201).json(newBlog[0]);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// UPDATE a blog
router.put("/:id", auth, async (req, res) => {
  const { title, subtitle, content, featured_image, category, tags } = req.body;
  try {
    await db.query(
      `UPDATE blogs SET title = ?, subtitle = ?, content = ?, featured_image = ?, category = ?, tags = ?
       WHERE id = ?`,
      [title, subtitle, content, featured_image, category, tags, req.params.id]
    );
    const [updatedBlog] = await db.query("SELECT * FROM blogs WHERE id = ?", [req.params.id]);
    res.json(updatedBlog[0]);
  } catch (err) {
    console.error("Error updating blog:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE a blog
router.delete("/:id", auth, async (req, res) => {
  try {
    await db.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
