const listings = require("../models/listing");
const axios = require("axios");

// ➕ Create new listing
module.exports.newlisting = async (req, res) => {
  try {

    // 📸 Image upload data  
    let url = req.file.path;
    let filename = req.file.filename;

    // 📥 User form se data
    const { title, description, price, location, country } = req.body;

    // 🌍 Convert location → Coordinates (Geocoding)
    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`;

    const geoRes = await axios.get(geoUrl, {
      headers: { "User-Agent": "ManishApp/1.0" }
    });

    let coordinates = null;
    if (geoRes.data.length > 0) {
      coordinates = {
        lat: geoRes.data[0].lat,
        lng: geoRes.data[0].lon
      };
    }

    // 🆕 New listing create
    const newListing = new listings({
      title,
      description,
      price,
      location,
      country,
      owner: req.user._id,
      geometry: coordinates,   // <-- coordinates save ho rahe hain
      image: { url, filename }
    });

    await newListing.save();

    req.flash("success", "Successfully created a listing!");
    res.redirect("/listing");

  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
};
