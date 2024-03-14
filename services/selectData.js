import createError from "http-errors";

export const findBy_id = async (Model, id) => {
  try {
    const document = await Model.findById(id).select("-_id");

    if (!document) {
      throw createError(404, "Not found");
    }

    return document;
  } catch (error) {
    console.log("==== findBy_id ====\n", error);
    if (createError.isHttpError(error)) {
      throw error;
    } else {
      throw createError(500, "find id Error");
    }
  }
};

export const findByQuery = async (Model, query, select, sort) => {
  try {
    const documents = await Model.find(query).select(select).sort(sort);

    if (documents.length === 0) {
      throw createError(404, "Not found");
    }

    return documents;
  } catch (error) {
    console.log("==== findByQuery ====\n", error);
    if (createError.isHttpError(error)) {
      throw error;
    } else {
      throw createError(500, "find data Error");
    }
  }
};

export const findOneByQuery = async (Model, query, select) => {
  try {
    const document = await Model.findOne(query).select(select);

    if (!document) {
      throw createError(404, "Not found");
    }

    return document;
  } catch (error) {
    console.log("==== findOneByQuery ====\n", error);
    if (createError.isHttpError(error)) {
      throw error;
    } else {
      throw createError(500, "find data Error");
    }
  }
};
