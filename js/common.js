function spendwiseLoadState() {
  try {
    return JSON.parse(localStorage.getItem('spendwise.state') || '{}');
  } catch (error) {
    return {};
  }
}

function spendwiseSaveState(state) {
  localStorage.setItem('spendwise.state', JSON.stringify(state));
}

const SpendWise = {
  getState() {
    const stored = spendwiseLoadState();
    return {
      currency: 'NGN',
      password: 'password123',
      profile: {
        name: 'Mariam Johnson',
        email: 'mariam@gmail.com',
        phone: '+234 801 234 5678',
        mode: 'personal'
      },
      backups: {
        email: ''
      },
      reminders: {},
      budgets: [],
      savings: [],
      transactions: [],
      ...stored
    };
  },

  saveState(changes) {
    const state = this.getState();
    spendwiseSaveState({ ...state, ...changes });
  },

  getCurrency() {
    return this.getState().currency;
  },

  setCurrency(currency) {
    this.saveState({ currency });
    applySpendWiseCurrency();
  },

  getCurrencyLabel(currency) {
    const labels = {
      NGN: 'NGN (₦)',
      USD: 'USD ($)',
      EUR: 'EUR (€)',
      GBP: 'GBP (£)',
      GHS: 'GHS (₵)',
      KES: 'KES (KSh)'
    };
    return labels[currency] || currency;
  },

  getCurrencySymbol(currency) {
    const symbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£',
      GHS: '₵',
      KES: 'KSh'
    };
    return symbols[currency] || '';
  },

  getBudgets() {
    return this.getState().budgets || [];
  },

  saveBudgets(budgets) {
    this.saveState({ budgets });
  },

  getSavings() {
    return this.getState().savings || [];
  },

  saveSavings(savings) {
    this.saveState({ savings });
  },

  getTransactions() {
    return this.getState().transactions || [];
  },

  saveTransactions(transactions) {
    this.saveState({ transactions });
  },

  getProfile() {
    return this.getState().profile;
  },

  saveProfile(profile) {
    this.saveState({ profile });
  },

  getPassword() {
    return this.getState().password;
  },

  setPassword(password) {
    this.saveState({ password });
  },

  getBackupEmail() {
    return this.getState().backups.email || '';
  },

  setBackupEmail(email) {
    const backups = this.getState().backups || {};
    this.saveState({ backups: { ...backups, email } });
  },

  getReminderDate(key) {
    return (this.getState().reminders || {})[key] || '';
  },

  setReminderDate(key, date) {
    const reminders = { ...(this.getState().reminders || {}) };
    reminders[key] = date;
    this.saveState({ reminders });
  }
};

function applySpendWiseCurrency() {
  const currency = SpendWise.getCurrency();
  const label = SpendWise.getCurrencyLabel(currency);
  document.querySelectorAll('.currency-pill span').forEach(function (span) {
    span.textContent = label;
  });
  document.querySelectorAll('[data-currency-label]').forEach(function (el) {
    el.textContent = label;
  });
}

function initSpendWiseMenuToggle() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('backdrop');
  // Ensure a backdrop element exists so the menu can be toggled on smaller screens
  let _backdrop = backdrop;
  if (!document.body) return;
  if (!_backdrop) {
    _backdrop = document.createElement('div');
    _backdrop.id = 'backdrop';
    _backdrop.className = 'backdrop';
    _backdrop.hidden = true;
    document.body.appendChild(_backdrop);
  }
  if (!menuToggle || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('is-open');
    backdrop.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    backdrop.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
  });

  _backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });
}

function initSpendWiseQuickLinks() {
  document.querySelectorAll('.icon-btn[aria-label^="View notifications"]').forEach(function (btn) {
    if (btn.tagName === 'BUTTON') {
      btn.addEventListener('click', function () {
        window.location.href = 'reminder.html';
      });
    }
  });

  document.querySelectorAll('.avatar-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.href = 'profile.html';
    });
  });
}

function initSpendWiseCommon() {
  applySpendWiseCurrency();
  initSpendWiseMenuToggle();
  initSpendWiseQuickLinks();
}

document.addEventListener('DOMContentLoaded', initSpendWiseCommon);
window.SpendWise = SpendWise;
