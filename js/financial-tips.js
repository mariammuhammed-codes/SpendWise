// SpendWise — Financial Tips
(function () {
  const icons = {
    save: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 12a6 6 0 0 1 6-6h5a5 5 0 0 1 5 5c0 1.5-1 2-1 2v3h-2l-1-1h-3l-1 1H9v-2a6 6 0 0 1-5-5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    track: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    impulse: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M6 8h12l-1 12H7L6 8Zm3 0a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    goal: '<svg viewBox="0 0 24 24" width="24" height="24"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
    invest: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M4 16l5-5 3 3 6-7M15 4h5v5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    fund: '<svg viewBox="0 0 24 24" width="24" height="24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  };

  const tips = [
    { title: "Save first, spend later", desc: "Try to save at least 20% of your income before spending.", color: "#22C55E", icon: "save" },
    { title: "Track your expenses daily", desc: "Know exactly where your money goes every single day.", color: "#3B82F6", icon: "track" },
    { title: "Avoid impulse buying", desc: "Wait 24 hours before making non-essential purchases.", color: "#F59E0B", icon: "impulse" },
    { title: "Set clear financial goals", desc: "Plan, design and stay consistent with your targets.", color: "#16A34A", icon: "goal" },
    { title: "Invest consistently", desc: "Small, regular investments grow into big returns over time.", color: "#3B82F6", icon: "invest" },
    { title: "Emergency fund is essential", desc: "Keep 3-6 months of expenses aside for the unexpected.", color: "#64748B", icon: "fund" },
  ];

  // Render all tip cards
  const grid = document.getElementById("tipsGrid");
  tips.forEach((t, i) => {
    const card = document.createElement("div");
    card.className = "tip-card";
    card.style.animationDelay = `${i * 50}ms`;
    card.innerHTML = `
      <div class="tip-icon" style="background:${t.color}">${icons[t.icon]}</div>
      <div class="tip-body">
        <h3>${t.title}</h3>
        <p>${t.desc}</p>
      </div>
    `;
    grid.appendChild(card);
  });

  // Tip of the Day
  const todIcon = document.getElementById("todIcon");
  const todTitle = document.getElementById("todTitle");
  const todDesc = document.getElementById("todDesc");
  const anotherBtn = document.getElementById("anotherBtn");
  const todBlock = document.getElementById("tipOfDay");

  let currentIndex = -1;

  function showRandomTip() {
    let idx;
    do {
      idx = Math.floor(Math.random() * tips.length);
    } while (idx === currentIndex && tips.length > 1);
    currentIndex = idx;

    const tip = tips[idx];
    todIcon.innerHTML = icons[tip.icon];
    todTitle.textContent = tip.title;
    todDesc.textContent = tip.desc;

    // restart fade animation
    todBlock.classList.remove("fade-swap");
    void todBlock.offsetWidth;
    todBlock.classList.add("fade-swap");
  }

  anotherBtn.addEventListener("click", showRandomTip);
  showRandomTip();
})();