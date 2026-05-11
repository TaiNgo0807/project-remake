const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Lễ tân chỉ dắt khách vào phòng thôi
router.post("/", contactController.submitContact);

module.exports = router;
