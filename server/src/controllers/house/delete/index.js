import { deleteDocById, findDocById } from "../../../helpers/db/index.js";

const deleteHouse = async (req, res) => {
    try {
        const { id } = req.params;

        const existingHouse = await findDocById("house", id);
        if (!existingHouse) {
            return res.status(404).json({
                success: false,
                message: "House not found.",
                data: null,
            });
        }

        const deletedHouse = await deleteDocById("house", id);

        return res.status(200).json({
            success: true,
            message: "House deleted successfully.",
            data: deletedHouse,
        });
    } catch (error) {
        console.error("Error deleting house:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default deleteHouse;
