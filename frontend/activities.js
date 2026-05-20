const API_BASE = `${apiUrl}/api/v1`;

const getNews = async () => {
  try {
    const res = await fetch(`${API_BASE}/news`, {
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

  return `
    <div class="act-gallery ${galleryClass}">
      ${visibleImages
        .map((url, index) => {
          const isLast = index === 4 && total > 5;

          return `
            <div class="img-wrap gi-${index + 1}">
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
