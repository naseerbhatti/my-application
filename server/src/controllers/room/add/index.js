import {
  insertDoc,
  findDocById,
  findDocuments,
} from "../../../helpers/db/index.js";
import { createRoomSchema } from "../../../validators/room/index.js";

const addRoom = async (req, res) => {
  try {
    const { error, value } = createRoomSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { house_id, count } = value;

    const house = await findDocById("house", house_id);
    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found.",
      });
    }

    // last room number find
    const existingRooms = await findDocuments("room", {
      house: house_id,
    });

    const lastNumber = existingRooms.length
      ? Math.max(...existingRooms.map((r) => r.number))
      : 0;

    const createdRooms = [];

    for (let i = 1; i <= count; i++) {
      const newRoom = await insertDoc("room", {
        house: house_id,
        number: lastNumber + i,
      });

      createdRooms.push(newRoom);
    }

    return res.status(201).json({
      success: true,
      message: `${count} rooms created successfully.`,
      data: createdRooms,
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export default addRoom;
