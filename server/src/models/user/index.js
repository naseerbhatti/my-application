import mongoose from "mongoose";
const { Schema, model } = mongoose;

const user_schema = new Schema(
  {
    name: { type: String, required: true, lowercase: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    cnic: { type: Number, required: true, unique: true, length: 13 },
    contact_number: { type: Number, required: true, length: 10 },
    avatar: [{ type: String }],
    password: { type: String, required: true },
    designation: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "super_admin",
        "admin",
        "director",
        "viewer",
        "deputy_director",
        "record_keeper",
      ],
      required: true,
    },
    address: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    leaving_letter: [{ type: String }],
    old_leaving_letter: [{ type: String }],
    joining_letter: [{ type: String }],
    old_joining_letter: [{ type: String }],
    permissions: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

const User = model("user", user_schema);

export default User;
