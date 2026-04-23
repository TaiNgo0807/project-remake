const recruitmentRouter = require("express").Router();
const recruitmentController = require("../controllers/recruitmentController.js");

recruitmentRouter.get("/", recruitmentController.getJobs);

module.exports = recruitmentRouter;
