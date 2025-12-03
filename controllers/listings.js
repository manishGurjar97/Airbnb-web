// LISTING CONTROLLER

const listings = require("../models/listing");
const axios = require("axios");

// Get coordinates from OpenStreetMap
async function getCoordinates(location) {
  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(location)}`;

    const geoRes = await axios.get(geoUrl, {
      headers: { "User-Agent": "ManishApp/1.0" }
    });

    if (geoRes.data.length > 0) {
      const data = geoRes.data[0];

      return {
        lat: data.lat,
        lng: data.lon,
        country: data.address?.country || "Unknown"
      };
    }

  } catch (err) {
    console.log("Geocoding Failed:", err);
  }

  return null;
}

// Show all listings
module.exports.index = async (req, res) => {
  const listing = await listings.find({});
  res.render("listings/home", { listing });
};

// Create new listing
module.exports.newlisting = async (req, res) => {
  try {
    const { title, description, price, location } = req.body;

    let url = req.file?.path || "/default.jpg";
    let filename = req.file?.filename || "default.jpg";

    const geo = await getCoordinates(location);

    const newListing = new listings({
      title,
      description,
      price,
      location,
      country: geo.country,
      owner: req.user._id,
      geometry: {
        lat: geo.lat,
        lng: geo.lng
      },
      image: { url, filename }
    });

    await newListing.save();
    req.flash("success", "Listing created successfully!");
    res.redirect("/listing");

  } catch (err) {
    console.error("Create Listing Error:", err.message);
    req.flash("success", "Failed to create listing!please enter valid city or country ");
    res.redirect("/listing");
  }
};

// Edit listing page
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listdata = await listings.findById(id);
  res.render("listings/update", { listdata });
};

// Update listing
module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;
    const { title, description, price, location } = req.body;

    const geo = await getCoordinates(location);
    let updatedImage = {};

    if (req.body.image) {
      updatedImage = {
        url: req.body.image.url,
        filename: req.body.image.filename
      };
    }

    await listings.findByIdAndUpdate(id, {
      title,
      description,
      price,
      location,
      country: geo.country,
      owner: req.user._id,
      geometry: {
        lat: geo.lat,
        lng: geo.lng
      },
      ...(updatedImage.url && { image: updatedImage })
    });

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listing/${id}`);

  } catch (err) {
    console.error("Update Listing Error:", err.message);
    req.flash("error", "Failed to update listing");
    res.redirect("/listing");
  }
};

// Show full listing details
module.exports.showListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    const listdata = await listings
      .findById(id)
      .populate("owner")
      .populate({
        path: "reviews",
        populate: { path: "author" }
      });

    if (!listdata) {
      req.flash("error", "Listing not found!");
      return res.redirect("/listing");
    }

    listdata.visits = (listdata.visits || 0) + 1;
    await listdata.save();

    res.render("listings/showdetails", { listdata });

  } catch (err) {
    next(err);
  }
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
  await listings.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listing");
};

// Render add listing form
module.exports.listingAddForm = (req, res) => {
  res.render("listings/add");
};

// Home page with trending sort
// module.exports.index = async (req, res) => {
//   let { sort } = req.query;
//   let listing;

//   if (sort === "trending") {
//     listing = await listings.find().sort({ visits: -1 });
//   } else {
//     listing = await listings.find({});
//   }

//   res.render("listings/home", { listing });
// };
module.exports.index = async (req, res) => {
  const listing = await listings.find().sort({ visits: -1 });
  res.render("listings/home", { listing });
};

// Search form handler
module.exports.search = async (req, res) => {
  let data = req.query.data;

  if (!data) {
    req.flash("success", "Please enter a location!");
    return res.redirect("/listing");
  }

  data = data.trim().toLowerCase();
  const regex = new RegExp(data, "i");

  let listing = await listings.find({
    $or: [
      { location: { $regex: regex } },
      { country: { $regex: regex } }
    ]
  });

  if (!listing || listing.length === 0) {
    req.flash("error", "Sorry! No listings are available at this place.");
    return res.render("listings/home", { listing: [] });
  }

  res.render("listings/home", { listing });
};
