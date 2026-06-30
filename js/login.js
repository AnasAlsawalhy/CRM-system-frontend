const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  message.textContent = "";
  message.className = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    const result = await apiRequest("/api/Auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    console.log("Login result:", result);

    localStorage.setItem("token", result.token);

    message.textContent = "Login successful";
    message.className = "success";

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch (error) {
    message.textContent = error.message;
    message.className = "error";
    console.error("Login error:", error);
  }
});
