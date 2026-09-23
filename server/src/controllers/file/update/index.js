import {
  updateDocById,
  findDocById,
  findDoc,
} from "../../../helpers/db/index.js";
import {
  generateFileNum,
  generateQRCode,
} from "../../../helpers/qrCodeGenerator.js";
import { updateFileSchema } from "../../../validators/file/index.js";
import FileTransaction from "../../../models/fileTransaction/index.js";

const updateFile = async (req, res) => {
  try {
    const { id } = req.params;

    req.body.updated_by = req.user._id;

    const { error, value } = updateFileSchema.validate(req.body);

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

    // ✅ status validation
    if (value.status) {
      const allowedStatuses = ["issued", "available", "missing"];

      if (!allowedStatuses.includes(value.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value.",
          data: null,
        });
      }

      existingFile.status = value.status;
    }

    // ✅ duplicate file number check
    if (value.number && value.number !== existingFile.number) {
      const duplicateFile = await findDoc("file", { number: value.number });
      if (duplicateFile) {
        return res.status(409).json({
          success: false,
          message: "File number already exists.",
          data: null,
        });
      }
    }

    //  LOCATION TRACKING START
    let previousLocation = null;
    let newLocation = null;

    if (value.shelf) {
      const shelf = await findDoc(
        "shelf",
        { _id: value.shelf },
        {
          path: "rack",
          populate: {
            path: "room",
            populate: { path: "house" },
          },
        },
      );

      if (!shelf) {
        return res.status(404).json({
          success: false,
          message: "Shelf not found.",
          data: null,
        });
      }

      const isLocationChanging =
        value.shelf.toString() !== existingFile.shelf?.toString();

      //  Previous Location
      if (isLocationChanging && existingFile.shelf) {
        const previousShelf = await findDoc(
          "shelf",
          { _id: existingFile.shelf },
          {
            path: "rack",
            populate: {
              path: "room",
              populate: { path: "house" },
            },
          },
        );

        if (previousShelf) {
          previousLocation = generateQRCode(
            previousShelf.rack.room.house.number,
            previousShelf.rack.room.number,
            previousShelf.rack.number,
            previousShelf.number,
          );

          // optional: keep history in file
          value.last_locations = existingFile.last_locations || [];
          value.last_locations.push({
            location: previousLocation,
            timestamp: new Date(),
            updated_by: req.user._id,
          });
        }
      }

      //  New Location
     newLocation = generateQRCode(
        shelf.rack.room.house.number,
        shelf.rack.room.number,
        shelf.rack.number,
        shelf.number,
      );

      const qrCodeDataURL = await generateFileNum(newLocation);
      value.qr_code = qrCodeDataURL;
      value.qr_code_value = newLocation;
    }
    //  LOCATION TRACKING END

    const updatedFile = await updateDocById("file", id, value);

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

    //  Transaction with location tracking
    await FileTransaction.create({
      file: id,
      action: "update",
      performed_by: req.user._id,
      purpose: "File Location Updated",
      department: req.user.department,
      previous_location: previousLocation,
      new_location: newLocation,
      date: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "File updated successfully.",
      data: populatedFile || updatedFile,
    });
  } catch (error) {
    console.error("Error updating file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default updateFile;
