const db = require("../models/db.js");

exports.searchStores = async (req, res) => {
  try {
    const { name, province, district, page = 1 } = req.query;

    let query = "SELECT * FROM stores WHERE is_published = 1";

    const limit = 21;
    const offset = (parseInt(page) - 1) * limit;
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

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi cmnr:", error);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
