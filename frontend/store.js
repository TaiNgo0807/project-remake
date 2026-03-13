// frontend/store.js

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
  const cucMoiNhu = document.getElementById("cuc-moi-nhu");

  // Các biến kiểm soát việc cuộn trang
  let currentPage = 1;
  let isLastPage = false;
  let isLoading = false; // Chống spam API khi đang tải

  // Hàm gọi API (có thêm cờ isLoadMore để biết là cuộn thêm hay tìm mới)
  const fetchStores = async (isLoadMore = false) => {
    if (isLoading || (isLastPage && isLoadMore)) return;

    isLoading = true;
    if (isLoadMore) cucMoiNhu.style.display = "block"; // Hiện chữ đang tải

    const name = document.getElementById("nameSearch").value;
    const province = document.getElementById("provinceSearch").value;
    const district = document.getElementById("districtSearch").value;

    try {
      const queryParams = new URLSearchParams({
        name,
        province,
        district,
        page: currentPage, // Ném thêm số trang lên API
      });

      const response = await fetch(`${API_BASE}/stores/search?${queryParams}`);
      const stores = await response.json();

      // Nếu là bấm tìm kiếm mới -> xóa sạch list cũ
      if (!isLoadMore) {
        dealerList.innerHTML = "";
        isLastPage = false;
      }

      if (stores.length === 0) {
        if (!isLoadMore)
          dealerList.innerHTML = "<p>Không tìm thấy đại lý nào phù hợp.</p>";
        isLastPage = true; // Hết data rồi, nghỉ cuộn
        cucMoiNhu.style.display = "none";
        isLoading = false;
        return;
      }

      // In data ra màn hình
      stores.forEach((store) => {
        dealerList.innerHTML += `
          <div class="dealer-card">
              <h3>${store.name}</h3>
              <p>📍 ${store.address}</p>
          </div>
        `;
      });

      // Kiểm tra xem đã hết data chưa (nếu trả về ít hơn 21 cái nghĩa là cạn kho)
      if (stores.length < 21) {
        isLastPage = true;
        cucMoiNhu.style.display = "none"; // Ẩn mồi nhử
      } else {
        cucMoiNhu.style.display = "block"; // Hiện mồi nhử cho lần cuộn sau
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
      if (!isLoadMore)
        dealerList.innerHTML =
          "<p>Đường truyền đang kẹt xe, vui lòng thử lại sau!</p>";
    } finally {
      isLoading = false; // Xong việc, mở khóa cho lần tải tiếp
    }
  };

  // === THUÊ BẢO VỆ CANH ME CUỘN CHUỘT ===
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isLoading && !isLastPage) {
      currentPage++; // Tăng số trang lên
      fetchStores(true); // Gọi hàm với cờ báo là đang cuộn thêm (Load More)
    }
  });

  // Bắt đầu canh cái thẻ mồi nhử
  if (cucMoiNhu) observer.observe(cucMoiNhu);

  // Load trang đầu tiên ngay khi vào web
  fetchStores();

  // Bấm nút tìm kiếm -> Reset lại từ trang 1
  searchBtn.addEventListener("click", () => {
    currentPage = 1;
    fetchStores(false);
  });
});
