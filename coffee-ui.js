
document.addEventListener("DOMContentLoaded", async function () {
    const form = document.getElementById("coffee-form");
    const member = document.getElementById("coffee-member");
    const date = document.getElementById("coffee-date");
    const time = document.getElementById("coffee-time");
    const message = document.getElementById("coffee-message");
    const result = document.getElementById("coffee-result");
    const submit = document.getElementById("coffee-submit");
    const list = document.getElementById("coffee-requests-list");
    const tabs = document.querySelectorAll("[data-coffee-filter]");

    if (!form || !list) return;

    let storageKey = "";
    let requests = [];
    let editingId = null;
    let currentFilter = "all";

    function todayString() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        return year + "-" + month + "-" + day;
    }

    date.min = todayString();

    function saveRequests() {
        try {
            localStorage.setItem(storageKey, JSON.stringify(requests));
            return true;
        } catch (error) {
            result.textContent = "Unable to save drafts in this browser.";
            return false;
        }
    }

    function formatDate(value) {
        const parts = value.split("-").map(Number);

        return new Date(
            parts[0], parts[1] - 1, parts[2]
        ).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }

    function formatTime(value) {
        const parts = value.split(":").map(Number);
        const hour = parts[0];
        const minute = parts[1];

        return new Date(
            2000, 0, 1, hour, minute
        ).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function createElement(tag, text, className) {
        const element = document.createElement(tag);

        if (text !== undefined) {
            element.textContent = text;
        }

        if (className) {
            element.className = className;
        }

        return element;
    }

    function makeButton(text, className, onClick) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = className;
        button.textContent = text;
        button.addEventListener("click", onClick);
        return button;
    }

    function renderRequests() {
        list.replaceChildren();

        const filtered = requests.filter(function (request) {
            return currentFilter === "all" ||
                request.status === currentFilter;
        });

        if (filtered.length === 0) {
            const empty = createElement(
                "div", undefined, "coffee-empty"
            );

            empty.append(
                createElement("div", "☕", "coffee-empty-icon"),
                createElement(
                    "h3",
                    currentFilter === "all"
                        ? "No coffee chats yet"
                        : "Nothing to show here"
                ),
                createElement(
                    "p",
                    "Choose a member and suggest a time to get started."
                )
            );

            list.appendChild(empty);
            return;
        }

        filtered.slice().reverse().forEach(function (request) {
            const card = createElement(
                "article", undefined, "coffee-request-card"
            );

            const header = createElement(
                "div", undefined, "coffee-request-header"
            );

            const details = createElement("div");

            details.append(
                createElement("h3", request.memberName),
                createElement(
                    "p",
                    "📅 " + formatDate(request.date) +
                    " at " + formatTime(request.time)
                )
            );

            const status = createElement(
                "span",
                request.status === "cancelled"
                    ? "Cancelled"
                    : request.status === "draft"
                        ? "Old Draft"
                        : "Sent",
                "coffee-request-status " + request.status
            );

            header.append(details, status);
            card.appendChild(header);

            if (request.message) {
                card.appendChild(
                    createElement(
                        "p",
                        request.message,
                        "coffee-request-message"
                    )
                );
            }

            if (request.status === "sent" || request.status === "draft") {
                const actions = createElement(
                    "div", undefined, "coffee-request-actions"
                );

                actions.append(
                    makeButton(
                        "Edit Request",
                        "coffee-secondary-button",
                        function () {
                            editingId = request.id;
                            member.value = request.memberId;
                            date.value = request.date;
                            time.value = request.time;
                            message.value = request.message;

                            submit.textContent = "Save Changes";
                            result.textContent = "Editing your draft.";

                            form.scrollIntoView({
                                behavior: "smooth",
                                block: "center"
                            });
                        }
                    ),
                    makeButton(
                        "Cancel Request",
                        "coffee-danger-button",
                        function () {
                            request.status = "cancelled";

                            if (!saveRequests()) {
                                request.status = "draft";
                                return;
                            }

                            if (editingId === request.id) {
                                resetForm();
                            }

                            renderRequests();
                        }
                    )
                );

                card.appendChild(actions);
            }

            list.appendChild(card);
        });
    }

    function resetForm() {
        form.reset();
        editingId = null;
        submit.textContent = "Save Coffee Chat Draft";
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!storageKey) {
            result.textContent = "Please sign in to save a draft.";
            return;
        }

        if (!form.reportValidity()) return;

        const appointment = new Date(
            date.value + "T" + time.value
        );

        if (
            Number.isNaN(appointment.getTime()) ||
            appointment <= new Date()
        ) {
            result.textContent =
                "Choose a date and time in the future.";
            return;
        }

        const chosenMember = member.selectedOptions[0];

        const draft = {
            id: editingId || (
                window.crypto?.randomUUID?.() ||
                String(Date.now()) + "-" +
                Math.random().toString(36).slice(2)
            ),
            memberId: member.value,
            memberName: chosenMember.textContent,
            date: date.value,
            time: time.value,
            message: message.value.trim(),
            status: "sent"
        };

        const previous = requests.slice();

        if (editingId) {
            const index = requests.findIndex(function (item) {
                return item.id === editingId;
            });

            if (index >= 0) {
                requests[index] = draft;
            } else {
                requests.push(draft);
            }
        } else {
            requests.push(draft);
        }

        if (!saveRequests()) {
            requests = previous;
            return;
        }

        resetForm();
        result.textContent =
            "Draft saved. No request has been sent to another CEO.";

        renderRequests();
    });

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            currentFilter = tab.dataset.coffeeFilter;

            tabs.forEach(function (other) {
                other.classList.toggle(
                    "active",
                    other === tab
                );
            });

            renderRequests();
        });
    });

    submit.disabled = true;
    result.textContent = "Loading your draft workspace...";

    try {
        const user = await getCurrentUser();

        if (!user) {
            result.textContent =
                "Please sign in to use Coffee Chats.";
            return;
        }

        storageKey = "ceoxb-coffee-drafts-" + user.id;

        const saved = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        requests = Array.isArray(saved)
            ? saved.filter(function (item) {
                return item &&
                    typeof item.id === "string" &&
                    typeof item.memberName === "string" &&
                    typeof item.date === "string" &&
                    typeof item.time === "string" &&
                    (item.status === "sent" ||
                     item.status === "draft" ||
                     item.status === "cancelled");
            })
            : [];

        const memberStatus = document.getElementById("coffee-member-status") || document.createElement("p");
        
        member.replaceChildren();
        
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "Select a member";
        member.appendChild(placeholder);
        
        const { data: members, error: membersError } = await _supabase
            .from("profiles")
            .select("id, name, role, company")
            .order("name");
        
        if (membersError) {
            memberStatus.textContent = "Unable to load members.";
            return;
        }
        
        const otherMembers = (members || []).filter(function(profile) {
            return profile.id !== user.id;
        });
        
        otherMembers.forEach(function(profile) {
            const option = document.createElement("option");
        
            option.value = profile.id;
            option.textContent = [
                profile.name || "Unnamed member",
                profile.company
            ].filter(Boolean).join(" · ");
        
            member.appendChild(option);
        });
        
        memberStatus.textContent = otherMembers.length
            ? otherMembers.length + " members available"
            : "No other members found.";
        
        submit.disabled = otherMembers.length === 0;
        result.textContent = "";
    } catch (error) {
        result.textContent =
            "Unable to load your drafts in this browser.";
    }

    renderRequests();
});
