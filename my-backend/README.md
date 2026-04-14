# 🌾 Website Doanh nghiệp Việt Sang – Backend + Frontend

## 🚀 **1. Mục tiêu dự án**

Xây dựng website giới thiệu sản phẩm và doanh nghiệp **Việt Sang**, bao gồm:

- Trang chủ, danh sách sản phẩm, chi tiết sản phẩm
- Form contact (liên hệ, câu hỏi)

## ⚙️ **2. Công nghệ sử dụng**

### **Backend**

- Node.js + Express
- MySQL (XAMPP local dev hoặc Vercel + Render production)
- Multer (upload file)
- Bcrypt (hash password)
- Express-session (session-based auth)
- Helmet, CORS, CSURF (bảo mật)

### **Frontend**

- HTML, CSS, JavaScript thuần
- AOS

---

## 🗃️ **3. Database schema**

### **Table: users**

| id  | username | password_hash | role | created_at | updated_at |
| --- | -------- | ------------- | ---- | ---------- | ---------- |

### **Table: products**

| id  | name | description | summary | image_url | created_at | updated_at |
| --- | ---- | ----------- | ------- | --------- | ---------- | ---------- |

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

---

## 🧰 Backend: `my-backend`

This folder contains the Express backend serving API endpoints used by the frontend.

### Requirements

- Node.js 18+ and npm

### Install & run

```bash
cd my-backend
npm install
npm start
```

By default the server listens on port `6969` (or `PORT` env var).

### Environment

You can set these environment variables in a `.env` file at `my-backend/`:

- `NODE_ENV` — `development` or `production` (defaults to `development`)
- `PORT` — server port (defaults to `6969`)
- `CORS_ORIGINS` — comma-separated allowed origins for CORS (defaults to `http://localhost:5500,http://127.0.0.1:5500`)

### Key endpoints

- `GET /health` — health check
- `GET /` — basic server root with available endpoints
- `GET /api/v1/products` — products router (see `routes/products.js`)
- `GET /api/v1/banners` — list banners (see `routes/bannerRouter.js`)
- `GET /api/v1/stores` — store endpoints (see `routes/storeRouter.js`)
- `POST /api/v1/contact` — submit contact (body: `name`, `phone` or `mail`, optional `message`)
- Blog endpoints are mounted under `/api/v1` (see `routes/blog.js`)

### Error & 404 handling

The app returns JSON 404 responses for unknown routes:

```json
{ "error": "Not Found", "path": "/the/requested/path" }
```

### Quick test commands

From the workspace root (after starting the server):

```bash
# health
curl http://localhost:6969/health

# banners
curl http://localhost:6969/api/v1/banners

# submit contact
curl -X POST -H "Content-Type: application/json" \
  -d '{"name":"Alice","mail":"a@a.com","message":"Hello"}' \
  http://localhost:6969/api/v1/contact
```

---

If you'd like, I can also:

- add example `.env.example` and `Procfile` for deployments
- run the server here and verify the endpoints

---
