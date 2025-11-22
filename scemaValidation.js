// scemaValidation.js
const Joi = require('joi');

const schema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
   image: Joi.object({
    filename: Joi.string().allow(''), // allow empty string too
    url: Joi.string().allow('')        // allow empty string too
  }).optional(),
  price: Joi.number().required(),
  location: Joi.string().required(),
  country: Joi.string().required()
});

// Expect the body to be { review: { comments, rating } }
const reviewschema = Joi.object({
  review: Joi.object({
    comments: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5)
  }).required()
});

module.exports = { schema, reviewschema };
