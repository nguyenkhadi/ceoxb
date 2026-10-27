(function () {
    const categories = [
        { id: "coffee", name: "Coffee Chats", icon: "☕" },
        { id: "discussion", name: "Discussions", icon: "💬" },
        { id: "connection", name: "Connections", icon: "🤝" },
        { id: "learning", name: "Learning", icon: "📚" }
    ];

    let userId = null;
    let achievementsDialog = null;
    let profileComplete = false;

    let visibilitySettings = {
        visible: false,
        selected: []
    };

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

        if (!userId) return;

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
        
        if (fill) {
            fill.style.width = percentage + "%";
        }

        if (progressBar) {
            progressBar.setAttribute(
                "aria-valuenow",
                String(percentage)
            );
        }

        const complete = completed === fields.length;
        profileComplete = complete;

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
        refreshProfileAchievements();

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

    
    function getVisibilityKey() {
        return "ceoxb-achievement-visibility-" + userId;
    }

    function getEarnedAchievements() {
        const earned = [];

        if (profileComplete) {
            earned.push({
                id: "profile",
                name: "Getting Started",
                icon: "✦",
                description: "Complete your profile",
                className: "gold"
            });
        }

        const tutorialUnlocked =
            localStorage.getItem("ceoxb-tutorial-achievement") ===
            "unlocked";

        if (tutorialUnlocked) {
            earned.push({
                id: "tutorial",
                name: "Welcome Aboard",
                icon: "🎓",
                description: "Explore or skip the tutorial",
                className: "bronze"
            });
        }

        categories.forEach(function (category) {
            const count = getActivities(category.id).length;
            const info = getMilestoneInfo(count);

            info.earned.forEach(function (number) {
                const tier = getTier(number);

                earned.push({
                    id: category.id + "-" + number,
                    name: category.name + " · " +
                        number.toLocaleString(),
                    icon: tier.icon,
                    description: tier.name + " milestone",
                    className: tier.className
                });
            });
        });

        return earned;
    }

    function loadVisibilitySettings() {
        visibilitySettings = {
            visible: false,
            selected: []
        };

        if (!userId) return;

        try {
            const saved = JSON.parse(
                localStorage.getItem(getVisibilityKey()) || "null"
            );

            if (saved && typeof saved === "object") {
                visibilitySettings.visible = saved.visible === true;

                visibilitySettings.selected =
                    Array.isArray(saved.selected)
                        ? saved.selected.filter(function (id) {
                            return typeof id === "string";
                        })
                        : [];
            }
        } catch (error) {
            visibilitySettings.visible = false;
            visibilitySettings.selected = [];
        }
    }

    function saveVisibilitySettings() {
        const status = document.getElementById(
            "achievement-privacy-status"
        );

        try {
            localStorage.setItem(
                getVisibilityKey(),
                JSON.stringify(visibilitySettings)
            );

            if (status) {
                status.textContent =
                    "Achievement preferences saved in this browser.";
            }
        } catch (error) {
            if (status) {
                status.textContent =
                    "Unable to save achievement preferences.";
            }
        }
    }

    function createFeaturedBadge(achievement) {
        const badge = document.createElement("div");

        badge.className =
            "featured-achievement-badge achievement-tier " +
            achievement.className;

        const icon = document.createElement("span");
        icon.className = "featured-achievement-icon";
        icon.textContent = achievement.icon;

        const name = document.createElement("strong");
        name.textContent = achievement.name;

        badge.append(icon, name);

        return badge;
    }

    function renderFeaturedPreview(earned) {
        const preview = document.getElementById(
            "featured-achievements-preview"
        );

        if (!preview) return;

        preview.replaceChildren();

        const featured = visibilitySettings.visible
            ? earned.filter(function (achievement) {
                return visibilitySettings.selected.includes(
                    achievement.id
                );
            })
            : [];

        if (featured.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No achievements displayed.";
            preview.appendChild(empty);
            return;
        }

        featured.forEach(function (achievement) {
            preview.appendChild(createFeaturedBadge(achievement));
        });
    }

    function refreshProfileAchievements() {
        const toggle = document.getElementById(
            "show-profile-achievements"
        );

        const options = document.getElementById(
            "achievement-visibility-options"
        );

        const list = document.getElementById(
            "achievement-selection-list"
        );

        if (!toggle || !options || !list) return;

        const earned = getEarnedAchievements();

        toggle.checked = visibilitySettings.visible;
        options.hidden = !visibilitySettings.visible;

        list.replaceChildren();

        if (earned.length === 0) {
            const empty = document.createElement("p");
            empty.textContent = "No achievements earned yet.";
            list.appendChild(empty);
        }

        earned.forEach(function (achievement) {
            const row = document.createElement("label");
            row.className = "achievement-selection-item";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";

            checkbox.checked =
                visibilitySettings.selected.includes(achievement.id);

            const icon = document.createElement("span");
            icon.className = "achievement-selection-icon";
            icon.textContent = achievement.icon;

            const details = document.createElement("span");
            details.className = "achievement-selection-info";

            const title = document.createElement("strong");
            title.textContent = achievement.name;

            const description = document.createElement("small");
            description.textContent = achievement.description;

            details.append(title, description);
            row.append(checkbox, icon, details);
            list.appendChild(row);

            checkbox.addEventListener("change", function () {
                if (checkbox.checked) {
                    if (!visibilitySettings.selected.includes(
                        achievement.id
                    )) {
                        visibilitySettings.selected.push(achievement.id);
                    }
                } else {
                    visibilitySettings.selected =
                        visibilitySettings.selected.filter(
                            function (id) {
                                return id !== achievement.id;
                            }
                        );
                }

                saveVisibilitySettings();
                renderFeaturedPreview(earned);
            });
        });

        renderFeaturedPreview(earned);
    }

    function initializeProfileSettings() {
        const toggle = document.getElementById(
            "show-profile-achievements"
        );

        if (!toggle) return;

        if (!userId) {
            toggle.disabled = true;

            const status = document.getElementById(
                "achievement-privacy-status"
            );

            if (status) {
                status.textContent =
                    "Sign in to manage your achievements.";
            }

            return;
        }

        loadVisibilitySettings();

        toggle.addEventListener("change", function () {
            visibilitySettings.visible = toggle.checked;

            saveVisibilitySettings();
            refreshProfileAchievements();
        });

        refreshProfileAchievements();
    }
    
    async function initializeAchievements(){ 
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
        initializeProfileSettings();
    }

    window.addEventListener(
        "ceoxb-achievement-updated",
        function () {
            updateTutorialAchievement();
            refreshProfileAchievements();
        }
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
