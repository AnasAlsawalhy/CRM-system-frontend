const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const contactForm = document.getElementById("contactForm");
const contactsTableBody = document.getElementById("contactsTableBody");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const customerSelect = document.getElementById("customerId");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

refreshBtn.addEventListener("click", loadContacts);

contactForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";
  message.className = "";

  const contact = {
    customerId: Number(document.getElementById("customerId").value),
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    jobTitle: document.getElementById("jobTitle").value.trim(),
  };

  try {
    await apiRequest("/api/Contacts", {
      method: "POST",
      body: JSON.stringify(contact),
    });

    message.textContent = "Contact added successfully.";
    message.className = "success";

    contactForm.reset();
    loadContacts();
  } catch (error) {
    message.textContent = error.message;
    message.className = "error";
    console.error(error);
  }
});

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

async function loadContacts() {
  try {
    contactsTableBody.innerHTML = `
      <tr>
        <td colspan="7">Loading contacts...</td>
      </tr>
    `;

    const contacts = await apiRequest("/api/Contacts");

    if (!contacts || contacts.length === 0) {
      contactsTableBody.innerHTML = `
        <tr>
          <td colspan="7">No contacts found.</td>
        </tr>
      `;
      return;
    }

    contactsTableBody.innerHTML = "";

    contacts.forEach((contact) => {
      const id = contact.id ?? contact.Id;
      const customerId = contact.customerId ?? contact.CustomerId ?? "";
      const fullName =
        contact.fullName ??
        contact.FullName ??
        contact.name ??
        contact.Name ??
        "";
      const email = contact.email ?? contact.Email ?? "";
      const phone = contact.phone ?? contact.Phone ?? "";
      const jobTitle =
        contact.jobTitle ??
        contact.JobTitle ??
        contact.position ??
        contact.Position ??
        "";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${id}</td>
        <td>${customerId}</td>
        <td>${fullName}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${jobTitle}</td>
        <td>
          <button class="danger-btn" onclick="deleteContact(${id})">
            Delete
          </button>
        </td>
      `;

      contactsTableBody.appendChild(row);
    });
  } catch (error) {
    contactsTableBody.innerHTML = `
      <tr>
        <td colspan="7">Failed to load contacts.</td>
      </tr>
    `;

    console.error(error);
  }
}

async function deleteContact(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this contact?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/api/Contacts/${id}`, {
      method: "DELETE",
    });

    loadContacts();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

loadCustomersDropdown();
loadContacts();
