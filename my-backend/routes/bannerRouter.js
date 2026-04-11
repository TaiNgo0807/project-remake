const express = require("express");
const router = express.Router();
const bannerController = require("../controllers/bannerController.js");

router.get("/", bannerController.getBanners);

module.exports = router;
