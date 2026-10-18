// Demo 
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

// Dashboard access
if (window.location.pathname.endsWith("/dashboard.html")) {
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
