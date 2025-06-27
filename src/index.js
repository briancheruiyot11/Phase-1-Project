// API Endpoints (render live api)
const API_URL = "https://phase-1-project-221n.onrender.com/wishlist";
const ORDERS_URL = "https://phase-1-project-221n.onrender.com/orders";


// DOM Elements Selection
const carList = document.getElementById("carList");
const wishlistContainer = document.querySelector(".wishlist-items");
const makeFilter = document.getElementById("makeFilter");
const searchBar = document.getElementById("searchBar");
const sortSelect = document.getElementById("sortSelect");

const modal = document.getElementById("carModal");
const modalImg = document.getElementById("modal-img");
const modalTitle = document.getElementById("modal-title");
const modalPrice = document.getElementById("modal-price");
const modalDescription = document.getElementById("modal-description");
const closeModal = modal.querySelector(".close-modal");
const modalContent = modal.querySelector(".modal-content");

const orderForm = document.getElementById("orderForm");
const orderName = document.getElementById("orderName");
const orderEmail = document.getElementById("orderEmail");
const orderMobile = document.getElementById("orderMobile");
const orderLocation = document.getElementById("orderLocation");
const orderMessage = document.getElementById("orderMessage");
const addToOrdersBtn = document.getElementById("addToOrdersBtn");
const cancelOrder = document.getElementById("cancelOrder");

const viewOrdersBtn = document.getElementById("viewOrdersBtn");
const ordersModal = document.getElementById("ordersModal");
const ordersList = document.getElementById("ordersList");
const closeOrdersModal = ordersModal.querySelector(".close-modal");

// Application State
const wishlist = new Map(); // Stores items in the wishlist
let cars = []; // List of all cars
let currentOrderCar = null; // Currently selected car for ordering
let currentEditingOrderId = null; // Tracks if editing an existing order

// Fetch data from the local API
async function requestData(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// Add item to wishlist API
async function saveToWishlist(car) {
  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(car),
    });
  } catch (err) {
    console.error("Save error:", err);
  }
}

// Delete item from wishlist API
async function deleteFromWishlist(title) {
  try {
    const res = await fetch(API_URL);
    const items = await res.json();
    const found = items.find((item) => item.title === title);
    if (found) {
      await fetch(`${API_URL}/${found.id}`, { method: "DELETE" });
    }
  } catch (err) {
    console.error("Delete error:", err);
  }
}

// Initialize car card objects from the DOM
function initCars() {
  cars = Array.from(document.querySelectorAll(".car-card")).map((card) => ({
    el: card,
    make: card.querySelector("h3").textContent.trim().split(" ")[0],
    price: parseInt(
      card.querySelector("p:nth-of-type(2)").textContent.replace(/\D/g, "")
    ),
    year: parseInt(
      card.querySelector("p:nth-of-type(1)").textContent.replace(/\D/g, "")
    ),
  }));
}

// Filter, search, and sort the displayed cars
function updateDisplay() {
  let filtered = cars;

  if (makeFilter.value !== "All") {
    filtered = filtered.filter((c) => c.make === makeFilter.value);
  }

  if (searchBar.value.trim() !== "") {
    filtered = filtered.filter((c) =>
      c.make.toLowerCase().includes(searchBar.value.trim().toLowerCase())
    );
  }

  if (sortSelect.value === "price") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortSelect.value === "year") {
    filtered.sort((a, b) => a.year - b.year);
  }

  carList.innerHTML = "";
  filtered.forEach((c) => carList.appendChild(c.el));
}

// Toggle and update wishlist
async function addToWishlist(card) {
  const title = card.querySelector("h3").textContent;

  if (wishlist.has(title)) {
    wishlist.delete(title);
    card.querySelector(".wishlist-btn").classList.remove("active");
    await deleteFromWishlist(title);
  } else {
    const img = card.querySelector("img").src;
    const price = card.querySelector("p:nth-of-type(2)").textContent;
    wishlist.set(title, { img, price });
    card.querySelector(".wishlist-btn").classList.add("active");
    await saveToWishlist({ title, img, price });
  }

  renderWishlist();
}

// Render wishlist in the sidebar
function renderWishlist() {
  wishlistContainer.innerHTML = "";

  wishlist.forEach((data, title) => {
    const div = document.createElement("div");
    div.classList.add("wishlist-item");
    div.innerHTML = `
      <img src="${data.img}" alt="${title}">
      <div><strong>${title}</strong><br>${data.price}</div>
      <button class="remove-btn"><i class="bi bi-trash-fill"></i></button>
    `;

    div.querySelector(".remove-btn").addEventListener("click", async () => {
      wishlist.delete(title);

      document.querySelectorAll(".car-card").forEach((card) => {
        if (card.querySelector("h3").textContent === title) {
          card.querySelector(".wishlist-btn").classList.remove("active");
        }
      });

      await deleteFromWishlist(title);
      renderWishlist();
    });

    wishlistContainer.appendChild(div);
  });
}

