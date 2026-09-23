import { findDocuments, findDocById, aggregate, updateDoc, updateDocuments } from "../../../helpers/db/index.js";
import mongoose from "mongoose";

const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, shelf, status, search, startDate, endDate, house, room, rack } = req.query;
    const query = {};

    if (shelf && shelf !== "all") {
      query.shelf = new mongoose.Types.ObjectId(shelf);
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDateObj;
      }
    }

    if (search) {
      query.$or = [
        { number: { $regex: search, $options: "i" } },
        { applicant: { $regex: search, $options: "i" } },
        { purpose: { $regex: search, $options: "i" } },
      ];
    }

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: "shelves",
          localField: "shelf",
          foreignField: "_id",
          as: "shelf",
        },
      },
      { $unwind: { path: "$shelf", preserveNullAndEmptyArrays: true } },
      // Lookup rack from shelf
      {
        $lookup: {
          from: "racks",
          localField: "shelf.rack",
          foreignField: "_id",
          as: "shelf.rack",
        },
      },
      { $unwind: { path: "$shelf.rack", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "rooms",
          localField: "shelf.rack.room",
          foreignField: "_id",
          as: "shelf.rack.room",
        },
      },
      { $unwind: { path: "$shelf.rack.room", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "houses",
          localField: "shelf.rack.room.house",
          foreignField: "_id",
          as: "shelf.rack.room.house",
        },
      },
      { $unwind: { path: "$shelf.rack.room.house", preserveNullAndEmptyArrays: true } },
    ];

    const postLookupMatch = {};
    if (house && house !== "all") {
      postLookupMatch["shelf.rack.room.house._id"] = new mongoose.Types.ObjectId(house);
    }
    if (room && room !== "all") {
      postLookupMatch["shelf.rack.room._id"] = new mongoose.Types.ObjectId(room);
    }
    if (rack && rack !== "all") {
      postLookupMatch["shelf.rack._id"] = new mongoose.Types.ObjectId(rack);
    }

    if (Object.keys(postLookupMatch).length > 0) {
      pipeline.push({ $match: postLookupMatch });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "added_by",
          foreignField: "_id",
          as: "added_by",
          pipeline: [
            { $project: { name: 1, email: 1, employee_id: 1 } }
          ]
        },
      },
      { $unwind: { path: "$added_by", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "updated_by",
          foreignField: "_id",
          as: "updated_by",
          pipeline: [
            { $project: { name: 1, email: 1, employee_id: 1 } }
          ]
        },
      },
      { $unwind: { path: "$updated_by", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "filetransactions",
          localField: "_id",
          foreignField: "file",
          as: "transactions",
          pipeline: [
            { $sort: { date: -1 } },
            {
              $lookup: {
                from: "users",
                localField: "performed_by",
                foreignField: "_id",
                as: "performed_by",
                pipeline: [
                  { $project: { name: 1, email: 1, role: 1 } }
                ]
              }
            },
            { $unwind: { path: "$performed_by", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "users",
                localField: "approved_by",
                foreignField: "_id",
                as: "approved_by",
                pipeline: [
                  { $project: { name: 1, email: 1 } }
                ]
              }
            },
            { $unwind: { path: "$approved_by", preserveNullAndEmptyArrays: true } }
          ]
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    );

    const files = await aggregate("file", pipeline);

    const countPipeline = [
      { $match: query },
      {
        $lookup: {
          from: "shelves",
          localField: "shelf",
          foreignField: "_id",
          as: "shelf",
        },
      },
      { $unwind: { path: "$shelf", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "racks",
          localField: "shelf.rack",
          foreignField: "_id",
          as: "shelf.rack",
        },
      },
      { $unwind: { path: "$shelf.rack", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "rooms",
          localField: "shelf.rack.room",
          foreignField: "_id",
          as: "shelf.rack.room",
        },
      },
      { $unwind: { path: "$shelf.rack.room", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "houses",
          localField: "shelf.rack.room.house",
          foreignField: "_id",
          as: "shelf.rack.room.house",
        },
      },
      { $unwind: { path: "$shelf.rack.room.house", preserveNullAndEmptyArrays: true } },
    ];

    if (Object.keys(postLookupMatch).length > 0) {
      countPipeline.push({ $match: postLookupMatch });
    }

    countPipeline.push({ $count: "total" });

    const countResult = await aggregate("file", countPipeline);
    const totalCount = countResult[0]?.total || 0;

    return res.status(200).json({
      success: true,
      message: "Files retrieved successfully.",
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};



const getFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      // Lookup shelf
      {
        $lookup: {
          from: "shelves",
          localField: "shelf",
          foreignField: "_id",
          as: "shelf"
        }
      },
      { $unwind: { path: "$shelf", preserveNullAndEmptyArrays: true } },
      // Lookup rack from shelf
      {
        $lookup: {
          from: "racks",
          localField: "shelf.rack",
          foreignField: "_id",
          as: "shelf.rack"
        }
      },
      { $unwind: { path: "$shelf.rack", preserveNullAndEmptyArrays: true } },
      // Lookup room from rack
      {
        $lookup: {
          from: "rooms",
          localField: "shelf.rack.room",
          foreignField: "_id",
          as: "shelf.rack.room"
        }
      },
      { $unwind: { path: "$shelf.rack.room", preserveNullAndEmptyArrays: true } },
      // Lookup house from room
      {
        $lookup: {
          from: "houses",
          localField: "shelf.rack.room.house",
          foreignField: "_id",
          as: "shelf.rack.room.house"
        }
      },
      { $unwind: { path: "$shelf.rack.room.house", preserveNullAndEmptyArrays: true } },
      // Lookup added_by user
      {
        $lookup: {
          from: "users",
          localField: "added_by",
          foreignField: "_id",
          as: "added_by",
          pipeline: [
            { $project: { name: 1, email: 1, employee_id: 1 } }
          ]
        }
      },
      { $unwind: { path: "$added_by", preserveNullAndEmptyArrays: true } },
      // Lookup updated_by user
      {
        $lookup: {
          from: "users",
          localField: "updated_by",
          foreignField: "_id",
          as: "updated_by",
          pipeline: [
            { $project: { name: 1, email: 1, employee_id: 1 } }
          ]
        }
      },
      { $unwind: { path: "$updated_by", preserveNullAndEmptyArrays: true } },
      // Lookup file transactions
      {
        $lookup: {
          from: "filetransactions",
          localField: "_id",
          foreignField: "file",
          as: "transactions",
          pipeline: [
            { $sort: { date: -1 } },
            {
              $lookup: {
                from: "users",
                localField: "performed_by",
                foreignField: "_id",
                as: "performed_by",
                pipeline: [
                  { $project: { name: 1, email: 1, role: 1 } }
                ]
              }
            },
            { $unwind: { path: "$performed_by", preserveNullAndEmptyArrays: true } }
          ]
        }
      }
    ];

    const result = await aggregate("file", pipeline);
    const file = result[0];

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "File retrieved successfully.",
      data: file,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export { getAllFiles, getFileById };
