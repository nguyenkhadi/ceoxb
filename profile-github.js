
const githubInput = document.getElementById("edit-github");

if (githubInput) {
    const githubLink = document.getElementById("profile-github-link");
    const githubStatus = document.getElementById("github-save-status");

    let githubStorageKey = "";

    function showGithub(url) {
        if (url) {
            githubLink.href = url;
            githubLink.hidden = false;
        } else {
            githubLink.removeAttribute("href");
            githubLink.hidden = true;
        }
    }

    function validGithubUrl(value) {
        try {
            const url = new URL(value);

            return url.protocol === "https:" &&
                url.hostname.toLowerCase() === "github.com" &&
                url.pathname.replace(/\/+$/, "").length > 1;
        } catch (error) {
            return false;
        }
    }

    githubInput.addEventListener("change", function() {
        if (!githubStorageKey) {
            githubStatus.textContent = "Unable to save GitHub profile.";
            return;
        }

        const url = githubInput.value.trim();

        if (url && !validGithubUrl(url)) {
            githubStatus.textContent =
                "Enter a valid GitHub profile URL.";
            return;
        }

        try {
            localStorage.setItem(githubStorageKey, url);
            showGithub(url);
            githubStatus.textContent = "GitHub link saved in this browser.";
        } catch (error) {
            githubStatus.textContent =
                "Unable to save GitHub link in this browser.";
        }
    });

    async function loadGithub() {
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        githubStorageKey = "ceoxb-github-" + user.id;

        const savedUrl = localStorage.getItem(githubStorageKey) || "";

        if (savedUrl && validGithubUrl(savedUrl)) {
            githubInput.value = savedUrl;
            showGithub(savedUrl);
        }
    }

    loadGithub();
}

