(function () {
  function ensureContainer() {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      document.body.appendChild(container);
    }
    return container;
  }

  function createToast(type, title, message) {
    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon =
      type === "success" ? "fa-circle-check" : "fa-circle-exclamation";

    toast.innerHTML = `\n    <i class="fa-solid ${icon} toast-icon"></i>\n    <div>\n      <div class="toast-title">${title}</div>\n      <div class="toast-msg">${message}</div>\n    </div>\n  `;
    container.appendChild(toast);

    // trigger animation
    setTimeout(() => toast.classList.add("show"), 10);

    // remove after timeout
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  window.createToast = createToast;
  window.showSuccess = (msg) => createToast("success", "Thành công!", msg);
  window.showError = (msg) => createToast("error", "Thất bại!", msg);
})();

// Hàm hiển thị Confirm Box
function showConfirm(title, message) {
  return new Promise((resolve) => {
    // 1. Tạo giao diện (Khỏi cần viết sẵn HTML, JS tự đẻ ra luôn)
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    overlay.innerHTML = `
      <div class="confirm-box">
        <i class="fa-solid fa-triangle-exclamation confirm-icon"></i>
        <div class="confirm-title">${title}</div>
        <div class="confirm-message">${message}</div>
        <div class="confirm-actions">
          <button class="btn-confirm-action btn-confirm-cancel">Hủy bỏ</button>
          <button class="btn-confirm-action btn-confirm-yes">Đồng ý</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // 2. Kích hoạt hiệu ứng hiện lên
    setTimeout(() => overlay.classList.add("show"), 10);

    // 3. Xử lý khi bấm nút
    const btnYes = overlay.querySelector(".btn-confirm-yes");
    const btnCancel = overlay.querySelector(".btn-confirm-cancel");

    const closeModal = (result) => {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 300); // Đợi tắt hiệu ứng rồi mới xóa HTML
      resolve(result); // Trả về true nếu bấm Yes, false nếu bấm Cancel
    };

    btnYes.addEventListener("click", () => closeModal(true));
    btnCancel.addEventListener("click", () => closeModal(false));
  });
}
