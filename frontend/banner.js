const slider = document.querySelector(".slider");
const API_BASE = `${apiUrl}/api/v1`;

fetch(`${API_BASE}/banners`)
  .then((response) => {
    if (!response.ok) throw new Error("Mạng mẽo chán quá!");
    return response.json();
  })
  .then((banners) => {
    if (!Array.isArray(banners) || banners.length === 0) {
      slider.innerHTML = "<p>Không có banner nào cả!</p>";
      return;
    }

    let slidesHtml = "";
    let dotsHtml = ""; // <--- Thêm biến này để chứa các dấu chấm

    banners.forEach((banner, index) => {
      const activeClass = index === 0 ? "active" : "";

      slidesHtml += `
            <div class="slide-item ${activeClass}">
                <img class="slide-img" src="${banner.image}" alt="${banner.alt}" />
            </div>
        `;

      dotsHtml += `<span class="dot ${activeClass}" data-index="${index}"></span>`;
    });

    slider.innerHTML = slidesHtml;

    const dotsContainer = document.querySelector(".slider-dots");
    if (dotsContainer) {
      dotsContainer.innerHTML = dotsHtml;
    }

    initSlider();
  })
  .catch((error) => {
    console.error("Error loading banners:", error);
    slider.innerHTML = "<p>Error load banners.</p>";
  });
