/* =================================================================
   SPENDWISE — ADD INCOME PAGE SCRIPT
   Plain vanilla JavaScript, no frameworks or libraries.

   What this file does:
   1. Currency formatting helper
   2. Sets today's date as the default value in the date field
   3. Quick-select "chip" buttons fill the Source dropdown
   4. Live preview banner updates as the user types
   5. Mobile sidebar drawer + notification panel
   6. Form submission: adds the new income to "Recently Added"
      and updates the "This Month's Income" summary
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
     Saves users the trouble of manually finding today's date.
  --------------------------------------------------------------- */
  const dateInput = document.getElementById('incomeDate');
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  dateInput.value = yyyy + '-' + mm + '-' + dd;

  /* ---------------------------------------------------------------
     3. QUICK-SELECT SOURCE CHIPS
     Tapping a chip fills the dropdown for users who find typing
     or long menus difficult.
  --------------------------------------------------------------- */
  const sourceSelect = document.getElementById('incomeSource');
  const chips = document.querySelectorAll('.chip');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      const chosenSource = chip.getAttribute('data-source');

      // Only allow one chip to look "selected" at a time.
      chips.forEach(function (c) { c.classList.remove('is-selected'); });
      chip.classList.add('is-selected');

      // If the dropdown doesn't have this exact option (e.g. "Other"
      // maps directly), set it directly; this covers all four chips
      // since they match existing <option> values.
      sourceSelect.value = chosenSource;
      updatePreview();
    });
  });

  // If the person picks a source directly from the dropdown instead,
  // un-highlight any chip so the UI doesn't look out of sync.
  sourceSelect.addEventListener('change', function () {
    const matchingChip = Array.from(chips).find(function (c) {
      return c.getAttribute('data-source') === sourceSelect.value;
    });
    chips.forEach(function (c) { c.classList.remove('is-selected'); });
    if (matchingChip) matchingChip.classList.add('is-selected');
    updatePreview();
  });

  /* ---------------------------------------------------------------
     4. LIVE PREVIEW BANNER
     Reassures the user by showing exactly what will be saved.
  --------------------------------------------------------------- */
  const amountInput = document.getElementById('incomeAmount');
  const currencySelect = document.getElementById('incomeCurrency');
  const previewBanner = document.getElementById('previewBanner');

  function updatePreview() {
    const amount = amountInput.value;
    const currency = currencySelect.value;
    const source = sourceSelect.value;

    if (!amount || Number(amount) <= 0) {
      previewBanner.innerHTML = '<span class="preview-banner__icon">✓</span><span>Fill in the amount above to see a preview here.</span>';
      return;
    }

    const sourceText = source ? ' from ' + source : '';
    previewBanner.innerHTML =
      '<span class="preview-banner__icon">✓</span>' +
      '<span>You are adding <strong>' + formatMoney(amount, currency) + '</strong>' + sourceText + '.</span>';
  }

  amountInput.addEventListener('input', updatePreview);
  currencySelect.addEventListener('change', updatePreview);

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
     6. FORM SUBMISSION
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
    Salary: '💰',
    Business: '💼',
    Gift: '🎁',
    Freelance: '🧑‍💻',
    Investment: '📈',
    Other: '📦'
  };

  const recentIncomeList = document.getElementById('recentIncomeList');
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryCount = document.getElementById('summaryCount');

  // Keep a running total in Naira-equivalent for the demo summary card.
  // (In a real app this would come from the server / database.)
  let runningTotal = 120000;
  let entryCount = 3;

  document.getElementById('incomeForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const amount = amountInput.value;
    const currency = currencySelect.value;
    const source = sourceSelect.value;
    const notes = document.getElementById('incomeNotes').value;

    if (!amount || Number(amount) <= 0 || !source) {
      showToast('Please fill in the amount and source before saving.');
      return;
    }

    // Add the new entry to the top of "Recently Added".
    const li = document.createElement('li');
    li.className = 'tx-item';
    const icon = CATEGORY_ICON[source] || '📦';
    li.innerHTML =
      '<span class="tx-item__icon" style="background:rgba(34,197,94,0.14)">' + icon + '</span>' +
      '<span class="tx-item__body">' +
        '<span class="tx-item__name">' + source + '</span><br>' +
        '<span class="tx-item__meta">Just now</span>' +
      '</span>' +
      '<span class="tx-item__amount is-income">+ ' + formatMoney(amount, currency) + '</span>';
    recentIncomeList.insertBefore(li, recentIncomeList.firstChild);

    // Update the running summary (simple demo logic; assumes NGN base).
    runningTotal += Number(amount);
    entryCount += 1;
    summaryTotal.textContent = formatMoney(runningTotal, 'NGN');
    summaryCount.textContent = String(entryCount);

    // Reset the form back to a clean state, ready for another entry.
    e.target.reset();
    dateInput.value = yyyy + '-' + mm + '-' + dd;
    chips.forEach(function (c) { c.classList.remove('is-selected'); });
    updatePreview();

    showToast('Income of ' + formatMoney(amount, currency) + ' saved successfully.');
  });

});