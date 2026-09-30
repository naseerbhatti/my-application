import Joi from "joi";

// Joi schema for creating a house
export const createHouseSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "House name is required",
    "any.required": "House name is required",
  }),

  address: Joi.string().trim().required().messages({
    "string.empty": "Address is required",
    "any.required": "Address is required",
  }),

});

// Joi schema for updating a house
export const updateHouseSchema = Joi.object({
  name: Joi.string().trim().messages({
    "string.empty": "House name cannot be empty",
  }),

  address: Joi.string().trim().messages({
    "string.empty": "Address cannot be empty",
  }),

  location: Joi.object({
    lat: Joi.number().messages({
      "number.base": "Latitude must be a number",
    }),
    long: Joi.number().messages({
      "number.base": "Longitude must be a number",
    }),
  }).messages({
    "object.base": "Location must be an object with lat and long",
  }),
}).min(1);

// Joi schema for house ID parameter
export const houseIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.empty": "House ID is required",
      "string.pattern.base": "House ID must be a valid MongoDB ObjectId",
      "any.required": "House ID is required",
    }),
});
