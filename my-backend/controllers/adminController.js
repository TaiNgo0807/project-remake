const db = require("../models/db.js");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.random();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

const uploadImage = async (req, res) => {
  try {
    console.log(req.files);

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Vui lòng tải lên ít nhất một tệp!" });
    }

    // Lặp qua mảng file vừa up để tạo ra mảng các đường link
    const imageUrls = req.files.map((file) => `/uploads/${file.filename}`);

    // Trả về mảng imageUrls cho Frontend xài
    res.status(200).json({ message: "Tải lên thành công!", imageUrls });
  } catch (err) {
    console.error("Lỗi up ảnh:", err);
    res.status(500).json({ message: "Lỗi khi tải lên hình ảnh!" });
  }
};

const logUserActivity = async (userId, activity) => {
  try {
    const [rows] = await db.execute(
      "SELECT display_name FROM users WHERE id = ?",
      [userId],
    );
    await db.execute(
      "INSERT INTO user_activity (user_id, activity, display_name) VALUES (?, ?, ?)",
      [userId, activity, rows[0].display_name],
    );
  } catch (error) {
    console.error("Lỗi log activity:", error);
  }
};

const setUserActivity = async (req, res) => {
  const userId = req.user.id;
  const activity = req.body.activity;

  if (!activity) {
    return res.status(400).json({ message: "Vui lòng cung cấp hoạt động!" });
  }

  try {
    await logUserActivity(userId, activity);
    res.status(201).json({ message: "Hoạt động đã được ghi lại!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};

const getUserActivity = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM user_activity ORDER BY created_at DESC",
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Không có hoạt động nào",
      });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi khi truy vấn activity:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const postBlog = async (req, res) => {
  const userId = req.user.id;
  // Bắt chuẩn các trường từ frontend gửi lên (JSON body)
  const { title, topic, author, short_description, content, image_url } =
    req.body;

  if (!title || !topic || !author || !short_description || !image_url) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ thông tin (bao gồm cả ảnh)!" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO blogs (title, topic, author, image_url, short_description, content) VALUES (?, ?, ?, ?, ?, ?)",
      [title, topic, author, image_url, short_description, content],
    );

    await logUserActivity(userId, `Đã thêm bài viết mới: ${title}`);

    return res.status(201).json({
      message: "Thêm bài viết thành công!",
      blogId: result.insertId,
    });
  } catch (error) {
    console.error("Xảy ra lỗi khi thêm bài viết:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const deleteBlog = async (req, res) => {
  const { id } = req.params;
  console.log(req.params);
  if (!id) {
    return res.status(400).json({ message: "Không nhận được ID bài viết!" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE blogs SET is_published = 0 WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bài viết không tồn tại!" });
    }
    return res.status(200).json({ message: "Xóa bài viết thành công!" });
  } catch (error) {
    console.error("Xảy ra lỗi khi xóa bài viết:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const postJob = async (req, res) => {
  const { title, salary, deadline, location, numberOfmember, description } =
    req.body;

  if (
    !title ||
    !salary ||
    !deadline ||
    !location ||
    !numberOfmember ||
    !description
  ) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin!" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO jobs (title, salary, deadline, location, number_of_members, description) VALUES (?, ?, ?, ?, ?, ?)",
      [title, salary, deadline, location, numberOfmember, description],
    );

    // 👉 lấy lại job vừa tạo
    const [rows] = await db.execute("SELECT * FROM jobs WHERE id = ?", [
      result.insertId,
    ]);

    return res.status(201).json({
      message: "Thêm công việc thành công!",
      job: rows[0],
    });
    await logUserActivity(req.user.id, "Đã thêm công việc mới");
  } catch (error) {
    console.error("Xảy ra lỗi khi thêm công việc:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const deleteJob = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Không nhận được ID tuyển dụng!" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE jobs SET is_published = 0 WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bài tuyển dụng không tồn tại!" });
    }
    return res.status(200).json({ message: "Xóa thành công!" });
  } catch (error) {
    console.error("Xảy ra lỗi khi xóa bài tuyển dụng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const editProduct = async (req, res) => {
  const { id } = req.params;

  const { name, category, description, summary, image_url } = req.body;

  if (!name || !category || !description || !summary) {
    return res.status(400).json({
      message: "Vui lòng điền đầy đủ thông tin!",
    });
  }

  try {
    let sql = `
      UPDATE products
      SET
        name = ?,
        category = ?,
        description = ?,
        summary = ?
    `;

    const params = [name, category, description, summary];

    // có ảnh mới thì update ảnh
    if (image_url) {
      sql += `, image_url = ?`;
      params.push(image_url);
    }

    sql += ` WHERE id = ?`;

    params.push(id);

    const [result] = await db.execute(sql, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Sản phẩm không tồn tại!",
      });
    }

    await logUserActivity(req.user.id, `Đã chỉnh sửa sản phẩm ${name}`);

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
    });
  } catch (error) {
    console.error("Lỗi cập nhật sản phẩm:", error);

    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.max(parseInt(req.query.limit, 10) || 5, 1);
    const offset = (page - 1) * limit;

    const conditions = ["is_published = 1"];
    const params = [];

    // search
    if (req.query.search) {
      conditions.push("(name LIKE ? OR description LIKE ?)");
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    // category
    if (req.query.category && req.query.category !== "all") {
      conditions.push("category = ?");
      params.push(req.query.category);
    }

    const whereSql = `WHERE ${conditions.join(" AND ")}`;

    // lấy sản phẩm
    const dataSql = `
      SELECT id, name, category, description, summary, image_url, created_at
      FROM products
      ${whereSql}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limit, offset];
    const [rows] = await db.query(dataSql, dataParams);

    // đếm tổng
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

const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      message: "Không nhận được ID sản phẩm!",
    });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, name, category, description, summary, image_url
       FROM products
       WHERE id = ? AND is_published = 1`,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Sản phẩm không tồn tại!",
      });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Lỗi khi lấy sản phẩm:", error);

    return res.status(500).json({
      message: "Lỗi máy chủ nội bộ!",
    });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Không nhận được ID sản phẩm!" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE products SET is_published = 0 WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }
    return res.status(200).json({ message: "Xóa sản phẩm thành công!" });
  } catch (error) {
    console.error("Xảy ra lỗi khi xóa sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const addProduct = async (req, res) => {
  const userId = req.user.id;
  let { name, category, description, summary, image_url } = req.body;

  // nếu upload file image thì dùng đường dẫn file vừa up
  if (req.file && req.file.filename) {
    image_url = `/uploads/${req.file.filename}`;
  }

  if (!name || !category || !description || !summary || !image_url) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ thông tin (bao gồm cả ảnh)!" });
  }

  try {
    const [result] = await db.execute(
      "INSERT INTO products (name, category, description, summary, image_url) VALUES (?, ?, ?, ?, ?)",
      [name, category, description, summary, image_url],
    );

    const [rows] = await db.execute(
      "SELECT id, name, category, description, summary, image_url FROM products WHERE id = ?",
      [result.insertId],
    );

    await logUserActivity(userId, `Đã thêm sản phẩm: ${name}`);

    return res
      .status(201)
      .json({ message: "Thêm sản phẩm thành công!", product: rows[0] });
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const getContact = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM contacts ORDER BY created_at DESC",
    );

    if (!rows.length) {
      return res.status(404).json({
        message: "Không có câu hỏi nào",
      });
    }

    return res.status(200).json(rows);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin khách hàng:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

const serviceContact = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Không nhận được ID contact!" });
  }

  try {
    const [result] = await db.execute(
      "UPDATE products SET is_serviced = 1 WHERE id = ?",
      [id],
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Thông tin không tồn tại!" });
    }
    return res.status(200).json({ message: "Đã phục vụ!" });
  } catch (error) {
    console.error("Xảy ra lỗi khi nhận contact:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ!" });
  }
};

module.exports = {
  upload,
  uploadImage,
  addProduct,
  postBlog,
  postJob,
  getUserActivity,
  editProduct,
  getProductById,
  setUserActivity,
  getAllProducts,
  deleteBlog,
  deleteProduct,
  deleteJob,
  getContact,
  serviceContact,
};
