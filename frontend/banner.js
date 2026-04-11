const slider = document.querySelector(".slider");
const API_BASE = `${apiUrl}/api/v1`;

fetch(`${API_BASE}/banners`)
  .then((response) => {
    if (!response.ok) throw new Error("Mạng mẽo chán quá!");
    return response.json();
  })
  .then((banners) => {
    if (!Array.isArray(banners) || banners.length === 0) {
      slider.innerHTML = "<p>No banners available.</p>";
      return;
    }

    let html = "";
    banners.forEach((banner, index) => {
      const activeClass = index === 0 ? "active" : "";
      html += `
        <div class="slide-item ${activeClass}">
          <img class="slide-img" src="${banner.image}" alt="${banner.alt}" style="width:100%; object-fit: cover;" />
        </div>
      `;
    });

    slider.innerHTML = html;

    const slides = document.querySelectorAll(".slide-item");
    let currentIndex = 0;

    if (slides.length <= 1) return;

    setInterval(() => {
      slides[currentIndex].classList.remove("active");

      currentIndex = (currentIndex + 1) % slides.length;

      slides[currentIndex].classList.add("active");
    }, 3000);
  })
  .catch((error) => {
    console.error("Error loading banners:", error);
    slider.innerHTML = "<p>Error load banners.</p>";
  });
