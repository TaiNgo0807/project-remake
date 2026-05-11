const router = require("express").Router();
const recruitmentController = require("../controllers/recruitmentController.js");

router.get("/jobs", recruitmentController.getAllJobs);

module.exports = router;
