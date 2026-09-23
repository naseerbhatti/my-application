import { insertDoc } from "../../../helpers/db/index.js";
import { createHouseSchema } from "../../../validators/house/index.js";
import House from "../../../models/house/index.js";

const addHouse = async (req, res) => {
  try {
    const { error, value } = createHouseSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // Get the highest house number and increment
    const lastHouse = await House.findOne().sort({ number: -1 }).lean();
     // ensure numeric + safe fallback
    const nextNumber = Number(lastHouse?.number || 0) + 1;

    // Add the auto-incremented number to the house data
    const houseData = {
      ...value,
      number: nextNumber,
    };

    const newHouse = await insertDoc("house", houseData);

    return res.status(201).json({
      success: true,
      message: "House created successfully.",
      data: newHouse,
    });
  } catch (error) {
    console.error("Error creating house:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "House number already exists. Try again.",
        data: null,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default addHouse;
