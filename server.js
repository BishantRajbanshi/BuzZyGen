const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");
const authRoutes = require("./routes/auth");
const newsRoutes = require("./routes/news");
const articleRoutes = require("./routes/article");
const blogsRoutes = require("./routes/blogs");
const db = require("./config/db"); // adjust path if needed
const { auth } = require("./middleware/auth");// required for secure access

 const bookmarkRoutes = require("./routes/bookmark");
 
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());

// Add security headers
app.use((req, res, next) => {
  // Basic security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Additional security headers
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://via.placeholder.com"
  );
  res.setHeader("Referrer-Policy", "no-referrer-when-downgrade");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/article", articleRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/bookmark", bookmarkRoutes);


// Serve static files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// 404 handler - must be before error handler
app.use((req, res, next) => {
  res.status(404).json({
    message: "Resource not found",
    path: req.originalUrl,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details for debugging
  console.error(`[${new Date().toISOString()}] Error:`, {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Don't expose stack traces in production
  const error =
    process.env.NODE_ENV === "production"
      ? { message: "Something went wrong!" }
      : { message: err.message, stack: err.stack };

  res.status(err.status || 500).json(error);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Bookmark POST route
// Bookmark article for logged-in user
app.post("/api/bookmark", auth, async (req, res) => {
  const { articleId } = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      "INSERT INTO bookmarks (user_id, article_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE article_id = article_id",
      [userId, articleId]
    );
    res.status(200).json({ message: "Bookmarked!" });
  } catch (err) {
    console.error("Bookmark error:", err);
    res.status(500).json({ message: "DB error", error: err.message });
  }
});

