document.addEventListener("DOMContentLoaded", () => {
  const locationData = {
    "An Giang": [
      "Châu Đốc",
      "Tân Châu",
      "Long Xuyên",
      "An Phú",
      "Châu Phú",
      "Châu Thành",
      "Chợ Mới",
      "Phú Tân",
      "Thoại Sơn",
      "Tri Tôn",
      "Tịnh Biên",
    ],
    "Đồng Tháp": [
      "Cao Lãnh",
      "Hồng Ngự",
      "Châu Thành",
      "Lai Vung",
      "Lấp Vò",
      "Tam Nông",
      "Tân Hồng",
      "Thanh Bình",
      "Tháp Mười",
    ],
    "Kiên Giang": [
      "Rạch Giá",
      "Giang Thành",
      "Giồng Riềng",
      "Gò Quao",
      "Hòn Đất",
      "Kiên Lương",
      "Tân Hiệp",
    ],
    "Sóc Trăng": [
      "Sóc Trăng",
      "Châu Thành",
      "Kế Sách",
      "Long Phú",
      "Mỹ Tú",
      "Mỹ Xuyên",
      "Ngã Năm",
      "Thạnh Trị",
    ],
    "Long An": [
      "Bến Lức",
      "Đức Hòa",
      "Đức Huệ",
      "Kiến Tường",
      "Mộc Hóa",
      "Tân Hưng",
      "Tân Thạnh",
      "Tân Trụ",
      "Thạnh Hóa",
      "Thủ Thừa",
      "Vĩnh Hưng",
    ],
    "Tiền Giang": ["Cái Bè", "Gò Công Tây", "Tân Phước"],
    "Cần Thơ": ["Cờ Đỏ", "Vĩnh Thạnh"],
    "Hậu Giang": ["Vị Thanh", "Long Mỹ", "Phụng Hiệp"],
    "Trà Vinh": ["Càng Long", "Cầu Kè", "Châu Thành", "Tiểu Cần"],
    "Hồ Chí Minh": ["Bình Chánh"],
    "Các tỉnh khác": [
      "Bà Rịa - Vũng Tàu",
      "Bình Dương",
      "Cà Mau",
      "Đắk Nông",
      "Vĩnh Long",
    ],
  };

  const provinceSelect = document.getElementById("provinceSearch");
  const districtSelect = document.getElementById("districtSearch");

  // Lắng nghe sự kiện mỗi khi người dùng đổi Tỉnh
  provinceSelect.addEventListener("change", function () {
    const selectedProvince = this.value; // Lấy tên tỉnh vừa chọn

    // Reset lại ô Huyện cho sạch sẽ trước khi đổ data mới
    districtSelect.innerHTML =
      '<option value="">-- Chọn Quận/Huyện --</option>';

    // Nếu có chọn Tỉnh và Tỉnh đó có trong từ điển của mình
    if (selectedProvince && locationData[selectedProvince]) {
      const districts = locationData[selectedProvince];

      // Vòng lặp đẻ ra các thẻ <option> cho Huyện
      districts.forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    }
  });

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
        dealerList.innerHTML = "<p>Không tìm thấy đại lý nào phù hợp.</p>";
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
