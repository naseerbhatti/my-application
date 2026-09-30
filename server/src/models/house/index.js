import mongoose from "mongoose";
const { Schema, model } = mongoose;

const houseSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: false },
    number: { type: Number, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

const House = model("house", houseSchema);

export default House;
