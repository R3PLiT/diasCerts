import "dotenv/config";
import createError from "http-errors";
import Course from "../models/courseModel.js";
import Graduate from "../models/graduateModel.js";
import {
  handleMongooseError,
  insertDocuments,
} from "../utils/mongooseUtils.js";

export const getAllCourses = async (req, res, next) => {
  try {
    const { instituteId } = req.jwt;
    const courses = await Course.find({ instituteId }).select(
      "-__v -createdAt -updatedAt",
    );

    if (courses.length === 0) {
      // return next(createError(404, "no courses found"));
      return next(createError(404));
    }

    res.json(courses);
  } catch (error) {
    console.error("==== getAllcourses ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find user Error"));
      next(createError(500));
    }
  }
};

export const addCourse = async (req, res, next) => {
  try {
    const { instituteId, userId } = req.jwt;
    const { course } = req.body;

    const document = { course, createdBy: userId, instituteId };
    await Course.create(document);

    // res.status(201).json({ message: "course added successfully" });
    res.status(201).json({ message: "Created" });
  } catch (error) {
    console.error("==== addCourse ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "add course Error"));
      next(createError(500));
    }
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const { instituteId } = req.jwt;
    const { _id } = req.params;
    const course = await Course.findById(_id)
      .select("-__v -createdAt -updatedAt")
      .where({ instituteId });

    if (!course) {
      // return next(createError(404, "no course Found"));
      return next(createError(404));
    }

    res.json(course);
  } catch (error) {
    console.error("==== getCourseById ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "get course Error"));
      next(createError(500));
    }
  }
};

export const updateCourseById = async (req, res, next) => {
  try {
    const { userId, instituteId } = req.jwt;
    const { _id } = req.params;
    const { course } = req.body;

    if (!course) {
      return next(createError(400, "no data to update"));
    }

    const update = { course, updatedBy: userId };

    const result = await Course.findByIdAndUpdate(_id, update).where({
      instituteId,
    });
    console.log(result);
    if (!result) {
      return next(createError(404, "no course Found"));
      // return next(createError(404));
    }

    // res.json(user);
    res.json({ message: "Updated" });
  } catch (error) {
    console.error("==== updateCourseById ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "update course Error"));
      next(createError(500));
    }
  }
};

export const deleteCourseById = async (req, res, next) => {
  try {
    const { instituteId } = req.jwt;
    const { _id } = req.params;

    const course = await Course.findByIdAndDelete(_id).where({ instituteId });
    console.log(course);
    if (!course) {
      return next(createError(404, "no course Found"));
      // return next(createError(404));
    }

    res.json({ message: "course deleted successfully" });
  } catch (error) {
    console.error("==== deleteCourseById ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "delete course Error"));
      next(createError(500));
    }
  }
};

export const addGraduates = async (req, res, next) => {
  try {
    const { userId, instituteId } = req.jwt;
    const { _id } = req.params;
    const graduates = req.body;

    const documents = graduates.map((obj) => ({
      ...obj,
      courseId: _id,
      instituteId,
      createdBy: userId,
    }));

    const records = await insertDocuments(Graduate, documents);

    res.status(201).json({ message: "graduates created ", records });
  } catch (error) {
    console.error("==== addGraduates ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "add graduates Error"));
      next(createError(500));
    }
  }
};

export const getGraduates = async (req, res, next) => {
  try {
    const { instituteId } = req.jwt;
    const { _id } = req.params;
    const graduates = await Graduate.find({ courseId: _id, instituteId }).select(
      "-__v -createdAt -updatedAt");

    if (graduates.length === 0) {
      // return next(createError(404, "no graduates found"));
      return next(createError(404));
    }

    res.json(graduates);
  } catch (error) {
    console.error("==== getgraduates ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find graduates Error"));
      next(createError(500));
    }
  }
};
