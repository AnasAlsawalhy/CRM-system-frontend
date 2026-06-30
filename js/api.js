const API_BASE_URL = "https://localhost:7153/api";

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

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
}
