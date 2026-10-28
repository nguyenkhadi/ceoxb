const cohortForm = document.getElementById("cohort-update-form");

if (cohortForm) {
    const winInput = document.getElementById("cohort-win");
    const focusInput = document.getElementById("cohort-focus");
    const askInput = document.getElementById("cohort-ask");

    const monthLabel = document.getElementById("cohort-update-month");
    const summary = document.getElementById("cohort-update-summary");
    const savedText = document.getElementById("cohort-update-saved-text");
    const editButton = document.getElementById("cohort-update-edit");
    const status = document.getElementById("cohort-update-status");

    const now = new Date();
    const currentMonth = now.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    const monthKey =
        now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");

    monthLabel.textContent = currentMonth;

    let storageKey = "";

    function showSavedUpdate(update) {
        savedText.replaceChildren();

        const sections = [
            ["Your Win", update.win],
            ["Your Focus", update.focus],
            ["Your Ask", update.ask]
        ];

        sections.forEach(function(section) {
            const item = document.createElement("div");
            
            const heading = document.createElement("h4");
            heading.textContent = section[0];

            const paragraph = document.createElement("p");
            paragraph.textContent = section[1];
            
            item.append(heading, paragraph);
            savedText.appendChild(item);
        });

        cohortForm.hidden = true;
        summary.hidden = false;
    }

    function showEditForm() {
        cohortForm.hidden = false;
        summary.hidden = true;
        status.textContent = "";
    }

    cohortForm.addEventListener("submit", function(event) {
        event.preventDefault();

        if (!storageKey) {
            status.textContent = "Unable to save your update.";
            return;
        }

        const update = {
            win: winInput.value.trim(),
            focus: focusInput.value.trim(),
            ask: askInput.value.trim()
        };

        if (!update.win || !update.focus || !update.ask) {
            status.textContent = "Please complete all three fields.";
            return;
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(update));
            showSavedUpdate(update);
            status.textContent = "Your monthly update has been saved.";
        } catch (error) {
            status.textContent = "Unable to save your update in this browser.";
        }
    });

    editButton.addEventListener("click", showEditForm);

    async function loadUpdate() {
        try {
            const user = await getCurrentUser();

            if (!user) {
                status.textContent = "Please sign in to save an update.";
                return;
            }

            storageKey = "ceoxb-monthly-update-" + user.id + "-" + monthKey;

            const saved = localStorage.getItem(storageKey);

            if (!saved) {
                showEditForm();
                return;
            }

            const update = JSON.parse(saved);

            if (!update || typeof update.win !== "string" ||
                typeof update.focus !== "string" ||
                typeof update.ask !== "string") {
                showEditForm();
                return;
            }

            winInput.value = update.win;
            focusInput.value = update.focus;
            askInput.value = update.ask;

            showSavedUpdate(update);
        } catch (error) {
            showEditForm();
            status.textContent = "Unable to load your saved update.";
        }
    }

    loadUpdate();
}

