import createError from "http-errors";
import Institute from "../models/instituteModel.js";
import { handleMongooseError, isValidObjectId } from "../utils/mongooseUtils.js";

export const institutesList = async (req, res, next) => {
  try {
    const { _id, instituteName, instituteAbbr } = req.query;

    let query = {};

    if (_id && isValidObjectId(_id)) {
      query._id = { _id };
    }

    if (instituteName) {
      query.instituteName = { $regex: new RegExp(instituteName, "ui") };
    }

    if (instituteAbbr) {
      query.instituteAbbr = { $regex: new RegExp(instituteAbbr, "i") };
    }

    const institutes = await Institute.find(query);

    if (institutes.length === 0) {
      // return next(createError(404, "no institute found"));
      return next(createError(404));
    }

    res.json(institutes);
  } catch (error) {
    console.error("==== getInstitutes ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "find institutes Error"));
      next(createError(500));
    }
  }
};

export const addInstitute = async (req, res, next) => {
  try {
    const { instituteName, instituteAbbr } = req.body;

    const document = { instituteName, instituteAbbr };
    await Institute.create(document);

    // res.status(201).json({ message: "institute added successfully" });
    res.status(201).json({ message: "Created" });
  } catch (error) {
    console.error("==== addInstitute ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      next(handledError);
    } else {
      // next(createError(500, "add institute Error"));
      next(createError(500));
    }
  }
};
