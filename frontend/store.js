document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = `${apiUrl}/api/v1`;

  const dealerList = document.getElementById("dealerList");
  const searchBtn = document.getElementById("searchBtn");

  // Hàm gọi API và render HTML
  const fetchStores = async () => {
    const name = document.getElementById("nameSearch").value;
    const province = document.getElementById("provinceSearch").value;
    const district = document.getElementById("districtSearch").value;

    try {
      // Gom các tham số thành query string
      const queryParams = new URLSearchParams({ name, province, district });

      // Gọi API (nhớ sửa lại cho khớp đường dẫn server của ông)
      const response = await fetch(`${API_BASE}/stores/search?${queryParams}`);
      const stores = await response.json();

      // Xóa sạch cái cũ trước khi in cái mới
      dealerList.innerHTML = "";

      if (stores.length === 0) {
        dealerList.innerHTML =
          "<p>Không tìm thấy đại lý nào phù hợp. Chắc ổng đi nhậu rồi!</p>";
        return;
      }

      // In từng đại lý ra màn hình
      stores.forEach((store) => {
        // Class dealer-card ông tự viết CSS để nó thành dạng lưới (grid) cho đẹp nghen
        dealerList.innerHTML += `
                    <div class="dealer-card">
                        <h3>${store.name}</h3>
                        <p>📍 ${store.address}, ${store.district}, ${store.province}</p>
                        <p>📞 ${store.phone}</p>
                    </div>
                `;
      });
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      dealerList.innerHTML =
        "<p>Đường truyền đang kẹt xe, vui lòng thử lại sau!</p>";
    }
  };

  // Load tất cả đại lý ngay khi vừa vào web
  fetchStores();

  // Bắt sự kiện click nút tìm kiếm
  searchBtn.addEventListener("click", fetchStores);
});
