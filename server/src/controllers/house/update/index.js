import { updateDocById, findDocById } from "../../../helpers/db/index.js";
import { updateHouseSchema } from "../../../validators/house/index.js";

const updateHouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = updateHouseSchema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
                data: null,
            });
        }

        const existingHouse = await findDocById("house", id);
        if (!existingHouse) {
            return res.status(404).json({
                success: false,
                message: "House not found.",
                data: null,
            });
        }

        const updatedHouse = await updateDocById("house", id, value);

        return res.status(200).json({
            success: true,
            message: "House updated successfully.",
            data: updatedHouse,
        });
    } catch (error) {
        console.error("Error updating house:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default updateHouse;
