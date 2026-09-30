import {responseHandler} from '../../../helpers/responseHandler.js'


const logoutUser = async (req, res) => {
    try {
        // Clear any cookies if they exist
        res.clearCookie("token");
        res.clearCookie("refreshToken");

        return responseHandler(res, {
            success: true,
            message: "User Logged out successfully.",
        })
    } catch (error) {
        console.error("Error logging out user:", error);
        return responseHandler(res, {
            success: false,
            message: "Internal server error."
        });
    }
};

export default logoutUser;
