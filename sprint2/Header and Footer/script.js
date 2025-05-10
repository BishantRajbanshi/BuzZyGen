// Sidebar toggle
document.querySelector('.hamburger-menu').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('active');
    document.getElementById('overlay').classList.add('active');
  });
  
  document.getElementById('closeSidebar').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
  });
  
  document.getElementById('overlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('active');
    document.getElementById('overlay').classList.remove('active');
  });
  
  // User profile dropdown
  document.querySelector('.user-profile').addEventListener('click', function (e) {
    e.stopPropagation();
    document.querySelector('.profile-dropdown').classList.toggle('active');
    document.querySelector('.kebab-dropdown').classList.remove('active');
  });
  
  // Kebab menu dropdown
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
  
  // Prevent closing dropdown on internal click
  document.querySelector('.kebab-dropdown').addEventListener('click', function (e) {
    e.stopPropagation();
  });
  