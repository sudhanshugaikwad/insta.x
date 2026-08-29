const requirelogin = require("./requirelogin");

module.exports = (req, res, next) => {
  requirelogin(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
};
