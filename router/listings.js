const express=require("express");
const router=express.Router();
const wrapasync = require("../utils/wrapasync.js");
const {reviewschema, schema}=require("../scemaValidation.js");
const isAuthenticated=require("../AuthenticationMiddleware.js");

const listings = require("../models/listing");

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
router.post("/form", validateScema, isAuthenticated,wrapasync(async (req, res) => {
  
    
    let { title, description, image, price, location, country } = req.body;
    let newListing = new listings({ title, description, image, price, location, country });
    await newListing.save();
    req.flash("success", "Successfully created a new listing!");
    res.redirect("/listing");
}));

// Show form to edit listing
router.get("/:id/edit", isAuthenticated,wrapasync(async (req, res) => {
    let { id } = req.params;
    let listdata = await listings.findById(id);
    res.render("listings/update", { listdata });
}));

// Update listing
router.put("/:id/update", isAuthenticated,validateScema, wrapasync(async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listing/${id}`);
}));

// Show single listing details
router.get("/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
 const listdata = await listings.findById(id).populate('reviews'); 
    res.render("listings/showdetails", { listdata });
}));

// Delete listing
router.delete("/:id", isAuthenticated,wrapasync(async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted a listing!");
    res.redirect("/listing");
}));
module.exports=router;