const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

function getJwtPayload() {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (char) {
          return "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid JWT token:", error);
    return null;
  }
}

function getUserRoleFromToken() {
  const payload = getJwtPayload();

  console.log("JWT Payload:", payload);

  if (!payload) {
    return null;
  }

  return (
    payload.role ||
    payload.Role ||
    payload.roles ||
    payload.Roles ||
    payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    null
  );
}

function requireAdmin() {
  const role = getUserRoleFromToken();

  console.log("Current user role:", role);

  if (role !== "Admin") {
    alert("Access denied. Admin only.");
    window.location.replace("dashboard.html");
    return false;
  }

  return true;
}

if (!requireAdmin()) {
  throw new Error("Access denied. Admin only.");
}

const logoutBtn = document.getElementById("logoutBtn");
const userForm = document.getElementById("userForm");
const usersTableBody = document.getElementById("usersTableBody");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

refreshBtn.addEventListener("click", loadUsers);

userForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";
  message.className = "";

  const user = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    role: document.getElementById("role").value,
    isActive: document.getElementById("isActive").value === "true",
  };

  try {
    await apiRequest("/Users", {
      method: "POST",
      body: JSON.stringify(user),
    });

    message.textContent = "User added successfully.";
    message.className = "success";

    userForm.reset();
    loadUsers();
  } catch (error) {
    message.textContent = error.message;
    message.className = "error";
    console.error(error);
  }
});

async function loadUsers() {
  try {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="7">Loading users...</td>
      </tr>
    `;

    const users = await apiRequest("/Users");

    if (!users || users.length === 0) {
      usersTableBody.innerHTML = `
        <tr>
          <td colspan="7">No users found.</td>
        </tr>
      `;
      return;
    }

    usersTableBody.innerHTML = "";

    users.forEach((user) => {
      const id = user.id ?? user.Id;
      const fullName = user.fullName ?? user.FullName ?? "";
      const email = user.email ?? user.Email ?? "";
      const role = user.role ?? user.Role ?? "";
      const isActive = user.isActive ?? user.IsActive ?? false;
      const createdAtUtc = user.createdAtUtc ?? user.CreatedAtUtc ?? "";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${id}</td>
        <td>${fullName}</td>
        <td>${email}</td>
        <td>${role}</td>
        <td>${isActive ? "Yes" : "No"}</td>
        <td>${formatDate(createdAtUtc)}</td>
        <td>
          <button class="danger-btn" onclick="deleteUser(${id})">
            Delete
          </button>
        </td>
      `;

      usersTableBody.appendChild(row);
    });
  } catch (error) {
    usersTableBody.innerHTML = `
      <tr>
        <td colspan="7">Access denied or failed to load users.</td>
      </tr>
    `;

    console.error(error);
    alert("You are not allowed to access Users page.");
    window.location.replace("dashboard.html");
  }
}

async function deleteUser(id) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/Users/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleString();
}

loadUsers();
