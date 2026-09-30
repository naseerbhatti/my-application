import express from "express";
import { addUser, loginUser, getMe, logoutUser, deleteUser, editUser, getSingleUser, userRole, getPermissions } from "../../controllers/user/index.js";
import { getAllUsers } from "../../controllers/user/get/index.js";
import authenticate from "../../middlewares/authenticate/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import permissions from "../../config/permission.json" with { type: "json" };
const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/", authenticate, checkPermission(permissions.PERMISSIONS.USER, permissions.CAPABILITIES.WRITE), addUser);
router.delete("/:id", authenticate, checkPermission(permissions.PERMISSIONS.USER, permissions.CAPABILITIES.DELETE), deleteUser);
router.put("/:id", editUser);



router.get("/role", userRole);
router.get("/me", authenticate, getMe);
router.get("/single/:id", authenticate, checkPermission(permissions.PERMISSIONS.USER, permissions.CAPABILITIES.READ), getSingleUser);
router.get("/",  authenticate, checkPermission(permissions.PERMISSIONS.USER, permissions.CAPABILITIES.READ), getAllUsers);
router.get("/permissions", authenticate, getPermissions);



export default router;
 