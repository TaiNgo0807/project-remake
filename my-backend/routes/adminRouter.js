const express = require("express");
const router = express.Router();

const {
  upload,
  uploadImage,
  addProduct,
  setUserActivity,
  getUserActivity,
  editProduct,
  postJob,
  postBlog,
  getAllProducts,
  deleteBlog,
  deleteJob,
  deleteProduct,
  getProductById,
  getContact,
  serviceContact,
} = require("../controllers/adminController");

const { protectedRoutes } = require("../middlewares/authMiddleware");

//img
router.post("/upload", protectedRoutes, upload.array("image", 5), uploadImage);

//product
router.post("/product", protectedRoutes, upload.single("image"), addProduct);
router.put(
  "/product/:id",
  protectedRoutes,
  upload.single("image"),
  editProduct,
);
router.get("/products", protectedRoutes, getAllProducts);
router.get("/product/:id", protectedRoutes, getProductById);
router.patch("/product/:id", protectedRoutes, deleteProduct);

//job
router.post("/job", protectedRoutes, postJob);
router.patch("/job/:id", protectedRoutes, deleteJob);

//blog
router.post("/blog", protectedRoutes, postBlog);
router.patch("/blog/:id", protectedRoutes, deleteBlog);

//activity
router.post("/activity", protectedRoutes, setUserActivity);
router.get("/activity", protectedRoutes, getUserActivity);

//contact
router.get("/contacts", protectedRoutes, getContact);
router.put("/contact/:id", protectedRoutes, serviceContact);

module.exports = router;
