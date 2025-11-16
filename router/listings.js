const express=require("express");
const router=express.Router();
const wrapasync = require("../utils/wrapasync.js");
const multer  = require('multer')

const { storage } = require("../config/cloudinary");
const upload = multer({storage});



const {isOwner,isAuthenticated,validateScema}=require("../AuthenticationMiddleware.js");
const listingcontroller=require("../controllers/listings.js")





router.get("/",wrapasync(listingcontroller.index));

// Show form to add new listing
router.get("/add", isAuthenticated,(req, res) => {
    res.render("listings/add");
});

// Create new listing
// router.post(
//   "/form",
//   validateScema,
//   isAuthenticated,upload.single("image"),wrapasync(listingcontroller.newlisting) 
// )
router.post("/form",upload.single("image"),(req,res)=>{
  res.send(req.file);
});


// Show form to edit listing
router.get("/:id/edit", isAuthenticated,isOwner,wrapasync(listingcontroller.editListing));

// Update listing
router.put("/:id/update", isAuthenticated,isOwner,validateScema,wrapasync(listingcontroller.updateListing) );

// Show single listing details
router.get("/:id",wrapasync(listingcontroller.showListing) );

// Delete listing
router.delete("/:id", isAuthenticated,isOwner,wrapasync(listingcontroller.deleteListing));
module.exports=router;