const db = require("../models/db");

/**
 * Process a contact submission.
 * @param {Object} params
 * @param {string} params.name
 * @param {string} [params.phone]
 * @param {string} [params.mail]
 * @param {string} params.message
 * @returns {Promise<number|undefined>} inserted id (MySQL) or undefined
 */
exports.submitContact = async ({ name, phone, mail, message }) => {
  // ---- Normalize ----
  name = typeof name === "string" ? name.trim() : "";
  message = typeof message === "string" ? message.trim() : "";
  phone = typeof phone === "string" ? phone.trim() : "";
  mail = typeof mail === "string" ? mail.trim() : "";

  // ---- Validate ----
  if (!name || !message || (!phone && !mail)) {
    const err = new Error(
      "name, message, and at least one of phone or mail are required"
    );
    err.status = 400;
    throw err;
  }

  if (name.length > 100 || message.length > 2000) {
    const err = new Error("Input data is too long");
    err.status = 400;
    throw err;
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

  if (mail) {
    columns.push("mail");
    placeholders.push("?");
    params.push(mail);
  }

  const sql = `
    INSERT INTO contacts (${columns.join(", ")})
    VALUES (${placeholders.join(", ")})
  `;

  // ---- Execute ----
  const [result] = await db.query(sql, params);

  // MySQL có insertId, DB khác thì undefined
  return result?.insertId;
};
