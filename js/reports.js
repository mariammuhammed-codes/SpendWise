document.addEventListener('DOMContentLoaded', function () {
  const exportButton = document.getElementById('exportReportBtn');
  const reportAmount = document.getElementById('reportDonutAmount');
  const reportLabel = document.getElementById('reportDonutLabel');
  const reportLegend = document.getElementById('reportLegend');
  const totalBudgetEl = document.getElementById('reportTotalBudget');
  const totalSpentEl = document.getElementById('reportTotalSpent');
  const totalRemainingEl = document.getElementById('reportTotalRemaining');
  const highestSpendEl = document.getElementById('reportHighestSpend');
  const donutSegments = Array.from(document.querySelectorAll('.donut-seg'));

  function formatMoney(amount, currencyCode) {
    const symbol = SpendWise.getCurrencySymbol(currencyCode || SpendWise.getCurrency());
    return symbol + Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function renderReport() {
    const state = SpendWise.getState();
    const budgets = state.budgets || [];
    const expenses = state.expenses || [];
    const currency = state.currency || SpendWise.getCurrency();

    const totalBudget = budgets.reduce(function (sum, item) {
      return sum + Number(item.amount || 0);
    }, 0);
    const totalSpent = expenses.reduce(function (sum, item) {
      return sum + Number(item.amount || 0);
    }, 0);
    const totalRemaining = Math.max(0, totalBudget - totalSpent);
    const highestBudget = budgets.slice().sort(function (a, b) {
      return Number(b.amount || 0) - Number(a.amount || 0);
    })[0] || null;

    const spending = calculateMonthlySpending(expenses);
    const categoryEntries = Object.entries(spending.byCategory || {}).sort(function (a, b) {
      return b[1] - a[1];
    });
    const totalCategoryAmount = categoryEntries.reduce(function (sum, item) {
      return sum + Number(item[1] || 0);
    }, 0);

    if (reportAmount) reportAmount.textContent = formatMoney(totalSpent, currency);
    if (reportLabel) reportLabel.textContent = 'Spent';
    if (totalBudgetEl) totalBudgetEl.textContent = formatMoney(totalBudget, currency);
    if (totalSpentEl) totalSpentEl.textContent = formatMoney(totalSpent, currency);
    if (totalRemainingEl) totalRemainingEl.textContent = formatMoney(totalRemaining, currency);
    if (highestSpendEl) highestSpendEl.textContent = highestBudget ? highestBudget.category : 'No budgets set';

    if (reportLegend) {
      if (categoryEntries.length === 0) {
        reportLegend.innerHTML = '<li>No expenses recorded yet.</li>';
      } else {
        const colors = ['#22C55E', '#F59E0B', '#3882F6', '#16A34A'];
        reportLegend.innerHTML = categoryEntries.map(function (entry, index) {
          const category = entry[0];
          const amount = Number(entry[1] || 0);
          const pct = totalCategoryAmount ? Math.round((amount / totalCategoryAmount) * 100) : 0;
          return '<li><span class="legend__dot" style="background:' + colors[index % colors.length] + '"></span>' + category + ' <b>' + pct + '%</b></li>';
        }).join('');
      }
    }

    if (donutSegments.length > 0) {
      let offset = 0;
      const circumference = 2 * Math.PI * 62;
      donutSegments.forEach(function (segment, index) {
        const entry = categoryEntries[index];
        const value = entry ? Number(entry[1] || 0) : 0;
        const pct = totalCategoryAmount ? (value / totalCategoryAmount) : 0;
        const dash = Math.round(circumference * pct);
        segment.style.strokeDasharray = dash + ' ' + Math.max(0, Math.round(circumference - dash));
        segment.style.strokeDashoffset = '-' + offset;
        offset += dash;
      });
    }
  }

  window.renderSpendWiseReports = renderReport;
  renderReport();

  if (exportButton) {
    exportButton.addEventListener('click', function () {
      const target = document.querySelector('.app-shell') || document.body;
      if (typeof html2canvas !== 'function') {
        alert('Export requires html2canvas. Please make sure you have internet access.');
        return;
      }
      html2canvas(target, { scale: 2 }).then(function (canvas) {
        canvas.toBlob(function (blob) {
          const link = document.createElement('a');
          link.download = 'spendwise-report.png';
          link.href = URL.createObjectURL(blob);
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
      }).catch(function () {
        alert('Unable to export report as image.');
      });
    });
  }

  window.addEventListener('spendwise:data-updated', renderReport);
});
