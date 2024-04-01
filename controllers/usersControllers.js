import "dotenv/config";
import createError from "http-errors";
import User from "../models/userModel.js";
import { handleMongooseError } from "../utils/mongooseUtils.js";

export const userDetail = async (req, res, next) => {
  try {
    const { userId } = req.jwt;
    const user = await User.findById(userId).select("-__v -createdAt -updatedAt");

    if (!user) {
      // return next(createError(404, "no user Found"));
      return next(createError(404));
    }

    res.json(user);
  } catch (error) {
    console.error("==== userDetail ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find user Error"));
      next(createError(500));
    }
  }
};
