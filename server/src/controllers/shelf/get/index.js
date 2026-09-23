import { findDocuments, findDocById, aggregate } from "../../../helpers/db/index.js";
import mongoose from "mongoose";


const getAllShelves = async (req, res) => {
  try {
    const { page = 1, limit = 10, rack_id } = req.query;
    const query = rack_id && rack_id !== "all" ? { rack: rack_id } : {};
    // const query = rack_id ? { rack: rack_id } : {};

    const shelves = await findDocuments("shelf", query, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: "rack", select: "number room" },
    });

    const totalCount = await findDocuments("shelf", query);

    return res.status(200).json({
      success: true,
      message: "Shelves retrieved successfully.",
      data: shelves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
      },
    });
  } catch (error) {
    console.error("Error fetching shelves:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

const getShelfById = async (req, res) => {
  try {
    const { id } = req.params;

    const shelf = await findDocById("shelf", id);

    if (!shelf) {
      return res.status(404).json({
        success: false,
        message: "Shelf not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shelf retrieved successfully.",
      data: shelf,
    });
  } catch (error) {
    console.error("Error fetching shelf:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};




const getShelfFileStats = async (req, res) => {
  try {
    const { shelfId } = req.params;
    console.log(req.params);

    if (!shelfId) {
      return res.status(400).json({
        success: false,
        message: "Shelf ID is required",
      });
    }
    console.log("shelfId:", shelfId);


    const result = await aggregate("file", [
      {
        $match: {
          shelf: new mongoose.Types.ObjectId(shelfId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("Aggregation result:", result);

    // Defaults
    let totalFiles = 0;
    let availableFiles = 0;
    let issuedFiles = 0;

    result.forEach((item) => {
      totalFiles += item.count;

      if (item._id === "available") {
        availableFiles = item.count;
      }

      if (item._id === "issued") {
        issuedFiles = item.count;
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        shelfId,
        totalFiles,
        availableFiles,
        issuedFiles,
      },
    });
  } catch (error) {
    console.error("Shelf stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getAllShelves, getShelfById, getShelfFileStats };
