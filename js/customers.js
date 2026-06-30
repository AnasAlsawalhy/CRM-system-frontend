const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const customerForm = document.getElementById("customerForm");
const customersTableBody = document.getElementById("customersTableBody");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

refreshBtn.addEventListener("click", loadCustomers);

customerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";
  message.className = "";

  // FIX: Map the Name input value to 'companyName' for the backend
  const customer = {
    companyName: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
  };

  try {
    await apiRequest("/api/Customers", {
      method: "POST",
      body: JSON.stringify(customer),
    });

    message.textContent = "Customer added successfully.";
    message.className = "success";

    customerForm.reset();
    loadCustomers();
  } catch (error) {
    message.textContent = error.message;
    message.className = "error";
    console.error(error);
  }
});

async function loadCustomers() {
  try {
    customersTableBody.innerHTML = `
      <tr>
        <td colspan="6">Loading customers...</td>
      </tr>
    `;

    const customers = await apiRequest("/api/Customers");

    if (!customers || customers.length === 0) {
      customersTableBody.innerHTML = `
        <tr>
          <td colspan="6">No customers found.</td>
        </tr>
      `;
      return;
    }

    customersTableBody.innerHTML = "";

    customers.forEach((customer) => {
      const id = customer.id ?? customer.Id;
      // FIX: Read 'companyName' or 'CompanyName' fallback from the API response
      const name =
        customer.companyName ??
        customer.CompanyName ??
        customer.name ??
        customer.Name ??
        "";
      const email = customer.email ?? customer.Email ?? "";
      const phone = customer.phone ?? customer.Phone ?? "";
      const address = customer.address ?? customer.Address ?? "";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${id}</td>
        <td>${name}</td>
        <td>${email}</td>
        <td>${phone}</td>
        <td>${address}</td>
        <td>
          <button class="danger-btn" onclick="deleteCustomer(${id})">
            Delete
          </button>
        </td>
      `;

      customersTableBody.appendChild(row);
    });
  } catch (error) {
    customersTableBody.innerHTML = `
      <tr>
        <td colspan="6">Failed to load customers.</td>
      </tr>
    `;

    console.error(error);
  }
}

async function deleteCustomer(id) {
  const confirmDelete = confirm(
    "Are you sure you want to delete this customer?",
  );

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/api/Customers/${id}`, {
      method: "DELETE",
    });

    loadCustomers();
  } catch (error) {
    alert(error.message);
    console.error(error);
  }
}

loadCustomers();
