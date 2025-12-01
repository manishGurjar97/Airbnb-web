// REVIEW ROUTES

const express = require("express");
const router = express.Router({ mergeParams: true });

const { isAuthenticated } = require("../AuthenticationMiddleware.js");
const { isReviewOwner, validatereview } = require("../AuthenticationMiddleware.js");
const reviewcontroller = require("../controllers/review.js");

// Create review
router.post("/", isAuthenticated, validatereview, reviewcontroller.postReview);

// Delete review
router.delete("/:reviewid", isReviewOwner, reviewcontroller.deleteReview);

module.exports = router;
