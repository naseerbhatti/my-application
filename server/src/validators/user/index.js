import Joi from "joi";

export const addUserSchema = Joi.object({
  name: Joi.string().trim().lowercase().required().messages({
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  email: Joi.string().email().trim().lowercase().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  permissions: Joi.object().optional(),
  cnic: Joi.number()
    .integer()
    .required()
    .custom((value, helpers) => {
      const cnicString = value.toString();
      if (cnicString.length !== 13) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "number.base": "CNIC must be a number",
      "any.required": "CNIC is required",
      "any.invalid": "CNIC must be exactly 13 digits",
    }),

  contact_number: Joi.number()
    .integer()
    .required()
    .custom((value, helpers) => {
      const contactString = value.toString();
      if (contactString.length !== 10) {
        return helpers.error("any.invalid");
      }
      return value;
    })
    .messages({
      "number.base": "Contact number must be a number",
      "any.required": "Contact number is required",
      "any.invalid": "Contact number must be exactly 10 digits",
    }),
  designation: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required(),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.empty": "Password is required",
      "string.min": "Password must be at least 8 characters long",
      // "string.pattern.base":
      //   "Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol (@$!%*?&)",
      "any.required": "Password is required",
    }),

  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters long",
    // "string.pattern.base":
    //   "Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol (@$!%*?&)",
    "any.required": "Password is required",
  }),

  role: Joi.string()
    .valid(
      "super_admin",
      "admin",
      "director",
      "viewer",
      "deputy_director",
      "record_keeper",
    )
    .required()
    .messages({
      "any.only":
        "Role must be one of: super_admin, admin, director, deputy_director, record_keeper",
      "any.required": "Role is required",
    }),

  address: Joi.string().required().messages({
    "string.empty": "Address is required",
    "any.required": "Address is required",
  }),

  status: Joi.string().valid("active", "inactive").default("active").messages({
    "any.only": "Status must be one of: active, inactive",
  }),

  designation: Joi.string().required().messages({
    "string.empty": "Destination is required",
  }),
  avatar: Joi.string().optional().allow("", null).messages({
    "string.base": "Avatar   must be a string",
  }),

  leaving_letter: Joi.array().optional().allow("").messages({
    "string.base": "Leaving letter must be a string",
  }),

  joining_letter: Joi.array().optional().allow("").messages({
    "string.base": "Joining letter must be a string",
  }),
});

// Joi schema for user update (all fields optional)
export const updateUserSchema = Joi.object({
  name: Joi.string().trim().lowercase().messages({
    "string.empty": "Name cannot be empty",
  }),

  email: Joi.string().email().trim().lowercase().messages({
    "string.email": "Please provide a valid email address",
  }),

  cnic: Joi.string()
    .pattern(/^\d{13}$/)
    .messages({
      "string.pattern.base": "CNIC must be exactly 13 digits",
    }),

  contact_number: Joi.string()
    .pattern(/^\d{10}$/)
    .messages({
      "string.pattern.base": "Contact number must be exactly 10 digits",
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol (@$!%*?&)",
    }),

  role: Joi.string()
    .valid(
      "super_admin",
      "admin",
      "director",
      "deputy_director",
      "record_keeper",
    )
    .messages({
      "any.only":
        "Role must be one of: super_admin, admin, director, deputy_director, record_keeper",
    }),

  address: Joi.string().messages({
    "string.empty": "Address cannot be empty",
  }),

  status: Joi.string().valid("active", "inactive").messages({
    "any.only": "Status must be one of: active, inactive",
  }),

  avatar: Joi.string().allow("").messages({
    "string.base": "Avatar must be a string",
  }),

  leaving_letter: Joi.string().allow("").messages({
    "string.base": "Leaving letter must be a string",
  }),

  joining_letter: Joi.string().allow("").messages({
    "string.base": "Joining letter must be a string",
  }),
}).min(1); // At least one field must be provided for update

// Joi schema for user login
export const loginUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().required().messages({
    "string.empty": "email is required",
    "any.required": "email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});
