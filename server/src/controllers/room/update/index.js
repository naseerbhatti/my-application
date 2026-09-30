import { deleteDocById, findDocById } from "../../../helpers/db/index.js";

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        const existingRoom = await findDocById("room", id);
        if (!existingRoom) {
            return res.status(404).json({
                success: false,
                message: "Room not found.",
                data: null,
            });
        }

        const deletedRoom = await deleteDocById("room", id);

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully.",
            data: deletedRoom,
        });
    } catch (error) {
        console.error("Error deleting room:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default deleteRoom;
