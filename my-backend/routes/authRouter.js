const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController.js");

router.post("/login", authController.login);
router.post("/logout", authController.signOut);
router.post("/register", authController.postUser);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
