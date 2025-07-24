const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

router.post("/", async (req, res, next) => {
  try {
    const { name, phone, mail, message } = req.body;
    if (!name || !message || (!phone && !mail)) {
      return res.status(400).json({
        error: "name, message, and at least one of phone or email required",
      });
    }

    await contactController.submitContact({
      name,
      phone: phone || null,
      mail: mail || null,
      message,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
