const slider = document.querySelector(".slider");
const dotsContainer = document.querySelector(".slider-dots");

const API_BASE = `${apiUrl}/api/v1`;

fetch(`${API_BASE}/banners`)
  .then((response) => {
    if (!response.ok) throw new Error("Mạng mẽo chán quá!");
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

      slidesHtml += `
        <div class="slide-item ${activeClass}">
          <img class="slide-img" src="${banner.image}" alt="${banner.alt}" style="width:100%; object-fit: cover;"/>
        </div>
      `;

      dotsHtml += `<span class="dot ${activeClass}" data-index="${i}"></span>`;
    });

    slider.innerHTML = slidesHtml;
    if (dotsContainer) {
      dotsContainer.innerHTML = dotsHtml;
    }

    const slideItems = document.querySelectorAll(".slide-item");
    const dots = document.querySelectorAll(".dot");
    let index = 0;
    let timer;

    if (slideItems.length > 1) {
      const switchSlide = (newIndex) => {
        slideItems[index].classList.remove("active");
        if (dots.length) dots[index].classList.remove("active");

        index = newIndex;

        slideItems[index].classList.add("active");
        if (dots.length) dots[index].classList.add("active");
      };

      const startAutoPlay = () => {
        timer = setInterval(() => {
          let nextIndex = (index + 1) % slideItems.length;
          switchSlide(nextIndex);
        }, 5000);
      };

      dots.forEach((dot, i) => {
        dot.style.cursor = "pointer";
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
