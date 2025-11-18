// ====== INITIALIZATION ======
let db = JSON.parse(localStorage.getItem("bookings")) || [];
let loggedIn = JSON.parse(localStorage.getItem("loggedIn")) || false;

function initApp() {
  if(loggedIn) {
    document.getElementById("btnLoginLi").style.display = "none";
    document.getElementById("logoutLi").style.display = "block";
    document.querySelectorAll(".requires-login").forEach(el => el.style.display="block");
  } else {
    document.getElementById("btnLoginLi").style.display = "block";
    document.getElementById("logoutLi").style.display = "none";
    document.querySelectorAll(".requires-login").forEach(el => el.style.display="none");
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      displayBookings(e.target.value);
    });
  }

  populateStyles();
  displayBookings(); // Auto-display bookings on load
}

// ====== PAGE SWITCHING ======
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.style.display="none");
  document.getElementById(pageId).style.display = "block";
}

// ====== STYLING OPTIONS ======
function populateStyles() {
  const select = document.getElementById("StyleInput");
  const styles = ["Classic", "Modern", "Rustic", "Minimalist", "Elegant"];
  select.innerHTML = styles.map(s => `<option value="${s}">${s}</option>`).join("");
}

// ====== SAVE BOOKING ======
function saveBook() {
    const booking = {
        name: document.getElementById("nameInput").value,
        email: document.getElementById("emailInput").value,
        contact: document.getElementById("contactInput").value,
        eventDate: document.getElementById("eventDateInput").value,
        venue: document.getElementById("eventVenueInput").value,
        guests: document.getElementById("guestInput").value,
        style: document.getElementById("StyleInput").value,
        mainDishes: Array.from(document.querySelectorAll('input[name="mainDishes"]:checked')).map(el => el.value),
        sideDishes: Array.from(document.querySelectorAll('input[name="sideDishes"]:checked')).map(el => el.value),
        desserts: Array.from(document.querySelectorAll('input[name="desserts"]:checked')).map(el => el.value),
        drinks: Array.from(document.querySelectorAll('input[name="drinks"]:checked')).map(el => el.value),
    };

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.push(booking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    alert("Booking saved successfully!");
    document.querySelector("#bookingForm form").reset();
    showPage("bookings");
    displayBookings();
}

const prices = {
  mainDishes: { Adobo: 1200, Caldereta: 1200, Menudo: 1800, Sinigang: 1700, KareKare: 1200 },
  sideDishes: { Rice: 1000, Lumpia: 1500, SweetSour: 1700, FruitSalad: 1100, CornSalad: 1700 },
  desserts: { "Ice Cream": 600, LecheFlan: 1800, Brownies: 1700, FruitTart: 900, "HaloHalo": 1000 },
  drinks: { Water: 1200, IcedTea: 1400, SoftDrinks: 1500, Juice: 1600, Coffee: 1700 }
};

// ====== SHOW RECEIPT ======
function showReceipt(booking) {
  document.getElementById('recName').innerText = booking.name;
  document.getElementById('recEmail').innerText = booking.email;
  document.getElementById('recContact').innerText = booking.contact;
  document.getElementById('recDate').innerText = booking.eventDate;
  document.getElementById('recVenue').innerText = booking.venue;
  document.getElementById('recGuests').innerText = booking.guests;
  document.getElementById('recStyle').innerText = booking.style;

  const recItems = document.getElementById('recItems');
  recItems.innerHTML = '';
  let total = 0;

  ['mainDishes', 'sideDishes', 'desserts', 'drinks'].forEach(category => {
    if(booking[category]) {
      booking[category].forEach(item => {
        const price = prices[category][item] || 0;
        total += price;
        const li = document.createElement('li');
        li.innerText = `${item} - ₱${price}`;
        recItems.appendChild(li);
      });
    }
  });

  // ====== ADD PER-HEAD AND STYLE FEES ======
  const perHeadFare = 150;
  const styleFee = 3000;
  const numGuests = parseInt(booking.guests) || 0;

  const perHeadTotal = perHeadFare * numGuests;
  total += perHeadTotal + styleFee;

  const liPerHead = document.createElement('li');
  liPerHead.innerText = `Per Head (${numGuests} x ₱${perHeadFare}) - ₱${perHeadTotal}`;
  recItems.appendChild(liPerHead);

  const liStyle = document.createElement('li');
  liStyle.innerText = `Style Fee - ₱${styleFee}`;
  recItems.appendChild(liStyle);

  document.getElementById('recTotal').innerText = total;
  showPage('receiptPage');
}

// ====== DISPLAY BOOKINGS ======
function displayBookings(searchText = "") {
    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    bookings = bookings.filter(b =>
        b.name.toLowerCase().includes(searchText.toLowerCase())
    );

    bookings.forEach((b, index) => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <h3>Event Details</h3>
            <p><strong>Name:</strong> ${b.name}</p>
            <p><strong>Email:</strong> ${b.email}</p>
            <p><strong>Contact:</strong> ${b.contact}</p>
            <p><strong>Event Date:</strong> ${b.eventDate}</p>
            <p><strong>Venue:</strong> ${b.venue}</p>
            <p><strong>No. of Guests:</strong> ${b.guests}</p>
            <p><strong>Style:</strong> ${b.style}</p>
            <div class="card-btns">
                <button onclick="editBooking(${index})">Edit</button>
                <button onclick="deleteBooking(${index})">Delete</button>
                <button onclick="checkoutBooking(${index})">Checkout</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// ====== EDIT BOOKING ======
function editBooking(index) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    let b = bookings[index];

    document.getElementById("nameInput").value = b.name;
    document.getElementById("emailInput").value = b.email;
    document.getElementById("contactInput").value = b.contact;
    document.getElementById("eventDateInput").value = b.eventDate;
    document.getElementById("eventVenueInput").value = b.venue;
    document.getElementById("guestInput").value = b.guests;
    document.getElementById("StyleInput").value = b.style;

    bookings.splice(index, 1);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    showPage("bookingForm");
}

// ====== DELETE BOOKING ======
function deleteBooking(idx) {
  if(confirm("Are you sure you want to delete this booking?")) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    bookings.splice(idx, 1);
    localStorage.setItem("bookings", JSON.stringify(bookings));
    displayBookings();
  }
}

// ====== CHECKOUT BOOKING ======
function checkoutBooking(index) {
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
    const booking = bookings[index];

    // Calculate total for dishes
    let total = 0;
    ['mainDishes', 'sideDishes', 'desserts', 'drinks'].forEach(category => {
        if (booking[category]) {
            booking[category].forEach(item => {
                const price = prices[category][item] || 0;
                total += price;
            });
        }
    });

    // ====== ADD PER-HEAD AND STYLE FEES ======
    const perHeadFare = 150;
    const styleFee = 3000;
    const numGuests = parseInt(booking.guests) || 0;

    total += (perHeadFare * numGuests) + styleFee;
    booking.total = total;

    // Show receipt
    showReceipt(booking);
}

// ====== LOGIN SYSTEM ======
function login() {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  if(accounts.some(acc=>acc.user===username && acc.pass===password)) {
    loggedIn = true;
    localStorage.setItem("loggedIn", JSON.stringify(true));
    alert("Logged in!");
    initApp();
    showPage("frontPage");
  } else {
    alert("Invalid login!");
  }
  if(loggedIn) {
    document.getElementById("btnBookings").style.display = "inline-block";
    displayBookings();
  }
}

// ====== REGISTER FUNCTION ======
function register() {
  const user = document.getElementById("regUser").value.trim();
  const pass = document.getElementById("regPass").value.trim();

  if (!user || !pass) {
    alert("Please enter both username and password.");
    return;
  }

  let accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  if (accounts.some(acc => acc.user === user)) {
    alert("Username already exists!");
    return;
  }

  accounts.push({ user, pass });
  localStorage.setItem("accounts", JSON.stringify(accounts));

  alert("Registered! You can now login.");

  document.getElementById("regUser").value = "";
  document.getElementById("regPass").value = "";

  toggleRegister(false);
}

// ====== LOGOUT FUNCTION ======
function logout() {
  loggedIn = false;
  localStorage.setItem("loggedIn", JSON.stringify(false));
  initApp();
  showPage("frontPage");
}

// ====== CENTRALIZED REGISTER/LOGIN TOGGLE ======
function toggleRegister(show) {
  document.getElementById("registerForm").style.display = show ? "block" : "none";
  document.querySelector("#loginPage .login-card h2").style.display = show ? "none" : "block";
  document.getElementById("loginUser").style.display = show ? "none" : "block";
  document.getElementById("loginPass").style.display = show ? "none" : "block";
  document.querySelector("#loginPage .login-card button").style.display = show ? "none" : "block";
  document.querySelector("#loginPage .login-card p").style.display = show ? "none" : "block";
}

// ====== BUTTON EVENT LISTENERS ======
document.getElementById("showRegister").addEventListener("click", () => toggleRegister(true));
document.getElementById("hideRegister").addEventListener("click", () => toggleRegister(false));

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      displayBookings(e.target.value);
    });
  }
  initApp();
});
