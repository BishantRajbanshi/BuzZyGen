// DOM Elements - safely get elements that might not exist on all pages
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const closeButtons = document.querySelectorAll(".close");
const navLinks = document.querySelectorAll(".nav-links a");
const authButtons = document.querySelector(".auth-buttons");
const userProfile = document.querySelector(".user-profile");
const profileDropdown = document.querySelector(".profile-dropdown");

// Sidebar functionality
const hamburgerMenu = document.querySelector(".hamburger-menu");
const sidebar = document.querySelector(".sidebar");
const closeSidebar = document.querySelector(".close-sidebar");
const overlay = document.querySelector(".overlay");

// Search bar functionality with enhanced animations
const searchContainer = document.querySelector(".search-container");
const searchInput = searchContainer
  ? searchContainer.querySelector("input")
  : null;
const searchButton = searchContainer
  ? searchContainer.querySelector("button")
  : null;
let searchTimeout;
let searchInteractionTimeout;

// Add animation to search container
if (searchContainer && searchInput && searchButton) {
  // Hover event for search container
  searchContainer.addEventListener("mouseenter", () => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    // Expand the search container
    searchContainer.classList.add("expanded");

    // Set a timeout to collapse after 3 seconds if no interaction
    searchInteractionTimeout = setTimeout(() => {
      // Only collapse if not active and no text in input
      if (
        !searchContainer.classList.contains("active") &&
        searchInput.value.trim() === ""
      ) {
        searchContainer.classList.remove("expanded");
      }
    }, 3000);
  });

  // Focus event for search input
  searchInput.addEventListener("focus", () => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    // Add active class to keep it expanded
    searchContainer.classList.add("active");
    searchContainer.classList.add("expanded");
  });

  // Input event to maintain active state when typing
  searchInput.addEventListener("input", () => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    // Keep active while typing
    if (searchInput.value.trim() !== "") {
      searchContainer.classList.add("active");
    }
  });

  // Blur event for search input
  searchInput.addEventListener("blur", () => {
    // If input is empty, remove active class after a short delay
    if (searchInput.value.trim() === "") {
      // Set a timeout to allow for button clicks
      setTimeout(() => {
        searchContainer.classList.remove("active");

        // Start the collapse timeout
        searchInteractionTimeout = setTimeout(() => {
          searchContainer.classList.remove("expanded");
        }, 500);
      }, 200);
    }
  });

  // Click event for search button
  searchButton.addEventListener("click", (e) => {
    // Clear any existing timeout
    if (searchInteractionTimeout) {
      clearTimeout(searchInteractionTimeout);
    }

    if (!searchContainer.classList.contains("expanded")) {
      e.preventDefault();
      searchContainer.classList.add("expanded");
      searchContainer.classList.add("active");
      searchInput.focus();
    } else if (searchInput.value.trim() !== "") {
      // Perform search
      console.log("Searching for:", searchInput.value);
      // Add ripple effect to button
      const ripple = document.createElement("span");
      ripple.classList.add("ripple-effect");
      searchButton.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    } else {
      // If button is clicked but input is empty, focus on input
      searchInput.focus();
    }
  });

  // Click outside to collapse if empty
  document.addEventListener("click", (e) => {
    if (
      !searchContainer.contains(e.target) &&
      searchInput.value.trim() === ""
    ) {
      searchContainer.classList.remove("active");
      searchContainer.classList.remove("expanded");
    }
  });
}

// Only set up sidebar functionality if all required elements exist
if (hamburgerMenu && sidebar && closeSidebar && overlay) {
  function openSidebar() {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent scrolling when sidebar is open
  }

  function closeSidebarMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = ""; // Restore scrolling
  }

  hamburgerMenu.addEventListener("click", openSidebar);
  closeSidebar.addEventListener("click", closeSidebarMenu);
  overlay.addEventListener("click", closeSidebarMenu);

  // Close sidebar with escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
      closeSidebarMenu();
    }
  });

  // Add click event listeners to sidebar menu items
  const sidebarMenuItems = document.querySelectorAll(".sidebar-menu li a");
  sidebarMenuItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const menuText = this.textContent.trim();

      // Close sidebar first to prevent scrolling issues
      closeSidebarMenu();

      // Handle different menu items
      if (menuText === "Home") {
        // Navigate to home and show all news
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Use setTimeout to ensure scroll completes before fetching news
        setTimeout(() => {
          const homeLink = document.querySelector(
            '.nav-links a[data-category="all"]'
          );
          if (homeLink) {
            homeLink.click();
          } else {
            fetchNews("all");
          }
        }, 100);
      } else if (
        [
          "Business",
          "Sports",
          "Technology",
          "Entertainment",
          "Science",
        ].includes(menuText)
      ) {
        // First scroll to the category section
        const categorySection = document.querySelector(".news-by-category");
        if (categorySection) {
          categorySection.scrollIntoView({ behavior: "smooth" });
        }

        // Use setTimeout to ensure scroll completes before fetching news
        setTimeout(() => {
          // Then navigate to the respective category
          const categoryLink = document.querySelector(
            `.nav-links a[data-category="${menuText.toLowerCase()}"]`
          );
          if (categoryLink) {
            // Just update the active class without triggering the click event
            const navLinks = document.querySelectorAll(".nav-links a");
            navLinks.forEach((l) => l.classList.remove("active"));
            categoryLink.classList.add("active");

            // Fetch news directly instead of clicking the link
            fetchNews(menuText.toLowerCase());
          } else {
            fetchNews(menuText.toLowerCase());
          }
        }, 300); // Slightly longer delay to ensure smooth scrolling completes
      } else if (menuText === "Saved Articles") {
        // Show saved articles (to be implemented)
        alert("Saved Articles feature coming soon!");
      } else if (menuText === "Settings") {
        // Show settings (to be implemented)
        alert("Settings feature coming soon!");
      }
    });
  });
}

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

