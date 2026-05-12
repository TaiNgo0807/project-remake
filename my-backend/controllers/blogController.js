const db = require("../models/db");
/**
 * GET /api/v1/blogs
 * Public: list blogs with pagination, optional search by title
 * Query Params:
 *   - page: page number (default: 1)
 *   - limit: items per page (default: 10)
 *   - search: search term for blog title
 */
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
