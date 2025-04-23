const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    res
      .status(401)
      .json({ message: "Token is not valid", error: error.message });
  }
};

const adminAuth = (req, res, next) => {
  try {
    console.log("Admin auth middleware called");
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("Token extracted:", token ? "Token exists" : "No token");

    if (!token) {
      console.log("No token provided");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    console.log(
      "Verifying token with secret:",
      process.env.JWT_SECRET ? "Secret exists" : "No secret"
    );
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    if (decoded.role !== "admin") {
      console.log("User is not admin, role:", decoded.role);
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    console.log("Admin authentication successful");
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Admin auth middleware error:", error.message);
    res
      .status(401)
      .json({ message: "Token is not valid", error: error.message });
  }
};

module.exports = { auth, adminAuth };
