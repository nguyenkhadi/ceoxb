
(function () {
    const categories = [
        { id: "coffee", name: "Coffee Chats", icon: "☕" },
        { id: "discussion", name: "Discussions", icon: "💬" },
        { id: "connection", name: "Connections", icon: "🤝" },
        { id: "learning", name: "Learning", icon: "📚" }
    ];

    let userId = null;
    let achievementsDialog = null;

    function getMilestone(index) {
        if (index === 0) return 1;

        const adjustedIndex = index - 1;
        const multiplier = [5, 10, 25][adjustedIndex % 3];
        const power = Math.floor(adjustedIndex / 3);

        return multiplier * Math.pow(10, power);
    }

    function getTier(milestone) {
        if (milestone >= 10000) {
            return {
                name: "Celestial",
                icon: "✺",
                className: "celestial"
            };
        }

        if (milestone >= 5000) {
            return {
                name: "Diamond",
                icon: "💎",
                className: "diamond"
            };
        }

        if (milestone >= 1000) {
            return {
                name: "Platinum",
                icon: "✧",
                className: "platinum"
            };
        }

        if (milestone >= 100) {
            return {
                name: "Gold",
                icon: "★",
                className: "gold"
            };
        }

        if (milestone >= 10) {
            return {
                name: "Silver",
                icon: "✦",
                className: "silver"
            };
        }

        return {
            name: "Bronze",
            icon: "◆",
            className: "bronze"
        };
    }

    function getMilestoneInfo(count) {
        const earned = [];
        let index = 0;

        while (getMilestone(index) <= count) {
            earned.push(getMilestone(index));
            index++;
        }

        return {
            earned: earned,
            next: getMilestone(index),
            previous: earned.length
                ? earned[earned.length - 1]
                : 0
        };
    }

    function getStorageKey(type) {
        return "ceoxb-achievements-" + userId + "-" + type;
    }

    function getActivities(type) {
        if (!userId) return [];

        try {
            const saved = JSON.parse(
                localStorage.getItem(getStorageKey(type)) || "[]"
            );

            return Array.isArray(saved) ? saved : [];
        } catch (error) {
            return [];
        }
    }

    function updateEarnedCount() {
        const counter = document.getElementById("earned-badge-count");

        if (!counter) return;

        const badges = document.querySelectorAll(
            ".badge-collection .reward-badge"
        );

        const earned = document.querySelectorAll(
            ".badge-collection .reward-badge.earned"
        );

        counter.textContent =
            earned.length + " / " + badges.length + " earned";
    }

    function setBadgeEarned(id, unlocked) {
        const badge = document.getElementById(id);

        if (!badge) return;

        badge.classList.toggle("earned", unlocked);
        badge.classList.toggle("locked", !unlocked);

        const status = badge.querySelector(".reward-status");

        if (status) {
            status.textContent = unlocked ? "Earned" : "Locked";
        }

        updateEarnedCount();
    }

    async function loadProfileAchievement() {
        const fill = document.getElementById("profile-progress-fill");

        if (!fill || !userId) return;

        const count = document.getElementById("profile-progress-count");
        const message = document.getElementById(
            "profile-progress-message"
        );
        const progressBar = document.getElementById(
            "profile-progress-bar"
        );

        const { data, error } = await _supabase
            .from("profiles")
            .select(
                "name, role, company, location, " +
                "about, interests, avatar_url"
            )
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            if (message) {
                message.textContent = "Unable to load progress.";
            }
            return;
        }

        const profile = data || {};

        const fields = [
            "name",
            "role",
            "company",
            "location",
            "about",
            "interests",
            "avatar_url"
        ];

        const completed = fields.filter(function (field) {
            return (
                typeof profile[field] === "string" &&
                profile[field].trim() !== ""
            );
        }).length;

        const percentage = Math.round(
            (completed / fields.length) * 100
        );

        if (count) {
            count.textContent =
                completed + " of " + fields.length;
        }

        fill.style.width = percentage + "%";

        if (progressBar) {
            progressBar.setAttribute(
                "aria-valuenow",
                String(percentage)
            );
        }

        const complete = completed === fields.length;

        if (message) {
            message.textContent = complete
                ? "Profile complete!"
                : "Complete your profile to unlock your first badge.";
        }

        setBadgeEarned("badge-profile", complete);
    }

    function updateTutorialAchievement() {
        const unlocked =
            localStorage.getItem("ceoxb-tutorial-achievement") ===
            "unlocked";

        setBadgeEarned("badge-tutorial", unlocked);
    }

    function createMilestoneTile(number, earned) {
        const tier = getTier(number);

        const tile = document.createElement("div");
        tile.className =
            "milestones-tile achievement-tier " +
            tier.className +
            (earned ? " is-earned" : " is-locked");

        const icon = document.createElement("span");
        icon.className = "milestone-tier-icon";
        icon.textContent = earned ? tier.icon : "🔒";

        const amount = document.createElement("strong");
        amount.textContent = number.toLocaleString();

        const label = document.createElement("small");
        label.textContent = tier.name;

        const status = document.createElement("span");
        status.className = "milestone-status";
        status.textContent = earned ? "Earned" : "Locked";

        tile.append(icon, amount, label, status);

        return tile;
    }

    function createCategoryCard(category) {
        const activities = getActivities(category.id);
        const count = activities.length;
        const info = getMilestoneInfo(count);

        const card = document.createElement("section");
        card.className = "milestones-activity";

        const title = document.createElement("h3");
        title.textContent =
            category.icon + " " + category.name;

        const description = document.createElement("p");
        description.textContent =
            count.toLocaleString() + " completed";

        const progress = document.createElement("div");
        progress.className = "milestones-progress";

        const fill = document.createElement("div");
        fill.className = "milestones-progress-fill";

        const percent =
            ((count - info.previous) /
                (info.next - info.previous)) * 100;

        fill.style.width =
            Math.max(0, Math.min(100, percent)) + "%";

        progress.appendChild(fill);

        const next = document.createElement("p");
        next.className = "milestones-next";
        next.textContent =
            "Next milestone: " +
            info.next.toLocaleString() +
            " · " +
            (info.next - count).toLocaleString() +
            " to go";

        const grid = document.createElement("div");
        grid.className = "milestones-grid";

        info.earned.forEach(function (milestone) {
            grid.appendChild(
                createMilestoneTile(milestone, true)
            );
        });

        const index = info.earned.length;

        for (let i = 0; i < 3; i++) {
            grid.appendChild(
                createMilestoneTile(
                    getMilestone(index + i),
                    false
                )
            );
        }

        card.append(title, description, progress, next, grid);

        return card;
    }

    function renderMilestones() {
        const content = document.getElementById(
            "milestones-content"
        );

        if (!content) return;

        content.replaceChildren();

        categories.forEach(function (category) {
            content.appendChild(
                createCategoryCard(category)
            );
        });
    }

    function createAchievementsViewer() {
        const collection = document.querySelector(".badge-collection");

        if (!collection) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "milestones-open";
        button.textContent = "View All Achievements →";

        collection.appendChild(button);

        achievementsDialog = document.createElement("dialog");
        achievementsDialog.className = "milestones-dialog";

        achievementsDialog.innerHTML = `
            <div class="milestones-dialog-inner">
                <div class="milestones-header">
                    <h2>All Achievements</h2>
                    <button type="button"
                        class="milestones-close"
                        aria-label="Close achievements">
                        ✕
                    </button>
                </div>

                <p class="milestones-intro">
                    Keep growing your community impact.
                    Every milestone unlocks a new badge.
                </p>

                <div id="milestones-content"
                    class="milestones-content"></div>
            </div>
        `;

        document.body.appendChild(achievementsDialog);

        button.addEventListener("click", function () {
            renderMilestones();
            achievementsDialog.showModal();
        });

        achievementsDialog
            .querySelector(".milestones-close")
            .addEventListener("click", function () {
                achievementsDialog.close();
            });
    }

    function celebrateAchievement(category, milestone) {
        const tier = getTier(milestone);

        const popup = document.createElement("div");
        popup.className =
            "achievement-celebration achievement-tier " +
            tier.className;

        popup.setAttribute("role", "dialog");
        popup.setAttribute("aria-modal", "true");
        popup.setAttribute(
            "aria-label",
            "Achievement unlocked"
        );

        const card = document.createElement("div");
        card.className = "achievement-celebration-card";

        const icon = document.createElement("div");
        icon.className = "achievement-celebration-icon";
        icon.textContent = tier.icon;

        const heading = document.createElement("h2");
        heading.textContent = "Achievement Unlocked!";

        const tierName = document.createElement("strong");
        tierName.textContent = tier.name + " " + category.name;

        const description = document.createElement("p");
        description.textContent =
            "You've reached " +
            milestone.toLocaleString() +
            " completed " +
            category.name.toLowerCase() +
            "!";

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "Awesome! ✨";

        card.append(
            icon,
            heading,
            tierName,
            description,
            button
        );

        popup.appendChild(card);

        if (!window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches) {
            const symbols = ["✦", "★", "◆", "✧"];

            for (let i = 0; i < 24; i++) {
                const particle = document.createElement("span");
                particle.className = "achievement-particle";
                particle.textContent = symbols[i % symbols.length];

                particle.style.left =
                    Math.random() * 100 + "%";

                particle.style.animationDelay =
                    Math.random() * 0.7 + "s";

                popup.appendChild(particle);
            }
        }

        document.body.appendChild(popup);

        const previousFocus = document.activeElement;

        function closePopup() {
            popup.remove();

            if (
                previousFocus &&
                typeof previousFocus.focus === "function"
            ) {
                previousFocus.focus();
            }
        }

        button.addEventListener("click", closePopup);
        button.focus();
    }

    async function recordActivity(type, uniqueId) {
        const category = categories.find(function (item) {
            return item.id === type;
        });

        if (
            !category ||
            uniqueId === undefined ||
            uniqueId === null ||
            String(uniqueId).trim() === ""
        ) {
            return false;
        }

        if (!userId) {
            const user = await getCurrentUser();

            if (!user) return false;

            userId = user.id;
        }

        const activities = getActivities(type);
        const id = String(uniqueId);

        if (activities.includes(id)) {
            return false;
        }

        const previousCount = activities.length;

        activities.push(id);

        try {
            localStorage.setItem(
                getStorageKey(type),
                JSON.stringify(activities)
            );
        } catch (error) {
            return false;
        }

        renderMilestones();

        const before = getMilestoneInfo(previousCount);
        const after = getMilestoneInfo(activities.length);

        if (after.earned.length > before.earned.length) {
            const milestone =
                after.earned[after.earned.length - 1];

            celebrateAchievement(category, milestone);
        }

        return true;
    }

    window.ceoxbMilestones = {
        record: recordActivity,
        refresh: renderMilestones
    };

    async function initializeAchievements() {
        createAchievementsViewer();
        updateTutorialAchievement();

        try {
            const user = await getCurrentUser();

            if (user) {
                userId = user.id;
                await loadProfileAchievement();
            }
        } catch (error) {
            const message = document.getElementById(
                "profile-progress-message"
            );

            if (message) {
                message.textContent =
                    "Unable to load achievements.";
            }
        }

        updateEarnedCount();
        renderMilestones();
    }

    window.addEventListener(
        "ceoxb-achievement-updated",
        updateTutorialAchievement
    );

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeAchievements
        );
    } else {
        initializeAchievements();
    }
})();
