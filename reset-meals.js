// const fs = require("fs");
// const path = require("path");

// // Load student and admin data from JSON file
// const dataPath = path.join(__dirname, "data", "students.json");
// let data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// // Reset meal cancellations
// data.students.forEach((student) => {
//   student.canceled_meals.breakfast = false;
//   student.canceled_meals.lunch = false;
//   student.canceled_meals.dinner = false;
// });
// data.admin.cancellations.breakfast = 0;
// data.admin.cancellations.lunch = 0;
// data.admin.cancellations.dinner = 0;

// // Save the updated data back to the JSON file
// fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
// console.log("Cancellations reset");
