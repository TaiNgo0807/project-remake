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
    banners.forEach((banner) => {
      html += `
        <div class="slide-item">
          <img class="slide-img" src="${banner.image}" alt="${banner.alt}" />
        </div>
      `;
    });

    slider.innerHTML = html;
  })
  .catch((error) => {
    console.error("Error loading banners:", error);
    slider.innerHTML = "<p>Error loading banners.</p>";
  });
