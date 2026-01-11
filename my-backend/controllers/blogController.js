const db = require("../models/db");
/**
 * GET /api/v1/blogs
 * Public: list blogs with pagination, optional search by title
 * Query Params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - search: search term for blog title
 */
exports.getAllBlogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);
    const offset = (page - 1) * limit;

    let whereSql = "WHERE is_published = 1";
    const params = [];
    if (req.query.search) {
      whereSql +=
        " AND (title LIKE ? OR short_description LIKE ? OR topic LIKE ?)";
      params.push(
        `%${req.query.search}%`,
        `%${req.query.search}%`,
        `%${req.query.search}%`
      );
    }
    const dataSql = `
      SELECT id, title, short_description, author, topic, image_url, created_at
      FROM blogs
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    const dataParams = [...params, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    const countSql = `
      SELECT COUNT(*) AS total
      FROM blogs
      ${whereSql}
    `;
    const [[{ total }]] = await db.query(countSql, params);

    res.set("Cache-Control", "no-store");
    res.json({ data: rows, total, page, limit });
  } catch (err) {
    console.error("[getAllBlogs]", err);
    next(err);
  }
};

/**
 * GET /api/v1/blogs/:id
 * Public: get single blog by ID
 * Path Params:
 *   - id: blog ID
 */
exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT id, title, short_description, content, author, topic, image_url, created_at FROM blogs WHERE id = ? AND is_published = 1",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.set("Cache-Control", "no-store");
    res.json(rows[0]);
  } catch (err) {
    console.error("[getBlogById]", err);
    next(err);
  }
};
