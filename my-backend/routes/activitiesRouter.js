const express = require("express");
const router = express.Router();
const actController = require("../controllers/activitiesController.js");

router.get("/news", actController.getAllPostActivities);

module.exports = router;
