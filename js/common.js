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

function createDemoState() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const now = new Date().toISOString();

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
    budgets: [
      { id: 'budget-food', category: 'Food', amount: 20000, spent: 15600, notes: 'Groceries and daily meals', currency: 'NGN' },
      { id: 'budget-transport', category: 'Transport', amount: 15000, spent: 9800, notes: 'Fuel and transport', currency: 'NGN' },
      { id: 'budget-bills', category: 'Bills', amount: 10000, spent: 3200, notes: 'Utilities and bills', currency: 'NGN' }
    ],
    expenses: [
      { id: 'expense-1', category: 'Transport', amount: 2500, currency: 'NGN', date: yyyy + '-' + mm + '-' + dd, notes: 'Bus fare', createdAt: now },
      { id: 'expense-2', category: 'Food', amount: 1800, currency: 'NGN', date: yyyy + '-' + mm + '-' + dd, notes: 'Lunch', createdAt: now },
      { id: 'expense-3', category: 'Shopping', amount: 3200, currency: 'NGN', date: yyyy + '-' + mm + '-' + dd, notes: 'Groceries', createdAt: now },
      { id: 'expense-4', category: 'Bills', amount: 1500, currency: 'NGN', date: yyyy + '-' + mm + '-' + dd, notes: 'Electricity', createdAt: now }
    ],
    income: [
      { id: 'income-1', category: 'Salary', amount: 50000, currency: 'NGN', date: yyyy + '-' + mm + '-' + dd, notes: 'Salary payout', createdAt: now }
    ],
    savings: []
  };
}

function syncBudgetsWithExpenses(state) {
  const expenses = Array.isArray(state.expenses) ? state.expenses : [];
  const budgets = (state.budgets || []).map(function (budget) {
    const matchingExpenses = expenses.filter(function (expense) {
      return expense.category === budget.category && isSameMonth(expense.date || expense.createdAt, new Date());
    });
    const spent = matchingExpenses.reduce(function (sum, expense) {
      return sum + Number(expense.amount || 0);
    }, 0);
    return { ...budget, spent };
  });
  return { ...state, budgets };
}

function buildStateFromStorage(stored) {
  const defaults = createDemoState();
  const expenses = Array.isArray(stored.expenses) ? stored.expenses : defaults.expenses;
  const income = Array.isArray(stored.income) ? stored.income : defaults.income;
  const transactions = Array.isArray(stored.transactions) && stored.transactions.length > 0
    ? stored.transactions
    : deriveTransactionsFromState({ ...defaults, ...stored, expenses, income });

  return syncBudgetsWithExpenses({
    ...defaults,
    ...stored,
    profile: { ...defaults.profile, ...(stored.profile || {}) },
    backups: { ...defaults.backups, ...(stored.backups || {}) },
    reminders: { ...(defaults.reminders || {}), ...(stored.reminders || {}) },
    budgets: Array.isArray(stored.budgets) ? stored.budgets : defaults.budgets,
    expenses,
    income,
    savings: Array.isArray(stored.savings) ? stored.savings : defaults.savings,
    transactions
  });
}

function ensureSpendWiseState() {
  const stored = spendwiseLoadState();
  if (!stored || Object.keys(stored).length === 0) {
    const defaults = createDemoState();
    spendwiseSaveState(defaults);
    return defaults;
  }

  const merged = buildStateFromStorage(stored);
  if (JSON.stringify(merged) !== JSON.stringify(stored)) {
    spendwiseSaveState(merged);
  }
  return merged;
}

function notifySpendWiseDataChanged() {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new Event('spendwise:data-updated'));
  }
}

function normalizeTransactionEntry(entry, defaultType) {
  const item = entry || {};
  const type = item.type || defaultType || 'expense';
  return {
    id: item.id || type + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    type,
    category: item.category || item.source || 'Others',
    amount: Number(item.amount || 0),
    currency: item.currency || 'NGN',
    date: item.date || item.createdAt || new Date().toISOString(),
    notes: item.notes || '',
    createdAt: item.createdAt || new Date().toISOString()
  };
}

function normalizeTransactions(entries) {
  return (entries || []).map(function (entry) {
    return normalizeTransactionEntry(entry, entry && entry.type ? entry.type : 'expense');
  });
}

