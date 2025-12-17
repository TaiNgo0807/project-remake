const db = require("../models/db");

/**
 * GET /api/v1/products
 * Public: list products with pagination, optional search and category filter
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 21, 1);
    const offset = (page - 1) * limit;

    let whereSql = "WHERE is_active = 1";
    const params = [];

    if (req.query.search) {
      whereSql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    if (req.query.category && req.query.category !== "all") {
      whereSql += " AND category = ?";
      params.push(req.query.category);
    }

    // 1️⃣ Lấy danh sách sản phẩm
    const dataSql = `
      SELECT id, name, category, description, summary, image_url, created_at
      FROM products
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    // 2️⃣ Lấy tổng số sản phẩm
    const countSql = `
      SELECT COUNT(*) AS total
      FROM products
      ${whereSql}
    `;
    const [[{ total }]] = await db.query(countSql, params);

    res.set("Cache-Control", "no-store");
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
      `
      SELECT id, name, category, description, summary,  image_url, created_at
      FROM products
      WHERE id = ? AND is_active = 1
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.set("Cache-Control", "no-store");
    res.json(rows[0]);
  } catch (err) {
    console.error("[getProductById]", err);
    next(err);
  }
};
