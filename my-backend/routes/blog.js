//my-backend/routes/blog.js
const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");

router.get("/blogs", blogController.getAllBlogs);
router.get("/blogs/:id", blogController.getBlogById);

module.exports = router;