function deriveTransactionsFromState(state) {
  const expenses = Array.isArray(state.expenses) ? state.expenses : [];
  const income = Array.isArray(state.income) ? state.income : [];
  const explicitTransactions = Array.isArray(state.transactions) && state.transactions.length > 0
    ? normalizeTransactions(state.transactions)
    : [];

  if (explicitTransactions.length > 0) {
    return explicitTransactions;
  }

  const expenseTransactions = expenses.map(function (entry) {
    return normalizeTransactionEntry({ ...entry, type: 'expense' }, 'expense');
  });
  const incomeTransactions = income.map(function (entry) {
    return normalizeTransactionEntry({ ...entry, type: 'income' }, 'income');
  });

  return expenseTransactions.concat(incomeTransactions).sort(function (a, b) {
    return new Date(b.createdAt || b.date || new Date()) - new Date(a.createdAt || a.date || new Date());
  });
}

function calculateTransactionTotals(transactions) {
  const items = normalizeTransactions(transactions || []);
  const incomeTotal = items.filter(function (item) {
    return item.type === 'income';
  }).reduce(function (sum, item) {
    return sum + Number(item.amount || 0);
  }, 0);
  const expenseTotal = items.filter(function (item) {
    return item.type === 'expense';
  }).reduce(function (sum, item) {
    return sum + Number(item.amount || 0);
  }, 0);
  return {
    count: items.length,
    income: incomeTotal,
    expense: expenseTotal,
    net: incomeTotal - expenseTotal
  };
}

function renderRecentTransactions(container, state) {
  if (!container) return [];

  const transactions = normalizeTransactions(
    Array.isArray(state && state.transactions) && state.transactions.length > 0
      ? state.transactions
      : SpendWise.getTransactions()
  );
  const sortedTransactions = transactions.slice().sort(function (a, b) {
    return new Date(b.createdAt || b.date || new Date()) - new Date(a.createdAt || a.date || new Date());
  });

  container.innerHTML = '';
  if (sortedTransactions.length === 0) {
    container.innerHTML = '<li class="tx-item"><span class="tx-item__body"><span class="tx-item__name">No recent transactions.</span><br><span class="tx-item__meta">Add income or expense entries to see them here.</span></span></li>';
    return sortedTransactions;
  }

  sortedTransactions.forEach(function (item) {
    const li = document.createElement('li');
    li.className = 'tx-item';
    const isExpense = item.type === 'expense';
    const sign = isExpense ? '- ' : '+ ';
    const amountClass = isExpense ? 'is-expense' : 'is-income';
    const icon = item.category === 'Food' ? '🍔' : item.category === 'Transport' ? '🚌' : item.category === 'Shopping' ? '🛍️' : item.category === 'Bills' ? '🧾' : item.category === 'Salary' || item.category === 'Business' || item.category === 'Gift' ? '💰' : '📦';
    li.innerHTML = '<span class="tx-item__icon" style="background:' + (isExpense ? 'rgba(239,68,68,0.10)' : 'rgba(34,197,94,0.14)') + '">' + icon + '</span>' + '<span class="tx-item__body"><span class="tx-item__name">' + item.category + '</span><br><span class="tx-item__meta">' + (item.notes || 'Saved from local data') + '</span></span><span class="tx-item__amount ' + amountClass + '">' + sign + formatSpendWiseAmount(item.amount, item.currency || SpendWise.getCurrency()) + '</span>';
    container.appendChild(li);
  });

  return sortedTransactions;
}

