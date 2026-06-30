// const API_BASE_URL = "https://localhost:7153/api";

const API_BASE_URL =
  "https://relying-firewall-occurred-virtual.trycloudflare.com";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const fixedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${fixedEndpoint}`;

  console.log("API REQUEST:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API ERROR:", response.status, errorText);
    throw new Error(errorText || "Request failed");
  }

  return response.json();
}

const responseText = await response.text();

console.log("API URL:", `${API_BASE_URL}${endpoint}`);
console.log("Status:", response.status);
console.log("Response:", responseText);

if (!response.ok) {
  throw new Error(
    `Status ${response.status}: ${responseText || "Request failed"}`,
  );
}

if (!responseText) {
  return null;
}

try {
  return JSON.parse(responseText);
} catch {
  return responseText;
}