// Set up heart icon buttons on car cards
function setupWishlistButtons() {
  document.querySelectorAll(".car-card").forEach((card) => {
    const btn = card.querySelector(".wishlist-btn");
    btn.innerHTML = '<i class="bi bi-heart"></i>';
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToWishlist(card);
    });
  });
}

// Set up modal popup for viewing car and submitting orders
function setupModalListeners() {
  document.querySelectorAll(".car-card").forEach((card) => {
    card.addEventListener("click", () => {
      const img = card.querySelector("img").src;
      const title = card.querySelector("h3").textContent;
      const price = card.querySelector("p:nth-of-type(2)").textContent;
      const desc = card.querySelector(".car-description").textContent;

      modalImg.src = img;
      modalTitle.textContent = title;
      modalPrice.textContent = price;
      modalDescription.textContent = desc;
      modal.style.display = "flex";

      currentOrderCar = { title, img, price, desc };
      currentEditingOrderId = null;

      orderForm.reset();
      modal.querySelector(".modal-form").style.display = "none";
      modal.querySelector(".modal-content").style.width = "30%";
    });
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    currentEditingOrderId = null;
    modal.querySelector(".modal-form").style.display = "none";
    modal.querySelector(".modal-content").style.width = "30%";
  });

  addToOrdersBtn.addEventListener("click", () => {
    modal.querySelector(".modal-form").style.display = "block";
    modal.querySelector(".modal-content").style.width = "50%";
  });

  cancelOrder.addEventListener("click", () => {
    modal.querySelector(".modal-form").style.display = "none";
    modal.querySelector(".modal-content").style.width = "30%";
    currentEditingOrderId = null;
  });

  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const order = {
      car: currentOrderCar,
      name: orderName.value,
      email: orderEmail.value,
      mobile: orderMobile.value,
      location: orderLocation.value,
      message: orderMessage.value,
    };

    try {
      if (currentEditingOrderId) {
        await fetch(`${ORDERS_URL}/${currentEditingOrderId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        alert("Order updated!");
      } else {
        await fetch(ORDERS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        });
        alert("Order submitted!");
      }

      modal.style.display = "none";
      currentEditingOrderId = null;
    } catch (err) {
      console.error("Order failed:", err);
    }
  });
}

// Set up filters, search, and sort functionality
function setupControls() {
  makeFilter.addEventListener("change", updateDisplay);
  searchBar.addEventListener("input", updateDisplay);
  sortSelect.addEventListener("change", updateDisplay);
}

// Display and manage orders list in popup
function setupOrdersPopup() {
  viewOrdersBtn.addEventListener("click", async () => {
    ordersModal.style.display = "flex";
    ordersList.innerHTML = "";

    const orders = await requestData(ORDERS_URL);
    orders.forEach((order) => {
      const div = document.createElement("div");
      div.classList.add("order-entry");
      div.innerHTML = `
        <div>
          <strong>${order.car.title}</strong> - ${order.car.price}<br/>
          ${order.name} | ${order.email} | ${order.mobile} | ${order.location}<br/>
          ${order.message}
        </div>
        <button data-id="${order.id}" class="edit-order">Edit</button>
        <button data-id="${order.id}" class="delete-order">Delete</button>
        <hr/>
      `;

      div.querySelector(".delete-order").addEventListener("click", async () => {
        await fetch(`${ORDERS_URL}/${order.id}`, { method: "DELETE" });
        div.remove();
      });

      div.querySelector(".edit-order").addEventListener("click", () => {
        currentOrderCar = order.car;
        currentEditingOrderId = order.id;

        modalImg.src = order.car.img;
        modalTitle.textContent = order.car.title;
        modalPrice.textContent = order.car.price;
        modalDescription.textContent = order.car.desc || "";

        orderName.value = order.name;
        orderEmail.value = order.email;
        orderMobile.value = order.mobile;
        orderLocation.value = order.location;
        orderMessage.value = order.message;

        modal.style.display = "flex";
        modal.querySelector(".modal-form").style.display = "block";
        modal.querySelector(".modal-content").style.width = "50%";
        ordersModal.style.display = "none";
      });

      ordersList.appendChild(div);
    });
  });

  closeOrdersModal.addEventListener("click", () => {
    ordersModal.style.display = "none";
  });

  ordersModal.addEventListener("click", (e) => {
    if (e.target === ordersModal) ordersModal.style.display = "none";
  });
}

// Main function: sets everything up when the page loads
async function main() {
  initCars();
  setupControls();
  setupWishlistButtons();
  setupModalListeners();
  setupOrdersPopup();

  const saved = await requestData(API_URL);
  saved.forEach(({ title, img, price }) => {
    wishlist.set(title, { img, price });

    document.querySelectorAll(".car-card").forEach((card) => {
      if (card.querySelector("h3").textContent === title) {
        card.querySelector(".wishlist-btn").classList.add("active");
      }
    });
  });

  renderWishlist();
  updateDisplay();
}

// Start app once the DOM is loaded
document.addEventListener("DOMContentLoaded", main);