// Function to reset forms when modals are closed
function resetForms() {
  // Reset signup form
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.reset();

    // Clear any error messages
    const errorElements = signupForm.querySelectorAll(".form-error");
    errorElements.forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    // Remove error highlighting
    const formGroups = signupForm.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      group.classList.remove("has-error");
    });

    // Remove any success overlay that might be present
    const successOverlay = document.querySelector(".signup-success-overlay");
    if (successOverlay) successOverlay.remove();
  }

  // Reset login form
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    // Only reset password field, keep email for convenience
    const passwordField = document.getElementById("loginPassword");
    if (passwordField) passwordField.value = "";

    // Clear any error messages
    const errorElements = loginForm.querySelectorAll(".form-error");
    errorElements.forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    // Remove error highlighting
    const formGroups = loginForm.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      group.classList.remove("has-error");
    });
  }

  // Reset forgot password form
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    forgotPasswordForm.reset();

    // Clear any error messages
    const errorElements = forgotPasswordForm.querySelectorAll(".form-error");
    errorElements.forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    // Clear success message
    const successMessage = document.getElementById("forgotSuccessMessage");
    if (successMessage) {
      successMessage.textContent = "";
      successMessage.style.display = "none";
    }

    // Remove error highlighting
    const formGroups = forgotPasswordForm.querySelectorAll(".form-group");
    formGroups.forEach((group) => {
      group.classList.remove("has-error");
    });
  }
}

if (closeButtons.length > 0) {
  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (loginModal) loginModal.style.display = "none";
      if (signupModal) signupModal.style.display = "none";
      resetForms();
    });
  });
}

window.addEventListener("click", (e) => {
  if (loginModal && e.target === loginModal) {
    loginModal.style.display = "none";
    resetForms();
  }
  if (signupModal && e.target === signupModal) {
    signupModal.style.display = "none";
    resetForms();
  }
});

// Also reset forms when escape key is pressed
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (loginModal && loginModal.style.display === "block") {
      loginModal.style.display = "none";
      resetForms();
    }
    if (signupModal && signupModal.style.display === "block") {
      signupModal.style.display = "none";
      resetForms();
    }
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

// Google login button functionality
const googleLoginBtn = document.getElementById("googleLoginBtn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "/api/auth/google/login";
  });
}

// Google signup button functionality
const googleSignupBtn = document.getElementById("googleSignupBtn");
if (googleSignupBtn) {
  googleSignupBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.location.href = "/api/auth/google/signup";
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

    // Get the email from login form
    const loginEmail = document.getElementById("loginEmail").value;

    // Redirect to the forgot password page with email parameter if available
    if (loginEmail) {
      window.location.href = `/forgot-password.html?email=${encodeURIComponent(
        loginEmail
      )}`;
    } else {
      window.location.href = "/forgot-password.html";
    }
  });
}

// Form submissions - only set up if forms exist
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  // Function to show form errors
  function showLoginError(field, message) {
    const errorElement = document.getElementById(`login${field}Error`);
    const formGroup = document
      .getElementById(`login${field}`)
      .closest(".form-group");

    if (errorElement) {
      errorElement.textContent = message;
      formGroup.classList.add("has-error");
    }
  }

  // Function to show general error
  function showLoginGeneralError(message) {
    const errorElement = document.getElementById("loginGeneralError");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  // Function to clear all errors
  function clearLoginErrors() {
    const errorElements = [
      document.getElementById("loginEmailError"),
      document.getElementById("loginPasswordError"),
      document.getElementById("loginGeneralError"),
    ];

    const formGroups = document.querySelectorAll("#loginForm .form-group");

    errorElements.forEach((el) => {
      if (el) el.textContent = "";
    });

    formGroups.forEach((group) => {
      group.classList.remove("has-error");
    });

    document.getElementById("loginGeneralError").style.display = "none";
  }

  // Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Add input event listeners to clear errors when user types
  document.getElementById("loginEmail").addEventListener("input", function () {
    document.getElementById("loginEmailError").textContent = "";
    this.closest(".form-group").classList.remove("has-error");
    document.getElementById("loginGeneralError").style.display = "none";
  });

  document
    .getElementById("loginPassword")
    .addEventListener("input", function () {
      document.getElementById("loginPasswordError").textContent = "";
      this.closest(".form-group").classList.remove("has-error");
      document.getElementById("loginGeneralError").style.display = "none";
    });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearLoginErrors();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Client-side validation
    let hasErrors = false;

    if (!email) {
      showLoginError("Email", "Email is required");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      showLoginError("Email", "Please enter a valid email address");
      hasErrors = true;
    }

    if (!password) {
      showLoginError("Password", "Password is required");
      hasErrors = true;
    }

    if (hasErrors) return;

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
        // Handle specific error cases
        if (data.googleAccount) {
          // This is a Google-only account
          showLoginGeneralError(
            data.message || "This account uses Google to sign in"
          );

          // Add a Google login button to the error message
          const errorElement = document.getElementById("loginGeneralError");
          const googleLoginBtn = document.createElement("button");
          googleLoginBtn.type = "button";
          googleLoginBtn.className = "google-login-btn error-action-btn";
          googleLoginBtn.innerHTML =
            '<i class="fab fa-google"></i> Sign in with Google';
          googleLoginBtn.addEventListener("click", function () {
            window.location.href = "/api/auth/google/login";
          });

          errorElement.appendChild(document.createElement("br"));
          errorElement.appendChild(document.createElement("br"));
          errorElement.appendChild(googleLoginBtn);
        } else if (data.field === "email") {
          showLoginError("Email", data.message || "Invalid email");
        } else if (data.field === "password") {
          showLoginError("Password", data.message || "Invalid password");
        } else {
          showLoginGeneralError(
            data.message || "Login failed. Please check your credentials."
          );
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      showLoginGeneralError(
        "An error occurred during login. Please try again later."
      );
    }
  });
}

