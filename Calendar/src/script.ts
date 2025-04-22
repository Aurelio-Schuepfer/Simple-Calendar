let calendarBody = document.getElementById("calendar-body") as HTMLDivElement;
let year: number = new Date().getFullYear();
let month: number = new Date().getMonth();

const openEventFormButton = document.getElementById("open-event-form") as HTMLButtonElement;
const closeEventFormButton = document.getElementById("close-event-form") as HTMLButtonElement;
const eventModal = document.getElementById("event-modal") as HTMLDivElement;
const eventDateInput = document.getElementById("event-date") as HTMLInputElement;
const eventTextInput = document.getElementById("event-text") as HTMLInputElement;
const addEventButton = document.getElementById("add-event-btn") as HTMLButtonElement;
let dayElements: HTMLDivElement[] = [];
const feedbackMessage = document.getElementById('feedback-message') as HTMLDivElement;

interface CalendarEvent {
    date: string;
    events: string[];
}

openEventFormButton.addEventListener("click", () => {
    eventDateInput.value = "";
    eventTextInput.value = "";
    openModal();
});

closeEventFormButton.addEventListener("click", () => {
    closeModal();
});

function saveEvent(date: string, title: string) {
    const events = JSON.parse(localStorage.getItem("events") || "[]") as CalendarEvent[];
    const existingEvent = events.find((event) => event.date === date);

    if (existingEvent) {
        existingEvent.events.push(title);
    } else {
        events.push({ date, events: [title] });
    }

    localStorage.setItem("events", JSON.stringify(events));
}

function createEventItem(eventDate: string, eventTitle: string, dayElement: HTMLDivElement): HTMLDivElement {
    const newEvent = document.createElement("div");
    newEvent.classList.add("event-item");
    newEvent.textContent = eventTitle;

    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-event-btn");
    deleteBtn.innerHTML = "🗑️";
    deleteBtn.addEventListener("click", (e) => {
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

function loadEvents(dayElements: HTMLDivElement[]) {
    const events = JSON.parse(localStorage.getItem("events") || "[]") as CalendarEvent[];

    events.forEach((event) => {
        const dayElement = document.querySelector(`[data-date="${event.date}"]`) as HTMLDivElement; 
        if (dayElement) {
            let eventsContainer = dayElement.querySelector(".events-container") as HTMLDivElement;
            if (!eventsContainer) {
                eventsContainer = document.createElement("div");
                eventsContainer.classList.add("events-container");
                dayElement.appendChild(eventsContainer);
            }

            event.events.forEach((eventTitle) => {
                const newEvent = createEventItem(event.date, eventTitle, dayElement);
                eventsContainer.appendChild(newEvent);
            });
        }
    });
}

function deleteEvent(date: string, title: string, dayElement: HTMLDivElement) {
    let events = JSON.parse(localStorage.getItem("events") || "[]") as CalendarEvent[];

    const event = events.find((event) => event.date === date);

    if (event) {
        event.events = event.events.filter((eventTitle) => eventTitle !== title);

        if (event.events.length === 0) {
            events = events.filter((event) => event.date !== date);
        }

        localStorage.setItem("events", JSON.stringify(events));
    }

    const eventsContainer = dayElement.querySelector(".events-container") as HTMLDivElement;
    const eventElements = eventsContainer.querySelectorAll(".event-item");

    eventElements.forEach((eventElement) => {
        const eventText = eventElement.childNodes[0]?.nodeValue?.trim();
        if (eventText === title) {
            eventsContainer.removeChild(eventElement);
        }
    });

    if (dayElement.querySelector(".events-container") === null) {
        dayElement.classList.remove("has-events");
    }
}

addEventButton.addEventListener("click", () => {
    const eventTitle = eventTextInput.value.trim();
    const eventDate = eventDateInput.value;

    if (!eventTitle || !eventDate) {
        showFeedbackMessage("Please fill in both fields.", "error");
        return;
    }

    const dayElement = document.querySelector(`[data-date="${eventDate}"]`) as HTMLDivElement;
    if (!dayElement) {
        showFeedbackMessage("Selected day is not visible on calendar.", "error");
        return;
    }

    const eventsContainer = dayElement.querySelector(".events-container") as HTMLDivElement;
    if (!eventsContainer) {
        showFeedbackMessage("Events container missing.", "error");
        return;
    }

    const newEvent = createEventItem(eventDate, eventTitle, dayElement);
    eventsContainer.appendChild(newEvent);

    saveEvent(eventDate, eventTitle);

    showFeedbackMessage("Event added successfully!", "success");
    setTimeout(() => {}, 1000);
});

function openModal() {
    eventModal.classList.remove("hidden");
    eventModal.classList.add("show");
}

function closeModal() {
    eventModal.classList.remove("show");
    setTimeout(() => {
        eventModal.classList.add("hidden");
    }, 300);
}

function showFeedbackMessage(message: string, type: "success" | "error") {
    feedbackMessage.textContent = message;
    feedbackMessage.className = 'feedback-message';
    feedbackMessage.classList.add(type);
    feedbackMessage.classList.remove('hidden');
    setTimeout(() => {
        feedbackMessage.classList.add('hidden');
        closeModal();
    }, 2000);
}

function getFirstDayOfMonth(year: number, month: number): number {
    const firstDay = new Date(year, month, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
}

function updateMonthDisplay() {
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById("month-name")!.textContent = monthNames[month];
    document.getElementById("year")!.textContent = year.toString();
}

function initializeCalendar() {
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const numberOfDays = new Date(year, month + 1, 0).getDate();
    calendarBody.innerHTML = "";

    dayElements = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("calendar-day", "previous-month-day");
        calendarBody.appendChild(emptyDiv);
    }

    for (let day = 1; day <= numberOfDays; day++) {
        const dayElement = document.createElement("div");
        dayElement.classList.add("calendar-day");
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        dayElement.setAttribute("data-date", fullDate);

        const topBar = document.createElement("div");
        topBar.classList.add("day-top-bar");

        const dayNumber = document.createElement("div");
        dayNumber.classList.add("day-number");
        dayNumber.textContent = day.toString();

        topBar.appendChild(dayNumber);

        const eventsContainer = document.createElement("div");
        eventsContainer.classList.add("events-container");

        dayElement.appendChild(topBar);
        dayElement.appendChild(eventsContainer);

        dayElement.addEventListener("dblclick", () => {
            eventDateInput.value = fullDate;
            eventTextInput.value = "";
            openModal();
        });

        calendarBody.appendChild(dayElement);
        dayElements.push(dayElement);
    }

    while (calendarBody.children.length < 42) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("calendar-day", "next-month-day");
        calendarBody.appendChild(emptyDiv);
    }

    loadEvents(dayElements);
}

document.getElementById("prev-month")?.addEventListener("click", () => {
    if (month === 0) {
        month = 11;
        year--;
    } else {
        month--;
    }
    updateMonthDisplay();
    initializeCalendar();
});

document.getElementById("next-month")?.addEventListener("click", () => {
    if (month === 11) {
        month = 0;
        year++;
    } else {
        month++;
    }
    updateMonthDisplay();
    initializeCalendar();
});

window.addEventListener("DOMContentLoaded", () => {
    updateMonthDisplay();
    initializeCalendar();
});
