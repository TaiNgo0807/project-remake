(function(){
  function ensureContainer() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  function createToast(type, title, message) {
    const container = ensureContainer();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';

    toast.innerHTML = `\n    <i class="fa-solid ${icon} toast-icon"></i>\n    <div>\n      <div class="toast-title">${title}</div>\n      <div class="toast-msg">${message}</div>\n    </div>\n  `;
    container.appendChild(toast);

    // trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // remove after timeout
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  window.createToast = createToast;
  window.showSuccess = (msg) => createToast('success', 'Thành công!', msg);
  window.showError = (msg) => createToast('error', 'Thất bại!', msg);
})();