const signupForm = document.getElementById("signupForm");
if (signupForm) {
  // Function to show form errors
  function showSignupError(field, message) {
    const errorElement = document.getElementById(`signup${field}Error`);
    const formGroup = document
      .getElementById(`signup${field}`)
      .closest(".form-group");

    if (errorElement) {
      errorElement.textContent = message;
      formGroup.classList.add("has-error");
    }
  }

  // Function to show general error
  function showSignupGeneralError(message) {
    const errorElement = document.getElementById("signupGeneralError");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  // Function to clear all errors
  function clearSignupErrors() {
    const errorElements = [
      document.getElementById("signupNameError"),
      document.getElementById("signupEmailError"),
      document.getElementById("signupPasswordError"),
      document.getElementById("signupConfirmPasswordError"),
      document.getElementById("signupGeneralError"),
    ];

    const formGroups = document.querySelectorAll("#signupForm .form-group");

    errorElements.forEach((el) => {
      if (el) el.textContent = "";
    });

    formGroups.forEach((group) => {
      group.classList.remove("has-error");
    });

    document.getElementById("signupGeneralError").style.display = "none";
  }

  // Validate email format
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Add input event listeners to clear errors when user types
  ["Name", "Email", "Password", "ConfirmPassword"].forEach((field) => {
    const element = document.getElementById(`signup${field}`);
    if (element) {
      element.addEventListener("input", function () {
        const errorElement = document.getElementById(`signup${field}Error`);
        if (errorElement) errorElement.textContent = "";
        this.closest(".form-group").classList.remove("has-error");
        document.getElementById("signupGeneralError").style.display = "none";

        // Special case for password confirmation
        if (field === "Password" || field === "ConfirmPassword") {
          const password = document.getElementById("signupPassword").value;
          const confirmPassword = document.getElementById(
            "signupConfirmPassword"
          ).value;

          if (password && confirmPassword && password !== confirmPassword) {
            document.getElementById("signupConfirmPasswordError").textContent =
              "Passwords do not match";
            document
              .getElementById("signupConfirmPassword")
              .closest(".form-group")
              .classList.add("has-error");
          } else if (password && confirmPassword) {
            document.getElementById("signupConfirmPasswordError").textContent =
              "";
            document
              .getElementById("signupConfirmPassword")
              .closest(".form-group")
              .classList.remove("has-error");
          }
        }

        // Special case for email - check if it already exists after user stops typing
        if (field === "Email") {
          const emailInput = this;
          const email = emailInput.value.trim();

          // Clear any existing timers
          if (emailInput.checkTimer) clearTimeout(emailInput.checkTimer);

          // Only check if email is valid and user has stopped typing for 800ms
          if (email && isValidEmail(email)) {
            emailInput.checkTimer = setTimeout(async () => {
              try {
                // Add a subtle loading indicator
                emailInput.classList.add("checking-email");

                // Check if email exists by making a lightweight request
                const response = await fetch("/api/auth/check-email", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email }),
                });

                const data = await response.json();

                // Remove loading indicator
                emailInput.classList.remove("checking-email");

                // If email exists, just show error without login link
                if (data.exists) {
                  showSignupError("Email", "This email is already registered");
                }
              } catch (error) {
                console.error("Error checking email:", error);
                // Remove loading indicator if there was an error
                emailInput.classList.remove("checking-email");
              }
            }, 800);
          }
        }
      });
    }
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    clearSignupErrors();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById(
      "signupConfirmPassword"
    ).value;

    // Client-side validation
    let hasErrors = false;

    if (!name) {
      showSignupError("Name", "Full name is required");
      hasErrors = true;
    } else if (name.length < 2) {
      showSignupError("Name", "Name must be at least 2 characters");
      hasErrors = true;
    }

    if (!email) {
      showSignupError("Email", "Email is required");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      showSignupError("Email", "Please enter a valid email address");
      hasErrors = true;
    }

    if (!password) {
      showSignupError("Password", "Password is required");
      hasErrors = true;
    } else {
      // Check password length
      if (password.length < 8) {
        showSignupError("Password", "Password must be at least 8 characters");
        hasErrors = true;
      }
      // Check for uppercase letter
      else if (!/[A-Z]/.test(password)) {
        showSignupError(
          "Password",
          "Password must contain at least one uppercase letter"
        );
        hasErrors = true;
      }
      // Check for number
      else if (!/[0-9]/.test(password)) {
        showSignupError(
          "Password",
          "Password must contain at least one number"
        );
        hasErrors = true;
      }
      // Check for special character
      else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        showSignupError(
          "Password",
          "Password must contain at least one special character"
        );
        hasErrors = true;
      }
    }

    if (!confirmPassword) {
      showSignupError("ConfirmPassword", "Please confirm your password");
      hasErrors = true;
    } else if (password !== confirmPassword) {
      showSignupError("ConfirmPassword", "Passwords do not match");
      hasErrors = true;
    }

    if (hasErrors) return;

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
        // Create a success message overlay instead of replacing the form
        const successOverlay = document.createElement("div");
        successOverlay.className = "signup-success-overlay";
        successOverlay.innerHTML = `
          <div class="signup-success">
            <i class="fas fa-check-circle"></i>
            <p>Signup successful! Redirecting to login...</p>
          </div>
        `;

        // Add the overlay to the modal content (parent of the form)
        const modalContent = signupForm.closest(".modal-content");
        modalContent.appendChild(successOverlay);

        // Store the original form values to reset them later
        const formValues = {
          name: document.getElementById("signupName").value,
          email: document.getElementById("signupEmail").value,
        };

        // Reset the form fields
        signupForm.reset();

        // Redirect to login after a delay
        setTimeout(() => {
          // Remove the success overlay
          successOverlay.remove();

          // Hide signup modal and show login modal
          if (signupModal) signupModal.style.display = "none";
          if (loginModal) {
            loginModal.style.display = "block";

            // Pre-fill the login email with the email used for signup
            const loginEmail = document.getElementById("loginEmail");
            if (loginEmail) loginEmail.value = formValues.email;

            // Focus on the password field
            const loginPassword = document.getElementById("loginPassword");
            if (loginPassword) setTimeout(() => loginPassword.focus(), 300);
          }
        }, 2000);
      } else {
        // Handle specific error cases
        if (data.field === "name") {
          showSignupError("Name", data.message);
        } else if (data.field === "email") {
          // Special handling for existing email
          if (data.code === "EMAIL_EXISTS") {
            showSignupError("Email", data.message);

            // Add a login link to the error message
            const errorElement = document.getElementById("signupEmailError");
            const loginLink = document.createElement("a");
            loginLink.href = "#";
            loginLink.textContent = "Click here to login instead";
            loginLink.className = "error-action-link";
            loginLink.addEventListener("click", function (e) {
              e.preventDefault();
              if (signupModal) signupModal.style.display = "none";
              if (loginModal) loginModal.style.display = "block";

              // Pre-fill the login email field with the email they tried to sign up with
              const loginEmail = document.getElementById("loginEmail");
              if (loginEmail)
                loginEmail.value = document.getElementById("signupEmail").value;

              // Focus on the password field
              const loginPassword = document.getElementById("loginPassword");
              if (loginPassword) setTimeout(() => loginPassword.focus(), 300);
            });

            errorElement.appendChild(document.createElement("br"));
            errorElement.appendChild(loginLink);
          } else {
            showSignupError("Email", data.message || "Email is already in use");
          }
        } else if (data.field === "password") {
          showSignupError("Password", data.message);
        } else {
          showSignupGeneralError(
            data.message || "Signup failed. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      showSignupGeneralError(
        "An error occurred during signup. Please try again later."
      );
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
  });
}

