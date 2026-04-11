const db = require("../models/db.js"); // Đường dẫn tới file cấu hình MySQL của bạn

exports.getBanners = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, image, alt FROM banners");

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching banners from DB:", error);
    // Quăng lỗi 500 nếu DB dở chứng
    res.status(500).json({ message: "Error fetching banners!" });
  }
};
