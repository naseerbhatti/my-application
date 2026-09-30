import { findDoc } from "../../../helpers/db/index.js";
import {responseHandler} from '../../../helpers/responseHandler.js'

const getMe = async (req, res) => {
    try {
        // req.user is set by the authenticate middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Return user data without password
        const userData = await findDoc("user", { _id: req.user._id });
        if (!userData) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        delete userData.password;

        return responseHandler(res, {
            success: true,
            message: "User retrieved successfully",
            data: {
                user: userData
            }
        });
        
    } catch (error) {
        console.error("Error getting user:", error);
        return responseHandler(res, {
            success: false,
            message: "Internal server error."
        })
    }
};

export default getMe;