// Fetch and display news
function fetchNews(category = null) {
  // Handle special categories
  let url;
  if (!category || category === "all" || category === "home") {
    url = "/api/news";
  } else {
    url = `/api/news/category/${category}`;
  }

  // Add a cache-busting parameter to avoid browser caching
  const cacheBuster = `cacheBust=${Date.now()}`;
  const finalUrl = `${url}?${cacheBuster}`;

  // Show loading state
  showLoadingState();

  // Set a timeout for the fetch request
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.warn("Fetch request timed out");
    displayFallbackNews();
    hideLoadingState();
  }, 10000); // 10 second timeout

  fetch(finalUrl, {
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
    signal: controller.signal,
  })
    .then((response) => {
      // Clear the timeout
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((news) => {
      // Check if we got valid news data
      if (!news || news.length === 0) {
        console.warn("No news articles returned from API");
        displayFallbackNews();
      } else {
        // Display news in BBC style layout
        displayBreakingNews(news[0]);
        displayTopStories(news.slice(0, 3));
        displayCategoryNews(news);
        displayMostRead(news.slice(0, 5));
        displayNews(news); // Keep original display for compatibility
        console.log("Successfully loaded news from API");
      }
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      // Use fallback news when there's an error
      displayFallbackNews();
    })
    .finally(() => {
      // Always hide loading state
      hideLoadingState();
    });
}

// Show loading state
function showLoadingState() {
  const sections = [
    document.getElementById("breakingNewsContent"),
    document.getElementById("topStoriesGrid"),
    document.getElementById("categoryContent"),
    document.getElementById("mostReadList"),
    document.querySelector(".featured-news"),
  ];

  sections.forEach((section) => {
    if (section) {
      section.innerHTML =
        '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Loading news...</div>';
    }
  });
}

// Hide loading state
function hideLoadingState() {
  const loadingSpinners = document.querySelectorAll(".loading-spinner");
  loadingSpinners.forEach((spinner) => {
    if (spinner) {
      spinner.remove();
    }
  });
}

// Display fallback news when API fails
function displayFallbackNews() {
  const featuredNews = document.querySelector(".featured-news");
  if (!featuredNews) return;

  featuredNews.innerHTML = `
    <div class="news-error">
      <h3>Unable to load news at this time</h3>
      <p>We're experiencing some technical difficulties with our news service. Please try again later.</p>
    </div>
    ${getFallbackNewsHTML()}
  `;

  // Also display fallback content in BBC-style sections
  const breakingNewsContent = document.getElementById("breakingNewsContent");
  if (breakingNewsContent) {
    breakingNewsContent.innerHTML = `<a href="#">Breaking: Technical difficulties with our news service</a>`;
  }

  const topStoriesGrid = document.getElementById("topStoriesGrid");
  if (topStoriesGrid) {
    topStoriesGrid.innerHTML = getFallbackTopStoriesHTML();
  }

  const categoryContent = document.getElementById("categoryContent");
  if (categoryContent) {
    categoryContent.innerHTML = getFallbackNewsHTML();
  }

  const mostReadList = document.getElementById("mostReadList");
  if (mostReadList) {
    mostReadList.innerHTML = getFallbackMostReadHTML();
  }
}

// Generate fallback news items
function getFallbackNewsHTML() {
  const fallbackNews = [
    {
      title: "Technology Trends for 2024",
      description:
        "Discover the latest technology trends that are shaping our future.",
      category: "Technology",
      date: new Date().toLocaleDateString(),
    },
    {
      title: "Global Economic Outlook",
      description:
        "Experts analyze the current state of the global economy and future projections.",
      category: "Business",
      date: new Date().toLocaleDateString(),
    },
    {
      title: "Health and Wellness Tips",
      description:
        "Simple lifestyle changes that can significantly improve your overall health and wellbeing.",
      category: "Health",
      date: new Date().toLocaleDateString(),
    },
  ];

  return fallbackNews
    .map(
      (article) => `
    <div class="news-card">
      <img src="https://via.placeholder.com/300x200" alt="${article.title}">
      <div class="news-content">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <div class="news-meta">
          <span class="category">${article.category}</span>
          <span class="date">${article.date}</span>
        </div>
        <a href="#" class="read-more">Read More</a>
      </div>
    </div>
  `
    )
    .join("");
}

// Generate fallback top stories HTML
function getFallbackTopStoriesHTML() {
  return `
    <div class="story-card main-story">
      <img src="https://via.placeholder.com/800x500?text=Breaking+News" alt="Breaking News">
      <div class="story-content">
        <h3>Major Technology Breakthrough Announced</h3>
        <p>Scientists have made a significant breakthrough in quantum computing that could revolutionize the tech industry.</p>
        <div class="story-meta">
          <span class="category">Technology</span>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <a href="#" class="story-link"></a>
    </div>
    <div class="story-card secondary-story">
      <img src="https://via.placeholder.com/400x250?text=Business+News" alt="Business News">
      <div class="story-content">
        <h3>Global Markets Respond to Economic Data</h3>
        <div class="story-meta">
          <span class="category">Business</span>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <a href="#" class="story-link"></a>
    </div>
    <div class="story-card secondary-story">
      <img src="https://via.placeholder.com/400x250?text=Sports+News" alt="Sports News">
      <div class="story-content">
        <h3>Championship Finals Set for Weekend Showdown</h3>
        <div class="story-meta">
          <span class="category">Sports</span>
          <span class="date">${new Date().toLocaleDateString()}</span>
        </div>
      </div>
      <a href="#" class="story-link"></a>
    </div>
  `;
}

// Generate fallback most read HTML
function getFallbackMostReadHTML() {
  const mostReadItems = [
    "Global Economic Summit Concludes with New Agreements",
    "Health Experts Release New Guidelines for Balanced Lifestyle",
    "Technology Giants Announce Collaboration on AI Standards",
    "Sports Championship Results Surprise Fans Worldwide",
    "Entertainment Industry Adapts to Changing Consumer Habits",
  ];

  return mostReadItems
    .map(
      (title) => `
      <div class="most-read-item">
        <h3><a href="#">${title}</a></h3>
      </div>
    `
    )
    .join("");
}

// Display news in the original layout (kept for compatibility)
function displayNews(news) {
  const featuredNews = document.querySelector(".featured-news");
  if (!featuredNews) return;

  featuredNews.innerHTML = news
    .map((article) => {
      // Check for valid image URL
      let imageUrl = "https://via.placeholder.com/300x200?text=No+Image";

      // Check all possible image sources
      if (article.featured_image && article.featured_image.trim() !== "") {
        imageUrl = article.featured_image;
      } else if (article.urlToImage && article.urlToImage.trim() !== "") {
        imageUrl = article.urlToImage;
      } else if (article.imageUrl && article.imageUrl.trim() !== "") {
        imageUrl = article.imageUrl;
      }

      return `
          <div class="news-card">
            <div class="news-image">
              <img src="${imageUrl}" alt="${article.title || "News article"}">
            </div>
            <div class="news-content">
              <h3>${article.title}</h3>
              <p>${article.description || article.subtitle || ""}</p>
              <div class="news-meta">
                <span class="category">${article.category || "General"}</span>
                <span class="date">${new Date(
                  article.publishedAt || article.created_at || new Date()
                ).toLocaleDateString()}</span>
              </div>
              <a href="${
                article.url || `/article/${article.id}` || "#"
              }" class="read-more">Read More</a>
            </div>
          </div>
        `;
    })
    .join("");
}

// Display breaking news in the banner
function displayBreakingNews(article) {
  if (!article) return;

  const breakingNewsContent = document.getElementById("breakingNewsContent");
  if (!breakingNewsContent) return;

  breakingNewsContent.innerHTML = `
    <a href="${article.url || `/article/${article.id}` || "#"}">
      ${article.title}
    </a>
  `;

  // Reset the animation when content changes to ensure it starts from the right position
  breakingNewsContent.style.animation = "none";
  setTimeout(() => {
    breakingNewsContent.style.animation = "scrollText 20s linear infinite";
  }, 10);
}

// Display top stories in the grid layout
function displayTopStories(articles) {
  if (!articles || articles.length === 0) return;

  const topStoriesGrid = document.getElementById("topStoriesGrid");
  if (!topStoriesGrid) return;

  // Get the main story and secondary stories
  const mainStory = articles[0];
  const secondaryStories = articles.slice(1, 3);

  // Function to get valid image URL
  function getValidImageUrl(article, defaultSize = "800x500") {
    if (article.featured_image && article.featured_image.trim() !== "") {
      return article.featured_image;
    } else if (article.urlToImage && article.urlToImage.trim() !== "") {
      return article.urlToImage;
    } else if (article.imageUrl && article.imageUrl.trim() !== "") {
      return article.imageUrl;
    }
    return `https://via.placeholder.com/${defaultSize}?text=No+Image`;
  }

  // Create HTML for the main story
  let html = `
    <div class="story-card main-story">
      <img src="${getValidImageUrl(mainStory)}" alt="${
    mainStory.title || "Featured Story"
  }">
      <div class="story-content">
        <h3>${mainStory.title}</h3>
        <p>${mainStory.description || mainStory.subtitle || ""}</p>
        <div class="story-meta">
          <span class="category">${mainStory.category || "General"}</span>
          <span class="date">${new Date(
            mainStory.publishedAt || mainStory.created_at || new Date()
          ).toLocaleDateString()}</span>
        </div>
      </div>
      <a href="${
        mainStory.url || `/article/${mainStory.id}` || "#"
      }" class="story-link"></a>
    </div>
  `;

  // Add secondary stories
  secondaryStories.forEach((story) => {
    html += `
      <div class="story-card secondary-story">
        <img src="${getValidImageUrl(story, "400x250")}" alt="${
      story.title || "News Story"
    }">
        <div class="story-content">
          <h3>${story.title}</h3>
          <div class="story-meta">
            <span class="category">${story.category || "General"}</span>
            <span class="date">${new Date(
              story.publishedAt || story.created_at || new Date()
            ).toLocaleDateString()}</span>
          </div>
        </div>
        <a href="${
          story.url || `/article/${story.id}` || "#"
        }" class="story-link"></a>
      </div>
    `;
  });

  topStoriesGrid.innerHTML = html;
}

// Display news by category
function displayCategoryNews(articles) {
  if (!articles || articles.length === 0) return;

  const categoryContent = document.getElementById("categoryContent");
  if (!categoryContent) return;

  // Default to showing all articles
  let filteredArticles = articles;

  // Set up category tabs - using event delegation for better performance
  const categoryTabsContainer = document.querySelector(".category-tabs");
  const categoryTabs = document.querySelectorAll(".category-tab");

  if (categoryTabsContainer) {
    // Remove any existing event listeners to prevent duplicates
    const newCategoryTabsContainer = categoryTabsContainer.cloneNode(true);
    categoryTabsContainer.parentNode.replaceChild(
      newCategoryTabsContainer,
      categoryTabsContainer
    );

    newCategoryTabsContainer.addEventListener("click", (e) => {
      const tab = e.target.closest(".category-tab");
      if (!tab) return; // Click was not on a tab

      // Remove active class from all tabs
      categoryTabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      tab.classList.add("active");

      const category = tab.dataset.category;

      // Filter articles by category
      if (category === "all") {
        filteredArticles = articles;
      } else {
        filteredArticles = articles.filter(
          (article) =>
            (article.category || "").toLowerCase() === category.toLowerCase()
        );

        // If no articles in this category, show all
        if (filteredArticles.length === 0) {
          filteredArticles = articles;
        }
      }

      // Update the display
      renderCategoryNews(filteredArticles);
    });
  }

  // Initial render
  renderCategoryNews(filteredArticles);

  function renderCategoryNews(articles) {
    // Function to get valid image URL
    function getValidImageUrl(article) {
      if (article.featured_image && article.featured_image.trim() !== "") {
        return article.featured_image;
      } else if (article.urlToImage && article.urlToImage.trim() !== "") {
        return article.urlToImage;
      } else if (article.imageUrl && article.imageUrl.trim() !== "") {
        return article.imageUrl;
      }
      return `https://via.placeholder.com/300x200?text=No+Image`;
    }

    categoryContent.innerHTML = articles
      .slice(0, 6) // Limit to 6 articles
      .map(
        (article) => `
        <div class="news-card">
          <div class="news-image">
            <img src="${getValidImageUrl(article)}" alt="${
          article.title || "News article"
        }">
          </div>
          <div class="news-content">
            <h3>${article.title}</h3>
            <p>${article.description || article.subtitle || ""}</p>
            <div class="news-meta">
              <span class="category">${article.category || "General"}</span>
              <span class="date">${new Date(
                article.publishedAt || article.created_at || new Date()
              ).toLocaleDateString()}</span>
            </div>
            <a href="${
              article.url || `/article/${article.id}` || "#"
            }" class="read-more">Read More</a>
          </div>
        </div>
      `
      )
      .join("");
  }
}

// Display most read articles
function displayMostRead(articles) {
  if (!articles || articles.length === 0) return;

  const mostReadList = document.getElementById("mostReadList");
  if (!mostReadList) return;

  mostReadList.innerHTML = articles
    .map(
      (article) => `
      <div class="most-read-item">
        <h3>
          <a href="${article.url || `/article/${article.id}`}">
            ${article.title}
          </a>
        </h3>
      </div>
    `
    )
    .join("");
}

// Category navigation - using event delegation for better performance
const navContainer = document.querySelector(".nav-links");
if (navContainer) {
  // Remove any existing event listeners to prevent duplicates
  const newNavContainer = navContainer.cloneNode(true);
  navContainer.parentNode.replaceChild(newNavContainer, navContainer);

  newNavContainer.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return; // Click was not on a link

    e.preventDefault();

    // Get category from data attribute, defaulting to "all" for Home
    const category = link.getAttribute("data-category") || "all";

    // Update active class
    const navLinks = document.querySelectorAll(".nav-links a");
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Fetch news with the category
    fetchNews(category);
  });
}

