const signinForm = document.getElementById("signin-form");

if (signinForm) {
    signinForm.addEventListener("submit", function(event) {
        event.preventDefault();
        sessionStorage.setItem("signedIn", "yes");
        window.location.href = "dashboard.html";
    });
}

const requestForm = document.getElementById("request-form");

if (requestForm) {
    requestForm.addEventListener("submit", function(event) {
        event.preventDefault();
        document.getElementById("request-message").textContent =
            "Design demo only. Your request has not been sent.";
    });
}

const signupForm = document.getElementById("signup-form");

if (signupForm) {
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const password = document.getElementById("signup-password").value;
        const confirm = document.getElementById("confirm-password").value;
        const message = document.getElementById("signup-message");

        if (password !== confirm) {
            message.textContent = "Passwords do not match.";
        } else {
            message.textContent =
                "Design demo only. No account has been created.";
        }
    });
}

// Member page access
const pageName = window.location.pathname.split("/").pop();

if (pageName === "dashboard.html" || pageName === "learn.html" ||
        pageName === "connect.html" || pageName === "coffee.html" || 
        pageName === "discuss.html"|| pageName === "profile.html") {
    if (sessionStorage.getItem("signedIn") !== "yes") {
        window.location.replace("signin.html");
    }
}

// Sign out
const signout = document.getElementById("signout");

if (signout) {
    signout.addEventListener("click", function(event) {
        event.preventDefault();

        sessionStorage.removeItem("signedIn");
        window.location.href = "index.html";
    });
}

// Filter members
const memberSearch = document.getElementById("member-search");

if (memberSearch) {
    memberSearch.addEventListener("input", function() {
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

        document.getElementById("member-count").textContent =
            visibleCount + (visibleCount === 1 ? " member" : " members");

        document.getElementById("no-members").hidden = visibleCount > 0;
    });
}

// Coffee chat form demo
const coffeeForm = document.getElementById("coffee-form");

if (coffeeForm) {
    coffeeForm.addEventListener("submit", function(event) {
        event.preventDefault();
        document.getElementById("coffee-result").textContent =
            "Demo only. Your coffee chat request has not been sent.";
    });
}

// Discussion form
const discussionForm = document.getElementById("discussion-form");

if (discussionForm) {
    discussionForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = document.getElementById("discussion-title").value;
        const topic = document.getElementById("discussion-topic").value;
        const message = document.getElementById("discussion-message").value;

        const post = document.createElement("article");
        post.className = "dashboard-card";

        const heading = document.createElement("h3");
        heading.textContent = title;

        const topicText = document.createElement("p");
        topicText.textContent = topic;

        const messageText = document.createElement("p");
        messageText.textContent = message;

        post.append(heading, topicText, messageText);

        document.getElementById("discussion-list").prepend(post);
        document.getElementById("no-discussions").hidden = true;

        document.getElementById("discussion-result").textContent =
            "Demo post added. It has not been saved or shared.";

        discussionForm.reset();
    });
}


// Profile functionality
const profileForm = document.getElementById("profile-form");

if (profileForm) {
    const fields = [
        "name", "role", "company",
        "location", "about", "interests"
    ];

    const pictureInput = document.getElementById("edit-picture");
    const picturePreview = document.getElementById("profile-picture-preview");
    const profileResult = document.getElementById("profile-result");

    // Show text only when the user has entered something
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

    // Load previously saved profile information
    fields.forEach(function(field) {
        const saved = sessionStorage.getItem("profile-" + field);

        if (saved) {
            document.getElementById("edit-" + field).value = saved;
        }
    });

    // Load previously saved profile picture
    const savedPicture = sessionStorage.getItem("profile-picture");

    if (savedPicture) {
        picturePreview.src = savedPicture;
        picturePreview.hidden = false;
        pictureInput.required = false;
    }

    showProfile();

    // Preview selected picture before saving
    pictureInput.addEventListener("change", function() {
        const file = pictureInput.files[0];

        if (!file) {
            return;
        }

        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            profileResult.textContent = "Please select a JPG, PNG, or WebP image.";
            pictureInput.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            profileResult.textContent = "Please select an image smaller than 2 MB.";
            pictureInput.value = "";
            return;
        }

        profileResult.textContent = "";

        const reader = new FileReader();

        reader.onload = function() {
            picturePreview.src = reader.result;
            picturePreview.hidden = false;
        };

        reader.readAsDataURL(file);
    });

    // Save profile
    profileForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const file = pictureInput.files[0];
        const existingPicture = sessionStorage.getItem("profile-picture");

        if (!file && !existingPicture) {
            profileResult.textContent = "Please upload a profile picture.";
            return;
        }

        function saveDetails() {
            fields.forEach(function(field) {
                sessionStorage.setItem(
                    "profile-" + field,
                    document.getElementById("edit-" + field).value
                );
            });

            showProfile();

            pictureInput.required = false;
            profileResult.textContent = "Profile saved successfully!";
        }

        if (file) {
            const reader = new FileReader();

            reader.onload = function() {
                try {
                    sessionStorage.setItem("profile-picture", reader.result);
                    picturePreview.src = reader.result;
                    picturePreview.hidden = false;
                    saveDetails();
                } catch (error) {
                    profileResult.textContent =
                        "Unable to save the picture. Try a smaller image.";
                }
            };

            reader.readAsDataURL(file);
        } else {
            saveDetails();
        }
    });
}