const SpendWise = {
  getState() {
const stored = spendwiseLoadState();
return buildStateFromStorage({
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
});
  },

  saveState(changes) {
    const state = this.getState();
    const nextState = { ...state, ...changes };
    const expenses = Array.isArray(changes && changes.expenses)
      ? changes.expenses
      : (Array.isArray(nextState.expenses) ? nextState.expenses : state.expenses || []);
    const income = Array.isArray(changes && changes.income)
      ? changes.income
      : (Array.isArray(nextState.income) ? nextState.income : state.income || []);
    const transactions = Array.isArray(changes && changes.transactions)
      ? changes.transactions
      : deriveTransactionsFromState({ ...nextState, expenses, income });
    const merged = syncBudgetsWithExpenses({ ...nextState, expenses, income, transactions });
    spendwiseSaveState(merged);
    notifySpendWiseDataChanged();
    return merged;
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
    return this.saveState({ budgets });
  },

  getExpenses() {
    return this.getState().expenses || [];
  },

  saveExpenses(expenses) {
    const state = this.getState();
    const nextExpenses = (expenses || []).map(function (expense, index) {
      return {
        ...expense,
        id: expense.id || 'expense-' + Date.now() + '-' + index,
        amount: Number(expense.amount || 0),
        currency: expense.currency || state.currency || 'NGN',
        date: expense.date || expense.createdAt || new Date().toISOString(),
        createdAt: expense.createdAt || new Date().toISOString()
      };
    });
    const nextTransactions = normalizeTransactions([
      ...(state.transactions || []).filter(function (item) {
        return item.type !== 'expense';
      }),
      ...nextExpenses.map(function (expense) {
        return normalizeTransactionEntry({ ...expense, type: 'expense' }, 'expense');
      })
    ]);
    return this.saveState({ expenses: nextExpenses, transactions: nextTransactions });
  },

  getIncome() {
    return this.getState().income || [];
  },

  saveIncome(income) {
    const state = this.getState();
    const nextIncome = (income || []).map(function (entry, index) {
      return {
        ...entry,
        id: entry.id || 'income-' + Date.now() + '-' + index,
        amount: Number(entry.amount || 0),
        currency: entry.currency || state.currency || 'NGN',
        date: entry.date || entry.createdAt || new Date().toISOString(),
        createdAt: entry.createdAt || new Date().toISOString()
      };
    });
    const nextTransactions = normalizeTransactions([
      ...(state.transactions || []).filter(function (item) {
        return item.type !== 'income';
      }),
      ...nextIncome.map(function (entry) {
        return normalizeTransactionEntry({ ...entry, type: 'income' }, 'income');
      })
    ]);
    return this.saveState({ income: nextIncome, transactions: nextTransactions });
  },

  getSavings() {
    return this.getState().savings || [];
  },

  saveSavings(savings) {
    return this.saveState({ savings });
  },

  getTransactions() {
    return deriveTransactionsFromState(this.getState());
  },

  saveTransactions(transactions) {
    const normalized = normalizeTransactions(transactions || []);
    const expenses = normalized.filter(function (item) {
      return item.type === 'expense';
    }).map(function (item) {
      return {
        id: item.id,
        category: item.category,
        amount: Number(item.amount || 0),
        currency: item.currency || 'NGN',
        date: item.date,
        notes: item.notes,
        createdAt: item.createdAt
      };
    });
    const income = normalized.filter(function (item) {
      return item.type === 'income';
    }).map(function (item) {
      return {
        id: item.id,
        category: item.category,
        amount: Number(item.amount || 0),
        currency: item.currency || 'NGN',
        date: item.date,
        notes: item.notes,
        createdAt: item.createdAt
      };
    });
    return this.saveState({ transactions: normalized, expenses, income });
  },

  getProfile() {
    return this.getState().profile;
  },

  saveProfile(profile) {
    return this.saveState({ profile });
  },

  getPassword() {
    return this.getState().password;
  },

  setPassword(password) {
    return this.saveState({ password });
  },

  getBackupEmail() {
    return this.getState().backups.email || '';
  },

  setBackupEmail(email) {
    const backups = this.getState().backups || {};
    return this.saveState({ backups: { ...backups, email } });
  },

  getReminderDate(key) {
    return (this.getState().reminders || {})[key] || '';
  },

  setReminderDate(key, date) {
    const reminders = { ...(this.getState().reminders || {}) };
    reminders[key] = date;
    return this.saveState({ reminders });
  }
};

function loadData() {
  return SpendWise.getState();
}

function saveData(changes) {
  return SpendWise.saveState(changes);
}

