import { updateDocById, findDocById } from "../../../helpers/db/index.js";
import { issueFileSchema } from "../../../validators/file/index.js";

const attachedFileSlip = async (req, res) => {
    try {

        const { image, id } = req.body;
        if (!image || !id) {
            return res.status(400).json({
                success: false,
                message: "Slip image and transaction ID are required.",
                data: null,
            });
        }

        req.body.updated_by = req.user._id;
        const findFileTransaction = await findDocById("fileTransaction", id);

        if (!findFileTransaction) {
            return res.status(404).json({
                success: false,
                message: "File transaction not found.",
                data: null,
            });
        }

        if (!image) {
            return res.status(400).json({
                success: false,
                message: "Slip image is required.",
                data: null,
            });
        }

        // update the file transaction with slip image
        const updatedFileTransaction = await updateDocById("fileTransaction", id, {
            issue_slip: image,
        });

        return res.status(200).json({
            success: true,
            message: "Slip image added successfully.",
            data: updatedFileTransaction,
        });

    } catch (error) {
        console.error("Error updating file:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export default attachedFileSlip;
