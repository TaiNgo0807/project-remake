const apiUrl = "http://localhost:6969";
const API_BASE = `${apiUrl}/api/v1`;

// Use global toast helpers (toast.js). Fallback to window.alert
const showSuccess = (msg) =>
  window.showSuccess ? window.showSuccess(msg) : alert(msg);
const showError = (msg) =>
  window.showError ? window.showError(msg) : alert(msg);
function openTab(tabId) {
  document
    .querySelectorAll(".tab-pane")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  // Cập nhật trạng thái active cho menu (xử lý luôn cả việc click từ nút ngoài sidebar)
  const targetBtn = document.querySelector(
    `.tab-btn[onclick="openTab('${tabId}')"]`,
  );
  if (targetBtn) targetBtn.classList.add("active");
}

const canvas = document.getElementById("editor-canvas");
const placeholder = document.getElementById("placeholder-text");
function addBlock(type) {
  if (placeholder) placeholder.style.display = "none";

  const wrapper = document.createElement("div");
  wrapper.className = "content-block";
  wrapper.dataset.type = type;

  let el;

  if (type === "heading") {
    el = document.createElement("input");
    el.placeholder = "Nhập tiêu đề chính...";
  } else if (type === "decs") {
    el = document.createElement("input");
    el.placeholder = "Nhập chú thích cho hình ảnh...";
  } else if (type === "para") {
    el = document.createElement("textarea");
    el.placeholder = "Nhập nội dung văn bản...";
  } else if (type === "list") {
    el = document.createElement("textarea");
    el.placeholder = "Mỗi dòng là 1 dấu chấm...";
  } else if (type === "image") {
    el = document.createElement("input");
    el.type = "file";
    el.accept = "image/*";
  }

  el.className = "block-input";
  wrapper.appendChild(el);
  canvas.appendChild(wrapper);

  if (type !== "image") el.focus();
}
function buildContent() {
  let content = "";

  canvas.querySelectorAll(".content-block").forEach((block) => {
    const type = block.dataset.type;
    const input = block.querySelector(".block-input");

    if (!input) return;

    const value = escapeHtml(input.value.trim());

    if (!value && input.type !== "file") return;

    switch (type) {
      case "heading":
        content += `<h2 class="blog-heading">${value}</h2>`;
        break;

      case "decs":
        content += `<p class="blog-decs">${value}</p>`;
        break;

      case "para":
        content += `<p class="blog-para">${value}</p>`;
        break;

      case "list":
        const items = value
          .split("\n")
          .filter((item) => item.trim() !== "")
          .map((item) => `<li>${item}</li>`)
          .join("");

        content += `<ul class="blog-list">${items}</ul>`;
        break;
    }
  });

  return content;
}

async function uploadImages(container = document) {
  try {
    const formData = new FormData();

    let hasImage = false;

    const inputs = container.querySelectorAll('input[type="file"]');

    inputs.forEach((input) => {
      Array.from(input.files).forEach((file) => {
        formData.append("image", file);
        hasImage = true;
      });
    });

    // không có ảnh
    if (!hasImage) {
      return [];
    }

    const response = await apiFetch(`${API_BASE}/admin/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Tải ảnh thất bại!");
    }

    return data.imageUrls || [];
  } catch (error) {
    console.error("Upload image error:", error);

    alert(error.message);

    return [];
  }
}

// Hàm submitBlog giữ nguyên như cũ, tui viết lại cho ông dễ nhìn
async function submitBlog({
  title,
  topic,
  author,
  imageUrls,
  shortDesc,
  content,
}) {
  const res = await apiFetch(`${API_BASE}/admin/blog`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      topic,
      author,
      image_url: imageUrls[0] || "", // Lấy ảnh đầu tiên làm ảnh đại diện
      short_description: shortDesc,
      content,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Đăng bài thất bại");
  }
}

document.addEventListener("submit", (e) => {
  e.preventDefault();
});

document
  .getElementById("save-post-btn")
  .addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const content = buildContent();

      const blogTitle = document.getElementById("blog-title").value;
      const topic = document.getElementById("topic").value;
      const author = document.getElementById("author").value;
      const shortDesc = document.getElementById("short-description").value;

      // upload ảnh trước
      const imageUrls = await uploadImages();

      // gửi bài
      await submitBlog({
        title: blogTitle,
        topic: topic,
        author: author,
        imageUrls: imageUrls,
        shortDesc: shortDesc,
        content: content,
      });

      showSuccess("Đăng bài thành công!");
      return;
    } catch (error) {
      console.error("Lỗi:", error);
    }
  });

async function apiFetch(url, options = {}) {
  try {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (response.status === 401) {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        localStorage.setItem("token", data.accessToken);

        response = await fetch(url, {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${data.accessToken}`,
          },
        });
      } else {
        console.log("TOKEN DIE");
        window.location.href = "login.html";
        return null;
      }
    }

    return response;
  } catch (err) {
    console.error("FETCH ERROR:", err);
    return null; // ❗ chặn crash
  }
}

