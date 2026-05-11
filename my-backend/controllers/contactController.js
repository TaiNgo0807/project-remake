const db = require("../models/db");

exports.submitContact = async (req, res, next) => {
  try {
    let { name, phone, message } = req.body;

    // ---- Normalize ----
    name = typeof name === "string" ? name.trim() : "";
    message = typeof message === "string" ? message.trim() : "";
    phone = typeof phone === "string" ? phone.trim() : "";

    // ---- Validate ----
    if (!name || !message || !phone) {
      return res.status(400).json({
        error: "name, message, and at least one of phone or mail are required",
      });
    }

    if (name.length > 100 || message.length > 2000) {
      return res.status(400).json({ error: "Input data is too long" });
    }

    // ---- Build dynamic insert ----
    const columns = ["name", "message"];
    const placeholders = ["?", "?"];
    const params = [name, message];

    if (phone) {
      columns.push("phone");
      placeholders.push("?");
      params.push(phone);
    }
    const sql = `
      INSERT INTO contacts (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    // ---- Execute ----
    const [result] = await db.query(sql, params);

    res.status(201).json({
      ok: true,
      insertId: result?.insertId,
    });
  } catch (err) {
    console.error("[submitContact]", err);
    next(err);
  }
};
