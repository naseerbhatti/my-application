import { insertDoc, findDocById } from "../../../helpers/db/index.js";
import { createRackSchema } from "../../../validators/rack/index.js";

const addRack = async (req, res) => {
  try {
    const { error, value } = createRackSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    // Verify room exists
    const room = await findDocById("room", value.room_id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
        data: null,
      });
    }

    // Verify house exists
    const house = await findDocById("house", value.house_id);
    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found.",
        data: null,
      });
    }

    const rackData = {
      number: value.number,
      house: value.house_id,
      room: value.room_id,
      total_shelf: value.total_shelf,
    };

    const newRack = await insertDoc("rack", rackData);

    const createdShelves = [];

    for (let i = 0; i < value.total_shelf; i++) {
      const shelfData = {
        number: i + 1,
        rack: newRack._id,
        capacity: value.shelf_capacity || 100, // default 50 if not provided
      };
      try {
        const newShelf = await insertDoc("shelf", shelfData);
        createdShelves.push(newShelf);
      } catch (err) {
        console.error("Failed to create shelf", i + 1, err);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Rack created successfully.",
      data: {
    ...newRack._doc,   // if using Mongoose
    shelves: createdShelves, // include the created shelves
  },
    });
  } catch (error) {
    console.error("Error creating rack:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default addRack;
