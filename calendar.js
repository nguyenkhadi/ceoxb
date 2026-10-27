const fullCalendar = document.getElementById("full-calendar-days");

if (fullCalendar) {
    const today = new Date();

    let displayedYear = today.getFullYear();
    let displayedMonth = today.getMonth();

    const monthTitle = document.getElementById("full-calendar-month");
    const selectedDate = document.getElementById("selected-date");
    const selectedInfo = document.getElementById("selected-date-info");

    function showSelectedDate(year, month, day) {
        const date = new Date(year, month, day);

        selectedDate.textContent = date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        });

        selectedInfo.textContent =
            "No events scheduled for this date.";

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

            selectedDate.textContent = "Select a date";
            selectedInfo.textContent =
                "Choose a day to view its events.";

            renderCalendar();
        });

    document.getElementById("calendar-next")
        .addEventListener("click", function() {
            displayedMonth++;

            if (displayedMonth > 11) {
                displayedMonth = 0;
                displayedYear++;
            }

            selectedDate.textContent = "Select a date";
            selectedInfo.textContent =
                "Choose a day to view its events.";

            renderCalendar();
        });

    document.getElementById("calendar-today")
        .addEventListener("click", function() {
            displayedYear = today.getFullYear();
            displayedMonth = today.getMonth();

            renderCalendar();

            showSelectedDate(
                displayedYear,
                displayedMonth,
                today.getDate()
            );
        });

    renderCalendar();
    showSelectedDate(
        displayedYear,
        displayedMonth,
        today.getDate()
    );
}
