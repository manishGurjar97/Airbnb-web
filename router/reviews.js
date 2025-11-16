const express=require("express");
const router=express.Router({mergeParams:true});

const {isAuthenticated}=require("../AuthenticationMiddleware.js");


const {isReviewOwner,validatereview}=require("../AuthenticationMiddleware.js");
const reviewcontroller=require("../controllers/review.js");




//create review
router.post('/',isAuthenticated, validatereview, reviewcontroller.postReview);


// review delete button
router.delete("/:reviewid",isReviewOwner,reviewcontroller.deleteReview);




module.exports=router;