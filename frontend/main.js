document.addEventListener("DOMContentLoaded", () => {
  // Khởi chạy AOS
  AOS.init();

  // Lấy element header và menu
  const header = document.getElementById("header");
  const btn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("nav-menu");

  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 50);
  });

  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    menu.classList.toggle("show");
  });

  // Highlight menu active
  const links = document.querySelectorAll("#nav-menu a");
  const currentPath = window.location.pathname;
  links.forEach((link) => {
    if (new URL(link.href).pathname === currentPath) {
      link.parentElement.classList.add("active");
    }
  });
});

// === Fetch products cho index.html / product.html ===
document.addEventListener("DOMContentLoaded", () => {
  const productListContainer = document.querySelector(".product-container");
  if (!productListContainer) return;

  const API_BASE = `${apiUrl}/api/v1`;

  // Nếu index page, chỉ show 3 sp đầu
  if (document.body.classList.contains("index-page")) {
    fetch(`${API_BASE}/products?page=1&limit=3`)
      .then((res) => res.json())
      .then(({ data }) => {
        data.forEach(renderProductCard);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }
  // Nếu product page thì render full và paging
  else {
    // Paging controls
    let currentPage = 1;
    const limit = 21;
    const pageInfo = document.getElementById("pageInfo");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const searchBtn = document.getElementById("searchBtn");

    function fetchAndRender(page = 1) {
      let url = new URL(`${API_BASE}/products`);
      url.searchParams.set("page", page);
      url.searchParams.set("limit", limit);
      if (searchInput && searchInput.value.trim()) {
        url.searchParams.set("search", searchInput.value.trim());
      }
      if (categoryFilter && categoryFilter.value !== "all") {
        url.searchParams.set("category", categoryFilter.value);
      }

      fetch(url.toString())
        .then((res) => res.json())
        .then(({ data, total }) => {
          productListContainer.innerHTML = "";
          if (!data.length) {
            productListContainer.innerHTML =
              "<p style='color:red; text-align:center;'>Không tìm thấy sản phẩm phù hợp.</p>";
            pageInfo.textContent = "";
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
          }
          data.forEach(renderProductCard);
          const totalPages = Math.ceil(total / limit);
          pageInfo.textContent = `Trang ${page} / ${totalPages} (${total} sp)`;
          prevPageBtn.disabled = page <= 1;
          nextPageBtn.disabled = page >= totalPages;
        })
        .catch((err) => {
          productListContainer.innerHTML = "<p>Lỗi khi tải sản phẩm.</p>";
          console.error("Error fetching products:", err);
        });
    }

    prevPageBtn?.addEventListener("click", () => {
      if (currentPage > 1) fetchAndRender(--currentPage);
    });
    nextPageBtn?.addEventListener("click", () => {
      currentPage++;
      fetchAndRender(currentPage);
    });
    searchBtn?.addEventListener("click", () => {
      currentPage = 1;
      fetchAndRender(currentPage);
    });
    categoryFilter?.addEventListener("change", () => {
      currentPage = 1;
      fetchAndRender(currentPage);
    });

    // Lần đầu load
    fetchAndRender(currentPage);
  }

  function renderProductCard(product) {
    console.log("product =", product);

    const html = `
      <div class="product-card">
        <div class="product-img">
          <img src="${product.image_url}" alt="${product.name}" />
        </div>
        <div class="product-information">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <p class="product-category">Loại: ${
            product.category || "Chưa phân loại"
          }</p>
          <a href="detail.html?id=${
            product.id
          }" class="product-btn">Xem chi tiết</a>
        </div>
      </div>
    `;
    document
      .querySelector(".product-container")
      .insertAdjacentHTML("beforeend", html);
  }
});

// === Form contact ===
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-form");
  if (!submitBtn) return;

  const API_BASE = `${apiUrl}/api/v1`;

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const inputs = document.querySelectorAll(".input-info-client");
    const [name, phone, mail, message] = Array.from(inputs).map((i) =>
      i.value.trim()
    );
    // Chọn contact ưu tiên email nếu có, ngược lại dùng phone
    const contactVal = phone;
    const API_BASE = `${apiUrl}/api/v1`;
    if (!name || !contactVal) {
      alert("Vui lòng điền đầy đủ tên và số điện thoại");
      return;
    }

    fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || null,
        mail: mail || null,
        message,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          alert("Gửi thành công!");
          location.reload();
        } else {
          alert("Gửi thất bại: " + (res.error || ""));
        }
      })
      .catch((err) => {
        console.error("Error submitting contact:", err);
        alert("Gửi thất bại. Vui lòng thử lại.");
      });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const API_BASE = `${apiUrl}/api/v1`;

  console.log("productId =", productId);

  if (!productId) {
    document.querySelector(".detail-content").innerHTML =
      "<p>Không tìm thấy sản phẩm.</p>";
    return;
  }

  fetch(`${API_BASE}/products/${productId}`)
    .then((response) => {
      console.log("API response status:", response.status);
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    })
    .then((product) => {
      console.log("Fetched product:", product);

      // Render ảnh sản phẩm
      document.querySelector(".detail-img").innerHTML = `
        <img src="${product.image_url}" alt="${product.name}" style="width:100%; max-width:600px; border-radius:8px;">
      `;

      // Render thông tin sản phẩm
      document.querySelector(".detail-content").innerHTML = `
        <h2 style="font-size:2rem; font-weight:bold; margin:10px 0;">${product.name}</h2>
        <p style="font-size:1.2rem; margin:10px 0;">${product.description}</p>
      `;

      // Render hướng dẫn sử dụng
      document.querySelector(".detail-instruction").innerHTML = `
        <h3>Hướng dẫn sử dụng</h3>
        <p>${product.instruction || "Đang cập nhật..."}</p>
      `;
    })
    .catch((err) => {
      console.error("Error fetching product:", err);
      document.querySelector(".detail-content").innerHTML =
        "<p>Không tìm thấy sản phẩm.</p>";
    });
});
