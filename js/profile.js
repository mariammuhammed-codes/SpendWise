document.addEventListener('DOMContentLoaded', function () {
  const profile = SpendWise.getProfile();
  const profileSummary = document.getElementById('profileSummary');
  const nameInput = document.getElementById('profileName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const modeSelect = document.getElementById('businessMode');
  const currencySelect = document.getElementById('currencySelect');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const clearProfileBtn = document.getElementById('clearProfileBtn');
  const updateProfileBtn = document.getElementById('updateProfileBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const backupEmailInput = document.getElementById('backupEmail');
  const backupSaveBtn = document.getElementById('backupSaveBtn');
  const manageBackupBtn = document.getElementById('manageBackupBtn');
  const backupPanel = document.getElementById('backupPanel');
  const helpPanel = document.getElementById('helpPanel');
  const helpOpenBtn = document.getElementById('helpOpenBtn');
  const oldPasswordInput = document.getElementById('oldPassword');
  const newPasswordInput = document.getElementById('newPassword');
  const setPasswordBtn = document.getElementById('setPasswordBtn');
  const passwordMessage = document.getElementById('passwordMessage');

  function renderProfileSummary() {
    if (!profileSummary) return;
    profileSummary.innerHTML =
      '<div class="budget-row"><div class="budget-row__top"><span class="budget-row__name">Name</span><span class="budget-row__amount">' + profile.name + '</span></div></div>' +
      '<div class="budget-row"><div class="budget-row__top"><span class="budget-row__name">Email</span><span class="budget-row__amount">' + profile.email + '</span></div></div>' +
      '<div class="budget-row"><div class="budget-row__top"><span class="budget-row__name">Phone</span><span class="budget-row__amount">' + profile.phone + '</span></div></div>' +
      '<div class="budget-row"><div class="budget-row__top"><span class="budget-row__name">Mode</span><span class="budget-row__amount">' + profile.mode + '</span></div></div>';
  }

  function populateProfileForm() {
    if (!nameInput || !emailInput || !phoneInput || !modeSelect || !currencySelect) return;
    nameInput.value = profile.name;
    emailInput.value = profile.email;
    phoneInput.value = profile.phone;
    modeSelect.value = profile.mode || 'personal';
    currencySelect.value = SpendWise.getCurrency();
  }

  function showEditProfileForm() {
    const formSection = document.getElementById('editProfileSection');
    if (formSection) {
      populateProfileForm();
      formSection.hidden = false;
      nameInput.focus();
    }
  }

  if (profileSummary) renderProfileSummary();
  populateProfileForm();

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', function () {
      showEditProfileForm();
    });
  }

  if (clearProfileBtn) {
    clearProfileBtn.addEventListener('click', function () {
      if (!nameInput || !emailInput || !phoneInput) return;
      nameInput.value = '';
      emailInput.value = '';
      phoneInput.value = '';
    });
  }

  if (updateProfileBtn) {
    updateProfileBtn.addEventListener('click', function (event) {
      event.preventDefault();
      const updatedProfile = {
        name: nameInput.value.trim() || 'Mariam Johnson',
        email: emailInput.value.trim() || 'mariam@gmail.com',
        phone: phoneInput.value.trim() || '+234 801 234 5678',
        mode: modeSelect.value || 'personal'
      };
      SpendWise.saveProfile(updatedProfile);
      profile.name = updatedProfile.name;
      profile.email = updatedProfile.email;
      profile.phone = updatedProfile.phone;
      profile.mode = updatedProfile.mode;
      renderProfileSummary();
      alert('Profile updated successfully.');
    });
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function (event) {
      event.preventDefault();
      SpendWise.setCurrency(currencySelect.value);
      const updatedProfile = {
        ...SpendWise.getProfile(),
        mode: modeSelect.value || 'personal'
      };
      SpendWise.saveProfile(updatedProfile);
      profile.mode = updatedProfile.mode;
      renderProfileSummary();
      alert('Settings saved and currency updated across the app.');
    });
  }

  if (backupSaveBtn && backupEmailInput) {
    backupEmailInput.value = SpendWise.getBackupEmail();
    backupSaveBtn.addEventListener('click', function (event) {
      event.preventDefault();
      const email = backupEmailInput.value.trim();
      SpendWise.setBackupEmail(email);
      alert('Backup email saved.');
    });
  }

  if (manageBackupBtn && backupPanel) {
    manageBackupBtn.addEventListener('click', function () {
      backupPanel.hidden = !backupPanel.hidden;
      if (!backupPanel.hidden && backupEmailInput) backupEmailInput.focus();
    });
  }

  if (helpOpenBtn && helpPanel) {
    helpOpenBtn.addEventListener('click', function () {
      helpPanel.hidden = !helpPanel.hidden;
    });
  }

  if (setPasswordBtn && oldPasswordInput && newPasswordInput && passwordMessage) {
    setPasswordBtn.addEventListener('click', function (event) {
      event.preventDefault();
      const oldPassword = oldPasswordInput.value;
      const newPassword = newPasswordInput.value;
      if (!oldPassword || !newPassword) {
        passwordMessage.textContent = 'Please fill out both fields.';
        passwordMessage.style.color = '#dc2626';
        return;
      }
      const currentPassword = SpendWise.getPassword();
      if (oldPassword !== currentPassword) {
        passwordMessage.textContent = 'Old password does not match.';
        passwordMessage.style.color = '#dc2626';
        return;
      }
      SpendWise.setPassword(newPassword);
      passwordMessage.textContent = 'Password updated successfully.';
      passwordMessage.style.color = '#16a34a';
      oldPasswordInput.value = '';
      newPasswordInput.value = '';
    });
  }
});
