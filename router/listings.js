const express=require("express");
const router=express.Router();
const wrapasync = require("../utils/wrapasync.js");
const {reviewschema, schema}=require("../scemaValidation.js");
const isAuthenticated=require("../AuthenticationMiddleware.js");
const ExpressError = require("../utils/ExpressErrors.js");
const {isOwner}=require("../AuthenticationMiddleware.js");

const listings = require("../models/listing");
const review = require("../models/review.js");

const validateScema = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get("/", wrapasync(async (req, res) => {
    let listing = await listings.find({});
    res.render("listings/home", { listing });
}));

// Show form to add new listing
router.get("/add", isAuthenticated,(req, res) => {
    res.render("listings/add");
});

// Create new listing
router.post(
  "/form",
  validateScema,
  isAuthenticated,
  wrapasync(async (req, res) => {
    let { title, description, price, location, country } = req.body;

    // ✅ Temporary default image object
    const defaultImage = {
      filename: "default.jpg",
      url: "https://cf.bstatic.com/xdata/images/hotel/max1024x768/385388071.jpg?k=de0b51f296a3d9431866b51b974921c9ebb50cacf08eb55c1eec1d468849ffe2&o="
    };

    // Create new listing
    let newListing = new listings({
      title,
      description,
      image: defaultImage,  // ✅ Always object
      price,
      location,
      country,
      owner: req.user._id,
    });

    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listing");
  })
);



// Show form to edit listing
router.get("/:id/edit", isAuthenticated,isOwner,wrapasync(async (req, res) => {
    let { id } = req.params;
    let listdata = await listings.findById(id);
    res.render("listings/update", { listdata });
}));

// Update listing
router.put("/:id/update", isAuthenticated,isOwner,validateScema, wrapasync(async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listing/${id}`);
}));

// Show single listing details
router.get("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
//  const listdata = await listings.findById(id).populate('reviews').populate('owner')
//  .populate({path:review}
//   .populate({path:outhor})); 
const listdata = await listings.findById(id)
  .populate({
    path: 'reviews',
    populate: { path: 'author' }
  })
  .populate('owner');


    res.render("listings/showdetails", { listdata });
}));

// Delete listing
router.delete("/:id", isAuthenticated,isOwner,wrapasync(async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listing");
}));
module.exports=router;