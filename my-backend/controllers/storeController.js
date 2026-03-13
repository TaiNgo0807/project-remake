const db = require("../models/db.js"); // File kết nối mysql2

exports.searchStores = async (req, res) => {
  try {
    // SỬA CHỖ NÀY: Lụm thêm thằng page ra, cho nó mặc định là 1
    const { name, province, district, page = 1 } = req.query;

    let query = "SELECT * FROM stores WHERE 1=1";

    const limit = 21;
    // Bây giờ thì nó mới biết page là cái gì để tính toán nè
    const offset = (Number(page) - 1) * limit;
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

    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server rùi bà con ơi!" });
  }
};
