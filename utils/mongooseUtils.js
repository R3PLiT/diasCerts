import createError from "http-errors";
import mongoose from "mongoose";

export const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const handleMongooseError = (error) => {
  // if (error instanceof mongoose.Error || error.name === "MongoServerError") {
  if (error instanceof mongoose.Error || error.name.includes("Mongo")) {
    if (error.code === 11000 || error.code === 11001) {
      const regex = /dup key: (\{[^}]+\})/;
      const errorMessage = error.message;
      const match = errorMessage.match(regex);
      if (match && match.length > 1) {
        const fieldDup = JSON.parse(match[1].replace(/(\w+):/g, '"$1":'));
        const firstMessage = { message: "duplicate key error" };
        const customMessage = { ...firstMessage, ...fieldDup };
        return createError(409, "duplicate key error", { customMessage });
      } else {
        return createError(409, "duplicate key error");
      }
    } else if (error.name === "ValidationError") {
      console.log(error.message);
      console.log(JSON.stringify(error));
      const customMessage = {};
      customMessage["message"] = error.name;
      for (const field in error.errors) {
        if (error.errors[field].name === "CastError") {
          const regex = /.*(?=for)/;
          const matches = error.errors[field].message.match(regex);
          if (matches) {
            customMessage[field] = `${matches[0]} ('${error.errors[field].value}')`;
          } else {
            customMessage[field] = `${error.errors[field].name} ('${error.errors[field].value}')`;
          }
        } else {
          customMessage[field] = `${error.errors[field].message} ('${error.errors[field].value}')`;
        }
      }
      return createError(422, "ValidationError", { customMessage });
    } else {
      return createError(400);
    }
  } else {
    return error;
  }
};

// export const handleMongooseError = (error) => {
//   if (error instanceof mongoose.Error || error.name === "MongoServerError") {
//     if (error.code === 11000 || error.code === 11001) {
//       const duplicateKey = JSON.stringify(error.keyValue).replace(/[{}"]/g, "");
//       return createError(409, `duplicate key ${duplicateKey} `);
//     } else if (error.code === 404) {
//       return createError(404, error.message);
//     } else if (error.name === "ValidationError") {
//       return createError(422, error.message);
//     } else if (error.name === "CastError") {
//       return createError(400, `${error.path}: ${error.value} [${error.reason}]`);
//     } else {
//       // return createError(500, "database Error");
//       return createError(500);
//     }
//   } else {
//     return error;
//   }
// };

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
