import createError from "http-errors";
import mongoose from "mongoose";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const handleMongooseError = (error) => {
  if (error instanceof mongoose.Error || error.name === "MongoServerError") {
    if (error.code === 11000 || error.code === 11001) {
      const duplicateKey = JSON.stringify(error.keyValue).replace(/[{}"]/g, "");
      return createError(409, `duplicate key ${duplicateKey} `);
    } else if (error.code === 404) {
      return createError(404, error.message);
    } else if (error.name === "ValidationError") {
      return createError(422, error.message);
    } else if (error.name === "CastError") {
      return createError(400, error.message);
    } else {
      // return createError(500, "database Error");
      return createError(500);
    }
  } else {
    return error;
  }
};

export const insertDocuments = async (Model, documents) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await Model.insertMany(documents, { session });

    await session.commitTransaction();

    return result.length;
  } catch (error) {
    await session.abortTransaction();
    console.error("==== insertDocuments ====\n", error);
    const handledError = handleMongooseError(error);
    if (createError.isHttpError(handledError)) {
      throw handledError;
    } else {
      // throw createError(500, "insert data Error");
      throw createError(500);
    }
  } finally {
    session.endSession();
  }
};
