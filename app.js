// Required modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const listings = require("./models/listing");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapasync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review= require("./models/review");
const {reviewschema, schema}=require("./scemaValidation.js");
const listing = require("./models/listing");
const review = require("./models/review");

// Set EJS-mate as template engine for layouts
app.engine('ejs', engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware for form data, method override, and static files
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB connection
let port = 8080;
let url = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("sucessfully connected");
}).catch((err) => {
    console.log("something went wrong", err);
});

async function main() {
    await mongoose.connect(url);
}
const validateScema = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

const validatereview = (req, res, next) => {
  // debug: print incoming body so you can verify shape
  console.log('validatereview - req.body:', req.body);

  const { error } = reviewschema.validate(req.body); // <-- validate req.body (not { listing: req.body })
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// Route to show all listings
app.get("/listing", wrapasync(async (req, res) => {
    let listing = await listings.find({});
    res.render("listings/home", { listing });
}));

// Show form to add new listing
app.get("/listing/add", (req, res) => {
    res.render("listings/add");
});

// Create new listing
app.post("/listing/form", validateScema, wrapasync(async (req, res) => {
  
    
    let { title, description, image, price, location, country } = req.body;
    let newListing = new listings({ title, description, image, price, location, country });
    await newListing.save();
    res.redirect("/listing");
}));

// Show form to edit listing
app.get("/listing/:id/edit", wrapasync(async (req, res) => {
    let { id } = req.params;
    let listdata = await listings.findById(id);
    res.render("listings/update", { listdata });
}));

// Update listing
app.put("/listing/:id/update", validateScema, wrapasync(async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/listing/${id}`);
}));

// Show single listing details
app.get("/listing/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
 const listdata = await listings.findById(id).populate('reviews'); 
    res.render("listings/showdetails", { listdata });
}));

// Delete listing
app.delete("/listing/:id", wrapasync(async (req, res) => {
    let { id } = req.params;
    await listings.findByIdAndDelete(id);
    res.redirect("/listing");
}));

// Global error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.render("listings/error",{statusCode,message,err})
});
app.post('/listing/:id/review', validatereview, wrapasync(async (req, res) => {
    const { id } = req.params;
    const listing = await listings.findById(id);

    // req.body.review should be present because form names are review[...]
    const newReview = new Review(req.body.review);
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("successfully done");
    res.redirect(`/listing/${id}`);
}));
//review delete button
app.delete("/listing/:id/delete/:reviewid" ,wrapasync(async(req,res)=>{
    let{id,reviewid}=req.params;
   await listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewid }
});
await Review.findOneAndDelete(reviewid);
res.redirect(`/listing/${id}`);
console.log("Delete route triggered", id, reviewid);


}));


// Start the server
app.listen(port, () => {
    console.log("success");
});
