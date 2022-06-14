// Initialize button
let generateCalendarBtn = document.getElementById("generateCalendarBtn");

// When the button is clicked, inject getBookingDays into current page
generateCalendarBtn.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: generateCalendar,
  });
});


function generateCalendar() {
    const generateGoogleLink = (year, month, day, hour, minute, endHour) => `http://www.google.com/calendar/event?action=TEMPLATE&dates=${year}${month}${day}T${hour}${minute}00Z%2F${year}${month}${day}T${endHour}${minute}00&text=Swimming&location=&details=`


    // Define constants
    const MONTHS_MAP = {
        "Jan": "01",
        "Feb": "02",
        "Mar": "03",
        "Apr": "04",
        "May": "05",
        "Jun": "06",
        "Jul": "07",
        "Aug": "08",
        "Sep": "09",
        "Oct": "10",
        "Nov": "11",
        "Dec": "12"
    }
    const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    // Check first day of current month
    const currentMonth = new Date().getMonth();
    const firstDayThisMonth = new Date(new Date().getFullYear(), currentMonth, 1).getDay();

    // Generate a list of dates for the current month
    const allBookings = Array.from(document.querySelectorAll("tr"));

    const bookedDays = allBookings.filter(booking => booking.cells[1].localName  === "td").map(booking => {
        const date = booking.cells[1].innerText.split(" ");
        const year = date[2];
        const month = MONTHS_MAP[date[1]];
        const day = date[0].length === 1 ? `0${date[0]}` : date[0];
        const time = date[3];
        const dateString =  `${year}-${month}-${day}T${time}:00`;

        return new Date(dateString);
    });

    // Generate a list of dates for the current month sorted in ascending order
    const bookingsThisMonth = bookedDays.filter(day => day.getMonth() === currentMonth).sort((a,b) => Date.parse(a) - Date.parse(b));

    // create calendar view
    const wrapper = document.querySelector("header");
    const squares = [...DAYS, ...Array(35).keys()]
    const calendar = document.createElement("ul");
    calendar.className = "calendar";
    const firstDayInCalendar = firstDayThisMonth + 7 - 1; // first day of the month is Monday, so we need to add 7 to get to Sunday, -1 to get to 0-index
    let dayIndex = 1;

    // generate grid
    squares.forEach((square, index) => {
        const cell = document.createElement("li");
        cell.classList.add("cell");

        // assign days to squares
        if (index >= firstDayInCalendar && dayIndex <= 31) {
            cell.innerHTML = `<p class="day-number">${dayIndex}</p>`;
            cell.setAttribute("data-day", dayIndex);
            dayIndex++;
            // assign days labels
        } else if (index < firstDayInCalendar && index < 7) {
            cell.innerHTML = `<p class="name">${square}</p>`;
        }

        calendar.appendChild(cell);
    })

    // assign bookings to correct days
    bookingsThisMonth.forEach(booking => {
        const day = booking.getDate();
        const cell = calendar.querySelector(`[data-day="${day}"]`);
        cell.classList.add("booked");
  
        const hour = booking.getHours();
        const formattedHour = hour < 10 ? `0${hour}` : hour;
        const formattedEndHour = hour + 1 < 10 ? `0${hour +1}` : hour +1;
        const minutes = booking.getMinutes();
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        cell.innerHTML += `<p>${formattedHour}:${formattedMinutes}</p>`;

        // generate button with Google Calendar link
        const button = document.createElement("a");
        button.classList.add("add-to-calendar");
        button.innerText = "Add to calendar";
        const formattedDay = day < 10 ? `0${day}` : day;
        const correctedMonth = booking.getMonth() + 1; // get month counts from 0-index
        const formattedMonth = correctedMonth +1 < 10 ? `0${correctedMonth}` : correctedMonth;
        button.href = generateGoogleLink(booking.getFullYear(), formattedMonth, formattedDay, formattedHour, formattedMinutes, formattedEndHour);
        
        cell.appendChild(button);
    })


    // generate calendar
    wrapper.appendChild(calendar);
}



