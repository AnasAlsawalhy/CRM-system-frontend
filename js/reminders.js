const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const reminderForm = document.getElementById("reminderForm");
const remindersTableBody = document.getElementById("remindersTableBody");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

const customerSelect = document.getElementById("customerId");
const assignedUserSelect = document.getElementById("assignedToUserId");

const reminderAfterDaysInput = document.getElementById("reminderAfterDays");
const reminderAtUtcInput = document.getElementById("reminderAtUtc");

let isSyncingReminderFields = false;

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

refreshBtn.addEventListener("click", loadReminders);

reminderAfterDaysInput.addEventListener("input", syncDateFromDays);
reminderAtUtcInput.addEventListener("change", syncDaysFromDate);

reminderForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";
  message.className = "";

  const reminderDateInput = reminderAtUtcInput.value;

  if (!reminderDateInput) {
    message.textContent = "Please select a reminder date.";
    message.className = "error";
    return;
  }

  const reminder = {
    customerId: Number(customerSelect.value),
    assignedToUserId: Number(assignedUserSelect.value),
    createdByUserId: null,

    title: document.getElementById("title").value.trim(),
    note: document.getElementById("note").value.trim(),

    reminderAfterDays: Number(reminderAfterDaysInput.value),
    reminderAtUtc: new Date(reminderDateInput).toISOString(),

    isEmailSent: false,
    emailSentAtUtc: null,
    isCompleted: false,
    createdAtUtc: new Date().toISOString(),
  };

  try {
    await apiRequest("/api/FollowUpReminders", {
      method: "POST",
      body: JSON.stringify(reminder),
    });

    message.textContent = "Reminder added successfully.";
    message.className = "success";

    reminderForm.reset();

    reminderAfterDaysInput.value = 0;
    syncDateFromDays();

    loadReminders();
  } catch (error) {
    message.textContent = error.message;
    message.className = "error";
    console.error(error);
  }
});

function toDateTimeLocalValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function syncDateFromDays() {
  if (isSyncingReminderFields) {
    return;
  }

  isSyncingReminderFields = true;

  const days = Number(reminderAfterDaysInput.value);

  if (!Number.isNaN(days) && days >= 0) {
    const date = new Date();
    date.setDate(date.getDate() + days);

    reminderAtUtcInput.value = toDateTimeLocalValue(date);
  }

  isSyncingReminderFields = false;
}

function syncDaysFromDate() {
  if (isSyncingReminderFields) {
    return;
  }

  isSyncingReminderFields = true;

  const selectedDateValue = reminderAtUtcInput.value;

  if (selectedDateValue) {
    const selectedDate = new Date(selectedDateValue);
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const selectedDateStart = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
    );

    const differenceInMs = selectedDateStart.getTime() - todayStart.getTime();
    const differenceInDays = Math.max(
      0,
      Math.round(differenceInMs / (1000 * 60 * 60 * 24)),
    );

    reminderAfterDaysInput.value = differenceInDays;
  }

  isSyncingReminderFields = false;
}

async function loadCustomersDropdown() {
  try {
    const customers = await apiRequest("/api/Customers");

    customerSelect.innerHTML = `<option value="">Select customer</option>`;

    customers.forEach((customer) => {
      const id = customer.id ?? customer.Id;

      const name =
        customer.companyName ?? customer.CompanyName ?? `Customer ${id}`;

      const option = document.createElement("option");
      option.value = id;
      option.textContent = `${id} - ${name}`;

      customerSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load customers:", error);
  }
}

async function loadUsersDropdown() {
  try {
    const users = await apiRequest("/api/Users");

    assignedUserSelect.innerHTML = `<option value="">Select user</option>`;

    users.forEach((user) => {
      const id = user.id ?? user.Id;

      const name =
        user.fullName ??
        user.FullName ??
        user.email ??
        user.Email ??
        `User ${id}`;

      const email = user.email ?? user.Email ?? "";
      const role = user.role ?? user.Role ?? "";

      const option = document.createElement("option");
      option.value = id;

      option.textContent = email
        ? `${id} - ${name} (${role}) - ${email}`
        : `${id} - ${name} (${role})`;

      assignedUserSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load users:", error);
  }
}

async function loadReminders() {
  try {
    remindersTableBody.innerHTML = `
      <tr>
        <td colspan="8">Loading reminders...</td>
      </tr>
    `;

    const reminders = await apiRequest("/api/FollowUpReminders");

    if (!reminders || reminders.length === 0) {
      remindersTableBody.innerHTML = `
        <tr>
          <td colspan="8">No reminders found.</td>
        </tr>
      `;
      return;
    }

    remindersTableBody.innerHTML = "";

    reminders.forEach((reminder) => {
      const id = reminder.id ?? reminder.Id;
      const customerId = reminder.customerId ?? reminder.CustomerId ?? "";
      const assignedToUserId =
        reminder.assignedToUserId ?? reminder.AssignedToUserId ?? "";

      const title = reminder.title ?? reminder.Title ?? "";
      const reminderAtUtc =
        reminder.reminderAtUtc ?? reminder.ReminderAtUtc ?? "";

      const isEmailSent = reminder.isEmailSent ?? reminder.IsEmailSent ?? false;

      const emailSentAtUtc =
        reminder.emailSentAtUtc ?? reminder.EmailSentAtUtc ?? "";

      const isCompleted = reminder.isCompleted ?? reminder.IsCompleted ?? false;

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${id}</td>
        <td>${customerId}</td>
        <td>${assignedToUserId}</td>
        <td>${title}</td>
        <td>${formatDate(reminderAtUtc)}</td>
        <td>
          ${
            isEmailSent
              ? `Yes<br><small>${formatDate(emailSentAtUtc)}</small>`
              : "No"
          }
        </td>
        <td>${isCompleted ? "Yes" : "No"}</td>
        <td>
          <button class="small-btn" onclick="markReminderCompleted(${id})">
            Complete
          </button>
          <button class="danger-btn" onclick="deleteReminder(${id})">
            Delete
          </button>
        </td>
      `;

      remindersTableBody.appendChild(row);
    });
  } catch (error) {
    remindersTableBody.innerHTML = `
      <tr>
        <td colspan="8">Failed to load reminders.</td>
      </tr>
    `;

    console.error(error);
  }
}

async function deleteReminder(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this reminder?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/api/FollowUpReminders/${id}`, {
      method: "DELETE",
    });

    loadReminders();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

async function markReminderCompleted(id) {
  try {
    const reminder = await apiRequest(`/api/FollowUpReminders/${id}`);

    const updatedReminder = {
      ...reminder,
      isCompleted: true,
      IsCompleted: true,
    };

    await apiRequest(`/api/FollowUpReminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(updatedReminder),
    });

    loadReminders();
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

loadCustomersDropdown();
loadUsersDropdown();
loadReminders();
syncDateFromDays();
