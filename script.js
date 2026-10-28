async function getCurrentUser() {
    const { data } = await _supabase.auth.getSession();
    return data.session ? data.session.user : null;
}

const signinForm = document.getElementById("signin-form");

if (signinForm) {
    signinForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const message = document.getElementById("signin-message");

        message.textContent = "Signing in...";

        const { error } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            message.textContent = error.message;
            return;
        }

        window.location.href = "dashboard.html";
    });
}

const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const inviteCode = document.getElementById("invite-code").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirm = document.getElementById("confirm-password").value;
        const message = document.getElementById("signup-message");

        if (password !== confirm) {
            message.textContent = "Passwords do not match.";
            return;
        }

        message.textContent = "Creating your account...";

        // name and invite_code are saved on the user; a database
        // trigger copies the name into their profile
        const { data, error } = await _supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { name: name, invite_code: inviteCode }
            }
        });

        if (error) {
            message.textContent = error.message;
            return;
        }

        if (data.session) {
            window.location.href = "profile.html";
        } else {
            message.textContent =
                "Account created! Check your email to confirm it, then sign in.";
            signupForm.reset();
        }
    });
}

const pageName = window.location.pathname.split("/").pop();

if (pageName === "dashboard.html" || pageName === "learn.html" ||
        pageName === "connect.html" || pageName === "coffee.html" ||
        pageName === "discuss.html"|| pageName === "profile.html" ||
        pageName === "calendar.html") {
    getCurrentUser().then(function(user) {
        if (!user) {
            window.location.replace("signin.html");
        }
    });
}

// Sign out
const signout = document.getElementById("signout");

if (signout) {
    signout.addEventListener("click", async function(event) {
        event.preventDefault();

        await _supabase.auth.signOut();
        window.location.href = "index.html";
    });
}

const dashboardWelcome = document.getElementById("dashboard-welcome");

if (dashboardWelcome) {
    (async function() {
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        const { data } = await _supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .maybeSingle();

        const name = ((data && data.name) || "").trim();

        dashboardWelcome.textContent = name
            ? "Welcome back, " + name + "!"
            : "Welcome back!";
    })();
}

const memberSearch = document.getElementById("member-search");

if (memberSearch) {
    const memberList = document.getElementById("member-list");
    const memberCount = document.getElementById("member-count");
    const noResults = document.getElementById("no-search-results");

    function addMember(profile) {
        const name = (profile.name || "").trim();
        const role = (profile.role || "").trim();
        const company = (profile.company || "").trim();
        const location = (profile.location || "").trim();
        const interests = (profile.interests || "").trim();
        
        if (!name || !profile.avatar_url) {
            return;
        }

        const card = document.createElement("div");
        card.className = "dashboard-card member-card";

        card.dataset.search =
            [name, role, company, location, interests]
                .join(" ").toLowerCase();

        const picture = document.createElement("img");
        picture.src = profile.avatar_url;
        picture.alt = name + "'s profile picture";
        picture.className = "member-picture";
        
        const details = document.createElement("details");
        details.className = "member-profile-details";

        const summary = document.createElement("summary");
        
        const heading = document.createElement("h3");
        heading.textContent = name;

        const roleText = document.createElement("p");
        roleText.className = "member-role";
        roleText.textContent =
        [role, company].filter(Boolean).join(" at ");

        const viewText = document.createElement("span");
        viewText.className = "member-view-profile";
        viewText.textContent = "View Profile";

        summary.append(picture, heading, roleText, viewText);
        details.appendChild(summary);
    
        const expanded = document.createElement("div");
        expanded.className = "member-expanded-info";
        
        if (location) {
            const locationText = document.createElement("p");
            locationText.textContent = location;
            expanded.appendChild(locationText);
        }

        if (interests) {
            const interestText = document.createElement("p");
            interestText.textContent = "Interests: " + interests;
            expanded.appendChild(interestText);
        }

        
    const achievementsTitle = document.createElement("h4");
    achievementsTitle.textContent = "Featured Achievements";
    expanded.appendChild(achievementsTitle);

    const badges = document.createElement("div");
    badges.className = "member-achievements";

    let settings = null;

    try {
        settings = JSON.parse(
            localStorage.getItem(
                "ceoxb-achievement-visibility-" + profile.id
            ) || "null"
        );
    } catch (error) {
        settings = null;
    }

    if (settings && settings.visible &&
        Array.isArray(settings.selected)) {

        const categories = {
            coffee: "Coffee Chats",
            discussion: "Discussions",
            connection: "Connections",
            learning: "Learning"
        };

        settings.selected.forEach(function(id) {
            let label = "";
            let icon = "★";

            if (id === "profile") {
                label = "Getting Started";
                icon = "✦";
            } else if (id === "tutorial") {
                label = "Welcome Aboard";
                icon = "🎓";
            } else {
                const match = id.match(
                    /^(coffee|discussion|connection|learning)-(\d+)$/
                );

                if (match) {
                    label = categories[match[1]] +
                        " · " + Number(match[2]).toLocaleString();
                }
            }

            if (label) {
                const badge = document.createElement("span");
                badge.className = "member-achievement-badge";
                badge.textContent = icon + " " + label;
                badges.appendChild(badge);
            }
        });
    }

    if (!badges.children.length) {
        const empty = document.createElement("p");
        empty.textContent = "No featured achievements available.";
        badges.appendChild(empty);
    }

        expanded.appendChild(badges);
    
        const linkedinUrl = localStorage.getItem(
            "ceoxb-linkedin-" + profile.id
        );
    
        if (linkedinUrl) {
            try {
                const url = new URL(linkedinUrl);
    
                if (url.protocol === "https:" &&
                    ["linkedin.com", "www.linkedin.com"]
                        .includes(url.hostname.toLowerCase()) &&
                    url.pathname.startsWith("/in/")) {
    
                    const link = document.createElement("a");
                    link.href = url.href;
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                    link.className = "member-linkedin-link";
                    link.textContent = "View LinkedIn Profile ↗";
                    expanded.appendChild(link);
                }
            } catch (error) {
            }
        }
        const coffeeButton = document.createElement("a");
        coffeeButton.href = "coffee.html?member=" + encodeURIComponent(profile.id);
        coffeeButton.className = "member-coffee-button";
        coffeeButton.textContent = "☕ Schedule Coffee Chat";

        details.appendChild(expanded);
        card.appendChild(details);
        card.appendChild(coffeeButton);
        memberList.appendChild(card);
    }

    async function loadMembers() {
        const { data, error } = await _supabase
            .from("profiles")
            .select("id, name, role, company, location, interests, avatar_url")
            .order("name");

        if (error) {
            memberCount.textContent = "Unable to load members";
            return;
        }

        data.forEach(addMember);
        filterMembers();
    }

    function filterMembers() {
        const searchText = memberSearch.value.toLowerCase().trim();
        const members = document.querySelectorAll(".member-card");

        let visibleCount = 0;

        members.forEach(function(member) {
            const matches = member.dataset.search.includes(searchText);

            member.hidden = !matches;

            if (matches) {
                visibleCount++;
            }
        });

        memberCount.textContent =
            visibleCount + (visibleCount === 1 ? " member" : " members");

        if (noResults) {
            noResults.hidden =
                visibleCount > 0 || members.length === 0 || !searchText;
        }
    }

    loadMembers();

    memberSearch.addEventListener("input", filterMembers);
}

