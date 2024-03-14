import "dotenv/config";
import createError from "http-errors";
import jwt from "jsonwebtoken";

const authenticateRole =
  (...roles) =>
  (req, res, next) => {
    const authHeader = req.headers.authorization;

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null) {
      return next(createError(401, "Unauthorized"));
    }

    jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, (err, user) => {
      if (err || !roles.includes(user.role)) {
        return next(createError(403, "Forbidden"));
      }
      req.jwt = user;
      next();
    });
  };

export default authenticateRole;
