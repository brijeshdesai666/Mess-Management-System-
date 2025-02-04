document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem('currentUsername'); // Remove username from localStorage
  window.location.href = "/"; // Redirect to login page
});

// Fetch meal counts and update the dashboard
async function fetchMealCounts() {
  const response = await fetch("/meal-counts");
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

// Function to format date and time in Indian format
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// Fetch and display meal cancellation details
document.querySelectorAll(".btn-success").forEach(button => {
  button.addEventListener("click", async (event) => {
    const meal = event.target.closest(".card-body").querySelector("h3").textContent.toLowerCase();
    const response = await fetch(`/meal-cancellations?meal=${meal}`);
    const cancellations = await response.json();
    const tableBody = document.getElementById("detailsTableBody");
    tableBody.innerHTML = "";
    cancellations.forEach(cancellation => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cancellation.username}</td>
        <td>${cancellation.meal}</td>
        <td>${formatDateTime(cancellation.dateTime)}</td>
      `;
      tableBody.appendChild(row);
    });
    const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
    modal.show();
  });
});

// Ensure the modal backdrop is removed when the modal is hidden
const detailsModal = document.getElementById("detailsModal");
detailsModal.addEventListener("hidden.bs.modal", () => {
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
});