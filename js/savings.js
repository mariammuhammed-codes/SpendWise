
document.addEventListener('DOMContentLoaded', function () {
  const activeList = document.getElementById('activeGoalsList');
  const goalsCount = document.getElementById('goalsCount');
  const goalNameInput = document.getElementById('goalName');
  const goalAmountInput = document.getElementById('goalAmount');
  const goalDateInput = document.getElementById('goalDate');
  const saveGoalBtn = document.getElementById('saveGoalBtn');
  const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
  const createGoalBtn = document.getElementById('createGoalBtn');

  function loadSavings() {
    return SpendWise.getSavings() || [];
  }

  function saveSavings(list) {
    SpendWise.saveSavings(list);
  }

  function formatMoney(amount) {
    const symbol = SpendWise.getCurrencySymbol(SpendWise.getCurrency());
    return symbol + Number(amount).toLocaleString();
  }

  function renderSavings() {
    const list = loadSavings();
    activeList.innerHTML = '';
    goalsCount.textContent = list.length + (list.length === 1 ? ' goal' : ' goals');

    list.forEach(function (item) {
      const pct = item.target > 0 ? Math.min(100, Math.round((item.current || 0) / item.target * 100)) : 0;

      const row = document.createElement('div');
      row.className = 'budget-row';
      row.dataset.id = item.id;

      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          <input type="checkbox" class="goal-checkbox" data-id="${item.id}" aria-label="Select goal ${item.name}" />
          <div style="flex:1;">
            <div class="budget-row__top">
              <span class="budget-row__name">${item.name}</span>
              <span class="budget-row__amount">${formatMoney(item.current || 0)} / ${formatMoney(item.target)}</span>
            </div>
            <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
            <span class="budget-row__pct">${pct}% complete</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-left:12px;align-items:flex-end;">
            <select class="goal-status" data-id="${item.id}" aria-label="Change status for ${item.name}">
              <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active</option>
              <option value="archived" ${item.status === 'archived' ? 'selected' : ''}>Archived</option>
              <option value="not-achieved" ${item.status === 'not-achieved' ? 'selected' : ''}>Not achieved</option>
            </select>
            <button class="btn btn--danger goal-delete" data-id="${item.id}" type="button">Delete</button>
          </div>
        </div>
      `;

      activeList.appendChild(row);
    });
  }

  function addGoal() {
    const name = (goalNameInput.value || '').trim();
    const target = Number(goalAmountInput.value) || 0;
    const date = goalDateInput.value || '';
    if (!name || target <= 0) {
      alert('Please enter a name and a valid target amount.');
      return;
    }

    const list = loadSavings();
    const item = {
      id: 's_' + Date.now(),
      name: name,
      target: target,
      date: date,
      current: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    list.push(item);
    saveSavings(list);
    renderSavings();

    goalNameInput.value = '';
    goalAmountInput.value = '';
    goalDateInput.value = '';
  }

  function deleteGoal(id) {
    let list = loadSavings();
    list = list.filter(function (it) { return it.id !== id; });
    saveSavings(list);
    renderSavings();
  }

  function deleteSelected() {
    const checks = Array.from(activeList.querySelectorAll('.goal-checkbox:checked'));
    if (checks.length === 0) return alert('No goals selected.');
    if (!confirm('Delete selected goals?')) return;
    const ids = checks.map(function (c) { return c.dataset.id; });
    let list = loadSavings();
    list = list.filter(function (it) { return !ids.includes(it.id); });
    saveSavings(list);
    renderSavings();
  }

  function updateStatus(id, status) {
    const list = loadSavings();
    const idx = list.findIndex(function (it) { return it.id === id; });
    if (idx === -1) return;
    list[idx].status = status;
    saveSavings(list);
    renderSavings();
  }

  // Delegation for delete and status change
  activeList.addEventListener('click', function (e) {
    const del = e.target.closest('.goal-delete');
    if (del) {
      const id = del.dataset.id;
      deleteGoal(id);
      return;
    }
  });

  activeList.addEventListener('change', function (e) {
    if (e.target.classList.contains('goal-status')) {
      const id = e.target.dataset.id;
      const val = e.target.value;
      updateStatus(id, val);
    }
  });

  // Save and delete-selected handlers
  if (saveGoalBtn) saveGoalBtn.addEventListener('click', addGoal);
  if (deleteSelectedBtn) deleteSelectedBtn.addEventListener('click', deleteSelected);
  if (createGoalBtn) createGoalBtn.addEventListener('click', function () {
    const formEl = document.getElementById('goalName');
    if (formEl) {
      formEl.focus();
      formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Initial render
  renderSavings();
});
