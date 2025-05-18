// Tab switching functionality
function switchTab(tabId) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
  
    // Deactivate all tab triggers
    const tabTriggers = document.querySelectorAll('.tab-trigger');
    tabTriggers.forEach(trigger => trigger.classList.remove('active'));
  
    // Show the selected tab content
    document.getElementById(tabId).classList.add('active');
  
    // Activate the clicked tab trigger
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
      }
      reader.readAsDataURL(file);
    }
  });
  
  // Save profile picture (mock functionality)
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
  
      // Refresh avatar on success
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
      console.log("Token used:", token);
  
      const response = await fetch("/api/bookmark", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Fetch response status:", response.status);
  
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
  
  //removebook mark
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
        loadSavedArticles(); // refresh the list
      } else {
        const error = await res.json();
        console.error("Failed to remove bookmark:", error);
      }
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  }
  
  
  //userinfo //userinfo 
  async function loadUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) return;
  
    try {
      const res = await fetch("/api/user/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("Failed to load profile");
  
      const user = await res.json();

      console.log("User loaded:", user);

      // ✅ Set profile image if exists
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
  
      // ✅ Set name, email, join date
      document.getElementById("profileName").textContent = user.name;
      document.querySelector(".profileEmail").textContent = user.email;
      document.querySelector(".role").textContent = user.role || "Standard";
      document.getElementById("profileSince").textContent =
        "Member since " +
        new Date(user.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        });
  
      // ✅ Set saved count
      const countEl = document.getElementById("profileSavedCount");
      if (countEl) countEl.textContent = user.savedCount;
  
      // ✅ Set notifications toggle
      const notifToggle = document.getElementById("email-notifications");
if (notifToggle) {
  console.log("Toggle set with value:", user.notifications_enabled); // Debug log
  notifToggle.checked = user.notifications_enabled == 1;
}

  
    } catch (err) {
      console.error("Failed to load profile:", err);
    }
  }
  


  //delete account 
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
  
  //Password change 
  document.querySelector(".btn.btn-primary").addEventListener("click", async () => {
    const currentPassword = document.getElementById("current-password").value;
    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
  
    if (newPassword !== confirmPassword) {
      return alert("New passwords do not match.");
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
        window.location.reload(); // 👈 This refreshes the page
      } else {
        alert(data.message || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      alert("An error occurred. Please try again.");
    }
  });

  
  
  // Call loadSavedArticles and loadUserProfile on DOMContentLoaded
  document.addEventListener("DOMContentLoaded", () => {
    loadSavedArticles();
    loadUserProfile();
  });
  