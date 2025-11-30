const express = require("express");
const router = express.Router();
const wrapasync = require("../utils/wrapasync.js");
const multer = require("multer");

const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

const {
  isOwner,
  isAuthenticated,
  validateScema,
} = require("../AuthenticationMiddleware.js");

const listingcontroller = require("../controllers/listings.js");


// -------------------- ROUTES -------------------- //

// ⭐ Trending Listings
router.get("/trending", wrapasync(listingcontroller.trending));

// ⭐ Home - All listings
router.get("/", wrapasync(listingcontroller.index));

// ⭐ Search (moved UP so it does NOT conflict with :id route)
router.post("/search/location", wrapasync(listingcontroller.search));

// ⭐ Add Listing Form
router.get("/add", isAuthenticated, (req, res) => {
  res.render("listings/add");
});

// ⭐ Create New Listing
router.post(
  "/form",
  isAuthenticated,
  upload.single("image"),
  validateScema,         // ADD THIS (important)
  wrapasync(listingcontroller.newlisting)
);

// ⭐ Edit Listing Form
router.get(
  "/:id/edit",
  isAuthenticated,
  isOwner,
  wrapasync(listingcontroller.editListing)
);

// ⭐ Update Listing
router.put(
  "/:id/update",
  isAuthenticated,
  isOwner,
  validateScema,
  wrapasync(listingcontroller.updateListing)
);

// ⭐ Show Single Listing
router.get("/:id", wrapasync(listingcontroller.showListing));

// ⭐ Delete Listing
router.delete(
  "/:id",
  isAuthenticated,
  isOwner,
  wrapasync(listingcontroller.deleteListing)
);

module.exports = router;
