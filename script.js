//demo 

if (signinForm) {
    signinForm.addEventListener("submit", function(event) {
        event.preventDefault();
        document.getElementById("signin-message").textContent =
            "Demo only: sign-in will be connected in a later step.";
    });
}
