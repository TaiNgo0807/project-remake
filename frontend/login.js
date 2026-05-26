const apiUrl =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:6969"
    : "https://project-remake.onrender.com";

const API_URL = `${apiUrl}/api/v1/auth/login`;

const loginForm = document.getElementById("login-form");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    if (window.showError) window.showError("Vui lòng nhập đầy đủ thông tin");
    else alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Đăng nhập thất bại");
    }

    localStorage.setItem("token", data.accessToken);

    const employeeName =
      data.user?.displayName ||
      data.user?.display_name ||
      getNameFromToken(data.accessToken) ||
      username;

    localStorage.setItem("employeeName", employeeName);

    if (window.showSuccess) window.showSuccess("Đăng nhập thành công");
    else alert("Đăng nhập thành công");

    location.href = "admin.html";
  } catch (error) {
    console.error(error);

    if (window.showError) window.showError(error.message);
    else alert(error.message);
  }
});

function getNameFromToken(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(
      payloadBase64.replace(/-/g, "+").replace(/_/g, "/"),
    );

    const payload = JSON.parse(payloadJson);

    return payload.displayName || payload.username || null;
  } catch (error) {
    console.error("Không đọc được tên từ token:", error);
    return null;
  }
}
