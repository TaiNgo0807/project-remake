const slider = document.querySelector(".slider");
const API_BASE = `${apiUrl}/api/v1`;

fetch(`${API_BASE}/banners`)
  .then((response) => response.json())
  .then((res) => {
    // Nếu API trả về { data: [...] } thì lấy res.data, nếu trả về thẳng mảng thì lấy res
    const bannerList = Array.isArray(res) ? res : res.data;

    if (!bannerList || bannerList.length === 0) {
      slider.innerHTML = "<p>No banners available.</p>";
    } else {
      // Clear trước khi thêm để tránh trùng lặp nếu cần
      slider.innerHTML = "";
      bannerList.forEach((banner) => {
        slider.innerHTML += `
                <div class="slide-item active">
                    <img class="slide-img" src="${banner.image}" alt="${banner.alt}" />
                </div>`;
      });
    }
  })
  .catch((error) => {
    console.error("Error fetching banners:", error);
    slider.innerHTML = "<p>Error loading banners.</p>";
  });
