// CEO XB welcome tutorial

const tourDialog = document.getElementById("welcome-tour");

if (tourDialog) {
    const steps = [
        {
            title: "Welcome to CEO XB",
            icon: "✦",
            description:
                "A private space to connect with fellow CEOs, " +
                "share ideas, and support each other's growth."
        },
        {
            title: "Dashboard",
            icon: "⌂",
            description:
                "Your starting point. Find quick actions, " +
                "community activity, and your calendar."
        },
        {
            title: "Calendar",
            icon: "▦",
            description:
                "Browse dates and plan upcoming meetings " +
                "and community activities."
        },
        {
            title: "Learn",
            icon: "▤",
            description:
                "Find Mini MBA learning resources " +
                "and course modules as they become available."
        },
        {
            title: "Connect",
            icon: "♧",
            description:
                "Browse member profiles and find other " +
                "CEOs by name, company, or location."
        },
        {
            title: "Coffee Chats",
            icon: "☕",
            description:
                "Build relationships through one-on-one " +
                "conversations with fellow members."
        },
        {
            title: "Discuss",
            icon: "✎",
            description:
                "Share questions, business challenges, " +
                "and ideas with your community."
        },
        {
            title: "Your Profile",
            icon: "◎",
            description:
                "Add your photo, company details, " +
                "background, and interests so other members " +
                "can get to know you."
        }
    ];

    let currentStep = 0;
    let storageKey = "";

    const title = document.getElementById("tour-title");
    const description = document.getElementById("tour-description");
    const icon = document.getElementById("tour-icon");
    const count = document.getElementById("tour-step-count");
    const dots = document.getElementById("tour-progress-dots");

    const back = document.getElementById("tour-back");
    const next = document.getElementById("tour-next");
    const skip = document.getElementById("tour-skip");
    const close = document.getElementById("tour-close");
    const replay = document.getElementById("replay-tour");

    function showStep() {
        const step = steps[currentStep];

        title.textContent = step.title;
        description.textContent = step.description;
        icon.textContent = step.icon;

        count.textContent =
            (currentStep + 1) + " of " + steps.length;

        dots.innerHTML = "";

        steps.forEach(function(step, index) {
            const dot = document.createElement("span");
            dot.className = "tour-dot";

            if (index <= currentStep) {
                dot.classList.add("active");
            }

            dots.appendChild(dot);
        });

        back.disabled = currentStep === 0;

        next.textContent =
            currentStep === steps.length - 1
                ? "Finish"
                : "Next";
    }

    function openTour() {
        if (tourDialog.open) {
            return;
        }

        currentStep = 0;
        showStep();
        tourDialog.showModal();
    }

    function finishTour() {
        if (storageKey) {
            localStorage.setItem(storageKey, "done");
        }

        tourDialog.close();
    }

    back.addEventListener("click", function() {
        if (currentStep > 0) {
            currentStep--;
            showStep();
        }
    });

    next.addEventListener("click", function() {
        if (currentStep === steps.length - 1) {
            finishTour();
            return;
        }

        currentStep++;
        showStep();
    });

    skip.addEventListener("click", finishTour);
    close.addEventListener("click", finishTour);

    tourDialog.addEventListener("cancel", function(event) {
        event.preventDefault();
        finishTour();
    });

    replay.addEventListener("click", openTour);

    getCurrentUser().then(function(user) {
        if (!user) {
            return;
        }

        storageKey = "ceoxb-tour-" + user.id;

        if (localStorage.getItem(storageKey) !== "done") {
            openTour();
        }
    }).catch(function(error) {
        console.error("Unable to start the welcome tour:", error);
    });
}
