var _a, _b;
var calendarBody = document.getElementById("calendar-body");
var year = new Date().getFullYear();
var month = new Date().getMonth();
var openEventFormButton = document.getElementById("open-event-form");
var closeEventFormButton = document.getElementById("close-event-form");
var eventModal = document.getElementById("event-modal");
var eventDateInput = document.getElementById("event-date");
var eventTextInput = document.getElementById("event-text");
var addEventButton = document.getElementById("add-event-btn");
var dayElements = [];
var feedbackMessage = document.getElementById('feedback-message');
openEventFormButton.addEventListener("click", function () {
    eventDateInput.value = "";
    eventTextInput.value = "";
    openModal();
});
closeEventFormButton.addEventListener("click", function () {
    closeModal();
});
function saveEvent(date, title) {
    var events = JSON.parse(localStorage.getItem("events") || "[]");
    var existingEvent = events.find(function (event) { return event.date === date; });
    if (existingEvent) {
        existingEvent.events.push(title);
    }
    else {
        events.push({ date: date, events: [title] });
    }
    localStorage.setItem("events", JSON.stringify(events));
}
function createEventItem(eventDate, eventTitle, dayElement) {
    var newEvent = document.createElement("div");
    newEvent.classList.add("event-item");
    newEvent.textContent = eventTitle;
    var deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-event-btn");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        deleteEvent(eventDate, eventTitle, dayElement);
    });
    deleteBtn.style.position = "absolute";
    deleteBtn.style.top = "2px";
    deleteBtn.style.right = "2px";
    newEvent.style.position = "relative";
    newEvent.appendChild(deleteBtn);
    return newEvent;
}
function loadEvents(dayElements) {
    var events = JSON.parse(localStorage.getItem("events") || "[]");
    events.forEach(function (event) {
        var dayElement = document.querySelector("[data-date=\"".concat(event.date, "\"]"));
        if (dayElement) {
            var eventsContainer_1 = dayElement.querySelector(".events-container");
            if (!eventsContainer_1) {
                eventsContainer_1 = document.createElement("div");
                eventsContainer_1.classList.add("events-container");
                dayElement.appendChild(eventsContainer_1);
            }
            event.events.forEach(function (eventTitle) {
                var newEvent = createEventItem(event.date, eventTitle, dayElement);
                eventsContainer_1.appendChild(newEvent);
            });
        }
    });
}
function deleteEvent(date, title, dayElement) {
    var events = JSON.parse(localStorage.getItem("events") || "[]");
    var event = events.find(function (event) { return event.date === date; });
    if (event) {
        event.events = event.events.filter(function (eventTitle) { return eventTitle !== title; });
        if (event.events.length === 0) {
            events = events.filter(function (event) { return event.date !== date; });
        }
        localStorage.setItem("events", JSON.stringify(events));
    }
    var eventsContainer = dayElement.querySelector(".events-container");
    var eventElements = eventsContainer.querySelectorAll(".event-item");
    eventElements.forEach(function (eventElement) {
        var _a, _b;
        var eventText = (_b = (_a = eventElement.childNodes[0]) === null || _a === void 0 ? void 0 : _a.nodeValue) === null || _b === void 0 ? void 0 : _b.trim();
        if (eventText === title) {
            eventsContainer.removeChild(eventElement);
        }
    });
    if (dayElement.querySelector(".events-container") === null) {
        dayElement.classList.remove("has-events");
    }
}
addEventButton.addEventListener("click", function () {
    var eventTitle = eventTextInput.value.trim();
    var eventDate = eventDateInput.value;
    if (!eventTitle || !eventDate) {
        showFeedbackMessage("Please fill in both fields.", "error");
        return;
    }
    var dayElement = document.querySelector("[data-date=\"".concat(eventDate, "\"]"));
    if (!dayElement) {
        showFeedbackMessage("Selected day is not visible on calendar.", "error");
        return;
    }
    var eventsContainer = dayElement.querySelector(".events-container");
    if (!eventsContainer) {
        showFeedbackMessage("Events container missing.", "error");
        return;
    }
    var newEvent = createEventItem(eventDate, eventTitle, dayElement);
    eventsContainer.appendChild(newEvent);
    saveEvent(eventDate, eventTitle);
    showFeedbackMessage("Event added successfully!", "success");
    setTimeout(function () { }, 1000);
});
function openModal() {
    eventModal.classList.remove("hidden");
    eventModal.classList.add("show");
}
function closeModal() {
    eventModal.classList.remove("show");
    setTimeout(function () {
        eventModal.classList.add("hidden");
    }, 300);
}
function showFeedbackMessage(message, type) {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.classList.add(type);
    feedbackMessage.classList.remove('hidden');
    setTimeout(function () {
        feedbackMessage.classList.add('hidden');
        closeModal();
    }, 2000);
}
function getFirstDayOfMonth(year, month) {
    var firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
}
function updateMonthDisplay() {
    var monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById("month-name").textContent = monthNames[month];
    document.getElementById("year").textContent = year.toString();
}
function initializeCalendar() {
    var firstDayOfMonth = getFirstDayOfMonth(year, month);
    var numberOfDays = new Date(year, month + 1, 0).getDate();
    calendarBody.innerHTML = "";
    dayElements = [];
    for (var i = 0; i < firstDayOfMonth; i++) {
        var emptyDiv = document.createElement("div");
        emptyDiv.classList.add("calendar-day", "previous-month-day");
        calendarBody.appendChild(emptyDiv);
    }
    var _loop_1 = function (day) {
        var dayElement = document.createElement("div");
        dayElement.classList.add("calendar-day");
        var fullDate = "".concat(year, "-").concat(String(month + 1).padStart(2, "0"), "-").concat(String(day).padStart(2, "0"));
        dayElement.setAttribute("data-date", fullDate);
        var topBar = document.createElement("div");
        topBar.classList.add("day-top-bar");
        var dayNumber = document.createElement("div");
        dayNumber.classList.add("day-number");
        dayNumber.textContent = day.toString();
        topBar.appendChild(dayNumber);
        var eventsContainer = document.createElement("div");
        eventsContainer.classList.add("events-container");
        dayElement.appendChild(topBar);
        dayElement.appendChild(eventsContainer);
        dayElement.addEventListener("dblclick", function () {
            eventDateInput.value = fullDate;
            eventTextInput.value = "";
            openModal();
        });
        calendarBody.appendChild(dayElement);
        dayElements.push(dayElement);
    };
    for (var day = 1; day <= numberOfDays; day++) {
        _loop_1(day);
    }
    while (calendarBody.children.length < 42) {
        var emptyDiv = document.createElement("div");
        emptyDiv.classList.add("calendar-day", "next-month-day");
        calendarBody.appendChild(emptyDiv);
    }
    loadEvents(dayElements);
}
(_a = document.getElementById("prev-month")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () {
    if (month === 0) {
        month = 11;
        year--;
    }
    else {
        month--;
    }
    updateMonthDisplay();
    initializeCalendar();
});
(_b = document.getElementById("next-month")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
    if (month === 11) {
        month = 0;
        year++;
    }
    else {
        month++;
    }
    updateMonthDisplay();
    initializeCalendar();
});
window.addEventListener("DOMContentLoaded", function () {
    updateMonthDisplay();
    initializeCalendar();
});
