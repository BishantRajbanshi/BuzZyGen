// Tab switching functionality
function switchTab(tabId) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));

  const tabTriggers = document.querySelectorAll('.tab-trigger');
  tabTriggers.forEach(trigger => trigger.classList.remove('active'));

  document.getElementById(tabId).classList.add('active');

  const clickedTrigger = document.querySelector(`.tab-trigger[onclick="switchTab('${tabId}')"]`);
  clickedTrigger.classList.add('active');
}

// Handle image error for avatar
document.querySelector('.avatar img').onerror = function () {
  this.style.display = 'none';
  document.querySelector('.avatar-fallback').style.display = 'flex';
};

// Modal functionality
function openModal() {
  document.getElementById('profilePicModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('profilePicModal').style.display = 'none';
  document.getElementById('imagePreview').style.display = 'none';
  document.getElementById('profilePicInput').value = '';
}

// Image preview functionality
document.getElementById('profilePicInput').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('previewImg').src = event.target.result;
      document.getElementById('imagePreview').style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
});

// Save profile picture
async function saveProfilePic() {
  const previewImg = document.getElementById('previewImg');
  const imageData = previewImg.src;

  if (!imageData || !imageData.startsWith("data:image")) {
    alert("Invalid image format.");
    return;
  }

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("/api/user/profile-picture", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ profile_picture: imageData }),
    });

    if (!response.ok) throw new Error("Failed to upload profile picture");

    document.querySelector('.avatar img').src = imageData;
    closeModal();
  } catch (error) {
    console.error("Upload error:", error);
    alert("Failed to upload profile picture");
  }
}

// Load saved bookmarked articles
async function loadSavedArticles() {
  const token = localStorage.getItem("token");
  const container = document.querySelector("#saved .card-content");
  container.innerHTML = "<p>Loading...</p>";

  try {
    const response = await fetch("/api/bookmark", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch bookmarks");

    const articles = await response.json();

    if (!Array.isArray(articles) || articles.length === 0) {
      container.innerHTML = "<p>No saved articles yet.</p>";
      return;
    }

    container.innerHTML = articles.map(article => `
      <div class="article-item">
        <div class="article-image">
          <img src="${article.featured_image || 'https://via.placeholder.com/60'}" alt="Article thumbnail">
        </div>
        <div class="article-content">
          <h3 class="article-title">${article.title}</h3>
          <div class="article-meta">
            <span>${new Date(article.created_at).toLocaleDateString()}</span>
            <span class="separator">•</span>
          </div>
          <div class="article-actions">
            <button class="action-btn" onclick="location.href='articleReading.html?id=${article.id}'">Read Now</button>
            <button class="action-btn" onclick="removeBookmark(${article.id})">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  } catch (err) {
    container.innerHTML = "<p>Failed to load saved articles.</p>";
    console.error("Bookmark fetch error:", err);
  }
}

// Remove bookmark
async function removeBookmark(articleId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("/api/bookmark", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ articleId }),
    });

    if (res.ok) {
      loadSavedArticles();
    } else {
      const error = await res.json();
      console.error("Failed to remove bookmark:", error);
    }
  } catch (error) {
    console.error("Error removing bookmark:", error);
  }
}

// Load user profile
// Load user profile
async function loadUserProfile() {
  const token = localStorage.getItem("token");
  console.log("📦 Token:", token); // Debug token

  if (!token) return;

  try {
    const res = await fetch("/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Failed to load profile");

    const user = await res.json();
    console.log("✅ User profile loaded:", user); // Debug log

    const avatarImg = document.querySelector(".avatar img");
    const avatarFallback = document.querySelector(".avatar-fallback");

    if (user.profile_picture) {
      avatarImg.src = user.profile_picture;
      avatarImg.style.display = "block";
      avatarFallback.style.display = "none";
    } else {
      avatarImg.style.display = "none";
      avatarFallback.style.display = "flex";
    }

    document.getElementById("profileName").textContent = user.name || "Anonymous";
    document.querySelector(".profileEmail").textContent = user.email || "Not provided";
    document.querySelector(".role").textContent = user.role || "Standard";

    const createdAt = user.created_at ? new Date(user.created_at) : null;
    document.getElementById("profileSince").textContent =
      createdAt
        ? "Member since " + createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long" })
        : "Member since N/A";

    const countEl = document.getElementById("profileSavedCount");
    if (countEl) countEl.textContent = user.savedCount;
  } catch (err) {
    console.error(" Failed to load profile:", err);
  }
}

// On page load
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
});


// Delete account
document.querySelector(".btn-danger").addEventListener("click", async () => {
  if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;

  try {
    const res = await fetch("/api/user/delete", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message);
      localStorage.removeItem("token");
      window.location.href = "/";
    } else {
      alert("Error deleting account: " + data.message);
    }
  } catch (err) {
    console.error("Delete request failed:", err);
    alert("Error deleting account.");
  }
});

// Change password
document.querySelector(".btn.btn-primary").addEventListener("click", async () => {
  const currentPasswordInput = document.getElementById("current-password");
  const newPasswordInput = document.getElementById("new-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Reset styles and error messages
  newPasswordInput.style.border = "";
  confirmPasswordInput.style.border = "";
  document.getElementById("new-password-error").style.display = "none";
  document.getElementById("confirm-password-error").style.display = "none";

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  if (newPassword !== confirmPassword) {
    confirmPasswordInput.style.border = "2px solid red";
    document.getElementById("confirm-password-error").style.display = "block";
    return;
  }

  if (!strongPasswordRegex.test(newPassword)) {
    newPasswordInput.style.border = "2px solid red";
    document.getElementById("new-password-error").style.display = "block";
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await fetch("/api/user/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password updated successfully!");
      window.location.reload();
    } else {
      alert(data.message || "Failed to update password");
    }
  } catch (err) {
    console.error("Error updating password:", err);
    alert("An error occurred. Please try again.");
  }
});

// On page load
document.addEventListener("DOMContentLoaded", () => {
  loadSavedArticles();
  loadUserProfile();
});
