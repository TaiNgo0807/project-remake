// controllers/contactController.js
// Stateless controller for public contact endpoint

const db = require("../models/db"); // Your configured DB pool/connection

/**
 * Process a contact submission.
 * @param {Object} params
 * @param {string} params.name - Customer name
 * @param {string} [params.phone] - Customer phone (optional if mail provided)
 * @param {string} [params.mail] - Customer email (optional if phone provided)
 * @param {string} params.message - Message content
 * @returns {Promise<number>} - Inserted record ID
 */
exports.submitContact = async ({ name, phone, mail, message }) => {
  // Validate required fields
  if (!name || !message || (!phone && !mail)) {
    throw new Error(
      "name, message, and at least one of phone or mail are required"
    );
  }

  // Build columns and params for insertion based on provided fields
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

  // Construct SQL statement
  const sql = `INSERT INTO contacts (${columns.join(
    ", "
  )}) VALUES (${placeholders.join(", ")})`;

  // Execute query
  const [result] = await db.query(sql, params);
  return result.insertId;
};
