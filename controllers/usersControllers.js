import "dotenv/config";
import createError from "http-errors";
import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import { handleMongooseError } from "../utils/mongooseUtils.js";

export const userDetail = async (req, res, next) => {
  try {
    const { userId } = req.jwt;
    const user = await User.findById(userId).select("-_id");

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

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find().select("-__v -createdAt -updatedAt");

    if (users.length === 0) {
      // return next(createError(404, "no institute found"));
      return next(createError(404));
    }

    res.json(users);
  } catch (error) {
    console.error("==== getAllUser ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find user Error"));
      next(createError(500));
    }
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id).select("-__v -createdAt -updatedAt");

    if (!user) {
      // return next(createError(404, "no user Found"));
      return next(createError(404));
    }

    res.json(user);
  } catch (error) {
    console.error("==== getUserById ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find user Error"));
      next(createError(500));
    }
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const user = await User.findByIdAndDelete(_id);
    if (!user) {
      return next(createError(404, "no user Found"));
      // return next(createError(404));
    }

    res.json({ message: "user deleted successfully" });
  } catch (error) {
    console.error("==== deleteUserById ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find user Error"));
      next(createError(500));
    }
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { name, oldPassword, newPassword } = req.body;

    if (!((oldPassword && newPassword) || (!oldPassword && !newPassword))) {
      return next(
        createError(400, "either old password or new password not exists"),
      );
    }

    let hashedPassword;

    if (oldPassword && newPassword) {
      const user = await User.findById(_id).select("+password");

      if (!user) {
        return next(createError(404, "no user Found"));
        // return next(createError(404));
      }

      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        return next(createError(400, "invalid credentials"));
      } else {
        hashedPassword = await bcrypt.hash(newPassword, 10);
      }
    }

    if (!name && !hashedPassword) {
      return next(createError(400, "no data to update"));
    }

    const update = name
      ? { name, ...(hashedPassword ? { password: hashedPassword } : {}) }
      : { ...(hashedPassword ? { password: hashedPassword } : {}) };
    const user = await User.findByIdAndUpdate(_id, update);

    if (!user) {
      return next(createError(404, "no user Found"));
      // return next(createError(404));
    }

    // res.json(user);
    res.json({ message: "Updated" });
  } catch (error) {
    console.error("==== updateUserById ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find user Error"));
      next(createError(500));
    }
  }
};
