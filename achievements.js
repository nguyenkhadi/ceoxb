const profileProgress = document.getElementById(
    "profile-progress-fill"
);

if (profileProgress) {
    const count = document.getElementById(
        "profile-progress-count"
    );

    const message = document.getElementById(
        "profile-progress-message"
    );

    const progressBar = document.getElementById(
        "profile-progress-bar"
    );

    const badge = document.getElementById("badge-profile");

    const earnedCount = document.getElementById(
        "earned-badge-count"
    );

    async function loadAchievements() {
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        const { data, error } = await _supabase
            .from("profiles")
            .select(
                "name, role, company, location, " +
                "about, interests, avatar_url"
            )
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            message.textContent =
                "Unable to load progress.";
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

        let completed = 0;

        fields.forEach(function(field) {
            if (
                typeof profile[field] === "string" &&
                profile[field].trim() !== ""
            ) {
                completed++;
            }
        });

        const percent = Math.round(
            completed / fields.length * 100
        );

        count.textContent =
            completed + " of " + fields.length;

        profileProgress.style.width = percent + "%";

        progressBar.setAttribute(
            "aria-valuenow",
            String(percent)
        );

        if (completed === fields.length) {
            message.textContent = "Profile complete!";
            badge.classList.remove("locked");
            badge.classList.add("earned");

            badge.querySelector(
                ".reward-status"
            ).textContent = "Earned";

            earnedCount.textContent = "1 / 3 earned";
        } else {
            message.textContent =
                "Complete your profile to unlock your first badge.";

            badge.classList.remove("earned");
            badge.classList.add("locked");

            badge.querySelector(
                ".reward-status"
            ).textContent = "Locked";

            earnedCount.textContent = "0 / 3 earned";
        }
    }

    loadAchievements();
}
