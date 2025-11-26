const listings = require("../models/listing");
const axios = require("axios");

// 🌍 Geocoding Service (Reuse Nishchit Kiya)
async function getCoordinates(location) {
  try {
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;
    const geoRes = await axios.get(geoUrl, {
      headers: { "User-Agent": "ManishApp/1.0" }
    });

    if (geoRes.data.length > 0) {
      return {
        lat: geoRes.data[0].lat,
        lng: geoRes.data[0].lon
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
    const { title, description, price, location, country } = req.body;

    let url = req.file?.path || "/default.jpg";
    let filename = req.file?.filename || "default.jpg";

    const coordinates = await getCoordinates(location);

    const newListing = new listings({
      title,
      description,
      price,
      location,
      country,
      owner: req.user._id,
      geometry: coordinates,
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
    const { title, description, price, location, country } = req.body;

    const coordinates = await getCoordinates(location);

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
      country,
      owner: req.user._id,
      geometry: coordinates,
      ...(updatedImage.url && { image: updatedImage })
    });

    req.flash("success", "Listing updated successfully!");
    res.redirect(`/listing/${id}`);

  } catch (err) {
    let { id } = req.params;
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
