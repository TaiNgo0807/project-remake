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
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  }),
);

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

// ---- Contact ----
app.post("/api/v1/contact", async (req, res, next) => {
  try {
    const { name, phone, message } = req.body || {};

    // 🔧 sửa tối thiểu: không ép message
    if (!name || !phone) {
      return res.status(400).json({
        error: "name and at least one of phone or mail required",
      });
    }

    await contactController.submitContact({ name, phone, message });
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    message: "Backend server is running!",
    endpoints: {
      health: "/health",
      recruitment: "/api/v1/recruitment",
      banners: "/api/v1/banners",
      blogs: "/api/v1/blogs",
      stores: "/api/v1/stores",
    },
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
