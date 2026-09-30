import { deleteDocById, findDocById } from "../../../helpers/db/index.js";

const deleteRack = async (req, res) => {
    try {
        const { id } = req.params;

        const existingRack = await findDocById("rack", id);
        if (!existingRack) {
            return res.status(404).json({
                success: false,
                message: "Rack not found.",
                data: null,
            });
        }

        const deletedRack = await deleteDocById("rack", id);

        return res.status(200).json({
            success: true,
            message: "Rack deleted successfully.",
            data: deletedRack,
        });
    } catch (error) {
        console.error("Error deleting rack:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default deleteRack;
