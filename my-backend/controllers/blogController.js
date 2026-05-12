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
        `%${req.query.search}%`,
      );
    }

    const dataSql = `
      SELECT 
        id,
        title,
        short_description,
        author,
        topic,
        image_url,
        created_at
      FROM blogs
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limit, offset];

    const [rows] = await db.query(dataSql, dataParams);

    // parse image_url thành array
    const formattedRows = rows.map((blog) => {
      const images = JSON.parse(blog.image_url || "[]");

      return {
        ...blog,
        image_url: images,
        thumbnail: images[0] || "",
        detail_images: images.slice(1),
      };
    });

    const countSql = `
      SELECT COUNT(*) AS total
      FROM blogs
      ${whereSql}
    `;

    const [[{ total }]] = await db.query(countSql, params);

    res.set("Cache-Control", "no-store");

    res.json({
      data: formattedRows,
      total,
      page,
      limit,
    });
  } catch (err) {
    console.error("[getAllBlogs]", err);
    next(err);
  }
};

exports.getBlogById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT 
        id,
        title,
        short_description,
        content,
        author,
        topic,
        image_url,
        created_at
      FROM blogs
      WHERE id = ? AND is_published = 1
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const blog = rows[0];

    const images = JSON.parse(blog.image_url || "[]");

    const formattedBlog = {
      ...blog,
      image_url: images,
      thumbnail: images[0] || "",
      detail_images: images.slice(1),
    };

    res.set("Cache-Control", "no-store");

    res.json(formattedBlog);
  } catch (err) {
    console.error("[getBlogById]", err);
    next(err);
  }
};
