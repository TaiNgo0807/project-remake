// ===== GLOBAL LOADING =====
function showLoading() {
  const el = document.getElementById("global-loading");
  if (el) el.style.display = "flex";
}

function hideLoading() {
  const el = document.getElementById("global-loading");
  if (el) el.style.display = "none";
}

// ===== INIT HEADER + MENU + AOS =====
document.addEventListener("DOMContentLoaded", () => {
  AOS.init();

  const header = document.getElementById("header");
  const btn = document.getElementById("hamburger-btn");
  const menu = document.getElementById("nav-menu");

  window.addEventListener("scroll", () => {
    header?.classList.toggle("scrolled", window.scrollY > 50);
  });

  btn?.addEventListener("click", () => {
    btn.classList.toggle("open");
    menu?.classList.toggle("show");
  });

  const links = document.querySelectorAll("#nav-menu a");
  const currentPath = window.location.pathname;
  links.forEach((link) => {
    if (new URL(link.href).pathname === currentPath) {
      link.parentElement.classList.add("active");
    }
  });
});

// ===== ALERT =====
document.addEventListener("DOMContentLoaded", () => {
  alert(
    "Website đang trong quá trình chạy thử nghiệm. Mọi thông tin chỉ mang tính tham khảo.",
  );
});

// ===== BLOG LIST + SEARCH =====
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("blog-container");
  if (!container) return;

  const API_BASE = `${apiUrl}/api/v1`;

  async function loadBlogs() {
    showLoading();
    await new Promise((r) => setTimeout(r, 50));

    try {
      const searchInput = document.getElementById("search");
      const search = searchInput ? searchInput.value : "";

      const res = await fetch(
        `${API_BASE}/blogs?search=${encodeURIComponent(search)}&page=1&limit=21`,
      );
      const { data } = await res.json();

      container.innerHTML = "";
      if (!data.length) {
        container.innerHTML = "<p>Không tìm thấy bài viết phù hợp.</p>";
        return;
      }

      data.forEach((blog) => {
        container.innerHTML += `
          <div class="blog-card">
            <img src="${blog.image_url}" />
            <h3 class="blog-title">${blog.title}</h3>
            <p class="blog-excerpt">${blog.short_description}</p>
            <a href="/blog-detail.html?id=${blog.id}" class="read-more">Xem chi tiết</a>
          </div>
        `;
      });
    } catch {
      container.innerHTML = "<p>Lỗi tải blog.</p>";
    } finally {
      hideLoading();
    }
  }

  loadBlogs();

  let timeout;
  document.getElementById("search")?.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(loadBlogs, 300);
  });
});

// ===== BLOG DETAIL =====
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("blog-detail.html")) return;

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const API_BASE = `${apiUrl}/api/v1`;

  showLoading();

  fetch(`${API_BASE}/blogs/${id}`)
    .then((res) => res.json())
    .then((blog) => {
      document.querySelector(".blog-title").innerText = blog.title;
      document.querySelector(".author").innerText = blog.author;
      document.querySelector(".date").innerText = new Date(
        blog.created_at,
      ).toLocaleDateString("vi-VN");
      document.querySelector(".content").innerHTML = blog.content;
    })
    .finally(hideLoading);
});

// ===== PRODUCT LIST (INDEX + PRODUCT PAGE) =====
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".product-container");
  if (!container) return;

  const API_BASE = `${apiUrl}/api/v1`;

  function renderProductCard(product) {
    container.insertAdjacentHTML(
      "beforeend",
      `
      <div class="product-card">
        <a href="detail.html?id=${product.id}" class="product-link">
          <div class="product-img">
            <img src="${product.image_url}" alt="${product.name}" />
          </div>
          <div class="product-information">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.summary}</p>
            <p class="product-category">Loại: ${product.category || "Chưa phân loại"}</p>
          </div>
        </a>
        <a href="detail.html?id=${product.id}" class="product-btn">Xem chi tiết</a>
      </div>
      `,
    );
  }

  function fetchProducts(url) {
    showLoading();
    fetch(url)
      .then((res) => res.json())
      .then(({ data }) => {
        container.innerHTML = "";
        data.forEach(renderProductCard);
      })
      .finally(hideLoading);
  }

  if (document.body.classList.contains("index-page")) {
    fetchProducts(`${API_BASE}/products?page=1&limit=3`);
  }

  if (document.body.classList.contains("product-page")) {
    fetchProducts(`${API_BASE}/products?page=1&limit=21`);
  }
});

// ===== PRODUCT DETAIL =====
document.addEventListener("DOMContentLoaded", () => {
  if (!window.location.pathname.includes("detail.html")) return;

  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const API_BASE = `${apiUrl}/api/v1`;

  showLoading();

  fetch(`${API_BASE}/products/${id}`)
    .then((res) => res.json())
    .then((product) => {
      document.querySelector(".detail-img").innerHTML =
        `<img src="${product.image_url}" alt="${product.name}" />`;
      document.querySelector(".product-summary").innerHTML =
        `<p style="font-size:1.4rem">${product.summary}</p>`;
      document.querySelector(".detail-bottom").innerHTML =
        `<h3>${product.name}</h3><p>${product.description}</p>`;
    })
    .finally(hideLoading);
});

// ===== CONTACT FORM =====
document.addEventListener("DOMContentLoaded", () => {
  const submitBtn = document.querySelector(".submit-form");
  if (!submitBtn) return;

  const API_BASE = `${apiUrl}/api/v1`;

  submitBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const inputs = document.querySelectorAll(".input-info-client");
    const [name, phone, mail, message] = Array.from(inputs).map((i) =>
      i.value.trim(),
    );

    if (!name || !phone) {
      alert("Vui lòng điền đầy đủ tên và số điện thoại");
      return;
    }

    showLoading();

    fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, mail, message }),
    })
      .then((res) => res.json())
      .then((res) => {
        alert(res.ok ? "Gửi thành công!" : "Gửi thất bại");
        if (res.ok) location.reload();
      })
      .catch(() => alert("Gửi thất bại. Vui lòng thử lại."))
      .finally(hideLoading);
  });
});
// ===== ADDITIONAL FIXES BASED ON RECENT EDITS =====
// None needed at this time.
