const express=require("express");
const router=express.Router();
const wrapasync = require("../utils/wrapasync.js");
// const {reviewschema, schema}=require("../scemaValidation.js");

const ExpressError = require("../utils/ExpressErrors.js");
const {isOwner,isAuthenticated,validateScema}=require("../AuthenticationMiddleware.js");
const listingcontroller=require("../controllers/listings.js")
const listings = require("../models/listing");




router.get("/",listingcontroller.index);

// Show form to add new listing
router.get("/add", isAuthenticated,(req, res) => {
    res.render("listings/add");
});

// Create new listing
router.post(
  "/form",
  validateScema,
  isAuthenticated,listingcontroller.newlisting 
)


// Show form to edit listing
router.get("/:id/edit", isAuthenticated,isOwner,listingcontroller.editListing)

// Update listing
router.put("/:id/update", isAuthenticated,isOwner,validateScema,listingcontroller.updateListing );

// Show single listing details
router.get("/:id",listingcontroller.showListing );

// Delete listing
router.delete("/:id", isAuthenticated,isOwner,listingcontroller.deleteListing);
module.exports=router;