const express = require("express");
const router = express.Router();
const db = require("../config/db");
const { auth } = require("../middleware/auth");

// GET all approved blogs (for blogListing page)
router.get("/", auth, async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const [rows] = await db.query(`
      SELECT blogs.*, users.name AS author_name 
      FROM blogs 
      JOIN users ON blogs.user_id = users.id 
      WHERE blogs.approved = 1 
      ORDER BY blogs.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    res.json(rows);
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});


// GET blogs created by the logged-in user
router.get("/my/posts", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM blogs WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching user blogs:", err);
    res.status(500).json({ message: "Failed to fetch user blogs" });
  }
});

// GET public blogs (no auth) - for homepage or blogListing
router.get("/public/listing", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT blogs.*, users.name AS author_name 
      FROM blogs 
      JOIN users ON blogs.user_id = users.id 
      WHERE blogs.approved = 1 
      ORDER BY blogs.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching public blogs:", err);
    res.status(500).json({ message: "Failed to fetch blogs" });
  }
});

// GET pending blogs (for admin approval list)
router.get("/pending", auth, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM blogs WHERE approved = 0 ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching pending blogs:", err);
    res.status(500).json({ message: "Failed to fetch pending blogs" });
  }
});

// GET a single blog by ID (with user name)
router.get("/:id", auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT blogs.*, users.name AS author_name 
       FROM blogs 
       JOIN users ON blogs.user_id = users.id 
       WHERE blogs.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Blog not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching blog:", err);
    res.status(500).json({ error: "Database error" });
  }
});


// CREATE a new blog (approved = 0 by default)
router.post("/", auth, async (req, res) => {
  const { title, subtitle, content, featured_image } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO blogs (title, subtitle, content, featured_image, created_at, approved, user_id)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [title, subtitle, content, featured_image, 0, req.user.id]
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
  const { title, subtitle, content, featured_image } = req.body;
  try {
    await db.query(
      `UPDATE blogs SET title = ?, subtitle = ?, content = ?, featured_image = ?
       WHERE id = ?`,
      [title, subtitle, content, featured_image, req.params.id]
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

// APPROVE a blog (admin action)
router.patch("/:id/approve", auth, async (req, res) => {
  try {
    await db.query("UPDATE blogs SET approved = 1 WHERE id = ?", [req.params.id]);
    res.json({ message: "Blog approved successfully." });
  } catch (err) {
    console.error("Error approving blog:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
