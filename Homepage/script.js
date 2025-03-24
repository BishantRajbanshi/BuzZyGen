// Toggle Mobile Menu
function toggleMenu() {
    const navSections = document.getElementById('nav-sections');
    navSections.classList.toggle('active');
  }
  
  // Toggle Profile Dropdown
  function toggleProfile() {
    const profileDropdown = document.getElementById('profile-dropdown');
    profileDropdown.classList.toggle('active');
  }
  
  // Close menu or profile dropdown when clicking outside
  window.onclick = function(event) {
    const navSections = document.getElementById('nav-sections');
    const profileDropdown = document.getElementById('profile-dropdown');
    
    if (!event.target.matches('.menu-btn')) {
      if (navSections.classList.contains('active')) {
        navSections.classList.remove('active');
      }
    }
  
    if (!event.target.matches('.user-profile')) {
      if (profileDropdown.classList.contains('active')) {
        profileDropdown.classList.remove('active');
      }
    }
  };
  