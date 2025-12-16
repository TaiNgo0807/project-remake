const express = require("express");
const router = express.Router();
const db = require("../models/db"); // module exporting your configured DB pool/connection

/**
 * GET /api/v1/products
 * Query params:
 *  - page (default 1)
 *  - limit (default 21)
 *  - search (optional)
 *  - category (optional, "all" to ignore)
 */
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 21;
    const offset = (page - 1) * limit;

    let sql = `
      SELECT SQL_CALC_FOUND_ROWS 
        id, name, category, description, summary, image_url 
      FROM products 
      WHERE 1=1
    `;
    const params = [];

    if (req.query.search) {
      sql += " AND (name LIKE ? OR description LIKE ?)";
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }
    if (req.query.category && req.query.category !== "all") {
      sql += " AND category = ?";
      params.push(req.query.category);
    }

    sql += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await db.query(sql, params);
    const [[{ "FOUND_ROWS()": total }]] = await db.query("SELECT FOUND_ROWS()");

    res.json({ data: rows, total, page, limit });
  } catch (err) {
    console.error("[getAllProducts]", err);
    res.status(500).json({ error: "Error fetching products" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, name, category, description, summary, image_url FROM products WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("[getProductById]", err);
    res.status(500).json({ error: "Error fetching product" });
  }
});

module.exports = router;
