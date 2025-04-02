document.addEventListener("DOMContentLoaded", function () {
  // Toggle Mobile Menu
  document.querySelector(".menu-btn").addEventListener("click", function () {
      document.getElementById("nav-sections").classList.toggle("active");
  });

  // Toggle Notifications Dropdown
  document.querySelector(".notification-icon").addEventListener("click", function (event) {
      event.stopPropagation();
      toggleDropdown("notificationsDropdown");
  });

  // Toggle Profile Dropdown
  document.querySelector(".user-profile").addEventListener("click", function (event) {
      event.stopPropagation();
      toggleDropdown("profileDropdown");
  });

  // Function to toggle dropdowns
  function toggleDropdown(dropdownId) {
      const dropdown = document.getElementById(dropdownId);
      const allDropdowns = document.querySelectorAll(".dropdown");

      allDropdowns.forEach((d) => {
          if (d.id !== dropdownId) d.classList.remove("active");
      });

      dropdown.classList.toggle("active");

      // Populate notifications dynamically
      if (dropdownId === "notificationsDropdown" && dropdown.innerHTML.trim() === "") {
          dropdown.innerHTML = `
              <p><strong>Notifications</strong></p>
              <ul>
                  <li>📢 Market hits all-time high</li>
                  <li>📰 AI's role in journalism</li>
                  <li>⚽ Local team wins championship</li>
              </ul>
          `;
      }
  }

  // Close dropdowns when clicking outside
  document.addEventListener("click", function () {
      document.querySelectorAll(".dropdown").forEach((dropdown) => {
          dropdown.classList.remove("active");
      });
  });

  // Example functions for settings and logout
  document.querySelectorAll(".profile-dropdown a").forEach((item) => {
      item.addEventListener("click", function (event) {
          event.preventDefault();
          if (this.textContent.includes("Settings")) {
              alert("Opening Settings...");
          } else if (this.textContent.includes("Logout")) {
              alert("You have been logged out.");
          }
      });
  });
});
