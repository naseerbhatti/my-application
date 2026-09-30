import { updateDocById, findDocById } from "../../../helpers/db/index.js";
import { updateShelfSchema } from "../../../validators/shelf/index.js";

const updateShelf = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateShelfSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }

        const existingShelf = await findDocById("shelf", id);
        if (!existingShelf) {
            return res.status(404).json({
                success: false,
                message: "Shelf not found.",
                data: null,
            });
        }

        // Verify rack exists if being updated
        if (value.rackId) {
            const rack = await findDocById("rack", value.rackId);
            if (!rack) {
                return res.status(404).json({
                    success: false,
                    message: "Rack not found.",
                    data: null,
                });
            }
            value.rack = value.rackId;
            delete value.rackId;
        }

        const updatedShelf = await updateDocById("shelf", id, value);

        return res.status(200).json({
            success: true,
            message: "Shelf updated successfully.",
            data: updatedShelf,
        });
    } catch (error) {
        console.error("Error updating shelf:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default updateShelf;
