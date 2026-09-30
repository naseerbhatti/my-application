import jwt from "jsonwebtoken";
import config from "../../config/index.js";

const jwtSecret = process.env.JWT_SECRET || config.config.jwtSecret;

if (!jwtSecret) {
  throw new Error("Missing env variable [jwtSecret]");
}

const authenticate = (req, res, next) => {
  try {
    const token = req.headers?.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ status: 401, message: "Unauthorized." });
    }


    let decoded;
    jwt.verify(token, jwtSecret, (err, user) => {
      if (err) {
        return res.status(403).json({ status: 403, message: "Forbidden." });
      }
      decoded = user;
    });

    if (!decoded) {
      return res
        .status(401)
        .json({ status: 401, message: "Token Unauthorized." });
    }

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(500).json({
      status: 500,
      message: "Internal server error during authentication.",
    });
  }
};

export default authenticate;
