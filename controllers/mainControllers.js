import "dotenv/config";
import createError from "http-errors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
// import { bulkInsert } from "../services/insertData.js";

export const register = async (req, res, next) => {
  try {
    const { userName, name, email, password, role, instituteId } = req.body;

    if (req.jwt?.role !== "admin" && (role === "admin" || role === "issuer")) {
      return next(createError(403, "Forbidden"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const document = { userName, name, email, password: hashedPassword, role };

    if (role === "issuer" && instituteId) {
      document.instituteId = instituteId;
    }

    await User.create(document);

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.log("==== register ====\n", error);
    next(createError(500, "User register failed"));
  }
};

// export const registers = async (req, res, next) => {
//   try {
//     const documents = req.body;

//     for (let user of documents) {
//       if (req.jwt?.role !== "admin" && (user.role === "admin" || user.role === "issuer")) {
//         // return res.status(403).json({ message: "Forbidden" });
//         return next(createError(403, "Forbidden"));
//       }
//       const hashedPassword = await bcrypt.hash(user.password, 10);
//       user.password = hashedPassword;
//       if (user.role === "issuer" && user.instituteId) {
//         user.instituteId = user.instituteId;
//       }
//     }

//     const records = await bulkInsert(User, documents);

//     res.json({ message: "user registered successfully", records });
//   } catch (error) {
//     console.log("==== registers ====\n", error);
//     next(createError(500, "User register failed"));
//   }
// };

export const login = async (req, res, next) => {
  try {
    const { userName, password } = req.body;

    const user = await User.findOne({ userName }).select("role +password");
    if (!user) {
      // return res.status(400).json({ message: "Invalid credentials" });
      return next(createError(400, "Invalid credentials"));
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      // return res.status(400).json({ message: "Invalid credentials" });
      return next(createError(400, "Invalid credentials"));
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_ACCESS_TOKEN, {
      expiresIn: process.env.EXPIRES_IN,
    });

    res.json({ userId: user._id, role: user.role, token });
  } catch (error) {
    console.log("==== login ====\n", error);
    next(createError(500, "Login failed"));
  }
};