function formatSpendWiseAmount(amount, currencyCode) {
  const symbol = SpendWise.getCurrencySymbol(currencyCode || SpendWise.getCurrency());
  const value = Number(amount || 0);
  return symbol + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMonthKey(dateValue) {
  const parsed = new Date(dateValue || new Date());
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.getFullYear() + '-' + String(parsed.getMonth() + 1).padStart(2, '0');
}

function isSameMonth(dateValue, referenceDate) {
  return getMonthKey(dateValue) === getMonthKey(referenceDate || new Date());
}

function calculateBudget(budget, expenses) {
  const safeBudget = budget || {};
  const matchingExpenses = (expenses || []).filter(function (expense) {
    return expense.category === safeBudget.category && isSameMonth(expense.date || expense.createdAt, new Date());
  });
  const spent = matchingExpenses.reduce(function (sum, expense) {
    return sum + Number(expense.amount || 0);
  }, 0);
  const amount = Number(safeBudget.amount || 0);
  return {
    id: safeBudget.id,
    category: safeBudget.category,
    amount: amount,
    spent: spent,
    remaining: Math.max(0, amount - spent),
    percent: amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0,
    currency: safeBudget.currency || SpendWise.getCurrency()
  };
}

function calculateMonthlySpending(expenses) {
  const currentMonthExpenses = (expenses || []).filter(function (expense) {
    return isSameMonth(expense.date || expense.createdAt, new Date());
  });
  const totals = currentMonthExpenses.reduce(function (acc, expense) {
    const category = expense.category || 'Others';
    acc[category] = (acc[category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});
  return {
    total: currentMonthExpenses.reduce(function (sum, expense) {
      return sum + Number(expense.amount || 0);
    }, 0),
    byCategory: totals,
    entries: currentMonthExpenses
  };
}

function getSpendWiseDisplayName() {
  const profile = SpendWise.getProfile();
  return (profile && profile.name && profile.name.trim()) || 'Mariam Johnson';
}

function getSpendWiseInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MA';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function applySpendWiseProfileName() {
  const displayName = getSpendWiseDisplayName();

  document.querySelectorAll('.greeting-name').forEach(function (el) {
    const icon = el.querySelector('span[aria-hidden="true"]');
    const iconHtml = icon ? icon.outerHTML : '';
    el.textContent = '';
    el.appendChild(document.createTextNode(displayName));
    if (iconHtml) {
      el.insertAdjacentHTML('beforeend', iconHtml);
    }
  });

  document.querySelectorAll('.avatar-btn').forEach(function (btn) {
    btn.textContent = getSpendWiseInitials(displayName);
  });

  document.querySelectorAll('[data-profile-name]').forEach(function (el) {
    el.textContent = displayName;
  });
}

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
  if (!menuToggle || !sidebar || !backdrop || menuToggle.dataset.spendwiseBound === 'true') {
    return;
  }

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
    if (sidebar.classList.contains('is-open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSidebar();
    }
  });

  menuToggle.dataset.spendwiseBound = 'true';
}

function initSpendWiseQuickLinks() {
  document.querySelectorAll('[data-nav-link]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      const target = link.getAttribute('data-nav-link');
      if (target) {
        window.location.href = target;
      }
    });
  });
}

function renderBudgetSnapshot() {
  const budgetCard = document.querySelector('.budget-card');
  if (!budgetCard) return;

  const budgets = SpendWise.getBudgets() || [];
  const expenses = SpendWise.getExpenses() || [];
  const rows = Array.from(budgetCard.querySelectorAll('.budget-row'));
  const budgetSummaries = budgets.slice(0, rows.length).map(function (budget) {
    return calculateBudget(budget, expenses);
  });

  rows.forEach(function (row, index) {
    const summary = budgetSummaries[index];
    if (!summary) {
      row.style.display = 'none';
      return;
    }

    row.style.display = '';
    const nameEl = row.querySelector('.budget-row__name');
    const amountEl = row.querySelector('.budget-row__amount');
    const progressEl = row.querySelector('.progress-fill');
    const pctEl = row.querySelector('.budget-row__pct');

    if (nameEl) {
      nameEl.textContent = summary.category;
    }
    if (amountEl) {
      amountEl.textContent = formatSpendWiseAmount(summary.spent, summary.currency) + ' / ' + formatSpendWiseAmount(summary.amount, summary.currency);
    }
    if (progressEl) {
      progressEl.style.width = summary.percent + '%';
      progressEl.style.setProperty('--fill', summary.percent + '%');
    }
    if (pctEl) {
      pctEl.textContent = summary.percent + '% used';
    }
  });
}

