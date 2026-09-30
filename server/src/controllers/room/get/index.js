import { findDocuments, findDocById } from "../../../helpers/db/index.js";

const getAllRooms = async (req, res) => {
  try {
    const { page = 1, limit = 10, house_id } = req.query;
    const query = house_id && house_id !== "all" ? { house: house_id } : {};

    const rooms = await findDocuments("room", query, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: "house", select: "name address" },
    });

    // Get total count for pagination
    const totalRooms = await findDocuments("room", query);

    // Count rooms per house - get ALL rooms to accurately count per house
    const allRoomsForCount = await findDocuments("room", {});
    const roomCountByHouse = {};

    allRoomsForCount.forEach((room) => {
      const houseId = room.house?._id?.toString() || room.house?.toString();
      if (houseId) {
        roomCountByHouse[houseId] = (roomCountByHouse[houseId] || 0) + 1;
      }
    });

    // Add room count to each room's house data
    const roomsWithCount = rooms.map((room) => {
      const houseId = room.house?._id?.toString();
      return {
        ...(room.toObject ? room.toObject() : room),
        house: {
          ...(room.house?.toObject ? room.house.toObject() : room.house),
        },
      };
    });

    return res.status(200).json({
      success: true,
      message: "Rooms retrieved successfully.",
      data: roomsWithCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalRooms.length,
      },
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const room = await findDocById("room", id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Room retrieved successfully.",
      data: room,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export { getAllRooms, getRoomById };