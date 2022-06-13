// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
});



// When the button is clicked, inject getBookingDays into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: getBookingDays,
  });
});

// The body of this function will be executed as a content script inside the
// current page
function getBookingDays() {
  chrome.storage.sync.get("color", ({ color }) => {
    // document.body.style.backgroundColor = color;

    document.querySelectorAll(".xn-sortable-header")[1].click();


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
    console.log(firstDayThisMonth);

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

    const bookingsThisMonth = bookedDays.filter(day => day.getMonth() === currentMonth).sort((a,b) => Date.parse(a) - Date.parse(b));

    console.log(bookingsThisMonth);



    // create calendar view
    const wrapper = document.querySelector("header");
    const squares = [...DAYS, ...Array(35).keys()]
    const calendar = document.createElement("ul");
    calendar.className = "calendar";
    const firstDayInCalendar = firstDayThisMonth + 7 - 1;
    let dayIndex = 1;
    // const button = document.createElement("button");
    // button.innerText = "Add to calendar";

    // generate grid
    squares.forEach((square, index) => {
        const cell = document.createElement("li");
        cell.classList.add("cell");

        console.log(dayIndex);
        if (index >= firstDayInCalendar && dayIndex <= 31) {
            cell.innerHTML = `<p class="day-number">${dayIndex}</p>`;
            cell.setAttribute("data-day", dayIndex);
            dayIndex++;
        } else if (index < firstDayInCalendar && index < 7) {
            cell.innerHTML = `<p class="name">${square}</p>`;
        }

        calendar.appendChild(cell);
    })

    bookingsThisMonth.forEach(booking => {
        const day = booking.getDate();
        const cell = calendar.querySelector(`[data-day="${day}"]`);
        cell.classList.add("booked");
        const hour = booking.getHours() < 10 ? `0${booking.getHours()}` : booking.getHours();
        const minutes = booking.getMinutes() < 10 ? `0${booking.getMinutes()}` : booking.getMinutes();
        cell.innerHTML += `<p>${hour}:${minutes}</p>`;
    //     cell.appendChild(button);
    })


    // generate calendar
    wrapper.appendChild(calendar);

  });
}



