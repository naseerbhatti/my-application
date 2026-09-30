import { deleteDocById, findDocById } from "../../../helpers/db/index.js";

const deleteShelf = async (req, res) => {
    try {
        const { id } = req.params;

        const existingShelf = await findDocById("shelf", id);
        if (!existingShelf) {
            return res.status(404).json({
                success: false,
                message: "Shelf not found.",
                data: null,
            });
        }

        const deletedShelf = await deleteDocById("shelf", id);

        return res.status(200).json({
            success: true,
            message: "Shelf deleted successfully.",
            data: deletedShelf,
        });
    } catch (error) {
        console.error("Error deleting shelf:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default deleteShelf;
