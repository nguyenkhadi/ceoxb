const fullCalendar = document.getElementById("full-calendar-days");

if (fullCalendar) {
    const today = new Date();

    let displayedYear = today.getFullYear();
    let displayedMonth = today.getMonth();

    const monthTitle = document.getElementById("full-calendar-month");
    const selectedDate = document.getElementById("selected-date");
    const selectedInfo = document.getElementById("selected-date-info");
    const eventForm = document.getElementById("calendar-event-form");
    const eventList = document.getElementById("calendar-event-list");
    const eventStatus = document.getElementById("calendar-event-status");
    
    let events = [];
    let eventStorageKey = "";
    let selectedDay = today.getDate();
    
    function dateKey(year, month, day) {
        return [
            year,
            String(month + 1).padStart(2, "0"),
            String(day).padStart(2, "0")
        ].join("-");
    }
    
    function renderSelectedEvents() {
        eventList.replaceChildren();
    
        const key = dateKey(displayedYear, displayedMonth, selectedDay);
        const matching = events
            .filter(event => event.date === key)
            .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    
        selectedInfo.textContent = matching.length
            ? matching.length + " event(s) scheduled."
            : "No events scheduled for this date.";
    
        matching.forEach(function(event) {
            const card = document.createElement("div");
            card.className = "calendar-event-item";
    
            const title = document.createElement("strong");
            title.textContent = event.title;
    
            const timeText = document.createElement("p");
            timeText.textContent = new Date(event.startsAt)
                .toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit"
                });
    
            card.append(title, timeText);
    
            if (event.description) {
                const description = document.createElement("p");
                description.textContent = event.description;
                card.appendChild(description);
            }
    
            const remove = document.createElement("button");
            remove.type = "button";
            remove.textContent = "Remove Event";
    
            remove.addEventListener("click", function() {
                const previous = events;
                events = events.filter(item => item.id !== event.id);
    
                if (!saveEvents()) {
                    events = previous;
                    return;
                }
    
                renderSelectedEvents();
                renderCalendar();
            });
    
            card.appendChild(remove);
            eventList.appendChild(card);
        });
    }
    
    function saveEvents() {
        if (!eventStorageKey) {
            eventStatus.textContent = "Please sign in first.";
            return false;
        }
    
        try {
            localStorage.setItem(eventStorageKey, JSON.stringify(events));
            return true;
        } catch (error) {
            eventStatus.textContent =
                "Unable to save events in this browser.";
            return false;
        }
    }

    function showSelectedDate(year, month, day) {
        const date = new Date(year, month, day);

        selectedDate.textContent = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        selectedDay = day;
        renderSelectedEvents();

        fullCalendar.querySelectorAll("button.calendar-day")
            .forEach(function(button) {
                button.classList.remove("selected");
                button.setAttribute("aria-pressed", "false");
            });

        const selectedButton = fullCalendar.querySelector(
            '[data-day="' + day + '"]'
        );

        if (selectedButton) {
            selectedButton.classList.add("selected");
            selectedButton.setAttribute("aria-pressed", "true");
        }
    }

    function renderCalendar() {
        fullCalendar.innerHTML = "";

        const firstDay = new Date(
            displayedYear, displayedMonth, 1
        ).getDay();

        const daysInMonth = new Date(
            displayedYear, displayedMonth + 1, 0
        ).getDate();

        const monthDate = new Date(
            displayedYear, displayedMonth, 1
        );

        monthTitle.textContent = monthDate.toLocaleDateString(
            "en-US", {
                month: "long",
                year: "numeric"
            }
        );

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement("div");
            empty.className = "calendar-day empty";
            fullCalendar.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement("button");
            cell.type = "button";
            cell.className = "calendar-day";
            cell.textContent = day;
            cell.dataset.day = day;
            cell.setAttribute("aria-pressed", "false");
            const key = dateKey(displayedYear, displayedMonth, day);
            const hasEvents = events.some(event => event.date === key);
            
            if (hasEvents) {
                cell.classList.add("has-events");
                cell.setAttribute("aria-label", day + " - Events scheduled");
            }
            
            if (
                selectedDay === day &&
                selectedDate.textContent !== "Select a date"
            ) {
                cell.classList.add("selected");
                cell.setAttribute("aria-pressed", "true");
            }

            if (
                displayedYear === today.getFullYear() &&
                displayedMonth === today.getMonth() &&
                day === today.getDate()
            ) {
                cell.classList.add("today");
            }

            cell.addEventListener("click", function() {
                showSelectedDate(
                    displayedYear, displayedMonth, day
                );
            });

            fullCalendar.appendChild(cell);
        }
    }

    document.getElementById("calendar-prev")
        .addEventListener("click", function() {
            displayedMonth--;

            if (displayedMonth < 0) {
                displayedMonth = 11;
                displayedYear--;
            }
            selectedDay = 1;
            renderCalendar();
            showSelectedDate(displayedYear, displayedMonth, 1);
        });

    document.getElementById("calendar-next")
        .addEventListener("click", function() {
            displayedMonth++;

            if (displayedMonth > 11) {
                displayedMonth = 0;
                displayedYear++;
            }
            selectedDay = 1;
            renderCalendar();
            showSelectedDate(displayedYear, displayedMonth, 1);
        });

    document.getElementById("calendar-today")
        .addEventListener("click", function() {
            const currentDate = new Date();
            
            displayedYear = today.getFullYear();
            displayedMonth = today.getMonth();

            renderCalendar();

            showSelectedDate(
                displayedYear,
                displayedMonth,
                currentDate.getDate()
            );
        });

        eventForm.addEventListener("submit", function(event) {
            event.preventDefault();
        
            if (!eventStorageKey) {
                eventStatus.textContent = "Please sign in first.";
                return;
            }
        
            const title = document.getElementById("event-title").value.trim();
            const timeValue = document.getElementById("event-time").value;
            const description = document.getElementById("event-description")
                .value.trim();
        
            if (!title || !timeValue) return;
        
            const dayKey = dateKey(displayedYear, displayedMonth, selectedDay);
            const instant = new Date(dayKey + "T" + timeValue);
        
            if (Number.isNaN(instant.getTime())) {
                eventStatus.textContent = "Choose a valid event time.";
                return;
            }
        
            const newEvent = {
                id: window.crypto?.randomUUID?.() ||
                    Date.now().toString() + "-" + Math.random(),
                title: title,
                date: dayKey,
                startsAt: instant.toISOString(),
                description: description
            };
        
            events.push(newEvent);
        
            if (!saveEvents()) {
                events.pop();
                return;
            }
        
            eventForm.reset();
            eventStatus.textContent = "Personal event added.";
        
            renderSelectedEvents();
            renderCalendar();
        });
        
        renderCalendar();
        
        showSelectedDate(
            displayedYear,
            displayedMonth,
            today.getDate()
        );
        
        getCurrentUser().then(function(user) {
            if (!user) return;
        
            eventStorageKey = "ceoxb-personal-events-" + user.id;
        
            try {
                const saved = JSON.parse(
                    localStorage.getItem(eventStorageKey) || "[]"
                );
        
                events = Array.isArray(saved)
                    ? saved.filter(item =>
                        item &&
                        typeof item.id === "string" &&
                        typeof item.date === "string" &&
                        typeof item.title === "string" &&
                        typeof item.startsAt === "string"
                    )
                    : [];
            } catch (error) {
                events = [];
            }
        
            renderCalendar();
            renderSelectedEvents();
        }).catch(function() {
            eventStatus.textContent = "Unable to load personal events.";
        });
    }
}
