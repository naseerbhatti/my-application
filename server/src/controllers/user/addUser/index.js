import bcrypt from "bcryptjs";
import { findDoc, insertDoc } from "../../../helpers/db/index.js";
import { addUserSchema } from "../../../validators/user/index.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const permission = require("../../../config/permission.json");
import {responseHandler} from '../../../helpers/responseHandler.js'


const addUser = async (req, res) => {
  try {
    const { error, value } = addUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, cnic, password } = value;


    const existingUser = await findDoc("user", { email, cnic });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User with this email or cnic already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    value.password = hashedPassword;

    // Use permissions from payload if provided, otherwise use role-based permissions
    const valueWithPermissions = {
      ...value,
      permissions: value.permissions ||
        (value.role ? permission.USER_ROLES[value.role.toUpperCase()] : {}) ||
        {},
    };

    const newUser = await insertDoc("user", valueWithPermissions);

    return responseHandler(res, {
      message: "User created successfully.",
      user: newUser,
    });
    
  } catch (error) {
    console.error("Error creating user:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]; // "email"
      const value = error.keyValue[field];
      return res.status(409).json({
        message: `${field} "${value}" already exists!`,
      });
    }


    return res.status(500).json({ message: "Internal server error." });
  }
};

export default addUser;
