const db = require("../models/db.js");

exports.getBanners = (req, res) => {
  const query = "SELECT * FROM banners";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error when fetch banner:", err);
      return res.status(500).json({ message: "Server error!" });
    }
    res.json(results);
  });
};
