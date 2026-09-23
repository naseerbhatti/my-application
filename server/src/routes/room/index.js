import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import permissions from "../../config/permission.json" with { type: "json" };
import {
  addRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  getLastRoomNumber,
} from "../../controllers/room/index.js";
const router = express.Router();

router.post(
  "/add",
  authenticate,
  checkPermission(permissions.PERMISSIONS.ROOM, permissions.CAPABILITIES.WRITE),
  addRoom,
);
router.get("/last-number", authenticate, getLastRoomNumber);
router.get(
  "/",
  authenticate,
  checkPermission(permissions.PERMISSIONS.ROOM, permissions.CAPABILITIES.READ),
  getAllRooms,
);
router.get(
  "/:id",
  authenticate,
  checkPermission(permissions.PERMISSIONS.ROOM, permissions.CAPABILITIES.READ),
  getRoomById,
);
router.put(
  "/:id",
  authenticate,
  checkPermission(
    permissions.PERMISSIONS.ROOM,
    permissions.CAPABILITIES.UPDATE,
  ),
  updateRoom,
);
router.delete(
  "/:id",
  authenticate,
  checkPermission(
    permissions.PERMISSIONS.ROOM,
    permissions.CAPABILITIES.DELETE,
  ),
  deleteRoom,
);

export default router;
