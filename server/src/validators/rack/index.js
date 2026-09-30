import Joi from "joi";

// Joi schema for creating a rack
export const createRackSchema = Joi.object({
  number: Joi.number().integer().min(1).required().messages({
    "number.base": "Rack number must be a number",
    "number.min": "Rack number must be at least 1",
    "any.required": "Rack number is required",
  }),

  house_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "House ID is required",
      "string.pattern.base": "House ID must be a valid MongoDB ObjectId",
      "any.required": "House ID is required",
    }),

  room_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Room ID is required",
      "string.pattern.base": "Room ID must be a valid MongoDB ObjectId",
      "any.required": "Room ID is required",
    }),

  total_shelf: Joi.number().integer().min(1).required().messages({
    "number.base": "Total shelf must be a number",
    "number.min": "Total shelf must be at least 1",
    "any.required": "Total shelf is required",
  }),

  shelf_capacity: Joi.number().required(),
});

// Joi schema for updating a rack
export const updateRackSchema = Joi.object({
  number: Joi.number().integer().min(1).messages({
    "number.base": "Rack number must be a number",
    "number.min": "Rack number must be at least 1",
  }),

  house_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "House ID must be a valid MongoDB ObjectId",
    }),

  room_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Room ID must be a valid MongoDB ObjectId",
    }),

  total_shelf: Joi.number().integer().min(1).messages({
    "number.base": "Total shelf must be a number",
    "number.min": "Total shelf must be at least 1",
  }),
}).min(1);

// Joi schema for rack ID parameter
export const rackIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Rack ID is required",
      "string.pattern.base": "Rack ID must be a valid MongoDB ObjectId",
      "any.required": "Rack ID is required",
    }),
});
