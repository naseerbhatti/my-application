import express from "express";

import authenticate from "../../middlewares/authenticate/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import { addHouse, getAllHouses, getHouseById, updateHouse, deleteHouse } from "../../controllers/house/index.js";
import permissions from "../../config/permission.json" with { type: "json" };
const router = express.Router();

router.post("/add", authenticate,
    checkPermission(permissions.PERMISSIONS.HOUSE, permissions.CAPABILITIES.WRITE)
    , addHouse);
router.get("/", authenticate,
    checkPermission(permissions.PERMISSIONS.HOUSE, permissions.CAPABILITIES.READ),
    getAllHouses);
router.get("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.HOUSE, permissions.CAPABILITIES.READ),
    getHouseById);
router.put("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.HOUSE, permissions.CAPABILITIES.UPDATE),
    updateHouse);
router.delete("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.HOUSE, permissions.CAPABILITIES.DELETE),
    deleteHouse);


export default router;
