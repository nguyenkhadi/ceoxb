//demo 
const signinForm = document.getElementById("signin-form");
if (signinForm) {
    signinForm.addEventListener("submit", function(event) {
        event.preventDefault();
        document.getElementById("signin-message").textContent =
            "Demo only: sign-in will be connected in a later step.";
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