// --- Admin backend integration ---

const token = localStorage.getItem("token");

async function fetchUserActivity() {
  try {
    const response = await apiFetch(`${API_BASE}/admin/activity`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Lỗi khi lấy hoạt động người dùng:", response.statusText);
      throw new Error("Không thể lấy hoạt động người dùng");
    }
    const data = await response.json();
    const activityList = document.getElementById("activity-list");
    activityList.innerHTML = "";
    data.forEach((activity) => {
      const li = document.createElement("li");
      li.textContent = `${activity.activity} (Nhân viên: ${activity.display_name}, Thời gian: ${new Date(activity.created_at).toLocaleString()})`;
      activityList.appendChild(li);
    });
  } catch (error) {
    console.error("Lỗi khi lấy hoạt động người dùng:", error);
    showError("Không thể lấy hoạt động người dùng");
  }
}

async function setActivity(activity) {
  if (!activity) return;

  try {
    const response = await apiFetch(`${API_BASE}/admin/activity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ activity }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Ghi activity thất bại");
    }
  } catch (error) {
    console.error("Lỗi activity:", error);
  }
}

async function postJob() {
  const title = document.getElementById("job-title").value;
  const salary = document.getElementById("job-salary").value;
  const deadline = document.getElementById("job-deadline").value;
  const location = document.getElementById("job-location").value;
  const numberOfmember = document.getElementById("job-number").value;
  const description = document.getElementById("job-description").value;

  if (
    !title ||
    !salary ||
    !deadline ||
    !location ||
    !numberOfmember ||
    !description
  ) {
    showError("Vui lòng điền đầy đủ thông tin!");
    return;
  }
  try {
    const response = await apiFetch(`${API_BASE}/admin/job`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        salary,
        deadline,
        location,
        numberOfmember,
        description,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Thêm công việc thất bại");
    }
    showSuccess("Thêm công việc thành công!");
    setActivity(`Đã thêm công việc mới: ${title}`);
  } catch (error) {
    console.error("Lỗi khi thêm công việc:", error);
    showError(error.message);
  }
}

async function fetchJobs() {
  try {
    const response = await apiFetch(`${API_BASE}/jobs`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      console.error("Lỗi khi lấy công việc:", response.statusText);
      throw new Error("Không thể lấy công việc");
    }
    const data = await response.json();
    const jobList = document.getElementById("jobs-list");
    jobList.innerHTML = "";
    data.forEach((job) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${job.title}</td>
        <td>${job.location}</td>
        <td>${new Date(job.deadline).toLocaleDateString()}</td>
        <td>${job.salary}</td>
        <td>${job.number_of_members}</td>
        <td>${job.description}</td>
        <td>
          <button class="btn-sm" style="background: var(--red);" onclick="deleteJob(${job.id})">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      `;
      jobList.appendChild(tr);
    });
  } catch (error) {
    console.error("Lỗi khi lấy công việc:", error);
    showError("Không thể lấy công việc");
  }
}

