import "dotenv/config";
import createError from "http-errors";
import User from "../models/userModel.js";

export const userDetail = async (req, res, next) => {
  try {
    const { userId } = req.jwt;
    const user = await User.findById(userId).select("-_id");

    if (!user) {
      return next(createError(404, "Not Found"));
    }

    res.json(user);
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== userDetail ====\n", error);
      next(createError(500, "get user Error"));
    }
  }
};
