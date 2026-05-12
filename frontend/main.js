document.addEventListener("DOMContentLoaded", () => {
  function createToast(type, title, message) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const icon =
      type === "success" ? "fa-circle-check" : "fa-circle-exclamation";

    toast.innerHTML = `
    <i class="fa-solid ${icon} toast-icon"></i>
    <div>
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
  `;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2500); // Rút ngắn còn 2.5s vì ở giữa màn hình xem xong nhanh lắm
  }

  const showSuccess = (msg) => createToast("success", "Thành công!", msg);
  const showError = (msg) => createToast("error", "Thất bại!", msg);
  // Khởi chạy AOS
  AOS.init();

  // Lấy element header và menu
  const header = document.getElementById("header");
  const btn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("nav-menu");

  window.addEventListener("scroll", () => {
    header && header.classList.toggle("scrolled", window.scrollY > 50);
  });

  btn &&
    btn.addEventListener("click", () => {
      btn.classList.toggle("open");
      menu && menu.classList.toggle("show");
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

document.addEventListener("DOMContentLoaded", () => {
  async function loadBlogs() {
    const searchInput = document.getElementById("search");
    const search = searchInput ? searchInput.value : "";
    const API_BASE = `${apiUrl}/api/v1`;

    const res = await fetch(
      `${API_BASE}/blogs?search=${encodeURIComponent(search)}&page=1&limit=15`,
    );
    const result = await res.json();
    const blogs = result.data;

    const container = document.getElementById("blog-container");
    container.innerHTML = "";
    if (blogs.length === 0) {
      container.innerHTML = "<p>Không tìm thấy bài viết phù hợp.</p>";
      return;
    }

    blogs.forEach((blog) => {
      container.innerHTML += `
            <div class="blog-card">
                <img src="${blog.thumbnail}" />
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-excerpt">${blog.short_description}</p>
                <a href="/blog-detail.html?id=${blog.id}" class="read-more">Xem chi tiết</a>
            </div>
        `;
    });
  }
  async function loadBlogDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const API_BASE = `${apiUrl}/api/v1`;

    if (!id) {
      document.getElementById("content").innerHTML =
        "<p>Không tìm thấy bài viết.</p>";
      return;
    }
    const res = await fetch(`${API_BASE}/blogs/${id}`);
    const blog = await res.json();

    document.getElementsByClassName("blog-title")[0].innerText = blog.title;
    document.getElementsByClassName("author")[0].innerText = blog.author;
    document.getElementsByClassName("date")[0].innerText = new Date(
      blog.created_at,
    ).toLocaleDateString("vi-VN");

    document.getElementsByClassName("content")[0].innerHTML = blog.content;
  }
  if (document.getElementById("blog-container")) {
    loadBlogs();
    let timeout;
    document.getElementById("search").addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(loadBlogs, 300);
    });
  } else if (window.location.pathname.includes("/blog-detail.html")) {
    loadBlogDetail();
  }
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
  else if (document.body.classList.contains("product-page")) {
    let currentPage = 1;
    const limit = 15;
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

    fetchAndRender(currentPage);
  }
  function renderProductCard(product) {
    const html = `
      <div class="product-card">
        <a href="detail.html?id=${product.id}" class="product-link">
          <div class="product-img">
            <img src="${product.image_url}" alt="${product.name}" />
          </div>
          <div class="product-information">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.summary}</p>
            <p class="product-category">Loại: ${
              product.category || "Chưa phân loại"
            }</p>
          </div>
        </a>
        <a href="detail.html?id=${
          product.id
        }" class="product-btn">Xem chi tiết</a>
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
    const name = document.getElementById("name")?.value.trim() || "";
    const phone = document.getElementById("phone")?.value.trim() || "";
    const message = document.getElementById("message")?.value.trim() || "";

    if (!name || !phone) {
      showError("Vui lòng điền đầy đủ tên và số điện thoại");
      return;
    }

    fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone: phone || null,
        message,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.ok) {
          showSuccess("Gửi thành công!");
          location.reload();
        } else {
          showError("Gửi thất bại");
        }
      })
      .catch(() => {
        showError("Gửi thất bại. Vui lòng thử lại.");
      });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  const API_BASE = `${apiUrl}/api/v1`;

  if (!productId) {
    document.querySelector(".detail-content").innerHTML =
      "<p>Không tìm thấy sản phẩm.</p>";
    return;
  }

  fetch(`${API_BASE}/products/${productId}`)
    .then((response) => {
      if (!response.ok) throw new Error("Product not found");
      return response.json();
    })
    .then((product) => {
      document.querySelector(".detail-img").innerHTML = `
        <img src="${product.image_url}" alt="${product.name}" />
      `;

      document.querySelector(".product-summary").innerHTML = `
        <p style="font-size: 1.4rem">${product.summary}</p>
      `;
      document.querySelector(".detail-bottom").innerHTML = `
        <h3 class="product-name">${product.name}</h3>
        <p class="product-info">${product.description}</p>
      `;
    })
    .catch(() => {
      document.querySelector(".detail-content").innerHTML =
        "<p>Không tìm thấy sản phẩm.</p>";
    });
});
