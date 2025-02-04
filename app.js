const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const cron = require("node-cron");

const app = express();
const PORT = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(express.json());

// Load student and admin data from JSON file
const dataPath = path.join(__dirname, "data", "students.json");
let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Commented out the password hashing code
// const saltRounds = 10;
// data.students.forEach((student) => {
//   if (!student.password.startsWith("$2b$")) {
//     student.password = bcrypt.hashSync(student.password, saltRounds);
//   }
// });
// if (!data.admin.password.startsWith("$2b$")) {
//   data.admin.password = bcrypt.hashSync(data.admin.password, saltRounds);
// }
// fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

// Define meal times
const mealTimes = {
  breakfast: { start: "07:00", end: "09:00" },
  lunch: { start: "12:00", end: "14:00" },
  dinner: { start: "19:00", end: "21:00" },
};

// Define meal cancellation end times for testing
const mealEndTimes = {
  breakfast: "23:59",
  lunch: "23:59",
  dinner: "23:59",
};

// Helper function to check if current time is within the allowed cancellation time
function isWithinTimeRange(meal) {
  const now = new Date();
  const [startHour, startMinute] = mealTimes[meal].start.split(":").map(Number);
  const [endHour, endMinute] = mealTimes[meal].end.split(":").map(Number);
  const startTime = new Date(now.setHours(startHour, startMinute, 0, 0));
  const endTime = new Date(now.setHours(endHour, endMinute, 0, 0));
  return now >= startTime && now <= endTime;
}

// Helper function to check if current time is before the allowed cancellation end time
function isBeforeEndTime(meal) {
  const now = new Date();
  const [endHour, endMinute] = mealEndTimes[meal].split(":").map(Number);
  const endTime = new Date(now.setHours(endHour, endMinute, 0, 0));
  return now <= endTime;
}

// Serve login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// Serve student dashboard
app.get("/student-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "student-dashboard.html"));
});

// Serve admin dashboard
app.get("/admin-dashboard.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-dashboard.html"));
});

// Serve student monthly summary page
app.get("/student-monthly-summary.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "student-monthly-summary.html"));
});

// Serve admin monthly summary page
app.get("/admin-monthly-summary.html", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-monthly-summary.html"));
});

