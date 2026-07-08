// SpendWise — Transactions
(function () {
  // Sample data
  const transactions = [
    { id: 1, name: "Transport", type: "expense", amount: 2500, date: "02 Jan", time: "8:30 AM", color: "#F59E0B", icon: "car" },
    { id: 2, name: "Salary", type: "income", amount: 50000, date: "01 Jan", time: "9:00 AM", color: "#22C55E", icon: "wallet" },
    { id: 3, name: "Food", type: "expense", amount: 1800, date: "02 Jan", time: "1:15 PM", color: "#EF4444", icon: "food" },
    { id: 4, name: "Shopping", type: "expense", amount: 3200, date: "03 Jan", time: "4:45 PM", color: "#3B82F6", icon: "bag" },
    { id: 5, name: "Freelance", type: "income", amount: 25000, date: "03 Jan", time: "6:20 PM", color: "#22C55E", icon: "wallet" },
    { id: 6, name: "Internet", type: "expense", amount: 1500, date: "04 Jan", time: "7:20 PM", color: "#64748B", icon: "wifi" },
  ];

  const icons = {
    car: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13v5h-2v-2H7v2H5v-5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="3" y="6" width="18" height="13" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 12h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    food: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 3v8m3-8v8M7.5 3v18M17 3c-1.5 2-1.5 6 0 8v10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 8h12l-1 12H7L6 8Zm3 0a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    wifi: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M5 12a10 10 0 0 1 14 0M8 15a6 6 0 0 1 8 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="18.5" r="1.4"/></svg>',
  };

  const listEl = document.getElementById("txList");
  const emptyEl = document.getElementById("emptyState");
  const tabs = document.querySelectorAll(".tab");
  const searchInput = document.getElementById("searchInput");

  let activeFilter = "all";

  function formatAmount(type, amount) {
    const sign = type === "income" ? "+" : "-";
    return `${sign}₦${amount.toLocaleString()}`;
  }

  function render() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = transactions.filter((t) => {
      const matchFilter = activeFilter === "all" || t.type === activeFilter;
      const matchSearch = t.name.toLowerCase().includes(query);
      return matchFilter && matchSearch;
    });

    listEl.innerHTML = "";
    emptyEl.hidden = filtered.length !== 0;

    filtered.forEach((t, i) => {
      const card = document.createElement("div");
      card.className = "tx-card";
      card.style.animationDelay = `${i * 45}ms`;
      card.innerHTML = `
        <div class="tx-icon" style="background:${t.color}">${icons[t.icon] || icons.wallet}</div>
        <div class="tx-meta">
          <div class="tx-name">${t.name}</div>
          <div class="tx-time">${t.date} • ${t.time}</div>
        </div>
        <div class="tx-amount ${t.type}">${formatAmount(t.type, t.amount)}</div>
      `;
      listEl.appendChild(card);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      activeFilter = tab.dataset.filter;
      render();
    });
  });

  searchInput.addEventListener("input", render);

  render();
})();