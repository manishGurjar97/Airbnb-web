const express=require("express");
const router=express.Router();
const wrapasync = require("../utils/wrapasync.js");
// const {reviewschema, schema}=require("../scemaValidation.js");


const {isOwner,isAuthenticated,validateScema}=require("../AuthenticationMiddleware.js");
const listingcontroller=require("../controllers/listings.js")
// const listings = require("../models/listing");




router.get("/",wrapasync(listingcontroller.index));

// Show form to add new listing
router.get("/add", isAuthenticated,(req, res) => {
    res.render("listings/add");
});

// Create new listing
router.post(
  "/form",
  validateScema,
  isAuthenticated,wrapasync(listingcontroller.newlisting) 
)


// Show form to edit listing
router.get("/:id/edit", isAuthenticated,isOwner,wrapasync(listingcontroller.editListing));

// Update listing
router.put("/:id/update", isAuthenticated,isOwner,validateScema,wrapasync(listingcontroller.updateListing) );

// Show single listing details
router.get("/:id",wrapasync(listingcontroller.showListing) );

// Delete listing
router.delete("/:id", isAuthenticated,isOwner,wrapasync(listingcontroller.deleteListing));
module.exports=router;