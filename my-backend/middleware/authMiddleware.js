exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Forbidden. Admins only." });
  }
};
