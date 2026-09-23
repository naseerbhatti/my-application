import { insertDoc, findDocById } from "../../../helpers/db/index.js";
import { createShelfSchema } from "../../../validators/shelf/index.js";

const addShelf = async (req, res) => {
  try {
    const { error, value } = createShelfSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // Verify rack exists
    const rack = await findDocById("rack", value.rack_id);
    if (!rack) {
      return res.status(404).json({
        success: false,
        message: "Rack not found.",
        data: null,
      });
    }

    const shelfData = {
      number: value.number,
      rack: value.rack_id,
      capacity: value.capacity,
    };

    const newShelf = await insertDoc("shelf", shelfData);

    return res.status(201).json({
      success: true,
      message: "Shelf created successfully.",
      data: newShelf,
    });
  } catch (error) {
    console.error("Error creating shelf:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default addShelf;
