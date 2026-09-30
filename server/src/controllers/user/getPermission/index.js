

import permission from "../../../config/permission.json" with { type: "json" };
import {responseHandler} from '../../../helpers/responseHandler.js'
const getPermissions = async (req, res) => {
    try {

        return responseHandler(res, {
            success: true,
            message: "User fetched Succesfully.",
            data: permission,
        })
    } catch (error) {
        console.error("Error getting user:", error);
        return responseHandler(res, {
            success: false,
            message: "Internal server error",
        });
    }
};

export default getPermissions;
