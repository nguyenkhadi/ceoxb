
document.addEventListener("DOMContentLoaded", function () {
    const search = document.getElementById("learn-search");
    const category = document.getElementById("learn-category");
    const cards = [...document.querySelectorAll(".learn-topic-card")];
    const count = document.getElementById("learn-count");
    const empty = document.getElementById("learn-empty");
    const savedList = document.getElementById("learn-saved-list");
    const feedback = document.getElementById("learn-feedback");

    if (!search || !category || !savedList) return;

    const storageKey = "ceoxb-saved-learning-topics";
    let saved = [];

    try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
        saved = Array.isArray(stored)
            ? stored.filter(item => typeof item === "string")
            : [];
    } catch (error) {
        saved = [];
    }

    function filterTopics() {
        const query = search.value.trim().toLowerCase();
        let visible = 0;

        cards.forEach(function (card) {
            const matchesSearch =
                card.textContent.toLowerCase().includes(query);

            const matchesCategory =
                category.value === "all" ||
                card.dataset.category === category.value;

            const show = matchesSearch && matchesCategory;

            card.hidden = !show;
            if (show) visible++;
        });

        count.textContent = visible + " topics";
        empty.hidden = visible !== 0;
    }

    function renderSaved() {
        savedList.replaceChildren();

        cards.forEach(function (card) {
            const button = card.querySelector(".learn-save-button");
            const topic = button.dataset.topic;
            const isSaved = saved.includes(topic);

            button.textContent = isSaved
                ? "★ Saved"
                : "☆ Save Topic";

            button.classList.toggle("saved", isSaved);
            button.setAttribute("aria-pressed", String(isSaved));
        });

        if (saved.length === 0) {
            const note = document.createElement("p");
            note.textContent = "You haven't saved any topics yet.";
            note.className = "learn-empty-state";
            savedList.appendChild(note);
            return;
        }

        saved.forEach(function (topic) {
            const item = document.createElement("div");
            item.className = "learn-saved-item";

            const label = document.createElement("span");
            label.textContent = topic;

            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Remove";
            remove.setAttribute("aria-label", "Remove " + topic);

            remove.addEventListener("click", function () {
                updateSaved(topic);
            });

            item.append(label, remove);
            savedList.appendChild(item);
        });
    }

    function updateSaved(topic) {
        const previous = [...saved];

        if (saved.includes(topic)) {
            saved = saved.filter(item => item !== topic);
        } else {
            saved.push(topic);
        }

        try {
            localStorage.setItem(storageKey, JSON.stringify(saved));
            feedback.textContent = saved.includes(topic)
                ? "Topic saved."
                : "Topic removed.";
        } catch (error) {
            saved = previous;
            feedback.textContent =
                "Unable to save topics in this browser.";
        }

        renderSaved();
    }

    document.querySelectorAll(".learn-save-button")
        .forEach(function (button) {
            button.addEventListener("click", function () {
                updateSaved(button.dataset.topic);
            });
        });

    search.addEventListener("input", filterTopics);
    category.addEventListener("change", filterTopics);

    filterTopics();
    renderSaved();
});
