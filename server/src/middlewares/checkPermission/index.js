export const checkPermission = (permission, capability) => {
    return async (req, res, next) => {
        const { user } = req;

        if (!user) {
            return res.status(401).send({
                status: 401,
                message: "Unauthorized.",
            });
        }


        console.log(user ,"user")
        if (!user.role || !user.permissions) {
            return res.status(401).send({
                status: 401,
                message: "User role or permissions not found.",
            });
        }


        const permArr = Object.keys(user.permissions);
        const hasPermission = permArr.includes(permission);
        const hasCapability = user.permissions[permission]?.includes(capability);

        if (!hasPermission || !hasCapability) {
            return res.status(401).send({
                status: 401,
                message: "You don't have permission to perform this action.",
            });
        }

        next();
    };
};
