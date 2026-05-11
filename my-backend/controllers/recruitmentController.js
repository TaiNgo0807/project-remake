const db = require("../models/db");

/*CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    salary VARCHAR(100),
    description TEXT,
    deadline DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
*/
exports.getAllJobs = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM jobs WHERE is_published = 1");
    res.json(rows);
  } catch (error) {
    next(error);
  }
};
