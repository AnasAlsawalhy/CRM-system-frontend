const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
const dealForm = document.getElementById("dealForm");
const dealsTableBody = document.getElementById("dealsTableBody");
const message = document.getElementById("message");
const refreshBtn = document.getElementById("refreshBtn");
const customerSelect = document.getElementById("customerId");

logoutBtn.addEventListener("click", function () {
  localStorage.removeItem("token");
  window.location.href = "index.html";
});

refreshBtn.addEventListener("click", loadDeals);

dealForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";
  message.className = "";

  const expectedCloseDateInput =
    document.getElementById("expectedCloseDate").value;

  const deal = {
    customerId: Number(document.getElementById("customerId").value),
    title: document.getElementById("title").value.trim(),
    value: Number(document.getElementById("value").value),
    stage: document.getElementById("stage").value,
    expectedCloseDate: expectedCloseDateInput ? expectedCloseDateInput : null,
  };

  try {
    await apiRequest("/api/Deals", {
      method: "POST",
      body: JSON.stringify(deal),
    });

    message.textContent = "Deal added successfully.";
    message.className = "success";

    dealForm.reset();
    loadDeals();
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

async function loadDeals() {
  try {
    dealsTableBody.innerHTML = `
      <tr>
        <td colspan="7">Loading deals...</td>
      </tr>
    `;

    const deals = await apiRequest("/api/Deals");

    if (!deals || deals.length === 0) {
      dealsTableBody.innerHTML = `
        <tr>
          <td colspan="7">No deals found.</td>
        </tr>
      `;
      return;
    }

    dealsTableBody.innerHTML = "";

    deals.forEach((deal) => {
      const id = deal.id ?? deal.Id;
      const customerId = deal.customerId ?? deal.CustomerId ?? "";
      const title = deal.title ?? deal.Title ?? "";
      const value =
        deal.value ?? deal.Value ?? deal.amount ?? deal.Amount ?? "";
      const stage =
        deal.stage ?? deal.Stage ?? deal.status ?? deal.Status ?? "";
      const expectedCloseDate =
        deal.expectedCloseDate ??
        deal.ExpectedCloseDate ??
        deal.expectedCloseDateUtc ??
        deal.ExpectedCloseDateUtc ??
        "";

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${id}</td>
        <td>${customerId}</td>
        <td>${title}</td>
        <td>${value}</td>
        <td>${stage}</td>
        <td>${formatDate(expectedCloseDate)}</td>
        <td>
          <button class="danger-btn" onclick="deleteDeal(${id})">
            Delete
          </button>
        </td>
      `;

      dealsTableBody.appendChild(row);
    });
  } catch (error) {
    dealsTableBody.innerHTML = `
      <tr>
        <td colspan="7">Failed to load deals.</td>
      </tr>
    `;

    console.error(error);
  }
}

async function deleteDeal(id) {
  const confirmDelete = confirm("Are you sure you want to delete this deal?");

  if (!confirmDelete) {
    return;
  }

  try {
    await apiRequest(`/api/Deals/${id}`, {
      method: "DELETE",
    });

    loadDeals();
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
loadDeals();
