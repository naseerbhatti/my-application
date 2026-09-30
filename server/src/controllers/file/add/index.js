import {
  insertDoc,
  findDocById,
  insertDocuments,
  findDoc,
} from "../../../helpers/db/index.js";
import {
  generateQRCode,
  generateFileNum,
} from "../../../helpers/qrCodeGenerator.js";
import { createFileSchema } from "../../../validators/file/index.js";

const addFile = async (req, res) => {
  try {
    console.log(req.body);
    console.log(req.user);

    const value = req.body;

    const { error } = createFileSchema.validate(value, { abortEarly: false });
    if (error) {
      const errorMessages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        data: errorMessages,
      });
    }

    const shelf = await findDoc(
      "shelf",
      { _id: value.shelf },
      {
        path: "rack",
        populate: [
          { path: "house" },
          {
            path: "room",
            populate: { path: "house" },
          },
        ],
      },
    );
    if (!shelf) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found.",
        data: null,
      });
    }
    const rack = shelf.rack.number;
    const room = shelf.rack.room.number;
    const house = shelf.rack.room.house.number;

    const generateNumber = generateQRCode(house, room, rack, shelf.number);

    // Check if file number already exists
    const existingFile = await findDoc("file", {
      proposal_file_no: value.proposal_file_no,
    });
    if (existingFile) {
      return res.status(409).json({
        success: false,
        message: "File number already exists.",
        data: null,
      });
    }

    // Generate QR code data URL
    const qrCodeDataURL = await generateFileNum(generateNumber);
    value.qr_code = qrCodeDataURL;

    // add proposal_circle and district fields
    const fileData = {
      number: value.number,
      proposal_file_no: value.proposal_file_no,
      plot_area: value.plot_area,
      proposal_circle: value.proposal_circle,
      district: value.district,
      property_address: value.property_address,
      covered_area: value.covered_area,
      owners: value.owners,
      total_floor: value.total_floor,
      plan_type: value.plan_type,
      shelf: value.shelf,
      status: value.status || "available",
      qr_code: qrCodeDataURL,
      qr_code_value: generateNumber,
      added_by: value.added_by || req.user?._id,
    };

    const newFile = await insertDoc("file", fileData);
    const currentLocation = `B${house}-R${room}-R${rack}-S${shelf.number}`;

    await insertDocuments("fileTransaction", {
      file: newFile._id, 
      action: "created", 
      performed_by: req.user._id,
      new_location: currentLocation,
      purpose: "File Marked Created",
      date: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "File created successfully.",
      data: newFile,
    });
  } catch (error) {
    console.error("Error creating file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default addFile;
