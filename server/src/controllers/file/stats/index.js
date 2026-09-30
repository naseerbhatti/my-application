import { countDocuments } from "../../../helpers/db/index.js";
import File from "../../../models/file/index.js";
import FileTransaction from "../../../models/fileTransaction/index.js";
import { aggregate } from "../../../helpers/db/index.js";

export const getFileStats = async (req, res) => {
  try {
    // Get all file counts in a single aggregation query
    const fileStats = await File.aggregate([
      {
        $facet: {
          totalFile: [{ $count: "count" }],
          issueFile: [{ $match: { status: "issued" } }, { $count: "count" }],
          missingFile: [{ $match: { status: "missing" } }, { $count: "count" }],
          availableFile: [
            { $match: { status: "available" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    // Extract counts from aggregation result (default to 0 if no results)
    const totalFile = fileStats[0].totalFile[0]?.count || 0;
    const issueFile = fileStats[0].issueFile[0]?.count || 0;
    const missingFile = fileStats[0].missingFile[0]?.count || 0;
    const availableFile = fileStats[0].availableFile[0]?.count || 0;

    // Get weekly stats for current week
    const weeklyStats = await getWeeklyStats();

    //Get montly state for current month
    const currentMonth = await getCurrentMonthStats();
    // Get RecentUpdated for All Files

    const getRecentFile = await getRecentlyUpdatedFiles();

    return res.status(200).json({
      success: true,
      message: "File statistics retrieved successfully",
      data: {
        totalFile,
        issueFile,
        missingFile,
        availableFile,
        currentWeek: weeklyStats.currentWeek,
        currentMonth,
        getRecentFile,
      },
    });
  } catch (error) {
    console.error("Error fetching file stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve file statistics",
      error: error.message,
    });
  }
};

// Helper function to get weekly statistics
const getWeeklyStats = async () => {
  const now = new Date();

  // Get start of current week (Monday)
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
  );
  currentWeekStart.setHours(0, 0, 0, 0);

  // Get start of next week (to mark end of current week)
  const nextWeekStart = new Date(currentWeekStart);
  nextWeekStart.setDate(currentWeekStart.getDate() + 7);

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Get stats for current week
  const currentWeek = await getWeekStats(
    currentWeekStart,
    nextWeekStart,
    daysOfWeek,
  );

  return { currentWeek };
};

// Helper function to get stats for a specific week
const getWeekStats = async (weekStart, weekEnd, daysOfWeek) => {
  const statePromises = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(weekStart);
    dayStart.setDate(weekStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    // ye saari queries ek saath chal rahi hain
    return Promise.all([
      File.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
      File.countDocuments({
        status: "issued",
        updatedAt: { $gte: dayStart, $lte: dayEnd },
      }),
      File.countDocuments({
        status: "available",
        updatedAt: { $gte: dayStart, $lte: dayEnd },
      }),
      File.countDocuments({
        status: "missing",
        updatedAt: { $gte: dayStart, $lte: dayEnd },
      }),


    ]).then(([newFiles, issuedFiles, returnedFiles, missingFiles]) => ({
      day: daysOfWeek[i],
      date: dayStart.toISOString().split("T")[0],
      newFiles,
      issued: issuedFiles,
      returned: returnedFiles,
      missing: missingFiles,
    }));
  });
  return await Promise.all(statePromises);
};

const getCurrentMonthStats = async () => {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const today = new Date(); // current date

  firstDayOfMonth.setHours(0, 0, 0, 0);
  today.setHours(23, 59, 59, 999);

  const dateFilter = { $gte: firstDayOfMonth, $lte: today };

  // Run both aggregations in parallel
  const [fileStats, transactionStats] = await Promise.all([
    // Count new files created this month
    File.countDocuments({
      createdAt: dateFilter,
    }),

    // Count all transaction types in a single query
    FileTransaction.aggregate([
      {
        $match: {
          createdAt: dateFilter,
        },
      },
      {
        $facet: {
          issuedFiles: [{ $match: { action: "issue" } }, { $count: "count" }],
          returnedFiles: [
            { $match: { action: "return" } },
            { $count: "count" },
          ],
          missingFiles: [{ $match: { action: "missing" } }, { $count: "count" }],
        },
      },
    ]),
  ]);

  // Extract transaction counts (default to 0 if no results)
  const issuedFiles = transactionStats[0].issuedFiles[0]?.count || 0;
  const returnedFiles = transactionStats[0].returnedFiles[0]?.count || 0;
  const missingFiles = transactionStats[0].missingFiles[0]?.count || 0;

  return {
    startDate: firstDayOfMonth.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
    newFiles: fileStats,
    issued: issuedFiles,
    returned: returnedFiles,
    missing: missingFiles,
  };
};

const getRecentlyUpdatedFiles = async (req, res) => {
  const pipeline = [
    { $sort: { updatedAt: -1 } },
    { $limit: 10 },

    // 🔹 updated_by
    {
      $lookup: {
        from: "users",
        localField: "updated_by",
        foreignField: "_id",
        as: "updated_by",
        pipeline: [{ $project: { name: 1, role: 1 } }],
      },
    },
    { $unwind: { path: "$updated_by", preserveNullAndEmptyArrays: true } },

    // 🔹 shelf
    {
      $lookup: {
        from: "shelves",
        localField: "shelf",
        foreignField: "_id",
        as: "shelf",
      },
    },
    { $unwind: { path: "$shelf", preserveNullAndEmptyArrays: true } },

    // 🔹 rack
    {
      $lookup: {
        from: "racks",
        localField: "shelf.rack",
        foreignField: "_id",
        as: "shelf.rack",
      },
    },
    { $unwind: { path: "$shelf.rack", preserveNullAndEmptyArrays: true } },

    // 🔹 house (SIRF name)
    {
      $lookup: {
        from: "houses",
        localField: "shelf.rack.house",
        foreignField: "_id",
        as: "shelf.rack.house",
        pipeline: [{ $project: { name: 1 } }],
      },
    },
    {
      $unwind: { path: "$shelf.rack.house", preserveNullAndEmptyArrays: true },
    },
  ];

  return await aggregate("file", pipeline);
};
