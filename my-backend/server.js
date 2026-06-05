require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookerParser = require("cookie-parser");

const contactController = require("./controllers/contactController");

const app = express();
const ENV = process.env.NODE_ENV || "development";
const IS_PROD = ENV === "production";
const PORT = process.env.PORT || 6969;

// ---- CORS ----
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS || "http://localhost:5501,http://127.0.0.1:5501"
)
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
  }),
);

// ---- Cookie parser ----
app.use(cookerParser());

// ---- Security ----
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        scriptSrc: [
          "'self'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
        ],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
          "https://unpkg.com",
          "https://fonts.googleapis.com",
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com",
        ],

        imgSrc: ["'self'", "data:", "blob:", "https:"],

        connectSrc: [
          "'self'",
          "http://localhost:6969",
          "https://project-remake.onrender.com",
          "https://www.ctyvietsang.com",
        ],
      },
    },

    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);
//upload
app.use("/uploads", express.static("uploads"));

// ---- Body parsing ----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Logging ----
app.use(morgan(IS_PROD ? "combined" : "dev"));

// ---- Rate limit (contact + upload) ----
app.use("/api/v1/contact", rateLimit({ windowMs: 5 * 60 * 1000, max: 30 }));

// ---- Health ----
app.get("/health", (_req, res) =>
  res.json({ ok: true, uptime: process.uptime() }),
);
const frontendPath = path.join(__dirname, "../frontend");

// Redirect URL cũ sang URL mới
app.get("/trang-chu.html", (req, res) => {
  res.redirect(301, "/trang-chu");
});

app.get("/product.html", (req, res) => {
  res.redirect(301, "/san-pham");
});

app.get("/blog.html", (req, res) => {
  res.redirect(301, "/bai-viet-ky-thuat");
});

app.get("/about.html", (req, res) => {
  res.redirect(301, "/gioi-thieu");
});

app.get("/activities.html", (req, res) => {
  res.redirect(301, "/hoat-dong");
});

app.get("/recruitment.html", (req, res) => {
  res.redirect(301, "/tuyen-dung");
});

app.get("/store.html", (req, res) => {
  res.redirect(301, "/dai-ly");
});

app.get("/detail.html", (req, res) => {
  const id = req.query.id;

  if (id) {
    return res.redirect(301, `/san-pham/${id}`);
  }

  res.redirect(301, "/san-pham");
});

// Cho phép load css, js, images trong frontend
app.use(express.static(frontendPath));

// Route URL đẹp
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/trang-chu", (req, res) => {
  res.sendFile(path.join(frontendPath, "trang-chu.html"));
});

app.get("/san-pham", (req, res) => {
  res.sendFile(path.join(frontendPath, "product.html"));
});

app.get("/bai-viet-ky-thuat", (req, res) => {
  res.sendFile(path.join(frontendPath, "blog.html"));
});

app.get("/gioi-thieu", (req, res) => {
  res.sendFile(path.join(frontendPath, "about.html"));
});

app.get("/hoat-dong", (req, res) => {
  res.sendFile(path.join(frontendPath, "activities.html"));
});

app.get("/tuyen-dung", (req, res) => {
  res.sendFile(path.join(frontendPath, "recruitment.html"));
});

app.get("/san-pham/:id", (req, res) => {
  res.sendFile(path.join(frontendPath, "detail.html"));
});

app.get("/dai-ly", (req, res) => {
  res.sendFile(path.join(frontendPath, "store.html"));
});
const productsRouter = require("./routes/products");
app.use("/api/v1/products", productsRouter);

//blog routes
const blogRouter = require("./routes/blog");
app.use("/api/v1", blogRouter);

//store routes
const storeRouter = require("./routes/storeRouter");
app.use("/api/v1/stores", storeRouter);

// banner routes
const bannerRouter = require("./routes/bannerRouter");
app.use("/api/v1/banners", bannerRouter);

// recruitment routes
const recruitmentRouter = require("./routes/recruitmentRouter");
app.use("/api/v1", recruitmentRouter);

// auth routes
const authRouter = require("./routes/authRouter");
app.use("/api/v1/auth", authRouter);

// admin routes
const adminRouter = require("./routes/adminRouter");
app.use("/api/v1/admin", adminRouter);

//news
const newsRouter = require("./routes/activitiesRouter");
const { error } = require("console");
app.use("/api/v1", newsRouter);

// ---- Contact ----

app.post("/api/v1/contact", contactController.submitContact);

app.get("/api", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend server is running!",
  });
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// ---- Error handler ----
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error("[Error]", err);
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (${ENV})`);
});
