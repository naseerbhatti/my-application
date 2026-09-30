import mongoose from "mongoose";
import {
  findDocuments,
  findDocById,
  aggregate,
  findDoc,
} from "../../../helpers/db/index.js";

const getAllRacks = async (req, res) => {
  try {
    const { page = 1, limit = 10, room_id, search } = req.query;

    const isValidObjectId = mongoose.Types.ObjectId.isValid;

    const query = {};

    if (room_id && room_id !== "all" && isValidObjectId(room_id)) {
      query.room = room_id;
    }

    //  SEARCH LOGIC
    if (search) {
      query.$or = [
        {
          $expr: {
            $eq: [
              { $toInt: "$number" },
              parseInt(search.replace(/\D/g, ""), 10),
            ],
          },
        },
      ];
    }

    const racks = await findDocuments("rack", query, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: {
        path: "room",
        select: "number house",
        populate: {
          path: "house",
          select: "name address",
        },
      },
    });

    const totalCount = await findDocuments("rack", query);

    return res.status(200).json({
      success: true,
      message: "Racks retrieved successfully.",
      data: racks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount.length,
      },
    });
  } catch (error) {
    console.error("Error fetching racks:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

const getRackById = async (req, res) => {
  try {
    const { id } = req.params;

    // const rack = await findDocById("rack", id);
    const rackWithShelves = await aggregate("rack", [
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: "shelves",
          let: { rackId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$rack", "$$rackId"] } } },
            {
              $lookup: {
                from: "racks",
                localField: "rack",
                foreignField: "_id",
                as: "rack",
              },
            },
          ],
          as: "shelves",
        },
      },
    ]);
    if (!rackWithShelves || rackWithShelves.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rack not found.",
        data: null,
      });
    }
    const rack = rackWithShelves[0];
    return res.status(200).json({
      success: true,
      message: "Rack retrieved successfully.",
      data: rack,
    });
  } catch (error) {
    console.error("Error fetching rack:", error);
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

    if (!shelfId) {
      return res.status(400).json({
        success: false,
        message: "Shelf ID is required",
      });
    }

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

export { getAllRacks, getRackById, getShelfFileStats };