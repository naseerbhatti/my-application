import { findDoc } from "../../helpers/db/index.js";
import { ROLES } from "../../Constant.js";

export const authorize = (permittedRoles) => {
    return async (req, res, next) => {
        try {
            const { user } = req;
            const rolesArr = Object.values(ROLES) || [];

            if (!user) {
                return res.status(401).json({
                    status: 401,
                    message: "Unauthorized.",
                });
            }

            const rolesToCheck = Array.isArray(permittedRoles)
                ? permittedRoles
                : [permittedRoles];

            if (!rolesToCheck || !rolesToCheck.length) {
                return res.status(400).json({
                    status: 400,
                    message: "No roles specified.",
                });
            }

            const invalidRoles = rolesToCheck.filter(
                (role) => !rolesArr.includes(role)
            );

            if (invalidRoles.length > 0) {
                return res.status(400).json({
                    status: 400,
                    message: `Invalid role(s) specified: ${invalidRoles.join(", ")}.`,
                });
            }

            if (!user.role || (!user.isAdmin && !rolesToCheck.includes(user.role))) {
                return res.status(403).json({
                    status: 403,
                    message: "Unauthorized role.",
                });
            }

            if (user.isAdmin) {
                const userExist = await findDoc("user", { _id: user.id });

                if (!userExist) {
                    return res.status(404).json({
                        status: 404,
                        message: "User not found.",
                    });
                }
                req.user = { ...userExist._doc, isAdmin: true };
            }

            next();
        } catch (err) {
            console.log("Error authorizing user =>", err);
            return res.status(500).json({
                status: 500,
                message: "Internal server error during authorization.",
            });
        }
    };
};