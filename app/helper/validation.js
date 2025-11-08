const Joi = require('joi');

const userValidation = () => {
  const schema = Joi.object({
    name: Joi.string()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Name is required',
        'string.min': 'Name should have at least 3 characters',
        'string.max': 'Name should not exceed 30 characters',
        'any.required': 'Name is required'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Please enter your email ID',
        'any.required': 'Please enter your email ID'
      }),
    phone: Joi.string()
      .pattern(/^[0-9]{10}$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be exactly 10 digits',
        'string.empty': 'Please enter your phone number',
        'any.required': 'Please enter your phone number'
      }),
    password: Joi.string()
      .min(8)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password should have at least 8 characters',
        'string.max': 'Password should not exceed 30 characters',
        'any.required': 'Password is required'
      }),
    role: Joi.string()
      .valid('User', 'Admin')
      .default('User')
      .messages({
        'any.only': 'Role must be either User or Admin'
      }),
    area: Joi.string()
      .required()
      .messages({
        'string.empty': 'Area is required',
        'any.required': 'Area is required'
      })
  });

  return schema;
};

module.exports = { userValidation };