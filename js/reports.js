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

  function formatMoney(amount) {
    const symbol = SpendWise.getCurrencySymbol(SpendWise.getCurrency());
    return symbol + Number(amount).toLocaleString();
  }

  function renderReport() {
    const budgets = SpendWise.getBudgets() || [];
    const currency = SpendWise.getCurrency();
    const symbol = SpendWise.getCurrencySymbol(currency);
    const totalBudget = budgets.reduce(function (sum, item) {
      return sum + Number(item.amount || 0);
    }, 0);
    const totalSpent = budgets.reduce(function (sum, item) {
      return sum + Number(item.spent || 0);
    }, 0);
    const totalRemaining = Math.max(0, totalBudget - totalSpent);
    const highestBudget = budgets.slice().sort(function (a, b) {
      return Number(b.amount || 0) - Number(a.amount || 0);
    })[0] || null;

    const categoryAmounts = budgets.reduce(function (acc, item) {
      const category = item.category || 'Other';
      acc[category] = (acc[category] || 0) + Number(item.amount || 0);
      return acc;
    }, {});

    const categoryEntries = Object.entries(categoryAmounts).sort(function (a, b) {
      return b[1] - a[1];
    }).slice(0, 4);
    const totalCategoryAmount = categoryEntries.reduce(function (sum, item) {
      return sum + item[1];
    }, 0);

    if (reportAmount) reportAmount.textContent = formatMoney(totalBudget);
    if (reportLabel) reportLabel.textContent = 'Budgeted';
    if (totalBudgetEl) totalBudgetEl.textContent = formatMoney(totalBudget);
    if (totalSpentEl) totalSpentEl.textContent = formatMoney(totalSpent);
    if (totalRemainingEl) totalRemainingEl.textContent = formatMoney(totalRemaining);
    if (highestSpendEl) highestSpendEl.textContent = highestBudget ? highestBudget.category : 'No budgets set';

    if (reportLegend) {
      if (categoryEntries.length === 0) {
        reportLegend.innerHTML = '<li>No budget categories available.</li>';
      } else {
        const colors = ['#22C55E', '#F59E0B', '#3882F6', '#16A34A'];
        reportLegend.innerHTML = categoryEntries.map(function (entry, index) {
          const category = entry[0];
          const amount = entry[1];
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
        const value = entry ? entry[1] : 0;
        const pct = totalCategoryAmount ? (value / totalCategoryAmount) : 0;
        const dash = Math.round(circumference * pct);
        segment.style.strokeDasharray = dash + ' ' + Math.max(0, Math.round(circumference - dash));
        segment.style.strokeDashoffset = '-' + offset;
        offset += dash;
      });
    }
  }

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
});
