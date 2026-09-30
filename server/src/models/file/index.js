import mongoose from "mongoose";
const { Schema, model } = mongoose;

const fileSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    description: { type: String },
    applicant: { type: String, required: false },
    purpose: { type: String, required: false },
    proposal_file_no: { type: String, required: true, unique: true },
    proposal_circle: { type: String, require: true },
    district: { type: String, require: true },
    owners: { type: String, required: true },
    plot_area: { type: String, required: false },
    property_address: { type: String, required: false },
    covered_area: { type: String, required: false },
    total_floor: { type: String, required: false },
    plan_type: { type: String, required: false },
    shelf: { type: Schema.Types.ObjectId, ref: "shelf", required: true },
    status: {
      type: String,
      enum: ["issued", "missing", "available"],
      default: "available",
    },
    last_locations: [
      {
        location: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        updated_by: { type: Schema.Types.ObjectId, ref: "user" },
      },
    ],
    qr_code_value: { type: String },
    qr_code: { type: String },
    added_by: { type: Schema.Types.ObjectId, ref: "user", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "user" },
  },
  { timestamps: true },
);

// Add indexes for better query performance
// fileSchema.index({ proposal_file_no: 1 });
fileSchema.index({ status: 1 }); // For status-based queries (issued, missing, available)
fileSchema.index({ createdAt: 1 }); // For date range queries in stats
fileSchema.index({ status: 1, createdAt: 1 }); // Compound index for combined queries
fileSchema.index({ shelf: 1 }); // For shelf-based queries

const File = model("file", fileSchema);

export default File;
