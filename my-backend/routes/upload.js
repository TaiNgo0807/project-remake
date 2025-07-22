const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// Cấu hình multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Route upload ảnh, không cần kiểm tra quyền admin ở đây (nếu là dashboard private)
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const fileUrl = `http://localhost:6969/uploads/${req.file.filename}`;
  res.json({ image_url: fileUrl });
});

module.exports = router;