async function deleteJob(id) {
  try {
    const res = await apiFetch(`${API_BASE}/admin/job/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      showError("Không thể xóa job!");
      return;
    }
    const data = await res.json();
    showSuccess("Xóa công việc thành công!");
    location.reload();
  } catch (error) {
    showError("Xảy ra lỗi khi xóa bài tuyển dụng");
    console.error(error);
  }
}

let currentPage = 1;
let isLoading = false;
let hasMore = true;
const limit = 5;

const loadingEl = document.getElementById("loading");
const endMessageEl = document.getElementById("end-message");
const productList = document.getElementById("products-list");

async function fetchProducts(page) {
  if (isLoading || !hasMore) return;

  isLoading = true;
  if (loadingEl) loadingEl.style.display = "block";

  try {
    const response = await apiFetch(
      `${API_BASE}/admin/products?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      throw new Error("Không thể lấy sản phẩm");
    }

    const { data, total } = await response.json();

    data.forEach((product) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.summary}</td>
        <td>${product.description}</td>
        <td><img src="${product.image_url}" alt="${product.name}" style="width: 100px;"></td>
        <td>
          <button class="btn-sm" onclick="editProduct(${product.id})">
            <i class="fa-solid fa-edit"></i> Sửa
          </button>
          <button class="btn-sm" style="background: var(--red);" onclick="deleteProduct(${product.id})">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      `;
      productList.appendChild(tr);
    });

    // 4. Check đúng tên biến productList
    if (productList.children.length >= total) {
      hasMore = false;
      if (endMessageEl) endMessageEl.style.display = "block";
    }
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);
    // showError("Không thể lấy sản phẩm");
  } finally {
    isLoading = false;
    if (loadingEl) loadingEl.style.display = "none";
  }
}

async function deleteProduct(id) {
  try {
    const res = await apiFetch(`${API_BASE}/admin/product/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      showError("Không thể xóa sản phẩm!");
      return;
    }
    const data = await res.json();
    showSuccess("Xóa sản phẩm thành công!");
    location.reload();
  } catch (error) {
    showError("Xảy ra lỗi khi xóa sản phẩm");
    console.error(error);
  }
}

function validateDescription(text) {
  const requiredSections = ["Thành phần:", "Công dụng:", "Hướng dẫn sử dụng:"];

  for (const section of requiredSections) {
    if (!text.includes(section)) {
      return `Thiếu mục "${section}"`;
    }
  }

  return null;
}

function formatDescription(rawText) {
  // chống inject html
  const text = escapeHtml(rawText);

  const lines = text.split("\n");

  let html = "";
  let inList = false;

  lines.forEach((line) => {
    line = line.trim();

    // title
    if (
      line === "Thành phần:" ||
      line === "Công dụng:" ||
      line === "Hướng dẫn sử dụng:"
    ) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `<span class="desc-title">${line}</span><br>`;
    }

    // bullet
    else if (line.startsWith("- ")) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }

      html += `<li>${line.substring(2)}</li>`;
    }

    // text thường
    else if (line !== "") {
      if (inList) {
        html += "</ul>";
        inList = false;
      }

      html += `${line}<br>`;
    }
  });

  if (inList) {
    html += "</ul>";
  }

  return html;
}

const descriptionTemplate = `Thành phần:

Công dụng:

- 

- 

Hướng dẫn sử dụng:

- 

- `;

document.getElementById("edit-description").value = descriptionTemplate;

