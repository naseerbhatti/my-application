import { updateDocById, findDocById } from "../../../helpers/db/index.js";
import { updateRoomSchema } from "../../../validators/room/index.js";

const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateRoomSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        data: null,
      });
    }

    const existingRoom = await findDocById("room", id);
    if (!existingRoom) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
        data: null,
      });
    }

    // Verify house exists if being updated
    if (value.house_id) {
      const house = await findDocById("house", value.house_id);
      if (!house) {
        return res.status(404).json({
          success: false,
          message: "House not found.",
          data: null,
        });
      }
      value.house = value.house_id;
      delete value.house_id;
    }

    const updatedRoom = await updateDocById("room", id, value);

    return res.status(200).json({
      success: true,
      message: "Room updated successfully.",
      data: updatedRoom,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default updateRoom;
