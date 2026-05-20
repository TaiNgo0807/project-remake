const db = require("../models/db.js");

exports.getAllPostActivities = async (req, res) => {
  try {
    const [results] = await db.execute(
      "SELECT title, date, content, image_urls FROM news WHERE is_published = 1 ORDER BY date DESC",
    );
    return res.status(200).json(results);
  } catch (error) {
    console.error("Lỗi khi lấy hoạt động thực tế:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};
