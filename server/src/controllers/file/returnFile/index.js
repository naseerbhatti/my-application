import {
  updateDocById,
  findDocById,
  findDocuments,
  findDoc,
  insertDocuments,
} from "../../../helpers/db/index.js";
import { issueFileSchema } from "../../../validators/file/index.js";

const returnFile = async (req, res) => {
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

    // Update file status
    const updatedFile = await updateDocById("file", id, {
      status: "available",
      updated_by: req.user._id,
    });

    //  Add NEW history entry
    await insertDocuments("fileTransaction", {
      file: id,
      action: "return",
      performed_by: req.user._id,
      purpose: "File Marked  Available",
      requestedBy: req.body.requestedBy,
      previous_location: currentLocation,
      return_date: new Date(),
      return_condition: req.body.return_condition || "good",
    });

    return res.status(200).json({
      success: true,
      message: "File returned successfully.",
      data: updatedFile,
    });
  } catch (error) {
    console.log("ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to return file. Please try again.",
      data: null,
    });
  }
};

export default returnFile;
