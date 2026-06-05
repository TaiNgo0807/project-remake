(function () {
  if (window.__loadingInitialized) return;
  window.__loadingInitialized = true;

  // inject stylesheet
  try {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/loading.css";
    document.head.appendChild(link);
  } catch (e) {
    // ignore
  }

  // create overlay
  const overlay = document.createElement("div");
  overlay.id = "global-loading-overlay";
  overlay.innerHTML = `
    <div class="loading-box">
      <div>
        <div class="spinner"></div>
        <div class="loading-message">Vui lòng đợi...</div>
      </div>
    </div>
  `;
  document.body && document.body.appendChild(overlay);

  let count = 0;

  function showLoading() {
    count = Math.max(0, count) + 1;
    overlay.style.display = "flex";
  }

  function hideLoading() {
    count = Math.max(0, count - 1);
    if (count <= 0) {
      count = 0;
      overlay.style.display = "none";
    }
  }

  async function withLoading(fn) {
    showLoading();
    try {
      return await fn();
    } finally {
      hideLoading();
    }
  }

  window.showLoading = showLoading;
  window.hideLoading = hideLoading;
  window.withLoading = withLoading;
})();
