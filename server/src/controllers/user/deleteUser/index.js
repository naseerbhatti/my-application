import { deleteDocById, findDoc } from "../../../helpers/db/index.js";
import {responseHandler} from '../../../helpers/responseHandler.js'

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await findDoc("user", { _id: id });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    await deleteDocById("user", id);

    return responseHandler(res, {
      message: "User deleted successfully.",
    })
  } catch (error) {
    console.error("Error deleting user:", error);
    return responseHandler(res, {
      success: false,
      message: "Internal server error.",
    })
  }
};

export default deleteUser;
