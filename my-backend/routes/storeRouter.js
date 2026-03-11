const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");

// API endpoint: /api/stores/search
router.get("/search", storeController.searchStores);

module.exports = router;
