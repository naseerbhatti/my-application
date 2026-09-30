import mongoose from "mongoose";
const { Schema, model } = mongoose;

const roomSchema = new Schema(
  {
    house: {
      type: Schema.Types.ObjectId,
      ref: "house",
      required: true,
    },
    number: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

roomSchema.index({ house: 1, number: 1 }, { unique: true });

const Room = model("room", roomSchema);

export default Room;
