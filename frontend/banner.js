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

    let html = ""; // Khởi tạo biến html
    banners.forEach((banner, index) => {
      // Gắn class 'active' cho banner đầu tiên (index 0)
      const activeClass = index === 0 ? "active" : "";

      // Cộng dồn vào biến html, KHÔNG chọc vào slider.innerHTML ở đây
      html += `
        <div class="slide-item ${activeClass}">
          <img class="slide-img" src="${banner.image}" alt="${banner.alt}" style="width:100%;" />
        </div>
      `;
    });

    // Gom đủ đạn rồi mới bắn 1 lần vào DOM
    slider.innerHTML = html;
  })
  .catch((error) => {
    console.error("Error loading banners:", error);
    slider.innerHTML = "<p>Error load banners.</p>";
  });
