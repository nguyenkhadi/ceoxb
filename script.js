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
        pageName === "connect.html" || pageName === "coffee.html" || pageName === "discuss.html") {
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
