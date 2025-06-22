// Required Modules
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const listings = require("./models/listing");
const methodOverride = require("method-override");

// Middleware to override method (_method in form)
app.use(methodOverride("_method"));

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Connection URL and Port
let port = 8080;
let url = "mongodb://127.0.0.1:27017/wanderlust";

// MongoDB Connection Function
main().then((res, err) => {
    console.log("sucessfuly connect..");
}).catch((err) => {
    console.log("somthing wrong", err);
});

async function main() {
    await mongoose.connect(url);
}

// ========================= Routes =========================

// Route: Show form to add new listing
app.get("/listing/add", (req, res) => {
    res.render("listings/showform");
});

// Route: Handle form submission to create new listing
app.post("/listing/form", async (req, res) => {
    try {
        let { title, description, image, price, location, country } = req.body;

        // Create new listing document
        let newListing = new listings({
            title,
            description,
            image,
            price,
            location,
            country
        });

        // Save listing to database
        await newListing.save();

        // Redirect to listing page
        res.redirect("/listing");
    } catch (err) {
        console.error("Error saving listing:", err);
        res.status(500).send("Something went wrong.");
    }
});

// Route: Show form to edit a listing by ID
app.get("/listing/:id/edit", async (req, res) => {
    let { id } = req.params;
    let listdata = await listings.findById(id);
    res.render("listings/edit", { listdata });
});

// Route: Update listing data by ID
app.put("/listing/:id", async (req, res) => {
    let { id } = req.params;

    try {
        await listings.findByIdAndUpdate(id, { ...req.body });
        console.log("Update successful ✅");
        res.redirect(`/listing/${id}`);
    } catch (err) {
        console.error("Error updating listing ❌", err);
        res.status(500).send("Something went wrong.");
    }
});

// Route: Show all listings
app.get("/listing", async (req, res) => {
    let listing = await listings.find({});
    console.log(listing);
    res.render("listings/list", { listing });
});

// Route: Show single listing details by ID
app.get("/listing/:id", async (req, res) => {
    let { id } = req.params;
    let listdata = await listings.findById(id);
    res.render("listings/showdata", { listdata });
});

// Route: Delete listing by ID
app.post("/listing/:id/delete", async (req, res) => {
    try {
        let { id } = req.params;
        console.log(id);
        await listings.findByIdAndDelete(id);
        console.log("succesfuly delete", id);
        res.redirect("/listing");
    } catch (err) {
        res.send("some error occur");
    }
});

// Start the Server
app.listen(port, () => {
    console.log("success");
});
