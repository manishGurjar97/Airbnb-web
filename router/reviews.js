const express=require("express");
const router=express.Router({mergeParams:true});
const wrapasync = require("../utils/wrapasync.js");
const {isAuthenticated}=require("../AuthenticationMiddleware.js");
const listings = require("../models/listing");
const Review= require("../models/review");
const {reviewschema, schema}=require("../scemaValidation.js");
const {isReviewOwner}=require("../AuthenticationMiddleware.js");



const validatereview = (req, res, next) => {
  // debug: print incoming body so you can verify shape
 

  const { error } = reviewschema.validate(req.body); // <-- validate req.body (not { listing: req.body })
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.post('/',isAuthenticated, validatereview, wrapasync(async (req, res) => {
    const { id } = req.params;
    const listing = await listings.findById(id);

    // req.body.review should be present because form names are review[...]
    const newReview = new Review(req.body.review);
    newReview.author=req.user._id;
   
    listing.reviews.push(newReview);
 
    await newReview.save();
    await listing.save();

    console.log("successfully done");
    
    res.redirect(`/listing/${id}`);
}));
// review delete button
router.delete("/:reviewid",isReviewOwner,wrapasync(async(req,res)=>{
    let{id,reviewid}=req.params;

   await listings.findByIdAndUpdate(id, {
    $pull: { reviews: reviewid }
});
await Review.findOneAndDelete(reviewid);
res.redirect(`/listing/${id}`);
console.log("Delete route triggered", id, reviewid);


}));




module.exports=router;