
document.addEventListener('DOMContentLoaded', function () {
  const CURRENCY_SYMBOLS = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
    KES: 'KSh'
  };

  const CATEGORY_STYLE = {
    Salary: { icon: '💰', bg: 'rgba(34,197,94,0.14)' },
    Business: { icon: '💼', bg: 'rgba(34,197,94,0.14)' },
    Gift: { icon: '🎁', bg: 'rgba(34,197,94,0.14)' },
    Food: { icon: '🍔', bg: 'rgba(239,68,68,0.10)' },
    Transport: { icon: '🚌', bg: 'rgba(56,130,246,0.12)' },
    Shopping: { icon: '🛍️', bg: 'rgba(245,158,11,0.14)' },
    Bills: { icon: '🧾', bg: 'rgba(100,116,139,0.14)' },
    Others: { icon: '📦', bg: 'rgba(100,116,139,0.14)' },
    Other: { icon: '📦', bg: 'rgba(100,116,139,0.14)' }
  };

  const txListEl = document.getElementById('txList');
  const balanceAmountEl = document.getElementById('balanceAmount');
  const incomeValueEl = document.getElementById('incomeValue');
  const expenseValueEl = document.getElementById('expenseValue');
  const savingsValueEl = document.getElementById('savingsValue');
  const toast = document.getElementById('toast');
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const backdrop = document.getElementById('backdrop');
  const allModals = document.querySelectorAll('.modal');
  const tabs = document.querySelectorAll('.tab');
  const tipTextEl = document.querySelector('.tip-body p');
  const nextTipBtn = document.getElementById('nextTipBtn');
  const greetingEl = document.getElementById('greetingText');

  let currentFilter = 'all';
  let toastTimer = null;
  let lastFocusedElement = null;

  function formatMoney(amount, currencyCode) {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '₦';
    const formattedNumber = Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return symbol + formattedNumber;
  }

  function getTransactions(state) {
    const incomeEntries = (state.income || []).map(function (item) {
      return { ...item, type: 'income' };
    });
    const expenseEntries = (state.expenses || []).map(function (item) {
      return { ...item, type: 'expense' };
    });
    return [...incomeEntries, ...expenseEntries].sort(function (a, b) {
      return new Date(b.createdAt || b.date || new Date()) - new Date(a.createdAt || a.date || new Date());
    });
  }

  // Icon + colour shown for each transaction category.
  const CATEGORY_STYLE = {
    Salary:    { icon: '💰', bg: 'rgba(34,197,94,0.14)' },
    Business:  { icon: '💼', bg: 'rgba(34,197,94,0.14)' },
    Gift:      { icon: '🎁', bg: 'rgba(34,197,94,0.14)' },
    Food:      { icon: '🍔', bg: 'rgba(239,68,68,0.10)' },
    Transport: { icon: '🚌', bg: 'rgba(56,130,246,0.12)' },
    Shopping:  { icon: '🛍️', bg: 'rgba(245,158,11,0.14)' },
    Bills:     { icon: '🧾', bg: 'rgba(100,116,139,0.14)' },
    Others:    { icon: '📦', bg: 'rgba(100,116,139,0.14)' },
    Other:     { icon: '📦', bg: 'rgba(100,116,139,0.14)' }
  };

  // Starting transaction data are loaded from persistent SpendWise state.
  // If no persisted transactions exist, start with an empty list.
  let transactions = SpendWise.getTransactions() || [];

  const txListEl = document.getElementById('txList');
  let currentFilter = 'all';

  // Builds one <li> element for a transaction.
  function buildTxItem(tx) {
    const style = CATEGORY_STYLE[tx.category] || CATEGORY_STYLE.Others;
    const li = document.createElement('li');
    li.className = 'tx-item';
    li.dataset.type = tx.type;

    const sign = tx.type === 'income' ? '+ ' : '- ';
    const amountClass = tx.type === 'income' ? 'is-income' : 'is-expense';
    const dateText = tx.date || (tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now');

    li.innerHTML =
      '<span class="tx-item__icon" style="background:' + style.bg + '">' + style.icon + '</span>' +
      '<span class="tx-item__body">' +
        '<span class="tx-item__name">' + tx.category + '</span><br>' +
        '<span class="tx-item__meta">' + dateText + '</span>' +
      '</span>' +
      '<span class="tx-item__amount ' + amountClass + '">' + sign + formatMoney(tx.amount, tx.currency || SpendWise.getCurrency()) + '</span>';

    return li;
  }

  function renderTransactions(state) {
    if (!txListEl) return;
    txListEl.innerHTML = '';
    const visible = getTransactions(state).filter(function (tx) {
      return currentFilter === 'all' || tx.type === currentFilter;
    });

    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'tx-item';
      empty.innerHTML = '<span class="tx-item__body"><span class="tx-item__name">No transactions yet</span><br><span class="tx-item__meta">Add income or expense entries to populate this list.</span></span>';
      txListEl.appendChild(empty);
      return;
    }

    visible.forEach(function (tx) {
      txListEl.appendChild(buildTxItem(tx));
    });
  }

  function updateBalanceCard(state) {
    const totalIncome = (state.income || []).reduce(function (sum, item) {
      return sum + Number(item.amount || 0);
    }, 0);
    const totalExpense = (state.expenses || []).reduce(function (sum, item) {
      return sum + Number(item.amount || 0);
    }, 0);
    const netBalance = totalIncome - totalExpense;

    if (balanceAmountEl) {
      balanceAmountEl.dataset.value = netBalance;
      balanceAmountEl.textContent = formatMoney(netBalance, state.currency);
    }
    if (incomeValueEl) {
      incomeValueEl.dataset.value = totalIncome;
      incomeValueEl.textContent = formatMoney(totalIncome, state.currency);
    }
    if (expenseValueEl) {
      expenseValueEl.dataset.value = totalExpense;
      expenseValueEl.textContent = formatMoney(totalExpense, state.currency);
    }
    if (savingsValueEl) {
      savingsValueEl.dataset.value = netBalance;
      savingsValueEl.textContent = formatMoney(netBalance, state.currency);
    }
  }

  function drawDonutChart(state) {
    const svgGroup = document.getElementById('donutSegments');
    if (!svgGroup) return;

    svgGroup.innerHTML = '';
    const spending = calculateMonthlySpending(state.expenses || []);
    const entries = Object.entries(spending.byCategory || {}).sort(function (a, b) {
      return b[1] - a[1];
    });
    const total = entries.reduce(function (sum, item) {
      return sum + Number(item[1] || 0);
    }, 0);

    const colors = ['#22C55E', '#F59E0B', '#3882F6', '#16A34A', '#64748B'];
    const legendListEl = document.getElementById('legendList');
    const centerAmountEl = document.querySelector('.donut-center__amount');
    const centerLabelEl = document.querySelector('.donut-center__label');

    if (entries.length === 0) {
      if (legendListEl) legendListEl.innerHTML = '<li><span class="legend__dot" style="background:#64748B"></span>No expenses yet <b>0%</b></li>';
      if (centerAmountEl) centerAmountEl.textContent = formatMoney(0, state.currency);
      if (centerLabelEl) centerLabelEl.textContent = 'No expenses yet';
      return;
    }

    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    entries.forEach(function (entry, index) {
      const value = Number(entry[1] || 0);
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      const dash = Math.round((pct / 100) * circumference);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 80);
      circle.setAttribute('cy', 80);
      circle.setAttribute('r', radius);
      circle.setAttribute('class', 'donut-seg');
      circle.style.stroke = colors[index % colors.length];
      circle.style.strokeDasharray = dash + ' ' + Math.max(0, circumference - dash);
      circle.style.strokeDashoffset = '-' + offset;
      svgGroup.appendChild(circle);
      offset += dash;
    });

    if (legendListEl) {
      legendListEl.innerHTML = entries.map(function (entry, index) {
        const category = entry[0];
        const value = Number(entry[1] || 0);
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;
        return '<li><span class="legend__dot" style="background:' + colors[index % colors.length] + '"></span>' + category + ' <b>' + pct + '%</b></li>';
      }).join('');
    }

    if (centerAmountEl) centerAmountEl.textContent = formatMoney(spending.total, state.currency);
    if (centerLabelEl) centerLabelEl.textContent = 'Total Spent';
  }

  function renderBudgetSnapshot(state) {
    const budgetCard = document.querySelector('.budget-card');
    if (!budgetCard) return;

    const budgets = state.budgets || [];
    const expenses = state.expenses || [];
    const rows = Array.from(budgetCard.querySelectorAll('.budget-row'));
    const summaries = budgets.map(function (budget) {
      return calculateBudget(budget, expenses);
    });

    rows.forEach(function (row, index) {
      const summary = summaries[index];
      if (!summary) {
        row.style.display = 'none';
        return;
      }

      row.style.display = '';
      const nameEl = row.querySelector('.budget-row__name');
      const amountEl = row.querySelector('.budget-row__amount');
      const progressEl = row.querySelector('.progress-fill');
      const pctEl = row.querySelector('.budget-row__pct');

      if (nameEl) nameEl.textContent = summary.category;
      if (amountEl) amountEl.textContent = formatMoney(summary.spent, summary.currency) + ' / ' + formatMoney(summary.amount, summary.currency);
      if (progressEl) {
        progressEl.style.width = summary.percent + '%';
        progressEl.style.setProperty('--fill', summary.percent + '%');
      }
      if (pctEl) pctEl.textContent = summary.percent + '% used';
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
  }

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    if (backdrop) backdrop.hidden = false;
    const firstField = modal.querySelector('input, select');
    if (firstField) firstField.focus();
  }

  function closeAllModals() {
    allModals.forEach(function (modal) {
      modal.hidden = true;
    });
    if (backdrop && !sidebar.classList.contains('is-open')) backdrop.hidden = true;
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  function refreshPage() {
    const state = SpendWise.getState();
    renderTransactions(state);
    updateBalanceCard(state);
    drawDonutChart(state);
    renderBudgetSnapshot(state);

    const hour = new Date().getHours();
    let greeting = 'Good Evening,';
    if (hour < 12) greeting = 'Good Morning,';
    else if (hour < 17) greeting = 'Good Afternoon,';
    if (greetingEl) greetingEl.textContent = greeting;
  }

  if (balanceToggle && balanceAmountEl) {
    balanceToggle.addEventListener('click', function () {
      const isHidden = balanceAmountEl.classList.toggle('is-hidden');
      balanceToggle.setAttribute('aria-pressed', String(isHidden));
      balanceToggle.setAttribute('aria-label', isHidden ? 'Show balance amount' : 'Hide balance amount');
    });
  }

  if (menuToggle && sidebar && backdrop) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.contains('is-open') ? sidebar.classList.remove('is-open') : sidebar.classList.add('is-open');
      backdrop.hidden = !sidebar.classList.contains('is-open');
      menuToggle.setAttribute('aria-expanded', String(sidebar.classList.contains('is-open')));
    });
    backdrop.addEventListener('click', function () {
      sidebar.classList.remove('is-open');
      backdrop.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        sidebar.classList.remove('is-open');
        backdrop.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-open-modal'));
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeAllModals);
  });

  if (backdrop) {
    backdrop.addEventListener('click', function () {
      closeAllModals();
    });
  }

  /* ---------------------------------------------------------------
     8. FORM SUBMISSIONS
     Each form pushes a new transaction/entry into the page and
     gives the user a friendly confirmation — no page reload needed.
  --------------------------------------------------------------- */

  // -- Add Income --
  document.getElementById('incomeForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = document.getElementById('incomeAmount').value;
    const currency = document.getElementById('incomeCurrency').value;
    const source = document.getElementById('incomeSource').value;

    if (!amount || !source) return; // required fields already enforced by browser

    const transaction = {
      type: 'income',
      category: source,
      amount: Number(amount),
      currency: currency,
      date: 'Just now',
      notes: document.getElementById('incomeNotes').value
    };
    transactions.unshift(transaction);
    SpendWise.saveTransactions(transactions);

    renderTransactions();
    updateBalanceCard();
    e.target.reset();
    closeAllModals();
    showToast('Income of ' + formatMoney(amount, currency) + ' saved.');
  });

  // -- Add Expense --
  document.getElementById('expenseForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const amount = document.getElementById('expenseAmount').value;
    const currency = document.getElementById('expenseCurrency').value;
    const category = document.getElementById('expenseCategory').value;

    if (!amount || !category) return;

    const transaction = {
      type: 'expense',
      category: category,
      amount: Number(amount),
      currency: currency,
      date: 'Just now',
      notes: document.getElementById('expenseNotes').value
    };
    transactions.unshift(transaction);
    SpendWise.saveTransactions(transactions);

    renderTransactions();
    updateBalanceCard();
    e.target.reset();
    closeAllModals();
    showToast('Expense of ' + formatMoney(amount, currency) + ' saved.');
  });

  // -- Set Budget --
  document.getElementById('budgetForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const category = document.getElementById('budgetCategory').value;
    const amount = Number(document.getElementById('budgetAmount').value);
    const currency = document.getElementById('budgetCurrency').value;

    if (!category || amount <= 0) {
      alert('Budget saved');
      return;
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });
    }
  });

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (item) {
        item.classList.remove('is-active');
        item.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      const state = SpendWise.getState();
      renderTransactions(state);
    });
  });

  const incomeForm = document.getElementById('incomeForm');
  if (incomeForm) {
    incomeForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const amount = Number(document.getElementById('incomeAmount').value || 0);
      const currency = document.getElementById('incomeCurrency').value;
      const source = document.getElementById('incomeSource').value;
      const notes = document.getElementById('incomeNotes').value;
      if (!source || amount <= 0) return;

      const state = SpendWise.getState();
      const entry = {
        id: 'income-' + Date.now(),
        category: source,
        amount: amount,
        currency: currency,
        date: document.getElementById('incomeDate').value || new Date().toISOString(),
        notes: notes,
        createdAt: new Date().toISOString()
      };
      SpendWise.saveState({ income: [...(state.income || []), entry] });
      event.target.reset();
      closeAllModals();
      showToast('Income of ' + formatMoney(amount, currency) + ' saved.');
    });
  }

  const expenseForm = document.getElementById('expenseForm');
  if (expenseForm) {
    expenseForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const amount = Number(document.getElementById('expenseAmount').value || 0);
      const currency = document.getElementById('expenseCurrency').value;
      const category = document.getElementById('expenseCategory').value;
      const notes = document.getElementById('expenseNotes').value;
      if (!category || amount <= 0) return;

      const state = SpendWise.getState();
      const entry = {
        id: 'expense-' + Date.now(),
        category: category,
        amount: amount,
        currency: currency,
        date: document.getElementById('expenseDate').value || new Date().toISOString(),
        notes: notes,
        createdAt: new Date().toISOString()
      };
      SpendWise.saveState({ expenses: [...(state.expenses || []), entry] });
      event.target.reset();
      closeAllModals();
      showToast('Expense of ' + formatMoney(amount, currency) + ' saved.');
    });
  }

  const budgetForm = document.getElementById('budgetForm');
  if (budgetForm) {
    budgetForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const category = document.getElementById('budgetCategory').value;
      const amount = Number(document.getElementById('budgetAmount').value || 0);
      const currency = document.getElementById('budgetCurrency').value;
      if (!category || amount <= 0) return;

      const state = SpendWise.getState();
      const nextBudgets = [...(state.budgets || []), {
        id: 'budget-' + Date.now(),
        category: category,
        amount: amount,
        spent: 0,
        notes: '',
        currency: currency
      }];
      SpendWise.saveState({ budgets: nextBudgets });
      event.target.reset();
      closeAllModals();
      showToast('Budget for ' + category + ' set to ' + formatMoney(amount, currency) + '.');
    });
  }

  const goalForm = document.getElementById('goalForm');
  if (goalForm) {
    goalForm.addEventListener('submit', function (event) {
      event.preventDefault();
      const name = document.getElementById('goalName').value.trim();
      const amount = Number(document.getElementById('goalAmount').value || 0);
      const currency = document.getElementById('goalCurrency').value;
      const date = document.getElementById('goalDate').value;
      if (!name || amount <= 0) return;

      const state = SpendWise.getState();
      SpendWise.saveState({ savings: [...(state.savings || []), {
        id: 'savings-' + Date.now(),
        name: name,
        target: amount,
        current: 0,
        currency: currency,
        date: date,
        status: 'active',
        createdAt: new Date().toISOString()
      }] });
      event.target.reset();
      closeAllModals();
      showToast('Goal "' + name + '" for ' + formatMoney(amount, currency) + ' created.');
    });
  }

  const tips = [
    'Save first, spend later. Try to save at least 20% of your income before you pay for anything else.',
    'Track your expenses daily so you always know where your money goes.',
    'Avoid impulse buying — wait 24 hours before making non-essential purchases.',
    'Set clear goals and stay consistent. Small, steady steps add up over time.',
    'Review your budget every week, even for five minutes. Small check-ins prevent big surprises.'
  ];
  let tipIndex = 0;
  if (nextTipBtn && tipTextEl) {
    nextTipBtn.addEventListener('click', function () {
      tipIndex = (tipIndex + 1) % tips.length;
      tipTextEl.textContent = tips[tipIndex];
    });
  }

  if (greetingEl) {
    const hour = new Date().getHours();
    let greeting = 'Good Evening,';
    if (hour < 12) greeting = 'Good Morning,';
    else if (hour < 17) greeting = 'Good Afternoon,';
    greetingEl.textContent = greeting;
  }

  ['incomeDate', 'expenseDate', 'goalDate'].forEach(function (id) {
    const field = document.getElementById(id);
    if (field && !field.value) {
      const today = new Date();
      field.value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    }
  });

  refreshPage();
  window.addEventListener('spendwise:data-updated', refreshPage);
});
