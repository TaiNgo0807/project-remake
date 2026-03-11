const db = require("../models/db.js"); // File kết nối mysql2 của ông

exports.searchStores = async (req, res) => {
  try {
    // Lấy thông tin từ query URL
    const { name, province, district } = req.query;

    let query = "SELECT * FROM stores WHERE 1=1";
    let params = [];

    if (name) {
      query += " AND name LIKE ?";
      params.push(`%${name}%`);
    }
    if (province) {
      query += " AND province = ?";
      params.push(province);
    }
    if (district) {
      query += " AND district = ?";
      params.push(district);
    }

    const [rows] = await db.execute(query, params);
    res.json(rows); // Trả data về cho frontend dạng JSON
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server rùi bà con ơi!" });
  }
};
