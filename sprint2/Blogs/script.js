// Sidebar toggle
document.querySelector('.hamburger-menu').onclick = () => {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.overlay').classList.toggle('active');
  };
  
  document.querySelector('.close-sidebar').onclick = () => {
    document.querySelector('.sidebar').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
  };
  
  // Close sidebar on overlay click
  document.querySelector('.overlay').onclick = () => {
    document.querySelector('.sidebar').classList.remove('active');
    document.querySelector('.overlay').classList.remove('active');
  };
  
  // Profile dropdown toggle
  document.querySelector('.user-profile').onclick = () => {
    document.querySelector('.profile-dropdown').classList.toggle('active');
  };
  
  // Toggle login password visibility
  document.querySelector('.toggle-password').onclick = () => {
    const input = document.getElementById('loginPassword');
    const icon = document.querySelector('.toggle-password');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  };
  
  // Toggle signup password visibility
  document.querySelector('.toggle-password-signup').onclick = () => {
    const input = document.getElementById('signupPassword');
    const icon = document.querySelector('.toggle-password-signup');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  };
  
  // Toggle confirm password visibility
  document.querySelector('.toggle-password-confirm').onclick = () => {
    const input = document.getElementById('signupConfirmPassword');
    const icon = document.querySelector('.toggle-password-confirm');
    input.type = input.type === 'password' ? 'text' : 'password';
    icon.classList.toggle('fa-eye');
    icon.classList.toggle('fa-eye-slash');
  };
  
  // Show login modal
  document.getElementById('loginBtn').onclick = () => {
    document.getElementById('loginModal').style.display = 'block';
  };
  
  // Show signup modal
  document.getElementById('signupBtn').onclick = () => {
    document.getElementById('signupModal').style.display = 'block';
  };
  
  // Close modals
  document.querySelectorAll('.modal .close').forEach(btn => {
    btn.onclick = () => {
      btn.closest('.modal').style.display = 'none';
    };
  });
  
  // Switch modals
  document.getElementById('registerNowLink').onclick = () => {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'block';
  };
  
  document.getElementById('loginNowLink').onclick = () => {
    document.getElementById('signupModal').style.display = 'none';
    document.getElementById('loginModal').style.display = 'block';
  };
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  };
  
  document.getElementById('addBlogBtn').onclick = () => {
    alert("Redirecting to blog creation page...");
  
    // Optional: redirect to another page
    // window.location.href = 'add-blog.html';
  };
  