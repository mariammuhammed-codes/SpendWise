document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    if (!menuToggle || !sidebar) return;

    // Create overlay if it doesn't exist
    let overlay = document.querySelector(".menu-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        document.body.appendChild(overlay);
    }

    function openMenu() {
        sidebar.classList.add("is-open");
        overlay.classList.add("active");
        menuToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("menu-open");
    }

    function closeMenu() {
        sidebar.classList.remove("is-open");
        overlay.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("menu-open");
    }

    function toggleMenu() {

        if (sidebar.classList.contains("is-open")) {
            closeMenu();
        } else {
            openMenu();
        }

    }

    menuToggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
    });

    overlay.addEventListener("click", closeMenu);

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeMenu();
        }
    });

    sidebar.querySelectorAll(".nav-link").forEach(link => {

        link.addEventListener("click", () => {

            if (window.innerWidth <= 992) {
                closeMenu();
            }

        });

    });

    window.addEventListener("resize", () => {

        if (window.innerWidth > 992) {
            closeMenu();
        }

    });

});