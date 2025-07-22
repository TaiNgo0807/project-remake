// controllers/productController.js
// Stateless controller for public product endpoints

const db = require("../models/db"); // Your configured MySQL/Postgres pool

/**
 * GET /api/v1/products
 * Public: list products with pagination, optional search and category filter
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 21;
    const offset = (page - 1) * limit;

    let sql = "SELECT SQL_CALC_FOUND_ROWS * FROM products WHERE is_active = 1";
    const params = [];

    if (req.query.search) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (req.query.category && req.query.category !== "all") {
      sql += " AND category = ?";
      params.push(req.query.category);
    }

    sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    const [[{ "FOUND_ROWS()": total }]] = await db.query("SELECT FOUND_ROWS()");

    res.json({ data: rows, total, page, limit });
  } catch (err) {
    console.error("[getAllProducts]", err);
    next(err);
  }
};

/**
 * GET /api/v1/products/:id
 * Public: get single product by ID
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ? AND is_active = 1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[getProductById]", err);
    next(err);
  }
};
