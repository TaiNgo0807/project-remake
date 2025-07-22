# 🌾 Website Doanh nghiệp Việt Sang – Backend + Frontend

## 🚀 **1. Mục tiêu dự án**

Xây dựng website giới thiệu sản phẩm và doanh nghiệp **Việt Sang**, bao gồm:

- Trang chủ, danh sách sản phẩm, chi tiết sản phẩm
- Form contact (liên hệ, câu hỏi)
- **Dashboard Admin**
  - CRUD sản phẩm (thêm, sửa, xóa)
  - Quản lý contact form

---

## ⚙️ **2. Công nghệ sử dụng**

### **Backend**

- Node.js + Express
- MySQL (XAMPP local dev hoặc VPS production)
- Multer (upload file)
- Bcrypt (hash password)
- Express-session (session-based auth)
- Helmet, CORS, CSURF (bảo mật)

### **Frontend**

- HTML, CSS, JavaScript thuần
- AOS, Bootstrap

---

## 🗃️ **3. Database schema**

### **Table: users**

| id  | username | password_hash | role | created_at | updated_at |
| --- | -------- | ------------- | ---- | ---------- | ---------- |

### **Table: products**

| id  | name | description | instruction | image_url | created_at | updated_at |
| --- | ---- | ----------- | ----------- | --------- | ---------- | ---------- |

### **Table: contacts**

| id  | name | email | phone | message | created_at |
| --- | ---- | ----- | ----- | ------- | ---------- |

---

## 🔧 **4. Cài đặt local development**

### **Bước 1. Clone project**

```bash
git clone https://github.com/yourusername/yourproject.git
cd yourproject
```
