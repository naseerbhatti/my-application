import mongoose from "mongoose";
const { Schema, model } = mongoose;

const shelfSchema = new Schema(
  {
    number: { type: Number, required: true },
    rack: { type: Schema.Types.ObjectId, ref: "rack", required: true },
    capacity: { type: Number, required: true },
  },
  { timestamps: true }
);

const Shelf = model("shelf", shelfSchema);

export default Shelf;