async function editProduct(id) {
  try {
    // lấy data sản phẩm
    const response = await apiFetch(`${API_BASE}/admin/product/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Không thể lấy sản phẩm");
    }

    const product = await response.json();

    // mở modal
    document.getElementById("editModal").classList.add("show");

    // đổ data vào form
    document.getElementById("edit-id").value = product.id;

    document.getElementById("edit-name").value = product.name;

    document.getElementById("edit-category").value = product.category;

    document.getElementById("edit-summary").value = product.summary;

    document.getElementById("edit-description").value = product.description;

    document.getElementById("edit-preview").src = product.image_url;

    // reset input file
    document.getElementById("edit-image").value = "";
  } catch (error) {
    console.error(error);

    alert("Lỗi khi lấy sản phẩm!");
  }
}

//SUBMIT update
document
  .getElementById("edit-product-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    try {
      const id = document.getElementById("edit-id").value;
      const rawDescription = document.getElementById("edit-description").value;

      // Validate y hệt như cũ
      const error = validateDescription(rawDescription);
      if (error) return alert(error);

      const formattedDescription = formatDescription(rawDescription);
      const imageUrls = await uploadImages(this);

      const payload = {
        name: document.getElementById("edit-name").value,
        category: document.getElementById("edit-category").value,
        summary: document.getElementById("edit-summary").value,
        description: formattedDescription,
      };

      // Xác định URL và Method dựa trên việc có ID hay không
      let url = `${API_BASE}/admin/product`;
      let method = "POST";

      if (id) {
        // Nếu có ID -> Đang ở chế độ Sửa
        url += `/${id}`;
        method = "PUT";
      }

      // Nếu thêm mới mà có ảnh, hoặc sửa mà đổi ảnh
      if (imageUrls.length > 0) {
        payload.image_url = imageUrls[0];
      } else if (method === "POST") {
        // Thêm mới mà quên chọn ảnh thì nhắc nhẹ cái nè
        return alert("Vui lòng chọn ảnh cho sản phẩm mới!");
      }

      const response = await apiFetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(id ? "Cập nhật thành công!" : "Thêm sản phẩm thành công!");

      closeEditModal();
      // Refresh danh sách
      productList.innerHTML = "";
      currentPage = 1;
      fetchProducts(currentPage);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  });
function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
}
function openAddModal() {
  // Reset form về trống
  document.getElementById("edit-product-form").reset();

  // Đổ template vào phần mô tả cho user dễ điền
  document.getElementById("edit-description").value = descriptionTemplate;

  // Xóa ảnh preview cũ (nếu có)
  document.getElementById("edit-preview").src = "";

  // Đổi tiêu đề modal (nếu cần) và hiển thị
  document.getElementById("editModal").classList.add("show");

  // Đặt id về rỗng để phân biệt với lúc Edit
  document.getElementById("edit-id").value = "";
}

//load product
window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    if (!isLoading && hasMore) {
      currentPage++;
      fetchProducts(currentPage); // 5. Gọi đúng tên hàm
    }
  }
});
fetchProducts(currentPage);

async function fetchPosts() {
  try {
    const response = await apiFetch(`${API_BASE}/blogs`, {
      method: "GET",
    });
    if (!response.ok) {
      console.error("Lỗi khi lấy bài viết:", response.statusText);
      throw new Error("Không thể lấy bài viết");
    }
    const data = await response.json();
    const postList = document.getElementById("posts-list");
    postList.innerHTML = "";
    data.data.forEach((post) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${post.id}</td>
        <td>${post.title}</td>
        <td>${post.topic}</td>
        <td>${post.author}</td>
        <td>
          <button class="btn-sm" onclick="editPost(${post.id})">
            <i class="fa-solid fa-edit"></i> Sửa
          </button>
          <button class="btn-sm" style="background: var(--red);" onclick="deletePost(${post.id})">
            <i class="fa-solid fa-trash"></i> Xóa
          </button>
        </td>
      `;
      postList.appendChild(tr);
    });
  } catch (error) {
    console.error("Lỗi khi lấy bài viết:", error);
    showError("Không thể lấy bài viết");
  }
}

async function deletePost(id) {
  try {
    const res = await apiFetch(`${API_BASE}/admin/blog/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      showError(data.message || "Không thể xóa bài viết");
      return;
    }
    const data = await res.json();
    showSuccess("Xóa bài viết thành công!");
    return data;
  } catch (error) {
    showError("Xảy ra lỗi khi xóa bài viết");
    console.error(error);
  }
}

async function getContacts() {
  try {
    const res = await apiFetch(`${API_BASE}/admin/contacts`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error("Lỗi khi lấy contact!");
    }
    const data = await res.json();
    console.log(data);
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";

    data.forEach((contact) => {
      const tr = document.createElement("tr");

      const isServiced = Number(contact.is_serviced) === 1;

      const statusText = isServiced ? "Đã nhận" : "Chưa phục vụ";

      const buttonHtml = isServiced
        ? `
      <button 
        class="btn-sm"
        style="background: green; cursor: not-allowed; opacity: 0.7;"
        disabled
      >
        <i class="fa-solid fa-check"></i> Đã xác nhận
      </button>
    `
        : `
      <button 
        class="btn-sm"
        style="background: red;"
        onclick="serviceContact(${contact.id})"
      >
        <i class="fa-solid fa-envelope"></i> Xác nhận thông tin
      </button>
    `;

      tr.innerHTML = `
    <td>${contact.name}</td>
    <td>${contact.phone}</td>
    <td>${contact.message}</td>
    <td>${new Date(contact.created_at).toLocaleDateString()}</td>
    <td>${statusText}</td>
    <td>${buttonHtml}</td>
  `;

      contactList.appendChild(tr);
    });
  } catch (error) {
    showError("Lỗi khi lấy contact!");
    console.error(error);
  }
}

// escape HTML to avoid injecting raw user input into generated HTML
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function logout() {
  try {
    await apiFetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
  } catch (error) {
    // Lỗi mạng hay server chê token thì kệ nó, mục tiêu chính là dọn dẹp ở Client
    console.error("Lỗi khi đăng xuất ở server (nhưng không sao):", error);
  } finally {
    localStorage.removeItem("token");
    location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("post-job-btn").addEventListener("click", postJob);
  document.getElementById("logout").addEventListener("click", logout);
  fetchUserActivity();
  fetchJobs();
  fetchPosts();
  getContacts();
});
