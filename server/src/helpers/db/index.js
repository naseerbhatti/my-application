import mongoose from "mongoose";
import Models from "../../models/index.js";



const findDocumentsCount = async (model, query = {}) => {
  try {
    const result = await model.countDocuments(query).exec();
    return result;
  } catch (error) {
    console.error(`Error in findDocumentsCount helper =>`, error);
    throw error;
  }
};

const findDoc = async (modelName, query = {}, populate = null) => {
  try {
    let queryBuilder = Models[modelName].findOne(query);

    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }

    const result = await queryBuilder.lean().exec();
    return result;
  } catch (error) {
    console.error(`Error in findDoc helper for model [${modelName}] =>`, error);
    throw error;
  }
};

const findDocuments = async (modelName, query = {}, options = {}) => {
  try {
    const { sort, page, limit, populate, select, lean } = options;

    let queryBuilder = Models[modelName].find(query);

    if (sort) {
      queryBuilder = queryBuilder.sort(sort);
    }

    if (page && limit) {
      const skip = (page - 1) * limit;
      queryBuilder = queryBuilder.skip(skip).limit(limit);
    }

    if (select) {
      queryBuilder = queryBuilder.select(select);
    }

    if (populate) {
      queryBuilder = queryBuilder.populate(populate);
    }

    const result = await queryBuilder.lean().exec();
    return result;
  } catch (error) {
    console.error(
      `Error in findDocuments helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const findDocById = async (modelName, id, lean) => {
  try {
    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(`Invalid ObjectId format: ${id}`);
    }

    if (typeof id === "string") {
      const objectId = new mongoose.Types.ObjectId(id);
      id = objectId;
    }

    const result = await Models[modelName].findById(id).lean().exec();
    return result;
  } catch (error) {
    console.error(
      `Error in findDocById helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const insertDoc = async (modelName, data) => {
  try {
    const result = await Models[modelName].create(data);
    return result;
  } catch (error) {
    console.error(
      `Error in insertDoc helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const insertDocuments = async (modelName, dataArray) => {
  try {
    const result = await Models[modelName].insertMany(dataArray);
    return result;
  } catch (error) {
    console.error(
      `Error in insertDocuments helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const updateDoc = async (modelName, query, updateData, options = {}) => {
  try {
    const execOptions = { new: true, runValidators: true, ...options };

    const result = await Models[modelName]
      .findOneAndUpdate(query, updateData, execOptions)
      .lean()
      .exec();
    return result;
  } catch (error) {
    console.error(
      `Error in updateDoc helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const updateDocById = async (modelName, id, updateData, options = {}) => {
  try {
    const execOptions = { new: true, runValidators: true, ...options };

    const result = await Models[modelName]
      .findByIdAndUpdate(id, updateData, execOptions).lean().exec();
    return result;
  } catch (error) {
    console.error(
      `Error in updateDocById helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const updateDocuments = async (modelName, query, updateData) => {
  try {
    const result = await Models[modelName].updateMany(query, updateData).exec();
    return result;
  } catch (error) {
    console.error(
      `Error in updateDocuments helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const deleteDoc = async (modelName, query) => {
  try {
    const result = await Models[modelName].findOneAndDelete(query).exec();
    return result;
  } catch (error) {
    console.error(
      `Error in deleteDoc helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const deleteDocById = async (modelName, id) => {
  try {
    const result = await Models[modelName].findByIdAndDelete(id).lean().exec();
    return result;
  } catch (error) {
    console.error(
      `Error in deleteDocById helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const deleteDocuments = async (modelName, query) => {
  try {
    const result = await Models[modelName].deleteMany(query).lean().exec();
    return result;
  } catch (error) {
    console.error(
      `Error in deleteDocuments helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const countDocuments = async (modelName, query = {}) => {
  try {
    const result = await Models[modelName].countDocuments(query).lean().exec();
    return result;
  } catch (error) {
    console.error(
      `Error in countDocuments helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

const exists = async (modelName, query) => {
  try {
    const result = await Models[modelName].exists(query).lean().exec();
    return result !== null;
  } catch (error) {
    console.error(`Error in exists helper for model [${modelName}] =>`, error);
    throw error;
  }
};

const aggregate = async (modelName, pipeline = [], options = {}) => {
  try {
    const result = await Models[modelName]
      .aggregate(pipeline)
      .option(options)
      .exec();
    return result;
  } catch (error) {
    console.error(
      `Error in aggregate helper for model [${modelName}] =>`,
      error
    );
    throw error;
  }
};

export {
  findDoc,
  findDocuments,
  findDocById,
  insertDoc,
  insertDocuments,
  updateDoc,
  updateDocById,
  updateDocuments,
  deleteDoc,
  deleteDocById,
  deleteDocuments,
  countDocuments,
  exists,
  aggregate,
  findDocumentsCount,
};
