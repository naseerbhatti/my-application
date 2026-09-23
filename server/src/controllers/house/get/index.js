import { findDocuments, findDocById } from "../../../helpers/db/index.js";

const getAllHouses = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const houses = await findDocuments("house", {}, {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        });

        const totalCount = await findDocuments("house");

        return res.status(200).json({
            success: true,
            message: "Houses retrieved successfully.",
            data: houses,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount.length,
            },
        });
    } catch (error) {
        console.error("Error fetching houses:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

const getHouseById = async (req, res) => {
    try {
        const { id } = req.params;

        const house = await findDocById("house", id);

        if (!house) {
            return res.status(404).json({
                success: false,
                message: "House not found.",
                data: null,
            });
        }

        return res.status(200).json({
            success: true,
            message: "House retrieved successfully.",
            data: house,
        });
    } catch (error) {
        console.error("Error fetching house:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            data: null,
        });
    }
};

export { getAllHouses, getHouseById };
