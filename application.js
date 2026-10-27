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

    // Get a field's value even if it is on a hidden (disabled) step
    function fieldValue(name) {
        return applicationForm.elements.namedItem(name).value.trim();
    }

    applicationForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        if (!validCurrentStep()) {
            return;
        }

        const message = document.getElementById("application-message");

        submit.disabled = true;
        message.textContent = "Submitting...";

        const { error } = await _supabase.from("applications").insert({
            first_name: fieldValue("firstName"),
            last_name: fieldValue("lastName"),
            title: fieldValue("title"),
            email: fieldValue("email"),
            phone: fieldValue("phone"),
            city: fieldValue("city"),
            country: fieldValue("country"),
            invitation_code: fieldValue("invitationCode") || null,
            company_name: fieldValue("companyName"),
            company_website: fieldValue("companyWebsite"),
            company_country: fieldValue("companyCountry"),
            industry: fieldValue("industry"),
            full_time_employees: fieldValue("fullTimeEmployees"),
            funding_raised: fieldValue("fundingRaised"),
            funding_stage: fieldValue("fundingStage")
        });

        submit.disabled = false;

        if (error) {
            message.textContent =
                "Unable to submit your application: " + error.message;
            return;
        }

        message.textContent = "";
        applicationForm.hidden = true;
        document.querySelector(".application-progress").hidden = true;
        document.getElementById("application-complete").hidden = false;
    });

    showStep(0);
}
