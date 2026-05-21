const db = require("../models/db");

exports.submitContact = async (req, res) => {
  try {
    let { name, phone, message } = req.body || {};

    name = typeof name === "string" ? name.trim() : "";
    phone = typeof phone === "string" ? phone.trim() : "";
    message = typeof message === "string" ? message.trim() : "";

    if (!name || !phone || !message) {
      return res.status(400).json({
        ok: false,
        error: "Vui lòng nhập đầy đủ tên, số điện thoại và nội dung",
      });
    }

    if (name.length > 100 || phone.length > 20 || message.length > 2000) {
      return res.status(400).json({
        ok: false,
        error: "Dữ liệu nhập quá dài",
      });
    }

    const sql = `
      INSERT INTO contacts (name, phone, message)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(sql, [name, phone, message]);

    return res.status(201).json({
      ok: true,
      message: "Gửi liên hệ thành công",
      insertId: result.insertId,
    });
  } catch (err) {
    console.error("[submitContact]", err);

    return res.status(500).json({
      ok: false,
      message: "Lỗi máy chủ",
    });
  }
};
