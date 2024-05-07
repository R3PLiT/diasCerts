require("dotenv/config");
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

const authenticateRole =
  (...roles) =>
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      // return next(createError(401, "Unauthorized"));
      return next(createError(401));
    }

    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
      if (err || !roles.includes(user.role)) {
        // return next(createError(403, "Forbidden"));
        return next(createError(403));
      }
      req.jwt = user;
      next();
    });
  };

module.exports = authenticateRole;
