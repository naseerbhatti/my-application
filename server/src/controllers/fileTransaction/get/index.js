import { findDocuments } from "../../../helpers/db/index.js";

const getFileTransactions = async (req, res) => {
    try {
        const { id } = req.params; // file id
        const { page = 1, limit = 10, action, status } = req.query;

        const query = { file: id };

        // Filter by action type (issue, return, extend, missing, found)
        if (action) {
            query.action = action;
        }

        // Filter by status (pending, approved, rejected)
        if (status) {
            query.status = status;
        }

        const transactions = await findDocuments("fileTransaction", query, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { date: -1 }, // Most recent first
            populate: [
                {
                    path: "performed_by",
                    select: "name email role",
                },
                {
                    path: "approved_by",
                    select: "name email",
                },
                {
                    path: "file",
                    select: "number applicant purpose createdAt status",
                },
            ],
        });

        const totalCount = await findDocuments("fileTransaction", query);

        return res.status(200).json({
            success: true,
            message: "File transactions retrieved successfully.",
            data: {
                transactions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalCount: totalCount.length,
                    totalPages: Math.ceil(totalCount.length / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        console.error("Error fetching file transactions:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve file transactions.",
            data: null,
        });
    }
};

export default getFileTransactions;
