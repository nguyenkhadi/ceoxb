// Frontend application form
const applicationForm = document.getElementById("application-form");

if (applicationForm) {
    const steps = Array.from(
        document.querySelectorAll(".application-step")
    );

    const back = document.getElementById("application-back");
    const next = document.getElementById("application-next");
    const submit = document.getElementById("application-submit");
    const label = document.getElementById("application-step-label");
    const fill = document.getElementById("application-progress-fill");

    let current = 0;

    const params = new URLSearchParams(window.location.search);
    const invitationCode = params.get("code") || params.get("invite");

    if (invitationCode && invitationCode !== "1") {
        document.getElementById("invitation-code").value = invitationCode;
    }

    if (params.has("invited")) {
        document.getElementById("invitation-code").focus();
    }

    function showStep(index) {
        current = index;

        steps.forEach(function(step, i) {
            step.hidden = i !== index;

            step.querySelectorAll("input, select, textarea")
                .forEach(function(field) {
                    field.disabled = i !== index;
                });
        });

        back.hidden = index === 0;
        next.hidden = index === steps.length - 1;
        submit.hidden = index !== steps.length - 1;

        label.textContent =
            "Step " + (index + 1) + " of " + steps.length;

        fill.style.width =
            ((index + 1) / steps.length * 100) + "%";
    }

    function validCurrentStep() {
        const fields = steps[current].querySelectorAll(
            "input, select, textarea"
        );

        for (const field of fields) {
            if (!field.checkValidity()) {
                field.reportValidity();
                return false;
            }
        }

        return true;
    }

    next.addEventListener("click", function() {
        if (validCurrentStep()) {
            showStep(current + 1);
        }
    });

    back.addEventListener("click", function() {
        showStep(current - 1);
    });

    applicationForm.addEventListener("submit", function(event) {
        event.preventDefault();

        if (!validCurrentStep()) {
            return;
        }

        applicationForm.hidden = true;
        document.querySelector(".application-progress").hidden = true;
        document.getElementById("application-complete").hidden = false;
    });

    showStep(0);
}
