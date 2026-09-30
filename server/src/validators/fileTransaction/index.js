import Joi from "joi";

// Base schema with common fields
const baseTransactionFields = {
  file: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "File ID is required",
      "string.pattern.base": "File ID must be a valid MongoDB ObjectId",
      "any.required": "File ID is required",
    }),

  action: Joi.string()
    .valid("request", "issue", "return", "extend", "missing", "found")
    .required()
    .messages({
      "string.empty": "Action is required",
      "any.only":
        "Action must be one of: request, issue, return, extend, missing, found",
      "any.required": "Action is required",
    }),

  performed_by: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Performed by user ID is required",
      "string.pattern.base": "Performed by must be a valid MongoDB ObjectId",
      "any.required": "Performed by user ID is required",
    }),

  remarks: Joi.string().allow("").optional().messages({
    "string.base": "Remarks must be a string",
  }),
};

// Schema for REQUEST action
export const createRequestTransactionSchema = Joi.object({
  ...baseTransactionFields,
  action: Joi.string().valid("request").required(),

  purpose: Joi.string().required().messages({
    "string.empty": "Purpose is required for request",
    "any.required": "Purpose is required for request",
  }),

  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending")
    .messages({
      "any.only": "Status must be one of: pending, approved, rejected",
    }),
});

// Schema for ISSUE action
export const createIssueTransactionSchema = Joi.object({
  ...baseTransactionFields,
  action: Joi.string().valid("issue").required(),

  purpose: Joi.string().optional().messages({
    "string.base": "Purpose must be a string",
  }),

  issued_to: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Issued to user ID is required",
      "string.pattern.base": "Issued to must be a valid MongoDB ObjectId",
      "any.required": "Issued to user ID is required",
    }),

  issue_date: Joi.date().required().messages({
    "date.base": "Issue date must be a valid date",
    "any.required": "Issue date is required",
  }),

  expected_return_date: Joi.date()
    .greater(Joi.ref("issue_date"))
    .required()
    .messages({
      "date.base": "Expected return date must be a valid date",
      "date.greater": "Expected return date must be after issue date",
      "any.required": "Expected return date is required",
    }),

  status: Joi.string().valid("approved").default("approved"),
});

// Schema for RETURN action
export const createReturnTransactionSchema = Joi.object({
  ...baseTransactionFields,
  action: Joi.string().valid("return").required(),

  return_date: Joi.date().required().messages({
    "date.base": "Return date must be a valid date",
    "any.required": "Return date is required",
  }),

  return_condition: Joi.string()
    .valid("good", "damaged", "incomplete")
    .required()
    .messages({
      "string.empty": "Return condition is required",
      "any.only": "Return condition must be one of: good, damaged, incomplete",
      "any.required": "Return condition is required",
    }),
});

// Schema for EXTEND action
export const createExtendTransactionSchema = Joi.object({
  ...baseTransactionFields,
  action: Joi.string().valid("extend").required(),

  extension_days: Joi.number().integer().min(1).required().messages({
    "number.base": "Extension days must be a number",
    "number.min": "Extension days must be at least 1",
    "any.required": "Extension days is required",
  }),

  new_return_date: Joi.date().required().messages({
    "date.base": "New return date must be a valid date",
    "any.required": "New return date is required",
  }),

  extension_reason: Joi.string().required().messages({
    "string.empty": "Extension reason is required",
    "any.required": "Extension reason is required",
  }),

  status: Joi.string()
    .valid("pending", "approved", "rejected")
    .default("pending")
    .messages({
      "any.only": "Status must be one of: pending, approved, rejected",
    }),
});

// Schema for missing/FOUND actions
export const createmissingFoundTransactionSchema = Joi.object({
  ...baseTransactionFields,
  action: Joi.string().valid("missing", "found").required(),

  remarks: Joi.string().required().messages({
    "string.empty": "Remarks are required for missing/found action",
    "any.required": "Remarks are required for missing/found action",
  }),
});

// Generic create schema (validates based on action)
export const createFileTransactionSchema = Joi.alternatives().conditional(
  "action",
  [
    { is: "request", then: createRequestTransactionSchema },
    { is: "issue", then: createIssueTransactionSchema },
    { is: "return", then: createReturnTransactionSchema },
    { is: "extend", then: createExtendTransactionSchema },
    { is: Joi.valid("missing", "found"), then: createmissingFoundTransactionSchema },
  ]
);

// Schema for updating transaction (mainly for status updates)
export const updateFileTransactionSchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").messages({
    "any.only": "Status must be one of: pending, approved, rejected",
  }),

  approved_by: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Approved by must be a valid MongoDB ObjectId",
    }),

  remarks: Joi.string().allow("").messages({
    "string.base": "Remarks must be a string",
  }),
}).min(1);

// Schema for transaction ID parameter
export const fileTransactionIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Transaction ID is required",
      "string.pattern.base": "Transaction ID must be a valid MongoDB ObjectId",
      "any.required": "Transaction ID is required",
    }),
});
