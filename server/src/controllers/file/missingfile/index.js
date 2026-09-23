import {
  updateDocById,
  findDocById,
  findDoc,
  findDocuments,
  insertDocuments,
} from "../../../helpers/db/index.js";

const missingFile = async (req, res) => {
  try {
    const { id } = req.params;

    const file = await findDocById("file", id);
    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // ✅ Get full location
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

    // 1. update file status
    await updateDocById("file", id, {
      status: "missing",
      updated_by: req.user._id,
    });

    // 2. add history
    await insertDocuments("fileTransaction", {
      file: id,
      action: "missing",
      performed_by: req.user._id,
      previous_location: currentLocation,
      purpose: "File Marked  Missing",
      date: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "File marked as missing",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error marking file missing",
    });
  }
};

export default missingFile;
