import Joi from "joi";

// Joi schema for creating a room
export const createRoomSchema = Joi.object({
  house_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "House ID is required",
      "string.pattern.base": "House ID must be a valid MongoDB ObjectId",
      "any.required": "House ID is required",
    }),
  count: Joi.number().required(),
});

// Joi schema for updating a room
export const updateRoomSchema = Joi.object({
  house_id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .messages({
      "string.pattern.base": "House ID must be a valid MongoDB ObjectId",
    }),

  number: Joi.number().integer().min(1).messages({
    "number.base": "Room number must be a number",
    "number.min": "Room number must be at least 1",
  }),
}).min(1);

// Joi schema for room ID parameter
export const roomIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "Room ID is required",
      "string.pattern.base": "Room ID must be a valid MongoDB ObjectId",
      "any.required": "Room ID is required",
    }),
});
