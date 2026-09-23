import { findDocById, updateDocById } from "../../../helpers/db/index.js";

const updateIssueSlip = async (req, res) => {
  try {
    const { issue_slip  } = req.body;
    const { id } = req.params;
    console.log("req.body =>", req.body.id);

    // if (!image || !id) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "New slip image and transaction ID are required.",
    //     data: null,
    //   });
    // }

    const fileTransaction = await findDocById("fileTransaction", id);

    if (!fileTransaction) {
      return res.status(404).json({
        success: false,
        message: "File transaction not found.",
        data: null,
      });
    }

    // 2️⃣ Prepare update object
    const updateData = {
      issue_slip,
    };

    // Push existing issue_slip to old_slip if it exists
    if (fileTransaction.issue_slip && fileTransaction.issue_slip !== issue_slip) {
      updateData.old_slip = [
        ...(fileTransaction.old_slip || []),
        fileTransaction.issue_slip,
      ];
    }

    
    const updatedTransaction = await updateDocById(
      "fileTransaction",
      id,
      updateData,
    );

    return res.status(200).json({
      success: true,
      message: "Issue slip updated successfully.",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating issue slip:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      data: null,
    });
  }
};

export default updateIssueSlip;
