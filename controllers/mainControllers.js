require("dotenv/config");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const handleMongooseError = require("../utils/mongooseUtils.js").handleMongooseError;
// import mongoose from "mongoose";
// import { bulkInsert } from "../services/insertData.js";

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, instituteId } = req.body;

    if (req.jwt?.role !== "admin" && (role === "admin" || role === "issuer")) {
      // return next(createError(403, "Forbidden"));
      return next(createError(403));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const document = { name, email, password: hashedPassword, role };

    if (role === "issuer" && instituteId) {
      document.instituteId = instituteId;
    }

    await User.create(document);

    // res.status(201).json({ message: "User registered successfully" });
    res.status(201).json({ message: "Created" });
  } catch (error) {
    console.error("==== register ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "reigister user Error"));
      next(createError(500));
    }
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("role instituteId +password");
    if (!user) {
      return next(createError(400, "invalid credentials"));
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return next(createError(400, "invalid credentials"));
    }

    const payload = { userId: user._id, role: user.role };

    if (user.instituteId) {
      payload.instituteId = user.instituteId;
    }

    const token = jwt.sign(payload, process.env.SECRET_ACCESS_TOKEN, {
      expiresIn: process.env.EXPIRES_IN,
    });

    res.json({ userId: user._id, role: user.role, token });
  } catch (error) {
    console.error("==== login ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "login Error"));
      next(createError(500));
    }
  }
};

exports.emailExists = async (req, res, next) => {
  try {
    const { email } = req.params;

    const user = await User.exists({ email });
    if (!user) {
      return next(createError(404, "email does not exists"));
    }

    res.json({ message: `email:${email} exists` });
  } catch (error) {
    console.error("==== emailExists ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "login Error"));
      next(createError(500));
    }
  }
};
