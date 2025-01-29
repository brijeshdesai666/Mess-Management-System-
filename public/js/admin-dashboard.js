async function fetchMealCounts() {
  const response = await fetch("/meal-counts");
  const data = await response.json();
  document.getElementById("breakfastTotal").textContent = data.breakfast + data.breakfastCancellations;
  document.getElementById("lunchTotal").textContent = data.lunch + data.lunchCancellations;
  document.getElementById("dinnerTotal").textContent = data.dinner + data.dinnerCancellations;
  document.getElementById("breakfastCancellations").textContent = data.breakfastCancellations;
  document.getElementById("lunchCancellations").textContent = data.lunchCancellations;
  document.getElementById("dinnerCancellations").textContent = data.dinnerCancellations;
  document.getElementById("breakfastComing").textContent = data.breakfast;
  document.getElementById("lunchComing").textContent = data.lunch;
  document.getElementById("dinnerComing").textContent = data.dinner;
}
fetchMealCounts();