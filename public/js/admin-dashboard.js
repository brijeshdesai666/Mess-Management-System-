document.addEventListener("DOMContentLoaded", () => {
  const username = localStorage.getItem('currentUsername');
  if (!username) {
    window.location.href = "/"; // Redirect to login page if not logged in
  }
});

async function fetchMealCounts() {
  const username = localStorage.getItem('currentUsername'); // Retrieve username
  const response = await fetch("/meal-counts", {
    headers: { "x-username": username } // Include username in headers
  });
  const data = await response.json();
  document.getElementById("breakfastTotal").textContent = data.totalBreakfast;
  document.getElementById("lunchTotal").textContent = data.totalLunch;
  document.getElementById("dinnerTotal").textContent = data.totalDinner;
  document.getElementById("breakfastCancellations").textContent = data.breakfastCancellations;
  document.getElementById("lunchCancellations").textContent = data.lunchCancellations;
  document.getElementById("dinnerCancellations").textContent = data.dinnerCancellations;
  document.getElementById("breakfastComing").textContent = data.totalBreakfast - data.breakfastCancellations;
  document.getElementById("lunchComing").textContent = data.totalLunch - data.lunchCancellations;
  document.getElementById("dinnerComing").textContent = data.totalDinner - data.dinnerCancellations;
}
fetchMealCounts();

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem('currentUsername'); // Remove username from localStorage
  window.location.href = "/"; // Redirect to login page
});