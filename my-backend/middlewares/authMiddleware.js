const jwt = require("jsonwebtoken");
const db = require("../models/db.js");

exports.protectedRoutes = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Không tìm thấy token!" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token không hợp lệ!" });
      }

      const [rows] = await db.execute(
        "SELECT id, username FROM users WHERE id = ?",
        [decoded.userId],
      );

      if (!rows.length) {
        return res.status(404).json({ message: "Người dùng không tồn tại!" });
      }

      req.user = rows[0]; // Gắn thông tin người dùng vào req để controller có thể sử dụng
      next();
    });
  } catch (err) {
    console.error("Lỗi middleware:", err);
    return res.status(500).json({ message: "Lỗi hệ thống!" });
  }
};
