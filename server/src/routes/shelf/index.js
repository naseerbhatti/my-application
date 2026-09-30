import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import {
    addShelf, getAllShelves, getShelfById, updateShelf, deleteShelf, getShelfFileStats
} from "../../controllers/shelf/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import permissions from "../../config/permission.json" with { type: "json" };
const router = express.Router();


router.post("/", authenticate,
    checkPermission(permissions.PERMISSIONS.SHELF, permissions.CAPABILITIES.WRITE), addShelf);
router.get("/", authenticate,
    checkPermission(permissions.PERMISSIONS.SHELF, permissions.CAPABILITIES.READ),
    getAllShelves);
router.get("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.SHELF, permissions.CAPABILITIES.READ),
    getShelfById);
router.put("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.SHELF, permissions.CAPABILITIES.UPDATE),
    updateShelf);
router.delete("/:id", authenticate,
    checkPermission(permissions.PERMISSIONS.SHELF, permissions.CAPABILITIES.DELETE),
    deleteShelf);
router.get("/shelfdetail/:shelfId", getShelfFileStats)
export default router;
