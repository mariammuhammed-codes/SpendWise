/* =================================================================
   SPENDWISE — ADD EXPENSE PAGE SCRIPT
   Plain vanilla JavaScript, no frameworks or libraries.

   What this file does:
   1. Currency formatting helper
   2. Sets today's date as the default value in the date field
   3. Quick-select "chip" buttons fill the Category dropdown
   4. Budget impact preview: shows how this expense affects the
      chosen category's monthly budget
   5. Live preview banner updates as the user types
   6. Mobile sidebar drawer + notification panel
   7. Form submission: adds the new expense to "Recently Added"
      and updates the "This Month's Expenses" summary
   ================================================================= */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------------------------------------------------------------
     1. CURRENCY HELPER
  --------------------------------------------------------------- */
  const CURRENCY_SYMBOLS = {
    NGN: '₦',
    USD: '$',
    EUR: '€',
    GBP: '£',
    GHS: '₵',
    KES: 'KSh'
  };

  function formatMoney(amount, currencyCode) {
    const symbol = CURRENCY_SYMBOLS[currencyCode] || '₦';
    const formattedNumber = Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return symbol + formattedNumber;
  }

  /* ---------------------------------------------------------------
     2. DEFAULT DATE = TODAY
  --------------------------------------------------------------- */
  const dateInput = document.getElementById('expenseDate');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.value = yyyy + '-' + mm + '-' + dd;

  /* ---------------------------------------------------------------
     3. QUICK-SELECT CATEGORY CHIPS
  --------------------------------------------------------------- */
  const categorySelect = document.getElementById('expenseCategory');
  const chips = document.querySelectorAll('.chip');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const chosenCategory = chip.getAttribute('data-category');

      chips.forEach(function (c) { c.classList.remove('is-selected'); });
      chip.classList.add('is-selected');

      categorySelect.value = chosenCategory;
      updateBudgetImpact();
      updatePreview();
    });
  });

  categorySelect.addEventListener('change', function () {
    const matchingChip = Array.from(chips).find(function (c) {
      return c.getAttribute('data-category') === categorySelect.value;
    });
    chips.forEach(function (c) { c.classList.remove('is-selected'); });
    if (matchingChip) matchingChip.classList.add('is-selected');
    updateBudgetImpact();
    updatePreview();
  });

  /* ---------------------------------------------------------------
     4. BUDGET IMPACT PREVIEW
     Sample budgets for the demo (in a real app these would come
     from the user's saved budgets in the database).
  --------------------------------------------------------------- */
  const BUDGETS = {
    Food:      { limit: 20000, spent: 15600 },
    Transport: { limit: 15000, spent: 9800 },
    Shopping:  { limit: 10000, spent: 4500 },
    Bills:     { limit: 10000, spent: 3200 }
    // "Others" has no fixed budget on purpose -- the impact box
    // hides itself for categories without a set budget.
  };

  const amountInput = document.getElementById('expenseAmount');
  const budgetImpact = document.getElementById('budgetImpact');
  const budgetImpactLabel = document.getElementById('budgetImpactLabel');
  const budgetImpactAmount = document.getElementById('budgetImpactAmount');
  const budgetImpactFill = document.getElementById('budgetImpactFill');
  const budgetImpactNote = document.getElementById('budgetImpactNote');

  function updateBudgetImpact() {
    const category = categorySelect.value;
    const budget = BUDGETS[category];
    const amount = Number(amountInput.value) || 0;

    if (!budget) {
      budgetImpact.hidden = true;
      return;
    }

    const projectedSpent = budget.spent + amount;
    const pct = Math.min(Math.round((projectedSpent / budget.limit) * 100), 999);

    budgetImpact.hidden = false;
    budgetImpactLabel.textContent = category + ' budget';
    budgetImpactAmount.textContent = formatMoney(projectedSpent, 'NGN') + ' / ' + formatMoney(budget.limit, 'NGN');
    budgetImpactFill.style.setProperty('--fill', Math.min(pct, 100) + '%');

    if (pct >= 100) {
      budgetImpactFill.style.background = 'var(--color-red-dark)';
      budgetImpactNote.textContent = 'This expense goes over your ' + category + ' budget for this month.';
      budgetImpactNote.className = 'budget-impact__note is-warning';
    } else if (pct >= 80) {
      budgetImpactFill.style.background = 'var(--color-amber)';
      budgetImpactNote.textContent = 'This will bring you close to your ' + category + ' budget limit.';
      budgetImpactNote.className = 'budget-impact__note';
    } else {
      budgetImpactFill.style.background = 'var(--color-primary)';
      budgetImpactNote.textContent = 'This expense keeps you within budget. Nice work!';
      budgetImpactNote.className = 'budget-impact__note';
    }
  }

  amountInput.addEventListener('input', updateBudgetImpact);

  /* ---------------------------------------------------------------
     5. LIVE PREVIEW BANNER
  --------------------------------------------------------------- */
  const currencySelect = document.getElementById('expenseCurrency');
  const previewBanner = document.getElementById('previewBanner');

  function updatePreview() {
    const amount = amountInput.value;
    const currency = currencySelect.value;
    const category = categorySelect.value;

    if (!amount || Number(amount) <= 0) {
      previewBanner.innerHTML = '<span class="preview-banner__icon">✓</span><span>Fill in the amount above to see a preview here.</span>';
      return;
    }

    const categoryText = category ? ' for ' + category : '';
    previewBanner.innerHTML =
      '<span class="preview-banner__icon">✓</span>' +
      '<span>You are adding <strong>' + formatMoney(amount, currency) + '</strong>' + categoryText + '.</span>';
  }

  amountInput.addEventListener('input', updatePreview);
  currencySelect.addEventListener('change', updatePreview);

  /* ---------------------------------------------------------------
     6. MOBILE SIDEBAR DRAWER + NOTIFICATION PANEL
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
  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  const notifBtn = document.getElementById('notifBtn');
  const notifPanel = document.getElementById('notifPanel');
  notifBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = !notifPanel.hidden;
    notifPanel.hidden = isOpen;
    notifBtn.setAttribute('aria-expanded', String(!isOpen));
  });
  document.addEventListener('click', function (e) {
    if (!notifPanel.hidden && !notifPanel.contains(e.target) && e.target !== notifBtn) {
      notifPanel.hidden = true;
      notifBtn.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------------------------------------------------------------
     7. FORM SUBMISSION
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

  const CATEGORY_ICON = {
    Food: '🍔',
    Transport: '🚌',
    Shopping: '🛍️',
    Bills: '🧾',
    Others: '📦'
  };

  const recentExpenseList = document.getElementById('recentExpenseList');
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryCount = document.getElementById('summaryCount');

  // Running total for the demo summary card.
  // (In a real app this would come from the server / database.)
  let runningTotal = 77500;
  let entryCount = 4;

  document.getElementById('expenseForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const amount = amountInput.value;
    const currency = currencySelect.value;
    const category = categorySelect.value;
    const notes = document.getElementById('expenseNotes').value;

    if (!amount || Number(amount) <= 0 || !category) {
      showToast('Please fill in the amount and category before saving.');
      return;
    }

    // Add the new entry to the top of "Recently Added".
    const li = document.createElement('li');
    li.className = 'tx-item';
    const icon = CATEGORY_ICON[category] || '📦';
    li.innerHTML =
      '<span class="tx-item__icon" style="background:rgba(239,68,68,0.10)">' + icon + '</span>' +
      '<span class="tx-item__body">' +
        '<span class="tx-item__name">' + category + '</span><br>' +
        '<span class="tx-item__meta">Just now</span>' +
      '</span>' +
      '<span class="tx-item__amount is-expense">− ' + formatMoney(amount, currency) + '</span>';
    recentExpenseList.insertBefore(li, recentExpenseList.firstChild);

    // Update the running summary and the category's "spent" amount
    // (simple demo logic; assumes NGN base for the totals shown).
    runningTotal += Number(amount);
    entryCount += 1;
    summaryTotal.textContent = formatMoney(runningTotal, 'NGN');
    summaryCount.textContent = String(entryCount);
    if (BUDGETS[category]) {
      BUDGETS[category].spent += Number(amount);
    }

    // Reset the form back to a clean state, ready for another entry.
    e.target.reset();
    dateInput.value = yyyy + '-' + mm + '-' + dd;
    chips.forEach(function (c) { c.classList.remove('is-selected'); });
    budgetImpact.hidden = true;
    updatePreview();

    showToast('Expense of ' + formatMoney(amount, currency) + ' saved successfully.');
  });

});