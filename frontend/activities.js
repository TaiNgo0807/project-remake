const API_BASE = `${apiUrl}/api/v1`;

async function safeFetch(url, options) {
  if (window.withLoading) return window.withLoading(() => fetch(url, options));
  if (window.showLoading) window.showLoading();
  try {
    return await fetch(url, options);
  } finally {
    if (window.hideLoading) window.hideLoading();
  }
}

const getNews = async () => {
  try {
    const res = await safeFetch(`${API_BASE}/news`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      showError("Không tìm thấy bài hoạt động thực tế!");
      return;
    }

    const result = await res.json();
    const data = Array.isArray(result) ? result : result.data;

    const activityFeed = document.querySelector(".activity-feed");
    activityFeed.innerHTML = "";

    data.forEach((el) => {
      const images = parseImageUrls(el.image_urls);

      const card = document.createElement("div");
      card.className = "activity-card";

      card.innerHTML = `
        <h3 class="act-title">${escapeHtml(el.title)}</h3>

        <div class="act-meta">
          <span>
            <i class="fa-regular fa-clock"></i>
            ${formatDate(el.date)}
          </span>

          <span style="margin-left: 15px">
            <i class="fa-solid fa-location-dot"></i>
            An Giang
          </span>
        </div>

        <div class="act-desc">
          <p>${escapeHtml(el.content)}</p>
        </div>

        ${renderGallery(images)}
      `;

      activityFeed.appendChild(card);
    });
  } catch (error) {
    console.error("Lỗi load hoạt động:", error);
    showError("Lỗi khi tải hoạt động thực tế!");
  }
};

function parseImageUrls(imageUrls) {
  if (!imageUrls) return [];

  try {
    if (Array.isArray(imageUrls)) return imageUrls;

    const parsed = JSON.parse(imageUrls);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("image_urls sai định dạng:", imageUrls);
    return [];
  }
}

function renderGallery(images) {
  if (!images || images.length === 0) return "";

  const visibleImages = images.slice(0, 5);
  const total = images.length;
  const galleryClass = `gallery-${Math.min(total, 5)}`;

  // Lưu toàn bộ ảnh, kể cả ảnh đang bị ẩn
  const encodedImages = encodeURIComponent(JSON.stringify(images));

  return `
    <div class="act-gallery ${galleryClass}" data-images="${encodedImages}">
      ${visibleImages
        .map((url, index) => {
          const isLast = index === 4 && total > 5;

          return `
            <div class="img-wrap gi-${index + 1}" data-index="${index}">
              <img src="${url}" alt="Hình hoạt động ${index + 1}" />

              ${isLast ? `<div class="img-more">+${total - 5}</div>` : ""}
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function escapeHtml(value) {
  if (!value) return "";

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

getNews();
let currentImages = [];
let currentImageIndex = 0;

function createImageViewer() {
  if (document.getElementById("image-viewer")) return;

  const viewer = document.createElement("div");
  viewer.id = "image-viewer";

  viewer.innerHTML = `
    <div class="image-viewer-backdrop"></div>

    <button class="image-viewer-close">
      <i class="fa-solid fa-xmark"></i>
    </button>

    <button class="image-viewer-prev">
      <i class="fa-solid fa-chevron-left"></i>
    </button>

    <img class="image-viewer-img" src="" alt="Ảnh phóng to" />

    <button class="image-viewer-next">
      <i class="fa-solid fa-chevron-right"></i>
    </button>

    <div class="image-viewer-count"></div>
  `;

  document.body.appendChild(viewer);

  viewer
    .querySelector(".image-viewer-close")
    .addEventListener("click", closeImageViewer);
  viewer
    .querySelector(".image-viewer-backdrop")
    .addEventListener("click", closeImageViewer);

  viewer.querySelector(".image-viewer-prev").addEventListener("click", () => {
    showPrevImage();
  });

  viewer.querySelector(".image-viewer-next").addEventListener("click", () => {
    showNextImage();
  });

  document.addEventListener("keydown", (e) => {
    if (!viewer.classList.contains("show")) return;

    if (e.key === "Escape") closeImageViewer();
    if (e.key === "ArrowLeft") showPrevImage();
    if (e.key === "ArrowRight") showNextImage();
  });
}

function openImageViewer(images, index) {
  currentImages = images;
  currentImageIndex = index;

  createImageViewer();
  updateImageViewer();

  document.getElementById("image-viewer").classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeImageViewer() {
  const viewer = document.getElementById("image-viewer");
  if (!viewer) return;

  viewer.classList.remove("show");
  document.body.style.overflow = "";
}

function updateImageViewer() {
  const viewer = document.getElementById("image-viewer");
  if (!viewer) return;

  const img = viewer.querySelector(".image-viewer-img");
  const count = viewer.querySelector(".image-viewer-count");
  const prevBtn = viewer.querySelector(".image-viewer-prev");
  const nextBtn = viewer.querySelector(".image-viewer-next");

  img.src = currentImages[currentImageIndex];

  count.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;

  if (currentImages.length <= 1) {
    prevBtn.style.display = "none";
    nextBtn.style.display = "none";
  } else {
    prevBtn.style.display = "flex";
    nextBtn.style.display = "flex";
  }
}

function showPrevImage() {
  if (currentImages.length <= 1) return;

  currentImageIndex--;

  if (currentImageIndex < 0) {
    currentImageIndex = currentImages.length - 1;
  }

  updateImageViewer();
}

function showNextImage() {
  if (currentImages.length <= 1) return;

  currentImageIndex++;

  if (currentImageIndex >= currentImages.length) {
    currentImageIndex = 0;
  }

  updateImageViewer();
}

// Bắt sự kiện click ảnh trong activity feed
document.addEventListener("click", (e) => {
  const imgWrap = e.target.closest(".act-gallery .img-wrap");
  if (!imgWrap) return;

  const gallery = imgWrap.closest(".act-gallery");
  if (!gallery) return;

  const images = JSON.parse(decodeURIComponent(gallery.dataset.images));
  const index = Number(imgWrap.dataset.index) || 0;

  openImageViewer(images, index);
});
