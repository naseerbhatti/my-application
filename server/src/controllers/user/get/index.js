import { aggregate } from "../../../helpers/db/index.js";
import { responseHandler } from "../../../helpers/responseHandler.js";

export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    const matchQuery = {};
    if (role && role !== "all") {
      matchQuery.role = role;
    }

    if (status && status !== "all") {
      matchQuery.status = status;
    }

    if (search) {
      matchQuery.name = { $regex: search, $options: "i" };
    }

    const result = await aggregate("user", [
      { $match: matchQuery },
      {
        $facet: {
          users: [
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: parsedLimit },
            { $project: { password: 0 } },
          ],
          totalCount: [{ $count: "count" }],
          totalRoleKeeper: [
            { $match: { role: "record_keeper" } },
            { $count: "count" },
          ],
          totalActive: [{ $match: { status: "active" } }, { $count: "count" }],
          totalInactive: [
            { $match: { status: "inactive" } },
            { $count: "count" },
          ],
        },
      },
    ]);
  
    const data = result[0];

    // Pagination & statistics
    const total = data.totalCount?.[0]?.count || 0;
    const totalRoleKeeper = data.totalRoleKeeper?.[0]?.count || 0;
    const totalActive = data.totalActive?.[0]?.count || 0;
    const totalInactive = data.totalInactive?.[0]?.count || 0;

    const users = data.users;

    // Separate aggregation for fileStats (updated_by files only)
    const userIds = users.map((user) => user._id);

    const fileStatsArr = await aggregate("file", [
      { $match: { updated_by: { $in: userIds } } },
      {
        $group: {
          _id: "$updated_by",
          totalFiles: { $sum: 1 },
          issuedFiles: {
            $sum: { $cond: [{ $eq: ["$status", "issued"] }, 1, 0] },
          },
          availableFiles: {
            $sum: { $cond: [{ $eq: ["$status", "available"] }, 1, 0] },
          },
        },
      },
    ]);

    // Convert to map for fast lookup
    const statsMap = {};
    fileStatsArr.forEach((stat) => {
      if (stat._id) statsMap[stat._id.toString()] = stat;
    });

    // Attach fileStats to users
    const usersWithStats = users.map((user) => {
      const stats = statsMap[user._id.toString()] || {
        totalFiles: 0,
        issuedFiles: 0,
        availableFiles: 0,
      };
      return {
        ...user,
        fileStats: stats,
      };
    });
    return responseHandler(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved succesfully.",
      data: {
        users: usersWithStats,
        pagination: {
          page: parseInt(page),
          limit: parsedLimit,
          pages: Math.ceil(total / parsedLimit),
        },
        statistics: {
          total,
          totalRoleKeeper,
          totalActive,
          totalInactive,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return responseHandler(res, {
      statusCode: 500,
      success: false,
      message: "Internal server error.",
      error,
    });
  }
};
