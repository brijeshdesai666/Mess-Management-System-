document.getElementById("studentLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("studentUsername").value;
    const password = document.getElementById("studentPassword").value;
  
    const response = await fetch("/login/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    const result = await response.json();
    if (result.success) {
      window.location.href = result.redirect;
    } else {
      alert(result.message); // Show error message
    }
  });
  
  document.getElementById("adminLoginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;
  
    const response = await fetch("/login/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    const result = await response.json();
    if (result.success) {
      window.location.href = result.redirect;
    } else {
      alert(result.message); // Show error message
    }
  });