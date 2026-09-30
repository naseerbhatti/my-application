import { aggregate } from "../../../helpers/db/index.js";
import {responseHandler} from "../../../helpers/responseHandler.js";

const userRole = async (req, res) => {
  try {
    const rolesData = await aggregate("user", [
      { $group: { _id: "$role" } },
      { $project: { _id: 0, role: "$_id" } },
    ]);

    const roles = rolesData.map((r) => r.role).filter(Boolean);

    return responseHandler(res, {
      success: true,
      message: "User roles fetched successfully",
      data: roles,
    })
  } catch (error) {
    console.error(error);
    return responseHandler(res, {
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};


export default userRole