import { findDocById } from "../../../helpers/db/index.js";
import mongoose from "mongoose";
import {responseHandler} from '../../../helpers/responseHandler.js'

const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
        data: null,
      });
    }

    const user = await findDocById("user", id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    const userData = { ...user }
    delete userData.password;

    return  responseHandler(res, {
      success: true,
      message: "User fetched Succesfully.",
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error("Error getting user:", error);
    return responseHandler(res, {
      success: false,
      message: "Internal server error",
    });
  }
};

export default getSingleUser;
