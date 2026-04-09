const slider = document.querySelector(".slider");
const API_BASE = `${apiUrl}/api/v1`;

fetch(`${API_BASE}/banners`)
  .then((response) => response.json())
  .then((banners) => {
    if (banners.length === 0) {
      slider.innerHTML = "<p>No banners available.</p>";
    } else {
      banners.forEach((banner) => {
        slider.innerHTML += `<div class="slide-item active">
          <img class="slide-img" src="${banner.image}" alt="${banner.alt}" />
        </div>`;
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching banners:", error);
    slider.innerHTML = "<p>Error loading banners.</p>";
  });
