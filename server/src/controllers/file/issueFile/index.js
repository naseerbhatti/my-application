import {
  updateDocById,
  findDocById,
  findDoc,
  insertDocuments,
} from "../../../helpers/db/index.js";
import { issueFileSchema } from "../../../validators/file/index.js";

const issueFile = async (req, res) => {
  try {
    const { id } = req.params;

    req.body.updated_by = req.user._id;
    req.body.status = "issued"; // Set status to issued

    const { error, value } = issueFileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const existingFile = await findDocById("file", id);
    if (!existingFile) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
        data: null,
      });
    }

    const populatedFile = await findDoc(
      "file",
      { _id: id },
      {
        path: "shelf",
        populate: {
          path: "rack",
          populate: {
            path: "room",
            populate: { path: "house" },
          },
        },
      },
    );

    let currentLocation = null;

    if (populatedFile?.shelf) {
      const shelf = populatedFile.shelf;

      currentLocation = `B${shelf.rack.room.house.number}-R${shelf.rack.room.number}-R${shelf.rack.number}-S${shelf.number}`;
    }

    // Update the file to issued
    const updatedFile = await updateDocById("file", id, value);

    // Add history entry to fileTransaction
    const addHistoryEntry = await insertDocuments("fileTransaction", {
      file: id,
      action: "issue",
      performed_by: req.user._id,
      purpose: value.purpose,
      previous_location: currentLocation,
      date: new Date(),
      requestedBy: value.requestedBy,
    });

    return res.status(200).json({
      success: true,
      message: "File issued successfully.",
      data: updatedFile,
    });
  } catch (error) {
    console.error("Error issuing file:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error: " + error.message,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to issue file. Please try again.",
      data: null,
    });
  }
};

export default issueFile;
