const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const pool = require("./db");
const jwt = require("jsonwebtoken");

// We'll initialize passport in server.js, not here

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/api/auth/google/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log("Google authentication callback received");
        console.log("Profile:", JSON.stringify(profile, null, 2));

        // Extract user information from Google profile
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (!email) {
          console.error("No email found in Google profile");
          return done(new Error("No email found in Google profile"), null);
        }

        const name =
          profile.displayName ||
          (profile.name
            ? `${profile.name.givenName || ""} ${
                profile.name.familyName || ""
              }`.trim()
            : "Google User");
        const googleId = profile.id;
        const profilePicture =
          profile.photos && profile.photos.length > 0
            ? profile.photos[0].value
            : null;

        // Check if user already exists in our database
        const [existingUsers] = await pool.query(
          "SELECT * FROM users WHERE email = ? OR google_id = ?",
          [email, googleId]
        );

        let user;

        let isNewUser = false;

        if (existingUsers.length > 0) {
          // User exists, update their Google ID if needed
          user = existingUsers[0];

          // If user exists but doesn't have a Google ID, update it
          if (!user.google_id) {
            await pool.query(
              "UPDATE users SET google_id = ?, profile_picture = ? WHERE id = ?",
              [googleId, profilePicture, user.id]
            );
          }

          // Check if user has a password set
          // If not, they need to complete registration
          if (!user.password) {
            isNewUser = true;
          }
        } else {
          // Create a new user
          const [result] = await pool.query(
            "INSERT INTO users (name, email, google_id, profile_picture, role) VALUES (?, ?, ?, ?, ?)",
            [name, email, googleId, profilePicture, "user"]
          );

          user = {
            id: result.insertId,
            name,
            email,
            google_id: googleId,
            profile_picture: profilePicture,
            role: "user",
          };

          // This is a new user, they need to complete registration
          isNewUser = true;
        }

        // Set the isNewUser flag in the session
        req.session = req.session || {};
        req.session.isNewUser = isNewUser;

        // Generate JWT token
        const token = jwt.sign(
          {
            id: user.id,
            email: user.email,
            role: user.role || "user",
            name: user.name,
            profile_picture: user.profile_picture,
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        // Store token in session for redirect
        req.session = req.session || {};
        req.session.jwt = token;

        return done(null, user);
      } catch (error) {
        console.error("Google authentication error:", error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
