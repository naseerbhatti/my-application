import mongoose from "mongoose";
const { Schema, model } = mongoose;

const fileTransactionSchema = new Schema(
  {
    file: { type: Schema.Types.ObjectId, ref: "file", required: true },
    action: {
      type: String,
      enum: [
        "request",
        "issue",
        "created",
        "return",
        "extend",
        "update",
        "missing",
        "found",
      ],
      required: true,
    },
    department: { type: String },
    previous_location: { type: String },
    new_location: { type: String },
    performed_by: { type: Schema.Types.ObjectId, ref: "user", required: true },
    purpose: { type: String },
    date: { type: Date, default: Date.now },
    return_date: { type: Date },
    return_condition: {
      type: String,
      enum: ["good", "damaged", "incomplete"],
      default: "good",
    },
    // expected_return_date: { type: Date },
    // extension_days: { type: Number },
    // new_return_date: { type: Date },
    // extension_reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    issue_slip: { type: String, default: "" },
    old_slip: [{ type: String }],
    approved_by: { type: Schema.Types.ObjectId, ref: "user" },
    remarks: { type: String },
  },
  { timestamps: true },
);

// Add indexes for better query performance
// fileTransactionSchema.index({ action: 1 }); // For action-based queries (issue, return, missing)
// fileTransactionSchema.index({ createdAt: 1 }); // For date range queries in stats
// fileTransactionSchema.index({ action: 1, createdAt: 1 }); // Compound index for action + date queries
// fileTransactionSchema.index({ file: 1 }); // For file reference queries
// fileTransactionSchema.index({ performed_by: 1 }); // For user-based queries
// fileTransactionSchema.index({ createdAt: 1 }); // For date range queries
// fileTransactionSchema.index({ action: 1, createdAt: 1 }); // Compound index for action + date queries
// fileTransactionSchema.index({ file: 1 }); // For file reference queries

fileTransactionSchema.index({ action: 1 });
fileTransactionSchema.index({ createdAt: 1 });
fileTransactionSchema.index({ action: 1, createdAt: 1 });
fileTransactionSchema.index({ file: 1 });
fileTransactionSchema.index({ performed_by: 1 });

const FileTransaction = model("fileTransaction", fileTransactionSchema);

export default FileTransaction;
