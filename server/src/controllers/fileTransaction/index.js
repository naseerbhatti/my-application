import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import updateIssueSlip from './editSlip/index.js'
import attachedFileSlip from "./issueSlip/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import permissions from "../../config/permission.json" with { type: "json" };

const router = express.Router();

router.post("/slip", authenticate, checkPermission(permissions.PERMISSIONS.FILETRANSACTION, permissions.CAPABILITIES.WRITE), attachedFileSlip);
router.put("/:id", authenticate, checkPermission(permissions.PERMISSIONS.FILETRANSACTION, permissions.CAPABILITIES.UPDATE), updateIssueSlip);


export default router;
