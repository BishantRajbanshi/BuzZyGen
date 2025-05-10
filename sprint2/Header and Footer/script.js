// Toggle user profile dropdown
document.querySelector('.user-profile').addEventListener('click', function (e) {
    e.stopPropagation();
    document.querySelector('.profile-dropdown').classList.toggle('active');
    document.querySelector('.kebab-dropdown').classList.remove('active');
  });
  
  // Toggle kebab menu dropdown
  document.querySelector('.kebab-menu').addEventListener('click', function (e) {
    e.stopPropagation();
    document.querySelector('.kebab-dropdown').classList.toggle('active');
    document.querySelector('.profile-dropdown').classList.remove('active');
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function () {
    document.querySelector('.profile-dropdown').classList.remove('active');
    document.querySelector('.kebab-dropdown').classList.remove('active');
  });
  
  // Prevent dropdown from closing when clicked inside
  document.querySelector('.kebab-dropdown').addEventListener('click', function (e) {
    e.stopPropagation();
  });
  