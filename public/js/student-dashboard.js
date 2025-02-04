document.getElementById("cancelBreakfast").addEventListener("click", async () => {
  await cancelMeal("breakfast", "cancelBreakfast");
});

document.getElementById("cancelLunch").addEventListener("click", async () => {
  await cancelMeal("lunch", "cancelLunch");
});

document.getElementById("cancelDinner").addEventListener("click", async () => {
  await cancelMeal("dinner", "cancelDinner");
});

document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem('currentUsername'); // Remove username from localStorage
  window.location.href = "/"; // Redirect to login page
});

async function cancelMeal(meal, buttonId) {
  const username = localStorage.getItem('currentUsername'); // Retrieve username
  if (!username) {
    alert("Please log in to cancel meals.");
    return;
  }

  const response = await fetch("/cancel-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meal, username }), // Use dynamic username
  });
  const result = await response.json();
  if (result.success) {
    alert(`${meal.charAt(0).toUpperCase() + meal.slice(1)} canceled successfully!`);
    const button = document.getElementById(buttonId);
    button.disabled = true;
    button.textContent = "Meal Canceled";
  } else {
    alert(`Failed to cancel ${meal}: ${result.message}`);
  }
}

// Add cutoff times for each meal for testing
const cutoffTimes = {
  breakfast: "23:59", // 11:59 PM
  lunch: "23:59",     // 11:59 PM
  dinner: "23:59",    // 11:59 PM
};

// Function to disable buttons after cutoff time
function disableButtonsAfterCutoff() {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // Get current time in HH:MM format

  // Disable breakfast button if current time is after cutoff
  if (currentTime > cutoffTimes.breakfast) {
    document.getElementById("cancelBreakfast").disabled = true;
    document.getElementById("cancelBreakfast").textContent = "Timeout";
  }

  // Disable lunch button if current time is after cutoff
  if (currentTime > cutoffTimes.lunch) {
    document.getElementById("cancelLunch").disabled = true;
    document.getElementById("cancelLunch").textContent = "Timeout";
  }

  // Disable dinner button if current time is after cutoff
  if (currentTime > cutoffTimes.dinner) {
    document.getElementById("cancelDinner").disabled = true;
    document.getElementById("cancelDinner").textContent = "Timeout";
  }
}

// Load canceled meals on page initialization
async function loadCanceledMeals() {
  const username = localStorage.getItem('currentUsername');
  if (!username) {
    alert("Not logged in");
    window.location.href = "/"; // Redirect to login
    return;
  }

  const response = await fetch(`/student-canceled-meals?username=${username}`);
  const canceledMeals = await response.json();

  if (canceledMeals.breakfast.canceled) disableButton("breakfast");
  if (canceledMeals.lunch.canceled) disableButton("lunch");
  if (canceledMeals.dinner.canceled) disableButton("dinner");
}

function disableButton(meal) {
  const buttonId = `cancel${meal.charAt(0).toUpperCase() + meal.slice(1)}`;
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.textContent = "Meal Canceled";
  }
}

// Call the functions when the page loads
disableButtonsAfterCutoff();
loadCanceledMeals();

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

function sendReminderEmail(email) {
  emailjs.send("YOUR_SERVICE_ID", "YOUR_TEMPLATE_ID", {
    to_email: email,
    message: "Don’t forget to cancel your meal before the cutoff time!",
  })
  .then(
    (response) => {
      console.log("Email sent successfully!", response);
    },
    (error) => {
      console.error("Failed to send email:", error);
    }
  );
}

// Example: Send a reminder email when the page loads
const studentEmail = "student@example.com"; // Replace with the student's email
sendReminderEmail(studentEmail);