import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import permissions from "../../config/permission.json" with { type: "json" };
import { addRack, getAllRacks, updateRack, deleteRack, getRackById } from "../../controllers/rack/index.js";
const router = express.Router();

router.post("/add", authenticate, checkPermission(permissions.PERMISSIONS.RACK, permissions.CAPABILITIES.WRITE), addRack);
router.get("/", authenticate, checkPermission(permissions.PERMISSIONS.RACK, permissions.CAPABILITIES.READ), getAllRacks);
router.get("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.RACK, permissions.CAPABILITIES.READ),
    getRackById);
router.put("/:id", checkPermission(permissions.PERMISSIONS.RACK, permissions.CAPABILITIES.UPDATE), authenticate, updateRack);
router.delete("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.RACK, permissions.CAPABILITIES.DELETE),
    deleteRack);
export default router;
