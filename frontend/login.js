const apiUrl = "https://project-remake.onrender.com/api/v1";
const API_URL = `${apiUrl}/auth/login`;

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!username || !password) {
    if (window.showError) window.showError("Vui lòng nhập đầy đủ thông tin");
    else alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Đăng nhập thất bại");
    }
    if (window.showSuccess) window.showSuccess("Đăng nhập thành công");
    else alert("Đăng nhập thành công");
    localStorage.setItem("token", data.accessToken);
    location.href = "admin.html";
  } catch (error) {
    if (window.showError) window.showError(error.message);
    else alert(error.message);
  }
});
