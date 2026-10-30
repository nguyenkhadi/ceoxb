
(function() {
    const savedTheme = localStorage.getItem("ceoxb-theme");
    const preferredDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    const theme = savedTheme || (preferredDark ? "dark" : "light");

    document.documentElement.setAttribute("data-theme", theme);

    function addThemeButton() {
        const nav = document.querySelector(".nav-links");

        if (!nav || document.getElementById("theme-toggle")) {
            return;
        }

        const button = document.createElement("button");
        button.id = "theme-toggle";
        button.type = "button";
        button.className = "theme-toggle";

        function updateButton() {
            const isDark =
                document.documentElement.getAttribute("data-theme") === "dark";

            button.textContent = isDark ? "☀ Light Mode" : "☾ Dark Mode";
            button.setAttribute("aria-pressed", String(isDark));
            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );
        }

        button.addEventListener("click", function() {
            const isDark =
                document.documentElement.getAttribute("data-theme") === "dark";

            const nextTheme = isDark ? "light" : "dark";

            document.documentElement.setAttribute(
                "data-theme",
                nextTheme
            );

            localStorage.setItem("ceoxb-theme", nextTheme);
            updateButton();
        });

        nav.appendChild(button);
        updateButton();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addThemeButton);
    } else {
        addThemeButton();
    }
})();

