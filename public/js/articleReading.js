async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    if (!articleId) {
        document.getElementById("articleTitle").textContent = "Article not found.";
        return;
    }

    try {
        const response = await fetch(`/api/article/${articleId}`);
        const article = await response.json();

        // Set image
        const imageDiv = document.getElementById("articleImage");
        const imageUrl = article.featured_image || "https://via.placeholder.com/1200x500?text=No+Image";
        imageDiv.innerHTML = `<img src="${imageUrl}" alt="${article.title}" />`;

        // Set title and meta
        document.getElementById("articleTitle").textContent = article.title || "Untitled";
        document.getElementById("articleAuthor").textContent = `Written by: Admin`;
        document.getElementById("articleDate").textContent = new Date(article.created_at).toLocaleDateString();

        // Set content
        const contentDiv = document.getElementById("articleContent");
        contentDiv.innerHTML = article.content
            .split("\n")
            .map(p => `<p>${p.trim()}</p>`)
            .join("");
    } catch (error) {
        document.getElementById("articleTitle").textContent = "Failed to load article.";
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", loadArticle);


// This event listener has been moved inside the sidebar functionality check

// Check authentication status
function checkAuth() {
  const token = localStorage.getItem("token");
  if (token) {
    const decodedToken = JSON.parse(atob(token.split(".")[1]));
    authButtons.innerHTML = `
            <span>Welcome, ${decodedToken.email}</span>
            <button id="logoutBtn">Logout</button>
            ${
              decodedToken.role === "admin"
                ? '<a href="/admin" class="admin-link">Admin Panel</a>'
                : ""
            }
        `;

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.reload();
    });
  }
}

// Modal functionality - only set up if elements exist
if (loginBtn && loginModal) {
  loginBtn.addEventListener("click", () => {
    loginModal.style.display = "block";
  });
}

if (signupBtn && signupModal) {
  signupBtn.addEventListener("click", () => {
    signupModal.style.display = "block";
  });
}

if (closeButtons.length > 0) {
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (loginModal) loginModal.style.display = "none";
      if (signupModal) signupModal.style.display = "none";
    });
  });
}

window.addEventListener("click", (e) => {
  if (loginModal && e.target === loginModal) {
    loginModal.style.display = "none";
  }
  if (signupModal && e.target === signupModal) {
    signupModal.style.display = "none";
  }
});

// Toggle password visibility for login
const togglePassword = document.querySelector(".toggle-password");
if (togglePassword) {
  togglePassword.addEventListener("click", function () {
    const passwordInput = document.getElementById("loginPassword");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// Toggle password visibility for signup
const togglePasswordSignup = document.querySelector(".toggle-password-signup");
if (togglePasswordSignup) {
  togglePasswordSignup.addEventListener("click", function () {
    const passwordInput = document.getElementById("signupPassword");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// Toggle password visibility for confirm password
const togglePasswordConfirm = document.querySelector(
  ".toggle-password-confirm"
);
if (togglePasswordConfirm) {
  togglePasswordConfirm.addEventListener("click", function () {
    const passwordInput = document.getElementById("signupConfirmPassword");
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);
    this.classList.toggle("fa-eye");
    this.classList.toggle("fa-eye-slash");
  });
}

// Register Now link functionality
const registerNowLink = document.getElementById("registerNowLink");
if (registerNowLink) {
  registerNowLink.addEventListener("click", (e) => {
    e.preventDefault();
    loginModal.style.display = "none";
    signupModal.style.display = "block";
  });
}

// Login Now link functionality
const loginNowLink = document.getElementById("loginNowLink");
if (loginNowLink) {
  loginNowLink.addEventListener("click", (e) => {
    e.preventDefault();
    signupModal.style.display = "none";
    loginModal.style.display = "block";
  });
}

// Forgot Password link functionality
const forgotPasswordLink = document.getElementById("forgotPasswordLink");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Password reset functionality will be implemented soon!");
  });
}

// Form submissions - only set up if forms exist
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        const decodedToken = JSON.parse(atob(data.token.split(".")[1]));
        if (decodedToken.role === "admin") {
          window.location.href = "/admin.html";
        } else {
          window.location.href = "/dashboard.html";
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("An error occurred during login");
    }
  });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Signup successful! Please login.");
        if (signupModal) signupModal.style.display = "none";
        if (loginModal) loginModal.style.display = "block";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("An error occurred during signup");
    }
  });
}

// Add animation to navigation links
if (navLinks && navLinks.length > 0) {
  navLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      // Add subtle animation on hover
      link.style.transition =
        "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      link.style.transform = "translateY(-2px)";
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = "translateY(0)";
    });

    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Remove active class from all links
      navLinks.forEach((l) => l.classList.remove("active"));

      // Add active class to clicked link with animation
      link.classList.add("active");

      // Get category from data attribute
      const category = link.getAttribute("data-category");

      // Fetch news for the selected category
      fetchNews(category);
    });
      // ✅ Logout button logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.href = "/";
      }
    });
  }

  // ✅ Back button logic
  const backBtn = document.querySelector(".back-btn");
  if (backBtn) {
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "dashboard.html#article";
    });
}
});
}

//BookMark
document.addEventListener("DOMContentLoaded", async () => {
  const bookmarkBtn = document.getElementById("bookmarkBtn");
  const token = localStorage.getItem("token");
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  if (!articleId) return;

  if (token && bookmarkBtn) {
    try {
      // ✅ Check if bookmarked
      const res = await fetch("/api/bookmark", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const bookmarks = await res.json();

      const isBookmarked = bookmarks.some(article => article.id == articleId);
      if (isBookmarked) {
        bookmarkBtn.querySelector("i").classList.add("bookmarked"); // golden class
        bookmarkBtn.dataset.bookmarked = "true";
      }

      // ✅ On click, prevent duplicate bookmarking
      bookmarkBtn.addEventListener("click", async () => {
        if (bookmarkBtn.dataset.bookmarked === "true") {
          alert("This article is already bookmarked.");
          return;
        }

        const postRes = await fetch("/api/bookmark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ articleId }),
        });

        const data = await postRes.json();
        if (postRes.ok) {
          alert("Article bookmarked successfully!");
          bookmarkBtn.querySelector("i").classList.add("bookmarked");
          bookmarkBtn.dataset.bookmarked = "true";
        } else {
          alert(data.message || "Failed to bookmark.");
        }
      });
    } catch (err) {
      console.error("Bookmark check/bookmark error:", err);
    }
  }
});

