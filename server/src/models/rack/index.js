import mongoose from "mongoose";
const { Schema, model } = mongoose;

const rackSchema = new Schema(
  {
    number: { type: Number, required: true },
    house: { type: Schema.Types.ObjectId, ref: "house", required: true },
    room: { type: Schema.Types.ObjectId, ref: "room", required: true },
  },
  { timestamps: true }
);

const Rack = model("rack", rackSchema);

export default Rack;
