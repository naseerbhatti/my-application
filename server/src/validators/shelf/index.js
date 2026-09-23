import Joi from "joi";

// Joi schema for creating a shelf
export const createShelfSchema = Joi.object({
  number: Joi.number().integer().min(1).required().messages({
    "number.base": "Shelf number must be a number",
    "number.min": "Shelf number must be at least 1",
    "any.required": "Shelf number is required",
  }),

  rack_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Rack ID is required",
      "string.pattern.base": "Rack ID must be a valid MongoDB ObjectId",
      "any.required": "Rack ID is required",
    }),

  capacity: Joi.number().integer().min(1).required().messages({
    "number.base": "Capacity must be a number",
    "number.min": "Capacity must be at least 1",
    "any.required": "Capacity is required",
  }),
});

// Joi schema for updating a shelf
export const updateShelfSchema = Joi.object({
  number: Joi.number().integer().min(1).messages({
    "number.base": "Shelf number must be a number",
    "number.min": "Shelf number must be at least 1",
  }),

  rack_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "Rack ID must be a valid MongoDB ObjectId",
    }),

  capacity: Joi.number().integer().min(1).messages({
    "number.base": "Capacity must be a number",
    "number.min": "Capacity must be at least 1",
  }),
}).min(1);

// Joi schema for shelf ID parameter
export const shelfIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Shelf ID is required",
      "string.pattern.base": "Shelf ID must be a valid MongoDB ObjectId",
      "any.required": "Shelf ID is required",
    }),
});
