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

  // Password change form handling
  const passwordResetForm = document.getElementById('passwordResetForm');
  if (passwordResetForm) {
    passwordResetForm.addEventListener('submit', async function(e) {
      e.preventDefault();

      // Get form values
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      // Validate passwords
      if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Please fill in all password fields', 'error');
        return;
      }

      if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters long', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
      }

      // Disable submit button and show loading state
      const submitButton = passwordResetForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Updating...';

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });

        const data = await response.json();

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;

        if (response.ok) {
          showMessage('Password updated successfully', 'success');
          // Clear form
          passwordResetForm.reset();
        } else {
          showMessage(data.message || 'Failed to update password', 'error');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        showMessage('An error occurred while updating password', 'error');
      }
    });
  }

  // Toggle password visibility
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

  // Profile picture handling
  const profilePictureInput = document.getElementById('profilePictureInput');
  const profilePreview = document.getElementById('profilePreview');
  const removeProfilePicBtn = document.getElementById('removeProfilePic');

  if (profilePictureInput) {
    profilePictureInput.addEventListener('change', async function(e) {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/update-profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (response.ok) {
          const data = await response.json();
          // Update profile picture preview
          profilePreview.src = data.profilePicture;
          // Update token in localStorage
          localStorage.setItem('token', data.token);
          // Show success message
          showMessage('Profile picture updated successfully', 'success');
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to update profile picture');
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        showMessage(error.message || 'Error updating profile picture', 'error');
      }
    });
  }

  if (removeProfilePicBtn) {
    removeProfilePicBtn.addEventListener('click', async function() {
      if (!confirm('Are you sure you want to remove your profile picture?')) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/auth/update-profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ removePicture: true })
        });

        if (response.ok) {
          const data = await response.json();
          // Reset to default avatar
          profilePreview.src = '/images/default-avatar.svg';
          // Update token in localStorage
          localStorage.setItem('token', data.token);
          // Show success message
          showMessage('Profile picture removed successfully', 'success');
        } else {
          const error = await response.json();
          throw new Error(error.message || 'Failed to remove profile picture');
        }
      } catch (error) {
        console.error('Error removing profile picture:', error);
        showMessage(error.message || 'Error removing profile picture', 'error');
      }
    });
  }

  // Notification settings handling
  const notificationToggles = document.querySelectorAll('.notification-settings .switch input');
  notificationToggles.forEach(toggle => {
    toggle.addEventListener('change', async function() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/auth/update-notification-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            setting: this.id,
            enabled: this.checked
          })
        });

        const data = await response.json();

        if (!response.ok) {
          // Revert toggle if update failed
          this.checked = !this.checked;
          showMessage(data.message || 'Failed to update notification settings', 'error');
        }
      } catch (error) {
        console.error('Error updating notification settings:', error);
        // Revert toggle if update failed
        this.checked = !this.checked;
        showMessage('An error occurred while updating notification settings', 'error');
      }
    });
  });

  // Cookie settings handling
  const cookieToggles = document.querySelectorAll('.cookie-settings .switch input:not([disabled])');
  cookieToggles.forEach(toggle => {
    toggle.addEventListener('change', async function() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/auth/update-cookie-settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            setting: this.id,
            enabled: this.checked
          })
        });

        const data = await response.json();

        if (!response.ok) {
          // Revert toggle if update failed
          this.checked = !this.checked;
          showMessage(data.message || 'Failed to update cookie settings', 'error');
        }
      } catch (error) {
        console.error('Error updating cookie settings:', error);
        // Revert toggle if update failed
        this.checked = !this.checked;
        showMessage('An error occurred while updating cookie settings', 'error');
      }
    });
  });

  // Timezone and region handling
  const timezoneSelect = document.getElementById('timezone');
  const regionSelect = document.getElementById('region');

  if (timezoneSelect) {
    timezoneSelect.addEventListener('change', async function() {
      await updateUserPreference('timezone', this.value);
    });
  }

  if (regionSelect) {
    regionSelect.addEventListener('change', async function() {
      await updateUserPreference('region', this.value);
    });
  }

  // Reset settings button
  const resetSettingsBtn = document.getElementById('resetSettings');
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', async function() {
      if (!confirm('Are you sure you want to reset all settings to default?')) {
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/auth/reset-settings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          // Reload page to reflect changes
          window.location.reload();
        } else {
          showMessage(data.message || 'Failed to reset settings', 'error');
        }
      } catch (error) {
        console.error('Error resetting settings:', error);
        showMessage('An error occurred while resetting settings', 'error');
      }
    });
  }

  // Helper function to update user preferences
  async function updateUserPreference(preference, value) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/update-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          [preference]: value
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.message || `Failed to update ${preference}`, 'error');
      }
    } catch (error) {
      console.error(`Error updating ${preference}:`, error);
      showMessage(`An error occurred while updating ${preference}`, 'error');
    }
  }

  // Helper function to show messages
  function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    // Remove any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Add new message
    document.querySelector('.settings-container').insertAdjacentElement('afterbegin', messageDiv);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
  }

  // Load initial settings
  async function loadSettings() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/auth/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Update notification toggles
        if (data.notifications) {
          Object.entries(data.notifications).forEach(([key, value]) => {
            const toggle = document.getElementById(key);
            if (toggle) toggle.checked = value;
          });
        }

        // Update cookie toggles
        if (data.cookies) {
          Object.entries(data.cookies).forEach(([key, value]) => {
            const toggle = document.getElementById(key);
            if (toggle) toggle.checked = value;
          });
        }

        // Update timezone and region
        if (data.timezone) {
          const timezoneSelect = document.getElementById('timezone');
          if (timezoneSelect) timezoneSelect.value = data.timezone;
        }

        if (data.region) {
          const regionSelect = document.getElementById('region');
          if (regionSelect) regionSelect.value = data.region;
        }

        // Update profile picture if available
        if (data.profile_picture) {
          const profilePreview = document.getElementById('profilePreview');
          if (profilePreview) profilePreview.src = data.profile_picture;
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('An error occurred while loading settings', 'error');
    }
  }

  // Load settings when page loads
  loadSettings();
});