// Profile Dropdown functionality - only add listeners if elements exist
if (userProfile && profileDropdown) {
  userProfile.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("active");
  });

  // Prevent dropdown from closing when clicking inside it
  profileDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (userProfile && !userProfile.contains(e.target)) {
      profileDropdown.classList.remove("active");
    }
  });
}

// Navigation dropdown functionality
const moreMenu = document.querySelector(".more-menu");
const moreDropdown = document.getElementById("moreDropdown");

if (moreMenu && moreDropdown) {
  moreMenu.addEventListener("click", (e) => {
    e.preventDefault();
    moreDropdown.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!moreMenu.contains(e.target) && !moreDropdown.contains(e.target)) {
      moreDropdown.classList.remove("active");
    }
  });
}

// Fetch and display news
async function fetchNews(category = null) {
  try {
    console.log(`Fetching news for category: ${category || "all"}`);

    // Show loading state
    const featuredNews = document.querySelector(".featured-news");
    if (featuredNews) {
      featuredNews.innerHTML = `
        <div class="loading-spinner">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Loading news...</p>
        </div>
      `;
    }

    // Handle special categories
    let url;
    if (!category || category === "all" || category === "home") {
      url = "/api/news";
    } else {
      url = `/api/news/category/${category}`;
    }

    // Add a cache-busting parameter to avoid browser caching
    const cacheBuster = `cacheBust=${Date.now()}`;
    const finalUrl = `${url}?${cacheBuster}`;

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(finalUrl, {
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
      cache: "no-store",
      signal: controller.signal,
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const news = await response.json();

    if (!news || news.length === 0 || news.message) {
      console.log("No news data received, displaying fallback content");
      displayFallbackNews();
    } else {
      console.log(`Received ${news.length} news items`);
      // Display news in BBC style layout
      displayBreakingNews(news[0]);
      displayTopStories(news.slice(0, 3));
      displayCategoryNews(news);
      displayMostRead(news.slice(0, 5));
      displayNews(news); // Keep original display for compatibility
    }

    // Update active navigation link
    updateActiveNavLink(category);
  } catch (error) {
    console.error("Error fetching news:", error);
    displayFallbackNews();
  }
}

// Function to update the active navigation link
function updateActiveNavLink(category) {
  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    const linkCategory = link.getAttribute("data-category");
    if (
      (!category && linkCategory === "all") ||
      (category === "all" && linkCategory === "all") ||
      (category && linkCategory === category)
    ) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Initialize - using both DOMContentLoaded and window.onload for reliability
let initialized = false;

function initializePage() {
  if (!initialized) {
    checkAuth();
    fetchNews();
    initialized = true;
    console.log("Page initialized successfully");
  }
}

// Try to initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", initializePage);

// Fallback to window.onload if DOMContentLoaded doesn't fire or completes too early
window.onload = function () {
  if (!initialized) {
    console.log("Using window.onload fallback for initialization");
    initializePage();
  }

  // Force a refresh of the news content after a short delay
  setTimeout(() => {
    if (
      document.querySelector(".loading-spinner") ||
      !document.querySelector(".news-card")
    ) {
      console.log("Forcing news refresh");
      fetchNews();
    }
  }, 1000);
};

// Add event listeners for search container if it exists
if (searchContainer) {
  searchContainer.addEventListener("click", (e) => {
    e.stopPropagation();
    searchContainer.classList.add("expanded");
    clearTimeout(searchTimeout);
  });

  // Prevent collapse when interacting with the search bar
  searchContainer.addEventListener("input", () => {
    clearTimeout(searchTimeout);
  });
}

// Collapse search bar after 5 seconds of inactivity
document.addEventListener("click", () => {
  if (searchContainer && searchContainer.classList.contains("expanded")) {
    searchTimeout = setTimeout(() => {
      searchContainer.classList.remove("expanded");
    }, 5000);
  }
});

// Forgot Password form submission
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
  // Function to show form errors
  function showForgotError(field, message) {
    const errorElement = document.getElementById(`forgot${field}Error`);
    const formGroup = document
      .getElementById(`forgot${field}`)
      .closest(".form-group");

    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
      formGroup.classList.add("has-error");
    }
  }

  // Function to show general error
  function showForgotGeneralError(message) {
    const errorElement = document.getElementById("forgotGeneralError");
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  // Function to show success message
  function showForgotSuccessMessage(message) {
    const successElement = document.getElementById("forgotSuccessMessage");
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = "block";
    }
  }

  // Function to clear all errors
  function clearForgotErrors() {
    const errorElements = [
      document.getElementById("forgotEmailError"),
      document.getElementById("forgotGeneralError"),
    ];

    const formGroups = document.querySelectorAll(
      "#forgotPasswordForm .form-group"
    );

    errorElements.forEach((el) => {
      if (el) {
        el.textContent = "";
        el.style.display = "none";
      }
    });

    formGroups.forEach((group) => {
      group.classList.remove("has-error");
    });

    // Also clear success message
    const successElement = document.getElementById("forgotSuccessMessage");
    if (successElement) {
      successElement.textContent = "";
      successElement.style.display = "none";
    }
  }

  // Add input event listener to clear errors when user types
  document.getElementById("forgotEmail").addEventListener("input", function () {
    document.getElementById("forgotEmailError").textContent = "";
    document.getElementById("forgotEmailError").style.display = "none";
    this.closest(".form-group").classList.remove("has-error");
    document.getElementById("forgotGeneralError").style.display = "none";
    document.getElementById("forgotSuccessMessage").style.display = "none";
  });

  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors and messages
    clearForgotErrors();

    const email = document.getElementById("forgotEmail").value.trim();

    // Client-side validation
    let hasErrors = false;

    if (!email) {
      showForgotError("Email", "Email is required");
      hasErrors = true;
    } else if (!isValidEmail(email)) {
      showForgotError("Email", "Please enter a valid email address");
      hasErrors = true;
    }

    if (hasErrors) return;

    // Disable submit button and show loading state
    const submitButton = forgotPasswordForm.querySelector(
      "button[type='submit']"
    );
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;

      if (response.ok) {
        // Check if we're in development mode with a direct link
        if (data.devMode && data.resetLink) {
          // Show success message with link
          const successMessage = document.getElementById(
            "forgotSuccessMessage"
          );
          successMessage.innerHTML = `
            ${data.message}<br><br>
            <strong>Development Mode:</strong> <a href="${data.resetLink}" target="_blank">Click here to reset your password</a>
          `;
          successMessage.style.display = "block";
        } else {
          // Show regular success message
          showForgotSuccessMessage(
            data.message || "Password reset link sent to your email."
          );
        }

        // Clear the form
        document.getElementById("forgotEmail").value = "";

        // Redirect back to login after 5 seconds (only if not in dev mode)
        if (!data.devMode) {
          setTimeout(() => {
            // Since we're now using a separate page for forgot password,
            // we just need to reset the form and don't need to hide any modal
            resetForms();

            // Redirect to login page
            window.location.href = "/";
          }, 5000);
        }
      } else if (data.googleAccount) {
        // Special case for Google accounts
        showForgotGeneralError(data.message);
      } else if (data.errors) {
        // Validation errors
        data.errors.forEach((error) => {
          if (error.param === "email") {
            showForgotError("Email", error.msg);
          } else {
            showForgotGeneralError(error.msg);
          }
        });
      } else {
        // General error
        showForgotGeneralError(
          data.message || "An error occurred. Please try again."
        );
      }
    } catch (error) {
      console.error("Forgot password error:", error);

      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;

      showForgotGeneralError("An error occurred. Please try again later.");
    }
  });
}
