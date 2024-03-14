import createError from "http-errors";
import mongoose from "mongoose";

export const isValidObjectId = (param) => mongoose.Types.ObjectId.isValid(param);

export const bulkInsert = async (Model, documents) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await Model.insertMany(documents, { session });

    await session.commitTransaction();

    return result.length;
  } catch (error) {
    console.error("==== Error bulkInsert ====\n", error);
    await session.abortTransaction();
    throw createError(500, "insert data Error");
  } finally {
    session.endSession();
  }
};

export const bulkUpdate = async (Model, documents) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let count = 0;
    for (const item of documents) {
      const { query, updateFields } = item;
      const result = await Model.updateMany(query, { $set: updateFields }, { session });

      if (result.n !== result.nModified) {
        throw new Error("Not all documents were updated !!");
      }

      count += result.nModified;
    }
    return count;
  } catch (error) {
    console.error("==== Error bulkUpdate ====\n", error);
    await session.abortTransaction();
    throw createError(500, "update data Error");
  } finally {
    session.endSession();
  }
};

export const insertMasterAndChild = async (masterModel, Document, childModel, Documents) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await masterModel.create(Document, { session });
    const result = await childModel.insertMany(Documents, { session });

    await session.commitTransaction();

    return result.insertedCount;
  } catch (error) {
    console.error("==== Error insertMasterAndChild ====\n", error);
    await session.abortTransaction();
    throw createError(500, "insert data Error");
  } finally {
    session.endSession();
  }
};

export const insertMasterUpdateChild = async (masterModel, document, childModel, documents) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await masterModel.create(document, { session });
    let count = 0;
    for (const item of documents) {
      const { query, updateFields } = item;
      const result = await childModel.updateOne(query, { $set: updateFields }, { session });

      if (result.matchedCount !== result.modifiedCount) {
        throw createError(500, "update data Error");
      }

      count += result.modifiedCount;
    }
    await session.commitTransaction();
    return count;
  } catch (error) {
    console.error("==== Error insertMasterUpdChild ====\n", error);
    await session.abortTransaction();
    if (createError.isHttpError(error)) {
      throw error;
    } else {
      throw createError(500, "insert data Error");
    }
  } finally {
    session.endSession();
  }
};

export const updateMasterAndChild = async (masterModel, document, childModel, documents) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { query, updateFields } = document;
    const output = await masterModel.updateOne(query, { $set: updateFields }, { session });

    let count = 0;
    for (const item of documents) {
      const { query, updateFields } = item;
      const result = await childModel.updateMany(query, { $set: updateFields }, { session });

      if (result.matchedCount !== result.modifiedCount) {
        throw createError(500, "update data Error");
      }

      count += result.modifiedCount;
    }
    await session.commitTransaction();
    return count;
  } catch (error) {
    console.error("==== Error updateMasterAndChild ====\n", error);
    await session.abortTransaction();
    if (createError.isHttpError(error)) {
      throw error;
    } else {
      throw createError(500, "update data Error");
    }
  } finally {
    session.endSession();
  }
};