const profileForm = document.getElementById("profile-form");

if (profileForm) {
    const fields = [
        "name", "role", "company",
        "location", "about", "interests"
    ];

    const pictureInput = document.getElementById("edit-picture");
    const picturePreview = document.getElementById("profile-picture-preview");
    const profileResult = document.getElementById("profile-result");

    function updateText(id, value) {
        const element = document.getElementById(id);

        element.textContent = value;
        element.hidden = !value;
    }

    function showProfile() {
        const name = document.getElementById("edit-name").value.trim();
        const role = document.getElementById("edit-role").value.trim();
        const company = document.getElementById("edit-company").value.trim();
        const location = document.getElementById("edit-location").value.trim();
        const about = document.getElementById("edit-about").value.trim();
        const interests = document.getElementById("edit-interests").value.trim();

        document.getElementById("profile-name").textContent =
            name || "Your name";

        updateText(
            "profile-role",
            [role, company].filter(Boolean).join(" at ")
        );

        updateText("profile-location", location);
        updateText("profile-about", about);
        updateText("profile-interests", interests);

        document.getElementById("profile-about-section").hidden = !about;
        document.getElementById("profile-interests-section").hidden = !interests;
    }

    // URL of the picture already saved in Supabase, if any
    let savedPicture = "";

    async function loadProfile() {
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        const { data } = await _supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (data) {
            fields.forEach(function(field) {
                if (data[field]) {
                    document.getElementById("edit-" + field).value = data[field];
                }
            });

            if (data.avatar_url) {
                savedPicture = data.avatar_url;
                picturePreview.src = savedPicture;
                picturePreview.hidden = false;
                pictureInput.required = false;
            }
        }

        showProfile();
    }

    showProfile();
    loadProfile();

    // Save profile
    profileForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (window.profileCropPending) {
            profileResult.textContent = "Finish editing your picture first.";
            return;
        }
        
        const file = window.profileCroppedFile;

        if (!file && !savedPicture) {
            profileResult.textContent = "Please upload a profile picture.";
            return;
        }

        const user = await getCurrentUser();

        if (!user) {
            window.location.replace("signin.html");
            return;
        }

        profileResult.textContent = "Saving...";

        const profile = { id: user.id };

        fields.forEach(function(field) {
            profile[field] =
                document.getElementById("edit-" + field).value.trim();
        });

        if (file) {
            const path = user.id + "/avatar.jpg";

            const { error: uploadError } = await _supabase.storage
                .from("avatars")
                .upload(path, file, { upsert: true, contentType: file.type });

            if (uploadError) {
                profileResult.textContent =
                    "Unable to upload the picture: " + uploadError.message;
                return;
            }

            const { data } = _supabase.storage
                .from("avatars")
                .getPublicUrl(path);
            
            profile.avatar_url = data.publicUrl + "?v=" + Date.now();
        }

        const { error } = await _supabase.from("profiles").upsert(profile);

        if (error) {
            profileResult.textContent =
                "Unable to save your profile: " + error.message;
            return;
        }

        if (profile.avatar_url) {
            savedPicture = profile.avatar_url;
            picturePreview.src = savedPicture;
            picturePreview.hidden = false;
        }

        pictureInput.value = "";
        pictureInput.required = false;
        showProfile();
        profileResult.textContent = "Profile saved successfully!";
    });
}

const dashboardCalendar = document.getElementById("calendar-days");

if (dashboardCalendar) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const monthLabel = document.getElementById("calendar-month");

    monthLabel.textContent = today.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric"
    });

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        dashboardCalendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";
        cell.textContent = day;

        if (day === today.getDate()) {
            cell.classList.add("today");
        }

        dashboardCalendar.appendChild(cell);
    }
}
