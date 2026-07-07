
/* =================================================================
   SPENDWISE — DASHBOARD SCRIPT
   Plain vanilla JavaScript, no frameworks or libraries.

   What this file does:
   1. Currency symbols + formatting helper
   2. Sample transaction data + rendering the transaction list
   3. Donut chart drawing (hand-built with SVG, animated on load)
   4. Balance show/hide toggle
   5. Mobile sidebar drawer + notification panel
   6. Modal open/close logic (Add Income, Add Expense, Budget, Goal)
   7. Form submission handling (adds new transactions to the page)
   8. Transaction filter tabs (All / Income / Expense)
   9. "Show another tip" button
   ================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------
     1. CURRENCY HELPERS
     Maps a currency code to its symbol so we can format numbers
     consistently anywhere in the app.
  --------------------------------------------------------------- */
  const CURRENCY_SYMBOLS = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
    KES: 'KSh'
  };

  // Turns a number + currency code into a nicely formatted string,
  // e.g. formatMoney(50000, 'NGN') -> "₦50,000.00"
  function formatMoney(amount, currencyCode) {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '₦';
    const formattedNumber = Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return symbol + formattedNumber;
  }

  /* ---------------------------------------------------------------
     2. SAMPLE TRANSACTIONS + RENDERING
  --------------------------------------------------------------- */

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

  // Starting sample data, so the dashboard looks alive on first load.
  // type is either 'income' or 'expense'.
  let transactions = [
    { type: 'expense', category: 'Transport', amount: 2500, currency: 'NGN', date: 'Today, 06:30 AM', notes: '' },
    { type: 'expense', category: 'Food',      amount: 1800, currency: 'NGN', date: 'Today, 01:15 PM', notes: '' },
    { type: 'income',  category: 'Salary',    amount: 50000, currency: 'NGN', date: 'Yesterday, 09:00 AM', notes: '' },
    { type: 'expense', category: 'Shopping',  amount: 3200, currency: 'NGN', date: 'Yesterday, 04:45 PM', notes: '' },
    { type: 'expense', category: 'Bills',     amount: 1500, currency: 'NGN', date: '01 Jun, 07:20 PM', notes: '' }
  ];

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

    li.innerHTML =
      '<span class="tx-item__icon" style="background:' + style.bg + '">' + style.icon + '</span>' +
      '<span class="tx-item__body">' +
        '<span class="tx-item__name">' + tx.category + '</span><br>' +
        '<span class="tx-item__meta">' + tx.date + '</span>' +
      '</span>' +
      '<span class="tx-item__amount ' + amountClass + '">' + sign + formatMoney(tx.amount, tx.currency) + '</span>';

    return li;
  }

  // Redraws the whole transaction list based on the current filter.
  function renderTransactions() {
    txListEl.innerHTML = '';
    const visible = transactions.filter(function (tx) {
      return currentFilter === 'all' || tx.type === currentFilter;
    });

    if (visible.length === 0) {
      const empty = document.createElement('li');
      empty.className = 'tx-item';
      empty.innerHTML = '<span class="tx-item__body"><span class="tx-item__name">No transactions yet</span><br><span class="tx-item__meta">Add one using the buttons above</span></span>';
      txListEl.appendChild(empty);
      return;
    }

    visible.forEach(function (tx) {
      txListEl.appendChild(buildTxItem(tx));
    });
  }

  const balanceAmountEl = document.getElementById('balanceAmount');
  const incomeValueEl = document.getElementById('incomeValue');
  const expenseValueEl = document.getElementById('expenseValue');
  const savingsValueEl = document.getElementById('savingsValue');

  function updateBalanceCard() {
    const totalIncome = transactions.reduce(function (sum, tx) {
      return tx.type === 'income' ? sum + tx.amount : sum;
    }, 0);
    const totalExpense = transactions.reduce(function (sum, tx) {
      return tx.type === 'expense' ? sum + tx.amount : sum;
    }, 0);
    const netBalance = totalIncome - totalExpense;

    balanceAmountEl.dataset.value = netBalance;
    incomeValueEl.dataset.value = totalIncome;
    expenseValueEl.dataset.value = totalExpense;
    savingsValueEl.dataset.value = netBalance;

    balanceAmountEl.textContent = formatMoney(netBalance, 'NGN');
    incomeValueEl.textContent = formatMoney(totalIncome, 'NGN');
    expenseValueEl.textContent = formatMoney(totalExpense, 'NGN');
    savingsValueEl.textContent = formatMoney(netBalance, 'NGN');
  }

  renderTransactions();
  updateBalanceCard();

  // Filter tabs (All / Income / Expense)
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.dataset.filter;
      renderTransactions();
    });
  });

  /* ---------------------------------------------------------------
     3. DONUT CHART (hand-drawn with SVG circles, no chart library)
     Each category becomes a stroked circle segment. We rotate the
     whole SVG -90deg in CSS so segments start at the top (12 o'clock).
  --------------------------------------------------------------- */
  const donutData = [
    { label: 'Food',      pct: 40, color: '#22C55E' },
    { label: 'Transport', pct: 20, color: '#F59E0B' },
    { label: 'Shopping',  pct: 15, color: '#3882F6' },
    { label: 'Bills',     pct: 15, color: '#16A34A' },
    { label: 'Others',    pct: 10, color: '#64748B' }
  ];

  function drawDonut() {
    const svgGroup = document.getElementById('donutSegments');
    if (!svgGroup) return;

    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    let offsetSoFar = 0;

    donutData.forEach(function (segment) {
      const segmentLength = (segment.pct / 100) * circumference;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', 80);
      circle.setAttribute('cy', 80);
      circle.setAttribute('r', radius);
      circle.setAttribute('class', 'donut-seg');
      circle.style.stroke = segment.color;

      // Draw only the segment's arc length, leave the rest transparent.
      circle.style.strokeDasharray = segmentLength + ' ' + (circumference - segmentLength);

      // Start fully "hidden" (offset = full circumference) so we can
      // animate it sliding into place — a small, tasteful reveal.
      circle.style.strokeDashoffset = circumference - offsetSoFar;
      svgGroup.appendChild(circle);

      // Trigger the animation on the next frame.
      requestAnimationFrame(function () {
        circle.style.strokeDashoffset = -offsetSoFar;
      });

      offsetSoFar += segmentLength;
    });
  }

  drawDonut();

  /* ---------------------------------------------------------------
     4. BALANCE SHOW / HIDE TOGGLE
  --------------------------------------------------------------- */
  const balanceToggle = document.getElementById('balanceToggle');
  const balanceAmount = document.getElementById('balanceAmount');

  balanceToggle.addEventListener('click', function () {
    const isHidden = balanceAmount.classList.toggle('is-hidden');
    balanceToggle.setAttribute('aria-pressed', String(isHidden));
    balanceToggle.setAttribute('aria-label', isHidden ? 'Show balance amount' : 'Hide balance amount');
  });

  /* ---------------------------------------------------------------
     5. MOBILE SIDEBAR DRAWER + NOTIFICATION PANEL
  --------------------------------------------------------------- */
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.getElementById('menuToggle');
  const backdrop = document.getElementById('backdrop');

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

  // Notification button: navigate to reminders page instead of toggling panel.
  const notifBtn = document.getElementById('notifBtn') || document.querySelector('.icon-btn[aria-label^="View notifications"]');
  const notifPanel = document.getElementById('notifPanel');
  if (notifBtn) {
    notifBtn.addEventListener('click', function (e) {
      // if there's a panel and the user is on a page that expects a panel, still navigate
      window.location.href = 'reminder.html';
    });
  }

  /* ---------------------------------------------------------------
     6. MODAL OPEN / CLOSE LOGIC
     Shared by all four "quick action" forms.
  --------------------------------------------------------------- */
  const allModals = document.querySelectorAll('.modal');
  let lastFocusedElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    backdrop.hidden = false;
    // Focus the first input for keyboard users.
    const firstField = modal.querySelector('input, select');
    if (firstField) firstField.focus();
  }

  function closeAllModals() {
    allModals.forEach(function (modal) { modal.hidden = true; });
    // Only hide the backdrop if the mobile sidebar isn't also open.
    if (!sidebar.classList.contains('is-open')) backdrop.hidden = true;
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  document.querySelectorAll('[data-open-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-open-modal'));
    });
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', closeAllModals);
  });

  backdrop.addEventListener('click', function () {
    closeAllModals();
    closeSidebar();
  });

  // Escape key closes whatever is open (modal or sidebar drawer).
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeAllModals();
      closeSidebar();
    }
  });

  /* ---------------------------------------------------------------
     7. TOAST NOTIFICATION (small confirmation message)
  --------------------------------------------------------------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2600);
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

    transactions.unshift({
      type: 'income',
      category: source,
      amount: Number(amount),
      currency: currency,
      date: 'Just now',
      notes: document.getElementById('incomeNotes').value
    });

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

    transactions.unshift({
      type: 'expense',
      category: category,
      amount: Number(amount),
      currency: currency,
      date: 'Just now',
      notes: document.getElementById('expenseNotes').value
    });

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
      alert('Please choose a category and enter a valid amount.');
      return;
    }

    const budgets = SpendWise.getBudgets() || [];
    budgets.push({
      id: 'budget-' + Date.now(),
      category: category,
      amount: amount,
      spent: 0,
      notes: '',
      currency: currency
    });
    SpendWise.saveBudgets(budgets);

    e.target.reset();
    closeAllModals();
    showToast('Budget for ' + category + ' set to ' + formatMoney(amount, currency) + '.');
  });

  // -- Add Savings Goal --
  document.getElementById('goalForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('goalName').value.trim();
    const amount = Number(document.getElementById('goalAmount').value);
    const currency = document.getElementById('goalCurrency').value;
    const date = document.getElementById('goalDate').value;

    if (!name || amount <= 0) {
      alert('Please provide a goal name and a valid target amount.');
      return;
    }

    const savings = SpendWise.getSavings() || [];
    savings.push({
      id: 'savings-' + Date.now(),
      name: name,
      target: amount,
      current: 0,
      currency: currency,
      date: date,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    SpendWise.saveSavings(savings);

    e.target.reset();
    closeAllModals();
    showToast('Goal "' + name + '" for ' + formatMoney(amount, currency) + ' created.');
  });

  /* ---------------------------------------------------------------
     9. "SHOW ANOTHER TIP" BUTTON
  --------------------------------------------------------------- */
  const tips = [
    'Save first, spend later. Try to save at least 20% of your income before you pay for anything else.',
    'Track your expenses daily so you always know where your money goes.',
    'Avoid impulse buying — wait 24 hours before making non-essential purchases.',
    'Set clear goals and stay consistent. Small, steady steps add up over time.',
    'Review your budget every week, even for five minutes. Small check-ins prevent big surprises.'
  ];
  let tipIndex = 0;
  const tipTextEl = document.querySelector('.tip-body p');
  document.getElementById('nextTipBtn').addEventListener('click', function () {
    tipIndex = (tipIndex + 1) % tips.length;
    tipTextEl.textContent = tips[tipIndex];
  });

  /* ---------------------------------------------------------------
     10. GREETING BASED ON TIME OF DAY
     A small, friendly touch: the greeting text updates to match
     when the person is actually using the app.
  --------------------------------------------------------------- */
  const greetingEl = document.getElementById('greetingText');
  const hour = new Date().getHours();
  let greeting = 'Good Evening,';
  if (hour < 12) greeting = 'Good Morning,';
  else if (hour < 17) greeting = 'Good Afternoon,';
  greetingEl.textContent = greeting;

});
