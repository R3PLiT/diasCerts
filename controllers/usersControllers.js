const handleMongooseError = require("../utils/mongooseUtils.js").handleMongooseError;
const isValidObjectId = require("../utils/mongooseUtils.js").isValidObjectId;
require("dotenv/config");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const User = require("../models/userModel.js");
const Institute = require("../models/instituteModel.js");

exports.userDetail = async (req, res, next) => {
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

exports.getAllUser = async (req, res, next) => {
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

exports.getUserById = async (req, res, next) => {
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

exports.deleteUserById = async (req, res, next) => {
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

exports.updateUserById = async (req, res, next) => {
  try {
    const { _id } = req.params;
    const { name, oldPassword, newPassword, role, instituteId } = req.body;

    if (!((oldPassword && newPassword) || (!oldPassword && !newPassword))) {
      return next(createError(400, "either old password or new password not exists"));
    }

    if (
      role &&
      !((role === "issuer" && isValidObjectId(instituteId)) || (role === "user" && !instituteId))
    ) {
      return next(createError(400, "role must be (user) or (issuer with valid institute id)"));
    }

    // if (!((role && instituteId) || (!role && !instituteId))) {
    //   return next(createError(400, "either role or instituteId not exists"));
    // }

    // if (role && (role !== "issuer" || !isValidObjectId(instituteId))) {
    //   return next(
    //     createError(400, "role must be issuer and instituteId must be valid"),
    //   );
    // }

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

    if (role === "issuer") {
      const institute = await Institute.findById(instituteId).select("instituteAbbr");

      if (!institute) {
        return next(createError(404, "institute id does not exists"));
        // return next(createError(404));
      }
    }

    if (!name && !hashedPassword && !role && !instituteId) {
      return next(createError(400, "no data to update"));
    }

    // const update = name
    //   ? { name, ...(hashedPassword ? { password: hashedPassword } : {}) }
    //   : { ...(hashedPassword ? { password: hashedPassword } : {}) };

    const update = name
      ? {
          name,
          ...(hashedPassword ? { password: hashedPassword } : {}),
          ...(role ? { role } : {}),
          // instituteId: role === "issuer" ? instituteId : null,
          // ...(instituteId ? { instituteId } : {}),
          ...(role === "user" ? { instituteId: null } : instituteId ? { instituteId } : {}),
        }
      : {
          ...(hashedPassword ? { password: hashedPassword } : {}),
          ...(role ? { role } : {}),
          // instituteId: role === "issuer" ? instituteId : null,
          // ...(instituteId ? { instituteId } : {}),
          ...(role === "user" ? { instituteId: null } : instituteId ? { instituteId } : {}),
        };

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
