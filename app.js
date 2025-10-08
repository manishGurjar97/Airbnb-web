// Required modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const engine = require("ejs-mate");

// Routers
const Listings = require("./router/listings.js");
const Reviews = require("./router/reviews.js");

// Set view engine
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Database connection
let port = 8080;
let url = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(url);
}

main()
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Database connection error:", err);
    });

// Routes
app.use("/listing", Listings);
app.use("/listing/:id/review", Reviews);

// Error handler
app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.render("listings/error", { statusCode, message, err });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
