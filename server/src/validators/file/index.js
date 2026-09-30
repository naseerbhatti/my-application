import Joi from "joi";

export const createFileSchema = Joi.object({
  number: Joi.string().required().messages({
    "string.empty": "File number is required",
    "any.required": "File number is required",
  }),

  proposal_file_no: Joi.string().required().messages({
    "string.empty": "Proposal file number is required",
    "any.required": "Proposal file number is required",
  }),
  owners: Joi.string().required().messages({
    "string.empty": "Owners name is required"
  }),
  plot_area: Joi.number().required().messages({
    "number.base": "Plot area must be a number",
    "any.required": "Plot area is required",
  }),
  total_floor: Joi.string().required().messages({
    "string.base": "Total floor must be a string",
    "any.required": "Total floor is required",
  }),
  plan_type: Joi.string().required().messages({
    "string.empty": "Plan type is required",
    "any.required": "Plan type is required",
  }),
  status: Joi.string().valid("available", "issued", "missing").messages({
    "any.only": "Status must be one of: available, issued, returned, missing",
  }),

  property_address: Joi.string().required().messages({
    "string.empty": "Property address is required",
    "any.required": "Property address is required",
  }),
   district: Joi.string().required().messages({
    "string.empty": "district address is required",
    "any.required": "district address is required",
  }),
  proposal_circle: Joi.string().required().messages({
    "string.empty": "proposal address is required",
    "any.required": "proposal address is required",
  }),

  covered_area: Joi.number().required().messages({
    "number.base": "Covered area must be a number",
    "any.required": "Covered area is required",
  }),
  added_by: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Added by must be a valid MongoDB ObjectId",
    }),


  shelf: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Shelf ID is required",
      "string.pattern.base": "Shelf ID must be a valid MongoDB ObjectId",
      "any.required": "Shelf ID is required",
    }),




});

export const updateFileSchema = Joi.object({
  number: Joi.string().messages({
    "string.empty": "File number cannot be empty",
  }).optional(),


  shelf: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Shelf ID must be a valid MongoDB ObjectId",
    }),

  status: Joi.string().valid("issued", "available", "missing").messages({
    "any.only": "Status must be one of: issued, available, missing",
  }).optional(),

  updated_by: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Updated by must be a valid MongoDB ObjectId",
    }),
}).min(1);

export const issueFileSchema = Joi.object({
  description: Joi.string().allow("").messages({
    "string.base": "Description must be a string",
  }),
  purpose: Joi.string().messages({
    "string.empty": "Purpose cannot be empty",
  }),

  requestedBy: Joi.string().messages({
    "string.empty": "Requested By cannot be empty",
  }),
  department: Joi.string().messages({
    "string.empty": "Department cannot be empty",
  }),


  status: Joi.string().valid("issued").messages({
    "any.only": "Status must be one of: issued, returned, missing",
  }),

  updated_by: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Updated by must be a valid MongoDB ObjectId",
    }),
}).min(1);


export const fileIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "File ID is required",
      "string.pattern.base": "File ID must be a valid MongoDB ObjectId",
      "any.required": "File ID is required",
    }),
});
