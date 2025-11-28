const listings = require("../models/listing");
const axios = require("axios");

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
    console.log("🌍 Geocoding Failed:", err);
  }

  return null;
}


// 🏠 Show all listings
module.exports.index = async (req, res) => {
  const listing = await listings.find({});
  res.render("listings/home", { listing });
};

// ➕ Create new listing
module.exports.newlisting = async (req, res) => {
  try {
    const { title, description, price, location } = req.body;

    let url = req.file?.path || "/default.jpg";
    let filename = req.file?.filename || "default.jpg";

    // 🌍 Auto geo + country extract
    const geo = await getCoordinates(location);

    const newListing = new listings({
      title,
      description,
      price,
      location,
      country: geo.country,  // ⭐ Auto-filled country
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
    console.error("❌ Create Listing Error:", err.message);
    req.flash("error", "Failed to create listing!");
    res.redirect("/listing");
  }
};


// ✏ Edit listing page
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listdata = await listings.findById(id);
  res.render("listings/update", { listdata });
};

// 🛠 Update listing
module.exports.updateListing = async (req, res) => {
  try {
    let { id } = req.params;
    const { title, description, price, location } = req.body;

    // 🌍 Auto geo + auto country extract
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

      // ⭐ Auto country (user se nahi)
      country: geo.country,

      owner: req.user._id,

      // ⭐ Auto geometry
      geometry: {
        lat: geo.lat,
        lng: geo.lng
      },

      ...(updatedImage.url && { image: updatedImage })
    });

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listing/${id}`);

  } catch (err) {
    console.error("❌ Update Listing Error:", err.message);
    req.flash("error", "Failed to update listing");
    res.redirect("/listing");
  }
};


// 👁 Full Detail Page
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listdata = await listings
    .findById(id)
    .populate("owner")
    .populate({
      path: "reviews",
      populate: {
        path: "author"
      }
    });
    let count = listdata.visits += 1;
    await listdata.save();
    console.log(count);

  res.render("listings/showdetails", { listdata });
};

// 🗑 Delete listing
module.exports.deleteListing = async (req, res) => {
  await listings.findByIdAndDelete(req.params.id);
  req.flash("success", "Listing deleted successfully!");
  res.redirect("/listing");
};

// ➕ Add form render
module.exports.listingAddForm = (req, res) => {
  res.render("listings/add");
};

module.exports.trending = async (req, res) => {

  let { sort } = req.query;
  let listing;

  // 🔥 Trending Filter (highest visits first)
  if (sort === "trending") {
    listing = await listings.find().sort({ visits: -1 });
    console.log(listing);
  } else {
    // Default: all listings without sorting
    listing = await listings.find();
  }

  res.render("listings/home", {listing});
}

//search form data 

module.exports.search = async (req, res) => {
  let data = req.body.data;

  // If empty input
  if (!data) {
    req.flash("success", "Please enter a location!");
    return res.redirect("/listing");
  }

  // Clean input
  data = data.trim().toLowerCase();
  const regex = new RegExp(data, "i");

  // Search DB (location OR country)
  let listing = await listings.find({
    $or: [
      { location: { $regex: regex } },
      { country: { $regex: regex } }
    ]
  });

  // If no listings found
  if (listing.length === 0) {
    req.flash("success", "Sorry! No listings are available at this place.");
    return res.render("listings/home", { listing: [] });
  }

  // If matched
  res.render("listings/home", { listing });
};

  
  

