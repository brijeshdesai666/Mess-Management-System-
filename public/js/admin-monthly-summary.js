document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch(`/admin-monthly-summary`);
  const summary = await response.json();

  const tableBody = document.getElementById("summaryTableBody");
  let totalCost = 0;
  let totalBreakfastsAttended = 0;
  let totalLunchesAttended = 0;
  let totalDinnersAttended = 0;
  let totalBreakfastsCanceled = 0;
  let totalLunchesCanceled = 0;
  let totalDinnersCanceled = 0;

  summary.attendance.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${record.username}</td>
      <td>${record.date}</td>
      <td>${record.breakfast ? "Attended" : "Canceled"}</td>
      <td>${record.lunch ? "Attended" : "Canceled"}</td>
      <td>${record.dinner ? "Attended" : "Canceled"}</td>
    `;
    tableBody.appendChild(row);

    if (record.breakfast) {
      totalCost += 30;
      totalBreakfastsAttended++;
    } else {
      totalBreakfastsCanceled++;
    }
    if (record.lunch) {
      totalCost += 60;
      totalLunchesAttended++;
    } else {
      totalLunchesCanceled++;
    }
    if (record.dinner) {
      totalCost += 60;
      totalDinnersAttended++;
    } else {
      totalDinnersCanceled++;
    }
  });

  document.getElementById("totalCost").textContent = `₹${totalCost}`;
  document.getElementById("totalBreakfastsAttended").textContent = totalBreakfastsAttended;
  document.getElementById("totalLunchesAttended").textContent = totalLunchesAttended;
  document.getElementById("totalDinnersAttended").textContent = totalDinnersAttended;
  document.getElementById("totalBreakfastsCanceled").textContent = totalBreakfastsCanceled;
  document.getElementById("totalLunchesCanceled").textContent = totalLunchesCanceled;
  document.getElementById("totalDinnersCanceled").textContent = totalDinnersCanceled;

  // Display last month's summary
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const monthName = lastMonth.toLocaleString('default', { month: 'long' });
  document.getElementById("lastMonthName").textContent = monthName;
  document.getElementById("lastMonthTotalCost").textContent = `₹${summary.last_month_summary.total_cost}`;
  document.getElementById("lastMonthTotalBreakfastsAttended").textContent = summary.last_month_summary.total_breakfasts_attended;
  document.getElementById("lastMonthTotalLunchesAttended").textContent = summary.last_month_summary.total_lunches_attended;
  document.getElementById("lastMonthTotalDinnersAttended").textContent = summary.last_month_summary.total_dinners_attended;
  document.getElementById("lastMonthTotalBreakfastsCanceled").textContent = summary.last_month_summary.total_breakfasts_canceled;
  document.getElementById("lastMonthTotalLunchesCanceled").textContent = summary.last_month_summary.total_lunches_canceled;
  document.getElementById("lastMonthTotalDinnersCanceled").textContent = summary.last_month_summary.total_dinners_canceled;
});
