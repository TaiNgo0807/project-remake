const db = require("../models/db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { cp } = require("fs");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

exports.postUser = async (req, res) => {
  const { username, password, displayName } = req.body;
  if (!username || !password || !displayName) {
    return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin!" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute(
      "INSERT INTO users (username, hashedPassword, display_name) VALUES (?, ?, ?)",
      [username, hashedPassword, displayName],
    );
    res.status(201).json({ message: "Người dùng đã được tạo!" });
  } catch (err) {
    console.error("Lỗi khi tạo người dùng:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập tên người dùng và mật khẩu!" });
  }
  try {
    const [rows] = await db.execute(
      "SELECT id, username, hashedPassword, display_name FROM users WHERE username = ?",
      [username],
    );
    const user = rows && rows.length ? rows[0] : null;
    if (!user) {
      return res
        .status(401)
        .json({ message: "Tên người dùng hoặc mật khẩu không đúng!!" });
    }
    //Mã hóa mật khẩu và so sánh

    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordCorrect) {
      return res
        .status(401)
        .json({ message: "Tên người dùng hoặc mật khẩu không đúng!" });
    }

    // Tạo access token nếu đăng nhập thành công
    const accessToken = jwt.sign(
      { userId: user.id, displayName: user.display_name },
      process.env.ACCESS_TOKEN_SECRET || process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // Tạo refresh token và lưu vào database
    const refreshToken = crypto.randomBytes(64).toString("hex");
    console.log("Refresh token mới:", refreshToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
    await db.execute(
      "INSERT INTO sessions (token, expiresAt, userId) VALUES (?, ?, ?)",
      [refreshToken, expiresAt, user.id],
    );

    // trả refresh token trong cookie (maxAge in ms)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL_MS,
    });

    // trả access token cho client
    return res
      .status(200)
      .json({ message: "Đăng nhập thành công!", accessToken });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" }, err);
  }
};

exports.signOut = async (req, res) => {
  // Lấy refresh token từ cookie
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Không tìm thấy refresh token!" });
  }
  try {
    // Xóa refresh token khỏi database
    await db.execute("DELETE FROM sessions WHERE token = ?", [refreshToken]);
    // Xóa cookie refresh token
    res.clearCookie("refreshToken");
    // Trả về phản hồi thành công
    return res.status(200).json({ message: "Đăng xuất thành công!" });
  } catch (err) {
    console.error("Lỗi đăng xuất:", err);
    res.status(500).json({ message: "Lỗi máy chủ!" });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Không có refresh token!" });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM sessions WHERE token = ?", [
      refreshToken,
    ]);

    const session = rows[0];

    if (!session) {
      return res.status(403).json({ message: "Refresh token không hợp lệ!" });
    }

    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ message: "Refresh token đã hết hạn!" });
    }

    // tạo access token mới
    const newAccessToken = jwt.sign(
      { userId: session.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Lỗi server!" });
  }
};
