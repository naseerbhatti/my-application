import mongoose from "mongoose";
import Models from "../../../models/index.js";

export const getLastRoomNumber = async (req, res) => {
  try {
    const { houseId } = req.query;

    const lastRoom = await Models["room"]
      .findOne({
        house: new mongoose.Types.ObjectId(houseId),
      })
      .sort({ number: -1 })
      .lean();

    res.status(200).json({
      lastNumber: lastRoom?.number || 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};