const slider = document.querySelector(".slider");

const API_BASE = `${apiUrl}/api/v1`;

async function safeFetch(url, options) {
  if (window.withLoading) {
    return window.withLoading(() => fetch(url, options));
  }

  if (window.showLoading) window.showLoading();

  try {
    return await fetch(url, options);
  } finally {
    if (window.hideLoading) window.hideLoading();
  }
}

safeFetch(`${API_BASE}/banners`)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Mạng mẽo chán quá!");
    }

    return response.json();
  })
  .then((banners) => {
    if (!Array.isArray(banners) || banners.length === 0) {
      slider.innerHTML = "<p>Chưa có banner nào cả.</p>";
      return;
    }

    let slidesHtml = "";
    let dotsHtml = "";

    banners.forEach((banner, i) => {
      const activeClass = i === 0 ? "active" : "";

      if (i === 0) {
        // chỉ load ảnh đầu tiên
        slidesHtml += `
          <div class="slide-item ${activeClass}">
            <img
              class="slide-img"
              src="${banner.image}"
              fetchpriority="high"
              decoding="async"
              alt="${banner.alt || "Banner"}"
            >
          </div>
        `;
      } else {
        // các ảnh còn lại chỉ lưu data-src
        slidesHtml += `
          <div class="slide-item ${activeClass}">
            <img
              class="slide-img"
              data-src="${banner.image}"
              loading="lazy"
              decoding="async"
              alt="${banner.alt || "Banner"}"
            >
          </div>
        `;
      }

      dotsHtml += `
        <span class="dot ${activeClass}" data-index="${i}"></span>
      `;
    });

    slider.innerHTML = `
      ${slidesHtml}
      <div class="slider-dots">
        ${dotsHtml}
      </div>
    `;

    const slideItems = slider.querySelectorAll(".slide-item");
    const dots = slider.querySelectorAll(".dot");

    let index = 0;
    let timer;

    function loadImage(slideIndex) {
      const img = slideItems[slideIndex].querySelector("img");

      if (!img.src && img.dataset.src) {
        img.src = img.dataset.src;
      }
    }

    function preloadNext(currentIndex) {
      const nextIndex = (currentIndex + 1) % slideItems.length;

      const nextImg = slideItems[nextIndex].querySelector("img");

      if (!nextImg.src && nextImg.dataset.src) {
        const preload = new Image();
        preload.src = nextImg.dataset.src;
      }
    }

    const switchSlide = (newIndex) => {
      // load ảnh mới nếu chưa load
      loadImage(newIndex);

      slideItems[index].classList.remove("active");
      dots[index].classList.remove("active");

      index = newIndex;

      slideItems[index].classList.add("active");
      dots[index].classList.add("active");

      // preload ảnh tiếp theo
      preloadNext(index);
    };

    const startAutoPlay = () => {
      timer = setInterval(() => {
        const nextIndex = (index + 1) % slideItems.length;
        switchSlide(nextIndex);
      }, 5000);
    };

    // preload ảnh thứ 2 ngay khi trang load xong
    preloadNext(0);

    if (slideItems.length > 1) {
      dots.forEach((dot, i) => {
        dot.onclick = () => {
          clearInterval(timer);
          switchSlide(i);
          startAutoPlay();
        };
      });

      startAutoPlay();
    }
  })
  .catch((error) => {
    console.error("Chi tiết lỗi:", error);
    slider.innerHTML = "<p>Lỗi tải banner!</p>";
  });
