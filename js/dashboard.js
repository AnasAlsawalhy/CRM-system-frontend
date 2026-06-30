console.log("dashboard.js loaded");

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

refreshBtn.addEventListener("click", loadDashboardSummary);

async function loadDashboardSummary() {
  try {
    console.log("Loading dashboard summary...");

    const summary = await apiRequest("/api/Dashboard/summary");

    console.log("Dashboard summary:", summary);

    document.getElementById("totalCustomers").textContent =
      summary.totalCustomers;
    document.getElementById("totalContacts").textContent =
      summary.totalContacts;
    document.getElementById("totalDeals").textContent = summary.totalDeals;
    document.getElementById("totalReminders").textContent =
      summary.totalReminders;
    document.getElementById("pendingReminders").textContent =
      summary.pendingReminders;
    document.getElementById("completedReminders").textContent =
      summary.completedReminders;
    document.getElementById("emailsSent").textContent = summary.emailsSent;
  } catch (error) {
    console.error("Failed to load dashboard summary:", error);
    alert("Failed to load dashboard data. Check Console.");
  }
}

loadDashboardSummary();
