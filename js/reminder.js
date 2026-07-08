// SpendWise — Reminders with Local Storage persistence
(function () {
  const reminders = [
    { id: "budget", title: "Budget Alerts", desc: "Get notified when you're close to your budget.", color: "#22C55E", icon: "bell", default: true },
    { id: "bill", title: "Bill Reminders", desc: "Never miss a payment.", color: "#3B82F6", icon: "calendar", default: true },
    { id: "savings", title: "Savings Goals", desc: "Remind me about my savings.", color: "#F59E0B", icon: "piggy", default: true },
    { id: "summary", title: "Daily Summary", desc: "Receive spending summary.", color: "#64748B", icon: "chart", default: false },
  ];

  const icons = {
    bell: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" width="22" height="22"><rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 9h18M8 3v4m8-4v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    piggy: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 12a6 6 0 0 1 6-6h5a5 5 0 0 1 5 5c0 1.5-1 2-1 2v3h-2l-1-1h-3l-1 1H9v-2a6 6 0 0 1-5-5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    chart: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  };

  const listEl = document.getElementById("reminderList");
  const STORAGE_KEY = "spendwise-reminders";

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadState();

  reminders.forEach((r, i) => {
    const isOn = r.id in state ? state[r.id] : r.default;

    const card = document.createElement("div");
    card.className = "reminder-card";
    card.style.animationDelay = `${i * 60}ms`;
    card.innerHTML = `
      <div class="reminder-icon" style="background:${r.color}">${icons[r.icon]}</div>
      <div class="reminder-meta">
        <div class="reminder-title">${r.title}</div>
        <div class="reminder-desc">${r.desc}</div>
      </div>
      <label class="switch">
        <input type="checkbox" data-id="${r.id}" ${isOn ? "checked" : ""} aria-label="Toggle ${r.title}" />
        <span class="slider"></span>
      </label>
    `;
    listEl.appendChild(card);
  });

  listEl.addEventListener("change", (e) => {
    if (e.target.matches('input[type="checkbox"]')) {
      state[e.target.dataset.id] = e.target.checked;
      saveState(state);
    }
  });
})();