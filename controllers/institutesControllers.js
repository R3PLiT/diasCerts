import createError from "http-errors";
import Institute from "../models/instituteModel.js";
import { isValidObjectId, bulkInsert } from "../services/insertData.js";

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
      return next(createError(404, "No institute found"));
    }

    res.json(institutes);
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== getInstitutes ====\n", error);
      next(createError(500, "get institutes Error"));
    }
  }
};

export const addInstitutes = async (req, res, next) => {
  try {
    const documents = req.body;

    const records = await bulkInsert(Institute, documents);

    res.json({ message: "institutes added successfully", records });
  } catch (error) {
    if (createError.isHttpError(error)) {
      next(error);
    } else {
      console.log("==== addInstitutes ====\n", error);
      next(createError(500, "add institutes Error"));
    }
  }
};
