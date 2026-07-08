(function () {
  const personalBtn = document.getElementById("personalBtn");
  const businessBtn = document.getElementById("businessBtn");
  const illustration = document.getElementById("illustration");

  function setMode(mode) {
    const isPersonal = mode === "personal";

    personalBtn.classList.toggle("active", isPersonal);
    businessBtn.classList.toggle("active", !isPersonal);

    personalBtn.setAttribute("aria-pressed", String(isPersonal));
    businessBtn.setAttribute("aria-pressed", String(!isPersonal));

    illustration.classList.toggle("business", !isPersonal);

    try {
      localStorage.setItem("spendwise-mode", mode);
    } catch (e) {
      /* storage may be unavailable */
    }
  }

  personalBtn.addEventListener("click", () => setMode("personal"));
  businessBtn.addEventListener("click", () => setMode("business"));

  let saved = "personal";
  try {
    saved = localStorage.getItem("spendwise-mode") || "personal";
  } catch (e) {
    /* ignore */
  }
  setMode(saved);
})();