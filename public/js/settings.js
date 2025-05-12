document.addEventListener('DOMContentLoaded', function() {
  // Initialize all settings components
  initializeProfilePicture();
  initializePasswordReset();
  initializeNotifications();
  initializeTimezone();
  initializeCookieSettings();
  initializeSettingsActions();

  // Load saved settings from localStorage
  loadSavedSettings();
});

// Profile Picture Functions
function initializeProfilePicture() {
  const profilePictureInput = document.getElementById('profilePictureInput');
  const profilePreview = document.getElementById('profilePreview');
  const removeProfilePicBtn = document.getElementById('removeProfilePic');

  profilePictureInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit
              showMessage('File size should be less than 5MB', 'error');
              return;
          }

          const reader = new FileReader();
          reader.onload = function(e) {
              profilePreview.src = e.target.result;
              // Save to localStorage temporarily
              localStorage.setItem('profilePicture', e.target.result);
              showMessage('Profile picture updated successfully', 'success');
          };
          reader.readAsDataURL(file);
      }
  });

  removeProfilePicBtn.addEventListener('click', function() {
      profilePreview.src = '../images/default-avatar.png';
      localStorage.removeItem('profilePicture');
      showMessage('Profile picture removed', 'success');
  });
}

// Password Reset Functions
function initializePasswordReset() {
  const passwordResetForm = document.getElementById('passwordResetForm');
  const togglePasswordButtons = document.querySelectorAll('.toggle-password');

  togglePasswordButtons.forEach(button => {
      button.addEventListener('click', function() {
          const input = this.previousElementSibling;
          const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
          input.setAttribute('type', type);
          this.classList.toggle('fa-eye');
          this.classList.toggle('fa-eye-slash');
      });
  });

  passwordResetForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
          showMessage('New passwords do not match', 'error');
          return;
      }

      if (newPassword.length < 8) {
          showMessage('Password must be at least 8 characters long', 'error');
          return;
      }

      // Here you would typically make an API call to update the password
      // For now, we'll just show a success message
      showMessage('Password updated successfully', 'success');
      passwordResetForm.reset();
  });
}

// Notification Settings Functions
function initializeNotifications() {
  const notificationToggles = document.querySelectorAll('.notification-settings input[type="checkbox"]');
  
  notificationToggles.forEach(toggle => {
      toggle.addEventListener('change', function() {
          const settingName = this.id;
          const isEnabled = this.checked;
          
          // Save to localStorage
          localStorage.setItem(settingName, isEnabled);
          showMessage('Notification settings updated', 'success');
      });
  });
}

// Timezone Functions
function initializeTimezone() {
  const timezoneSelect = document.getElementById('timezone');
  const regionSelect = document.getElementById('region');

  // Set default timezone based on user's browser
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  timezoneSelect.value = userTimezone;

  timezoneSelect.addEventListener('change', function() {
      localStorage.setItem('timezone', this.value);
      showMessage('Timezone updated', 'success');
  });

  regionSelect.addEventListener('change', function() {
      localStorage.setItem('region', this.value);
      showMessage('Region updated', 'success');
  });
}

// Cookie Settings Functions
function initializeCookieSettings() {
  const cookieToggles = document.querySelectorAll('.cookie-settings input[type="checkbox"]');
  
  cookieToggles.forEach(toggle => {
      if (!toggle.disabled) {
          toggle.addEventListener('change', function() {
              const cookieType = this.id;
              const isEnabled = this.checked;
              
              // Save to localStorage
              localStorage.setItem(cookieType, isEnabled);
              showMessage('Cookie settings updated', 'success');

              // If analytics cookies are disabled, you might want to disable analytics tracking
              if (cookieType === 'analyticsCookies' && !isEnabled) {
                  // Disable analytics tracking
                  console.log('Analytics tracking disabled');
              }
          });
      }
  });
}

// Settings Actions Functions
function initializeSettingsActions() {
  const resetSettingsBtn = document.getElementById('resetSettings');
  const saveSettingsBtn = document.getElementById('saveSettings');

  resetSettingsBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to reset all settings to default?')) {
          resetAllSettings();
          showMessage('Settings reset to default', 'success');
      }
  });

  saveSettingsBtn.addEventListener('click', function() {
      // Here you would typically make an API call to save all settings
      // For now, we'll just show a success message
      showMessage('All settings saved successfully', 'success');
  });
}

// Utility Functions
function loadSavedSettings() {
  // Load profile picture
  const savedProfilePicture = localStorage.getItem('profilePicture');
  if (savedProfilePicture) {
      document.getElementById('profilePreview').src = savedProfilePicture;
  }

  // Load notification settings
  document.querySelectorAll('.notification-settings input[type="checkbox"]').forEach(toggle => {
      const savedValue = localStorage.getItem(toggle.id);
      if (savedValue !== null) {
          toggle.checked = savedValue === 'true';
      }
  });

  // Load timezone and region
  const savedTimezone = localStorage.getItem('timezone');
  if (savedTimezone) {
      document.getElementById('timezone').value = savedTimezone;
  }

  const savedRegion = localStorage.getItem('region');
  if (savedRegion) {
      document.getElementById('region').value = savedRegion;
  }

  // Load cookie settings
  document.querySelectorAll('.cookie-settings input[type="checkbox"]').forEach(toggle => {
      if (!toggle.disabled) {
          const savedValue = localStorage.getItem(toggle.id);
          if (savedValue !== null) {
              toggle.checked = savedValue === 'true';
          }
      }
  });
}

function resetAllSettings() {
  // Reset profile picture
  document.getElementById('profilePreview').src = '../images/default-avatar.png';
  localStorage.removeItem('profilePicture');

  // Reset notification settings
  document.querySelectorAll('.notification-settings input[type="checkbox"]').forEach(toggle => {
      toggle.checked = true;
      localStorage.setItem(toggle.id, 'true');
  });

  // Reset timezone and region
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  document.getElementById('timezone').value = userTimezone;
  document.getElementById('region').value = 'US';
  localStorage.setItem('timezone', userTimezone);
  localStorage.setItem('region', 'US');

  // Reset cookie settings
  document.querySelectorAll('.cookie-settings input[type="checkbox"]').forEach(toggle => {
      if (!toggle.disabled) {
          toggle.checked = true;
          localStorage.setItem(toggle.id, 'true');
      }
  });
}

function showMessage(message, type) {
  // Remove any existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
      existingMessage.remove();
  }

  // Create and show new message
  const messageElement = document.createElement('div');
  messageElement.className = `message ${type}`;
  messageElement.textContent = message;
  messageElement.style.display = 'block';

  // Insert message at the top of the settings container
  const settingsContainer = document.querySelector('.settings-container');
  settingsContainer.insertBefore(messageElement, settingsContainer.firstChild);

  // Remove message after 3 seconds
  setTimeout(() => {
      messageElement.remove();
  }, 3000);
} 