import bcrypt from "bcryptjs";
import { findDoc, updateDocById } from "../../../helpers/db/index.js";
import { responseHandler } from "../../../helpers/responseHandler.js";

const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await findDoc("user", { _id: id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prepare final update data, appending to arrays if provided
    const finalUpdateData = { ...updateData };

    if (updateData.avatar && Array.isArray(updateData.avatar)) {
      finalUpdateData.avatar = [
        ...(user.avatar || []),
        ...updateData.avatar,
      ];
    }

    if (updateData.joining_letter && Array.isArray(updateData.joining_letter)) {
      finalUpdateData.old_joining_letter = [
        ...(user.joining_letter || []),
      ];
      finalUpdateData.joining_letter = [
        ...updateData.joining_letter,
      ];
    }

    if (updateData.leaving_letter && Array.isArray(updateData.leaving_letter)) {
      finalUpdateData.old_leaving_letter = [
        ...(user.leaving_letter || []),
      ];
      finalUpdateData.leaving_letter = [
        ...updateData.leaving_letter,
      ];
    }
    if (updateData.password) {
      const hashPassword = await bcrypt.hash(updateData.password, 10);
      finalUpdateData.password = hashPassword;
    }


    const updatedUser = await updateDocById("user", id, finalUpdateData);

    return responseHandler(res, {
      success: true,
      message: "User updated successfully.",
      data: {
        user: updatedUser,
      }
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return responseHandler(res, {
      success: false,
      message: "Internal server error.",
    });
  }
};

export default editUser;