// Profile Picture Functions
function initializeProfilePicture() {
  const profilePictureInput = document.getElementById('profilePictureInput');
  const profilePreview = document.getElementById('profilePreview');
  const removeProfilePicBtn = document.getElementById('removeProfilePic');

  // Load current profile picture
  async function loadProfilePicture() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = 'login.html';
        return;
      }

      const response = await fetch('/api/auth/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile_picture) {
          profilePreview.src = data.profile_picture;
        }
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  }

  // Handle profile picture upload
  profilePictureInput.addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Update profile picture preview
        profilePreview.src = data.profilePicture;
        // Update token in localStorage
        localStorage.setItem('token', data.token);
        // Show success message
        showMessage('Profile picture updated successfully', 'success');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showMessage(error.message || 'Error updating profile picture', 'error');
    }
  });

  // Handle remove profile picture
  removeProfilePicBtn.addEventListener('click', async function() {
    if (!confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/update-profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ removePicture: true })
      });

      if (response.ok) {
        const data = await response.json();
        // Reset to default avatar
        profilePreview.src = '/images/default-avatar.svg';
        // Update token in localStorage
        localStorage.setItem('token', data.token);
        // Show success message
        showMessage('Profile picture removed successfully', 'success');
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove profile picture');
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      showMessage(error.message || 'Error removing profile picture', 'error');
    }
  });

  // Load profile picture when page loads
  document.addEventListener('DOMContentLoaded', loadProfilePicture);
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

  passwordResetForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      showMessage('Please fill in all password fields', 'error');
      return;
    }

    if (newPassword.length < 8) {
      showMessage('Password must be at least 8 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage('New passwords do not match', 'error');
      return;
    }

    // Disable submit button and show loading state
    const submitButton = passwordResetForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Updating...';

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Make API call to update password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await response.json();

      // Re-enable submit button
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;

      if (response.ok) {
        showMessage('Password updated successfully', 'success');
        // Clear form
        passwordResetForm.reset();
        
        // If the server returns a new token (some implementations do this for security)
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
      } else {
        showMessage(data.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
      showMessage('An error occurred while updating password', 'error');
    }
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
  document.getElementById('profilePreview').src = '/images/default-avatar.svg';
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