function updateDashboard() {
  const state = loadData();
  const expenses = state.expenses || [];
  const income = state.income || [];
  const budgets = state.budgets || [];
  const monthlySpending = calculateMonthlySpending(expenses);
  const totalIncome = income.reduce(function (sum, item) {
    return sum + Number(item.amount || 0);
  }, 0);
  const totalExpense = expenses.reduce(function (sum, item) {
    return sum + Number(item.amount || 0);
  }, 0);
  const netBalance = totalIncome - totalExpense;

  const balanceAmountEl = document.getElementById('balanceAmount');
  const incomeValueEl = document.getElementById('incomeValue');
  const expenseValueEl = document.getElementById('expenseValue');
  const savingsValueEl = document.getElementById('savingsValue');
  if (balanceAmountEl) {
    balanceAmountEl.textContent = formatSpendWiseAmount(netBalance, state.currency);
    balanceAmountEl.dataset.value = String(netBalance);
  }
  if (incomeValueEl) {
    incomeValueEl.textContent = formatSpendWiseAmount(totalIncome, state.currency);
    incomeValueEl.dataset.value = String(totalIncome);
  }
  if (expenseValueEl) {
    expenseValueEl.textContent = formatSpendWiseAmount(totalExpense, state.currency);
    expenseValueEl.dataset.value = String(totalExpense);
  }
  if (savingsValueEl) {
    savingsValueEl.textContent = formatSpendWiseAmount(netBalance, state.currency);
    savingsValueEl.dataset.value = String(netBalance);
  }

  const donutSegmentsEl = document.getElementById('donutSegments');
  const legendListEl = document.getElementById('legendList');
  const donutCenterAmountEl = document.querySelector('.donut-center__amount');
  const donutCenterLabelEl = document.querySelector('.donut-center__label');

  if (donutSegmentsEl && legendListEl) {
    donutSegmentsEl.innerHTML = '';
    const categories = Object.entries(monthlySpending.byCategory || {}).sort(function (a, b) {
      return b[1] - a[1];
    });

    if (categories.length === 0) {
      legendListEl.innerHTML = '<li><span class="legend__dot" style="background:#64748B"></span>No expenses yet <b>0%</b></li>';
      if (donutCenterAmountEl) donutCenterAmountEl.textContent = formatSpendWiseAmount(0, state.currency);
      if (donutCenterLabelEl) donutCenterLabelEl.textContent = 'No expenses yet';
      return;
    }

    const totalCategoryValue = categories.reduce(function (sum, item) {
      return sum + Number(item[1] || 0);
    }, 0);
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const colors = ['#22C55E', '#F59E0B', '#3882F6', '#16A34A', '#64748B'];

    categories.forEach(function (entry, index) {
      const category = entry[0];
      const value = Number(entry[1] || 0);
      const pct = totalCategoryValue > 0 ? Math.round((value / totalCategoryValue) * 100) : 0;
      const dash = Math.round((pct / 100) * circumference);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 80);
      circle.setAttribute('cy', 80);
      circle.setAttribute('r', radius);
      circle.setAttribute('class', 'donut-seg');
      circle.style.stroke = colors[index % colors.length];
      circle.style.strokeDasharray = dash + ' ' + Math.max(0, circumference - dash);
      circle.style.strokeDashoffset = '-' + offset;
      donutSegmentsEl.appendChild(circle);
      offset += dash;
    });

    legendListEl.innerHTML = categories.map(function (entry, index) {
      const category = entry[0];
      const value = Number(entry[1] || 0);
      const pct = totalCategoryValue > 0 ? Math.round((value / totalCategoryValue) * 100) : 0;
      return '<li><span class="legend__dot" style="background:' + colors[index % colors.length] + '"></span>' + category + ' <b>' + pct + '%</b></li>';
    }).join('');

    if (donutCenterAmountEl) donutCenterAmountEl.textContent = formatSpendWiseAmount(monthlySpending.total, state.currency);
    if (donutCenterLabelEl) donutCenterLabelEl.textContent = 'Total Spent';
  }

  renderBudgetSnapshot();

  const txListEl = document.getElementById('txList');
  if (txListEl) {
    renderRecentTransactions(txListEl, state);
  }
}

function updateBudgetPage() {
  if (typeof window.renderBudgetPage === 'function') {
    window.renderBudgetPage();
  }
}

function updateReports() {
  if (typeof window.renderSpendWiseReports === 'function') {
    window.renderSpendWiseReports();
  }
}

function initSpendWiseCommon() {
  ensureSpendWiseState();
  applySpendWiseProfileName();
  applySpendWiseCurrency();
  initSpendWiseMenuToggle();
  initSpendWiseQuickLinks();
  if (document.getElementById('balanceAmount') || document.getElementById('txList')) {
    updateDashboard();
  }
  if (document.getElementById('budgetRows')) {
    updateBudgetPage();
  }
  if (document.getElementById('reportDonutAmount')) {
    updateReports();
  }
}

document.addEventListener('DOMContentLoaded', initSpendWiseCommon);
window.addEventListener('spendwise:data-updated', function () {
  if (document.getElementById('balanceAmount') || document.getElementById('txList')) {
    updateDashboard();
  }
  if (document.getElementById('budgetRows')) {
    updateBudgetPage();
  }
  if (document.getElementById('reportDonutAmount')) {
    updateReports();
  }
});
window.SpendWise = SpendWise;
window.applySpendWiseProfileName = applySpendWiseProfileName;
window.loadData = loadData;
window.saveData = saveData;
window.calculateBudget = calculateBudget;
window.calculateMonthlySpending = calculateMonthlySpending;
window.updateDashboard = updateDashboard;
window.updateBudgetPage = updateBudgetPage;
window.updateReports = updateReports;
window.renderBudgetSnapshot = renderBudgetSnapshot;
window.formatSpendWiseAmount = formatSpendWiseAmount;
window.renderRecentTransactions = renderRecentTransactions;
window.calculateTransactionTotals = calculateTransactionTotals;
