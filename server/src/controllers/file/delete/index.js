import { deleteDocById, findDocById } from "../../../helpers/db/index.js";

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFile = await findDocById("file", id);
    if (!existingFile) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
        data: null,
      });
    }

    const deletedFile = await deleteDocById("file", id);

    return res.status(200).json({
      success: true,
      message: "File deleted successfully.",
      data: deletedFile,
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default deleteFile;
