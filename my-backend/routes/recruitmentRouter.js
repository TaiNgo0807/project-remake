const recruitmentRouter = require("express").Router();
const recruitmentController = require("../controllers/recruitmentController.js");

recruitmentRouter.get("/", recruitmentController.getAllJobs);

module.exports = recruitmentRouter;
