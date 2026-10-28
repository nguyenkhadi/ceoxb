
const linkedinInput = document.getElementById("edit-linkedin");

if (linkedinInput) {
    const linkedinLink = document.getElementById("profile-linkedin-link");
    const linkedinStatus = document.getElementById("linkedin-save-status");

    let linkedinStorageKey = "";

    function showLinkedin(url) {
        if (url) {
            linkedinLink.href = url;
            linkedinLink.hidden = false;
        } else {
            linkedinLink.removeAttribute("href");
            linkedinLink.hidden = true;
        }
    }

    function validLinkedinUrl(value) {
        try {
            const url = new URL(value);
            const hostname = url.hostname.toLowerCase();

            return url.protocol === "https:" &&
                (hostname === "linkedin.com" ||
                 hostname === "www.linkedin.com") &&
                url.pathname.startsWith("/in/") &&
                url.pathname.length > 4;
        } catch (error) {
            return false;
        }
    }

    linkedinInput.addEventListener("change", function() {
        if (!linkedinStorageKey) {
            linkedinStatus.textContent = "Unable to save LinkedIn profile.";
            return;
        }

        const url = linkedinInput.value.trim();

        if (url && !validLinkedinUrl(url)) {
            linkedinStatus.textContent =
                "Enter a valid LinkedIn profile URL.";
            return;
        }

        try {
            localStorage.setItem(linkedinStorageKey, url);
            showLinkedin(url);
            linkedinStatus.textContent = "LinkedIn link saved in this browser.";
        } catch (error) {
            linkedinStatus.textContent =
                "Unable to save LinkedIn link.";
        }
    });

    async function loadLinkedin() {
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        linkedinStorageKey = "ceoxb-linkedin-" + user.id;

        const savedUrl = localStorage.getItem(linkedinStorageKey) || "";

        if (savedUrl && validLinkedinUrl(savedUrl)) {
            linkedinInput.value = savedUrl;
            showLinkedin(savedUrl);
        }
    }

    loadLinkedin();
}
