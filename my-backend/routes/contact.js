const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", async (req, res, next) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !message || (!phone && !email)) {
      return res.status(400).json({
        error: "name, message, and at least one of phone or email required",
      });
    }

    await contactController.submitContact({
      name,
      phone: phone || null,
      mail: email || null,
      message,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
