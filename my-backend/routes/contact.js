// routes/contact.js
// Stateless, public-only contact endpoint

const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

/**
 * POST /api/v1/contact
 * Body params: { name, contact, message, productSku? }
 * - name: string, required
 * - contact: string (email or phone), required
 * - message: string, required
 * - productSku: string, optional
 */
router.post("/", async (req, res, next) => {
  try {
    const { name, contact, message } = req.body;
    if (!name || !contact || !message) {
      return res.status(400).json({ error: "name, contact, message required" });
    }

    // Gán contact là phone nếu là số, ngược lại là mail
    const isPhone = /^[\d\s+()-]{7,}$/.test(contact);
    const phone = isPhone ? contact : undefined;
    const mail = !isPhone ? contact : undefined;

    await contactController.submitContact({
      name,
      phone,
      mail,
      message,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
