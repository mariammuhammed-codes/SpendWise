/* =================================================================
   SPENDWISE — LOGIN PAGE SCRIPT
   Plain vanilla JavaScript, no frameworks or libraries.

   IMPORTANT NOTE FOR THE DEVELOPER
   This page is front-end only — there is no real server to check
   the email/password against. Submitting the form simulates a
   short loading delay and then shows a success message. Look for
   the comment inside the "form submit" section below for exactly
   where to connect this to a real authentication API.

   What this file does:
   1. Dark mode toggle (saved so it's remembered next visit)
   2. Language selector (saved; real translation not included yet)
   3. Show / hide password
   4. Toast helper
   5. Login form validation + simulated submit
   6. Social login buttons (demo placeholders)
   ================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------
     TOAST HELPER (used by several features below)
  --------------------------------------------------------------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2800);
  }

  /* ---------------------------------------------------------------
     1. DARK MODE TOGGLE
     The chosen theme is saved in localStorage so it stays the same
     the next time this person opens the page.
  --------------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  const htmlEl = document.documentElement;
  const THEME_KEY = 'spendwiseTheme';

  function applyTheme(theme) {
    if (theme === 'dark') {
      htmlEl.setAttribute('data-theme', 'dark');
      themeLabel.textContent = 'Light Mode';
      themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      htmlEl.removeAttribute('data-theme');
      themeLabel.textContent = 'Dark Mode';
      themeToggle.setAttribute('aria-pressed', 'false');
    }
  }

  // Load any previously saved preference as soon as the page opens.
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) applyTheme(savedTheme);

  themeToggle.addEventListener('click', function () {
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    const nextTheme = isDark ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });

  /* ---------------------------------------------------------------
     2. LANGUAGE SELECTOR
     Saves the person's chosen language for later. Full translation
     of the interface isn't wired up in this demo -- this is where
     a real app would swap out its text strings.
  --------------------------------------------------------------- */
  const langSelect = document.getElementById('langSelect');
  const LANG_KEY = 'spendwiseLang';
  const LANG_NAMES = { en: 'English', fr: 'Français', ha: 'Hausa', yo: 'Yorùbá', ig: 'Igbo' };

  const savedLang = localStorage.getItem(LANG_KEY);
  if (savedLang) langSelect.value = savedLang;

  langSelect.addEventListener('change', function () {
    localStorage.setItem(LANG_KEY, langSelect.value);
    showToast('Language preference set to ' + LANG_NAMES[langSelect.value] + '.');
  });

  /* ---------------------------------------------------------------
     3. SHOW / HIDE PASSWORD
  --------------------------------------------------------------- */
  const passwordInput = document.getElementById('loginPassword');
  const togglePassword = document.getElementById('togglePassword');

  togglePassword.addEventListener('click', function () {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePassword.setAttribute('aria-pressed', String(isPassword));
    togglePassword.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });

  /* ---------------------------------------------------------------
     5. LOGIN FORM VALIDATION + SIMULATED SUBMIT
  --------------------------------------------------------------- */
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const loginSubmit = document.getElementById('loginSubmit');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginArrow = document.getElementById('loginArrow');
  const loginBtnText = document.getElementById('loginBtnText');

  // Very simple email pattern check -- good enough to catch obvious
  // typos like a missing "@" without being overly strict.
  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function setFieldError(input, errorEl, message) {
    input.closest('.field-group').classList.add('has-error');
    errorEl.textContent = message;
    errorEl.hidden = false;
  }
  function clearFieldError(input, errorEl) {
    input.closest('.field-group').classList.remove('has-error');
    errorEl.hidden = true;
  }

  // Clear an error as soon as the person starts fixing that field.
  emailInput.addEventListener('input', function () { clearFieldError(emailInput, emailError); });
  passwordInput.addEventListener('input', function () { clearFieldError(passwordInput, passwordError); });

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    let isValid = true;

    if (!isValidEmail(emailInput.value.trim())) {
      setFieldError(emailInput, emailError, 'Please enter a valid email address.');
      isValid = false;
    } else {
      clearFieldError(emailInput, emailError);
    }

    if (passwordInput.value.length < 6) {
      setFieldError(passwordInput, passwordError, 'Password must be at least 6 characters.');
      isValid = false;
    } else {
      clearFieldError(passwordInput, passwordError);
    }

    if (!isValid) return;

    // ---- Show a loading state on the button while we "log in" ----
    loginSubmit.disabled = true;
    loginArrow.hidden = true;
    loginSpinner.hidden = false;
    loginBtnText.textContent = 'Logging in...';

    // ------------------------------------------------------------
    // DEVELOPER NOTE: this setTimeout stands in for a real network
    // request. Replace it with something like:
    //
    //   fetch('/api/login', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       email: emailInput.value.trim(),
    //       password: passwordInput.value
    //     })
    //   })
    //   .then(response => response.json())
    //   .then(result => { /* redirect on success, show error on failure */ })
    //   .catch(() => { /* show a network error message */ });
    // ------------------------------------------------------------
    setTimeout(function () {
      loginSubmit.disabled = false;
      loginArrow.hidden = false;
      loginSpinner.hidden = true;
      loginBtnText.textContent = 'Login';
      window.location.href = 'pages/dashboard.html';
    }, 1300);
  });

  /* ---------------------------------------------------------------
     6. SOCIAL LOGIN BUTTONS (demo placeholders)
  --------------------------------------------------------------- */
  document.querySelectorAll('.btn--social').forEach(function (button) {
    button.addEventListener('click', function () {
      const provider = button.getAttribute('data-provider');
      showToast(provider + ' sign-in isn\'t connected in this demo yet.');
    });
  });

});