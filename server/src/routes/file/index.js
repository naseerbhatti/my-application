import express from "express";
import authenticate from "../../middlewares/authenticate/index.js";
import { authorize } from "../../middlewares/authorize/index.js";
import { checkPermission } from "../../middlewares/checkPermission/index.js";
import {
  addFile,
  getAllFiles,
  exportFileLogs,
  getFileById,
  updateFile,
  deleteFile,
  issueFile,
  returnFile,
  getFileStats,
  sbcaAllFile,
  missingFile,
} from "../../controllers/file/index.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const permissions = require("../../config/permission.json");
const router = express.Router();

router.post(
  "/add",
  authenticate,

  checkPermission(permissions.PERMISSIONS.FILE, permissions.CAPABILITIES.WRITE),
  addFile,
);

router.put("/missing/:id", authenticate, missingFile)

router.get(
  "/export-logs",
  authenticate,
  checkPermission(
    permissions.PERMISSIONS.FILE,
    permissions.CAPABILITIES.EXPORT,
  ),
  exportFileLogs,
);

router.put(
  "/return/:id",
  authenticate,

  checkPermission(
    permissions.PERMISSIONS.FILE,
    permissions.CAPABILITIES.UPDATE,
  ),
  returnFile,
);

router.put(
  "/issue/:id",
  authenticate,

  checkPermission(
    permissions.PERMISSIONS.FILE,
    permissions.CAPABILITIES.UPDATE,
  ),
  issueFile,
);

router.get(
  "/stats",
  authenticate,
  checkPermission(permissions.PERMISSIONS.FILE, permissions.CAPABILITIES.READ),
  getFileStats,
);
router.get(
  "/",
  authenticate,
  checkPermission(permissions.PERMISSIONS.FILE, permissions.CAPABILITIES.READ),
  getAllFiles,
);

router.get(
  "/sbca-files",
  authenticate,
  checkPermission(permissions.PERMISSIONS.FILE, permissions.CAPABILITIES.READ),
  sbcaAllFile,
);
router.get(
  "/:id",
  authenticate,
  checkPermission(permissions.PERMISSIONS.FILE, permissions.CAPABILITIES.READ),
  getFileById,
);

// router.get("/:id/transactions", authenticate,
//
//     checkPermission(permissions.PERMISSIONS.FILES, permissions.CAPABILITIES.READ), getFileTransactions);

router.put(
  "/update/:id",
  authenticate,

  checkPermission(
    permissions.PERMISSIONS.FILE,
    permissions.CAPABILITIES.UPDATE,
  ),
  updateFile,
);

router.delete(
  "/:id",
  authenticate,
  checkPermission(
    permissions.PERMISSIONS.FILE,
    permissions.CAPABILITIES.DELETE,
  ),
  deleteFile,
);

export default router;
