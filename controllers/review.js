const Review= require("../models/review");
const listings = require("../models/listing");
module.exports.postReview=async (req, res) => {
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
};

module.exports.deleteReview=async (req, res) => {
  const { id, reviewid } = req.params;

  // Remove review reference from listing
  await listings.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });

  // Delete review itself
  await Review.findByIdAndDelete(reviewid);

  console.log("Delete route triggered", id, reviewid);
  res.redirect(`/listing/${id}`);
};