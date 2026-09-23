import express from "express";
import userRoutes from "./user/index.js";
import roomRoutes from "./room/index.js";
import houseRoutes from "./house/index.js";
import shelfRoutes from "./shelf/index.js";
import fileRoutes from "./file/index.js";
import rackRoutes from "./rack/index.js";
import fileTransactionRoutes from "../controllers/fileTransaction/index.js";
import { getSignedUrl } from "../helpers/cloud.js";
import authenticate from "../middlewares/authenticate/index.js";
import { checkPermission } from "../middlewares/checkPermission/index.js";

const router = express.Router();

// Mount routes
router.use("/auth", userRoutes);
router.use("/room", roomRoutes);
router.use("/house", houseRoutes);
router.use("/shelf", shelfRoutes);
router.use("/rack", rackRoutes);
router.use("/file", fileRoutes);
router.use("/fileTransaction", fileTransactionRoutes);


router.get("/get-signed-url", authenticate, getSignedUrl)

export default router;