// Login route for students
app.post("/login/student", (req, res) => {
  const { username, password } = req.body;
  const student = data.students.find((s) => s.username === username);

  if (student && password === student.password) {
    res.json({ 
      success: true, 
      redirect: "/student-dashboard.html", 
      username: username // Return the username
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Login route for admin
app.post("/login/admin", (req, res) => {
  const { username, password } = req.body;
  if (username === data.admin.username && password === data.admin.password) {
    res.json({ 
      success: true, 
      redirect: "/admin-dashboard.html", 
      username: username // Return the username
    });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// Cancel meal route
app.post("/cancel-meal", (req, res) => {
  const { meal, username } = req.body;

  // Check if the current time is before the allowed cancellation end time
  if (!isBeforeEndTime(meal)) {
    return res.status(400).json({ success: false, message: "Cancellation not allowed at this time" });
  }

  // Check if the current time is within the allowed cancellation time
  if (!isWithinTimeRange(meal)) {
    return res.status(400).json({ success: false, message: "Cancellation not allowed at this time" });
  }

  // Find the student in the JSON data
  const student = data.students.find((s) => s.username === username);
  if (student) {
    if (!student.canceled_meals[meal].canceled) {
      student.canceled_meals[meal] = {
        canceled: true,
        dateTime: new Date().toISOString() // Store the actual cancellation date and time
      };
      data.admin.meal_counts[meal] -= 1;   // Update the meal count
      data.admin.cancellations[meal] += 1; // Update the cancellation count

      // Save the updated data back to the JSON file
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: "Meal already canceled" });
    }
  } else {
    res.status(404).json({ success: false, message: "Student not found" });
  }
});

// Get meal counts route
app.get("/meal-counts", (req, res) => {
  const counts = {
    breakfast: data.admin.meal_counts.breakfast,
    lunch: data.admin.meal_counts.lunch,
    dinner: data.admin.meal_counts.dinner,
    breakfastCancellations: data.admin.cancellations.breakfast,
    lunchCancellations: data.admin.cancellations.lunch,
    dinnerCancellations: data.admin.cancellations.dinner,
    totalBreakfast: data.admin.total_students.breakfast,
    totalLunch: data.admin.total_students.lunch,
    totalDinner: data.admin.total_students.dinner,
  };
  res.json(counts);
});

// Get meal cancellations route
app.get("/meal-cancellations", (req, res) => {
  const meal = req.query.meal;
  const cancellations = data.students
    .filter(student => student.canceled_meals[meal].canceled)
    .map(student => ({
      username: student.username,
      meal: meal,
      dateTime: student.canceled_meals[meal].dateTime
    }));
  res.json(cancellations);
});

// Schedule a task to reset cancellations and students coming at midnight
cron.schedule("16 21 * * *", () => {
  data.students.forEach((student) => {
    student.canceled_meals.breakfast = false;
    student.canceled_meals.lunch = false;
    student.canceled_meals.dinner = false;
  });
  data.admin.cancellations.breakfast = 0;
  data.admin.cancellations.lunch = 0;
  data.admin.cancellations.dinner = 0;
  data.admin.meal_counts.breakfast = data.admin.total_students.breakfast; // Use total students from JSON
  data.admin.meal_counts.lunch = data.admin.total_students.lunch;         // Use total students from JSON
  data.admin.meal_counts.dinner = data.admin.total_students.dinner;       // Use total students from JSON
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Cancellations and students coming reset at midnight, total students unchanged");
});

// Comment out the testing cron job
// cron.schedule("0 0 * * *", () => {
//   data.students.forEach((student) => {
//     student.canceled_meals.breakfast = false;
//     student.canceled_meals.lunch = false;
//     student.canceled_meals.dinner = false;
//   });
//   data.admin.cancellations.breakfast = 0;
//   data.admin.cancellations.lunch = 0;
//   data.admin.cancellations.dinner = 0;
//   data.admin.meal_counts.breakfast = 0;
//   data.admin.meal_counts.lunch = 0;
//   data.admin.meal_counts.dinner = 0;
//   fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
//   console.log("Cancellations and admin dashboard values reset at 8:25 PM");
// });

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong!" });
});

// Get student's canceled meals
app.get("/student-canceled-meals", (req, res) => {
  const username = req.query.username;
  const student = data.students.find(s => s.username === username);
  if (student) {
    res.json(student.canceled_meals);
  } else {
    res.status(404).json({ success: false, message: "Student not found" });
  }
});

// Get student monthly summary route
app.get("/student-monthly-summary", (req, res) => {
  const username = req.query.username;
  const student = data.students.find(s => s.username === username);
  if (student) {
    const summary = {
      attendance: Object.keys(student.attendance).map(date => ({
        date,
        ...student.attendance[date]
      })),
      last_month_summary: student.last_month_summary
    };
    res.json(summary);
  } else {
    res.status(404).json({ success: false, message: "Student not found" });
  }
});

// Get admin monthly summary route
app.get("/admin-monthly-summary", (req, res) => {
  const summary = {
    attendance: data.students.flatMap(student => 
      Object.keys(student.attendance).map(date => ({
        username: student.username,
        date,
        ...student.attendance[date]
      }))
    ),
    last_month_summary: data.students.map(student => student.last_month_summary)
  };
  res.json(summary);
});

// Get list of students
app.get("/students", (req, res) => {
  const students = data.students.map(student => ({
    username: student.username,
    last_month_summary: student.last_month_summary
  }));
  res.json(students);
});

// Schedule a task to reset cancellations and students coming at midnight
cron.schedule("0 0 1 * *", () => {
  data.students.forEach((student) => {
    // Calculate last month's summary
    const lastMonthSummary = {
      total_breakfasts_attended: 0,
      total_lunches_attended: 0,
      total_dinners_attended: 0,
      total_breakfasts_canceled: 0,
      total_lunches_canceled: 0,
      total_dinners_canceled: 0,
      total_cost: 0
    };

    Object.keys(student.attendance).forEach(date => {
      const day = student.attendance[date];
      if (day.breakfast) lastMonthSummary.total_breakfasts_attended++;
      if (day.lunch) lastMonthSummary.total_lunches_attended++;
      if (day.dinner) lastMonthSummary.total_dinners_attended++;

      if (!day.breakfast) lastMonthSummary.total_breakfasts_canceled++;
      if (!day.lunch) lastMonthSummary.total_lunches_canceled++;
      if (!day.dinner) lastMonthSummary.total_dinners_canceled++;

      if (day.breakfast) lastMonthSummary.total_cost += 30;
      if (day.lunch) lastMonthSummary.total_cost += 60;
      if (day.dinner) lastMonthSummary.total_cost += 60;
    });

    student.last_month_summary = lastMonthSummary;

    // Reset attendance for the new month
    student.attendance = {};
  });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log("Cancellations and students coming reset at midnight, total students unchanged");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});