const API_URL = "http://localhost:3000/cars";

//DOM elements
const carList = document.getElementById("carList");
const makeFilter = document.getElementById("makeFilter");
const searchBar = document.getElementById("searchBar");
const sortSelect = document.getElementById("sortSelect");


let allCars = [];

// Fetch data from JSON server
async function requestData(API_URL) {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`Error ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

// Render car cards
function displayCars(carArray) {
  carList.innerHTML = "";
  if (carArray.length === 0) {
    carList.innerHTML = "<p>No cars found.</p>";
    return;
  }

  carArray.forEach((car) => {
    const card = document.createElement("div");
    card.className = "car-card";
    card.innerHTML = `
      <img src="${car.image}" alt="${car.make} ${car.model}" />
      <h3>${car.make} ${car.model}</h3>
      <p>Year: ${car.year}</p>
      <p>Price: KES ${car.price.toLocaleString()}</p>
      <button class="buy-btn">Buy Now</button>
    `;
    carList.appendChild(card);
  });
}

// Filter, search, sort and display cars
function updateDisplay() {
  let filteredCars = [...allCars];

  // Filter by make
  const selectedMake = makeFilter.value;
  if (selectedMake !== "All") {
    filteredCars = filteredCars.filter(
      (car) => car.make.toLowerCase() === selectedMake.toLowerCase()
    );
  }

  // Search by make (partial match)
  const searchTerm = searchBar.value.toLowerCase().trim();
  if (searchTerm) {
    filteredCars = filteredCars.filter((car) =>
      car.make.toLowerCase().includes(searchTerm)
    );
  }

  // Sort by price or year
  const sortBy = sortSelect.value;
  if (sortBy === "price") {
    filteredCars.sort((a, b) => a.price - b.price);
  } else if (sortBy === "year") {
    filteredCars.sort((a, b) => b.year - a.year);
  }

  displayCars(filteredCars);
}

// Initial load
async function initCarStore() {
  allCars = await requestData(API_URL);
  displayCars(allCars);
}

// Event Listeners
makeFilter.addEventListener("change", updateDisplay);
searchBar.addEventListener("input", updateDisplay);
sortSelect.addEventListener("change", updateDisplay);

document.addEventListener("DOMContentLoaded", initCarStore);
