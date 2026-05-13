const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// Cấu hình tài khoản (M lấy mấy cái này trên Dashboard Cloudinary nhé)
cloudinary.config({
  cloud_name: "diik19fmn",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nong_nghiep_viet_sang", // Tên thư mục trên Cloudinary cho dễ quản lý
    allowed_formats: ["jpg", "png", "jpeg", "webp"], // Chỉ cho phép mấy loại này
    transformation: [{ width: 1200, crop: "limit" }], // Tự động resize nếu ảnh quá to
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
