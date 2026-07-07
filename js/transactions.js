(function () {
  function formatMoney(amount, currency) {
    const symbol = SpendWise.getCurrencySymbol(currency || SpendWise.getCurrency());
    return symbol + Number(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function buildTxItem(tx) {
    const sign = tx.type === 'income' ? '+ ' : '- ';
    const amountClass = tx.type === 'income' ? 'is-income' : 'is-expense';
    const icon = tx.type === 'income' ? '💰' : '🛒';

    const li = document.createElement('li');
    li.className = 'tx-item';
    li.dataset.id = tx.id || '';
    li.innerHTML =
      '<label style="display:flex;align-items:center;gap:12px;cursor:pointer;">' +
        '<input type="checkbox" class="tx-select" data-id="' + (tx.id || '') + '" aria-label="Select transaction" />' +
        '<span class="tx-item__icon" style="background:' + (tx.type === 'income' ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.10)') + '">' + icon + '</span>' +
        '<span class="tx-item__body">' +
          '<span class="tx-item__name">' + tx.category + '</span><br>' +
          '<span class="tx-item__meta">' + (tx.date || tx.createdAt || 'Just now') + '</span>' +
        '</span>' +
      '</label>' +
      '<span class="tx-item__amount ' + amountClass + '">' + sign + formatMoney(tx.amount, tx.currency || SpendWise.getCurrency()) + '</span>';
    return li;
  }

  function initSpendWiseTransactions() {
    const txListEl = document.getElementById('txList');
    const tabs = Array.from(document.querySelectorAll('.tab'));
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const selectedTransactionIds = new Set();
    let currentFilter = 'all';

    function updateDeleteButton() {
      if (!deleteSelectedBtn) return;
      deleteSelectedBtn.disabled = selectedTransactionIds.size === 0;
      deleteSelectedBtn.textContent = selectedTransactionIds.size > 0 ? 'Delete selected (' + selectedTransactionIds.size + ')' : 'Delete selected';
    }

    function renderTransactions() {
      if (!txListEl) return;
      txListEl.innerHTML = '';
      const transactions = (SpendWise.getTransactions() || []).map(function (tx, index) {
        if (!tx.id) {
          tx.id = 'tx-' + Date.now() + '-' + index;
        }
        return tx;
      });
      if (transactions.length > 0) {
        SpendWise.saveTransactions(transactions);
      }

      const visible = transactions.filter(function (tx) {
        return currentFilter === 'all' || tx.type === currentFilter;
      });

      if (visible.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'tx-item';
        empty.innerHTML = '<span class="tx-item__body"><span class="tx-item__name">No transactions yet</span><br><span class="tx-item__meta">Add income or expenses from the dashboard.</span></span>';
        txListEl.appendChild(empty);
        updateDeleteButton();
        return;
      }

      visible.forEach(function (tx) {
        txListEl.appendChild(buildTxItem(tx));
      });
      updateDeleteButton();
    }

    function removeSelectedTransactions() {
      const transactions = SpendWise.getTransactions() || [];
      const remaining = transactions.filter(function (tx) {
        return !selectedTransactionIds.has(tx.id);
      });
      SpendWise.saveTransactions(remaining);
      selectedTransactionIds.clear();
      renderTransactions();
      window.saveData();
      if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
      }
      if (typeof window.updateReports === 'function') {
        window.updateReports();
      }
    }

    if (txListEl) {
      txListEl.addEventListener('change', function (event) {
        const checkbox = event.target.closest('.tx-select');
        if (!checkbox) return;
        const id = checkbox.dataset.id;
        if (!id) return;
        if (checkbox.checked) {
          selectedTransactionIds.add(id);
        } else {
          selectedTransactionIds.delete(id);
        }
        updateDeleteButton();
      });
    }

    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener('click', function () {
        if (selectedTransactionIds.size === 0) return;
        if (confirm('Delete the selected transactions?')) {
          removeSelectedTransactions();
        }
      });
    }

    if (addTransactionBtn) {
      addTransactionBtn.addEventListener('click', function () {
        window.location.href = 'dashboard.html';
      });
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (item) {
          item.classList.remove('is-active');
          item.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-selected', 'true');
        currentFilter = tab.dataset.filter;
        renderTransactions();
      });
    });

    window.addEventListener('spendwise:data-updated', renderTransactions);
    renderTransactions();
  }

  window.initSpendWiseTransactions = initSpendWiseTransactions;
})();
