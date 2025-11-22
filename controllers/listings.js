const listings = require("../models/listing");
// const wrapasync = require("../utils/wrapasync.js");
// const ExpressError = require("../utils/ExpressErrors.js");

// 🏠 Show all listings
module.exports.index = async (req, res) => {
  const listing = await listings.find({});
  res.render("listings/home", { listing });
};

// ➕ Create new listing
module.exports.newlisting = async (req, res) => {
  try {
    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url, "..", filename);
    const { title, description, price, location, country, image } = req.body;

    const newListing = new listings({
      title,
      description,
      image: image|| " ", // schema will auto replace "" with default image
      price,
      location,
      country,
      owner: req.user._id,
    });
newListing.image={url,filename};
    await newListing.save();
    req.flash("success", "Successfully created a listing!");
    res.redirect("/listing");
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
};

// ✏️ Edit form
module.exports.editListing = async (req, res) => {
  const { id } = req.params;
  const listdata = await listings.findById(id);
  res.render("listings/update", { listdata });
};

// 🛠 Update listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const { title, description, image, price, location, country } = req.body;

  // Agar image empty string hai to mongoose schema default set karega
  await listings.findByIdAndUpdate(id, {
    title,
    description,
    image,
    price,
    location,
    country,
  });

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listing/${id}`);
};

// 👁 Show details
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listdata = await listings
    .findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  res.render("listings/showdetails", { listdata });
};

// ❌ Delete listing
module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  await listings.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted a listing!");
  res.redirect("/listing");
};

// 🧾 Add form render
module.exports.listingAddForm = (req, res) => {
  res.render("listings/add");
};
