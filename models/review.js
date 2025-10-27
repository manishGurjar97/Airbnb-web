// models/review.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new mongoose.Schema({
  comments: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now   // <-- function reference, not Date.now()
  },
  author:{
          type: Schema.Types.ObjectId,

        ref:"User"
    }
});

module.exports = mongoose.model("Review", reviewSchema); // Capitalized name
