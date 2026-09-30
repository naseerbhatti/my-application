import { updateDocById, findDocById } from "../../../helpers/db/index.js";
import { updateRackSchema } from "../../../validators/rack/index.js";

const updateRack = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateRackSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }

        const existingRack = await findDocById("rack", id);
        if (!existingRack) {
            return res.status(404).json({
                success: false,
                message: "Rack not found.",
                data: null,
            });
        }

        // Verify room exists if being updated
        if (value.roomId) {
            const room = await findDocById("room", value.roomId);
            if (!room) {
                return res.status(404).json({
                    success: false,
                    message: "Room not found.",
                    data: null,
                });
            }
            value.room = value.roomId;
            delete value.roomId;
        }

        const updatedRack = await updateDocById("rack", id, value);

        return res.status(200).json({
            success: true,
            message: "Rack updated successfully.",
            data: updatedRack,
        });
    } catch (error) {
        console.error("Error updating rack:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default updateRack;
