import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findDoc } from "../../../helpers/db/index.js";
import { loginUserSchema } from "../../../validators/user/index.js";
import config from "../../../config/index.js";
import { responseHandler } from "../../../helpers/responseHandler.js";

const jwtSecret = config.config.jwtSecret;

if (!jwtSecret) {
  throw new Error("Missing env variable [jwtSecret]");
}

const loginUser = async (req, res) => {
  try {
    const { error, value } = loginUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { email, password } = value;

    const user = await findDoc("user", { email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    const tokenPayload = {
      _id: user._id,
      role: user.role,
      permissions: user.permissions,
    };

    const token = jwt.sign(tokenPayload, jwtSecret, {
      expiresIn: "7d",
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
    };

    return responseHandler(res, {
      success: true,
      message: "Login successful.",
      data: {
        token,
        user: safeUser,
      },
    });
  } catch (error) {
    console.error("Error logging in user:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export default loginUser;