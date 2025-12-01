// Required modules
require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("express-flash");
const User=require("./models/user.js");
const passport=require("passport");
const  LocalStrategy=require("passport-local");
const url = process.env.MONGO_URL;


// Routers
const Listings = require("./router/listings.js");
const Reviews = require("./router/reviews.js");
const users=require("./router/users.js");
const store =MongoStore.create({
   mongoUrl:url,
  //  crypto:{
  //   secret: process.env.SESSION_SECRET
  //  },
   touchAfter:24* 3600,
})
// Session configuration
const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};



store.on("error", (err) => {
  console.log("Error in Mongo Session Store:", err);
});


// Set view engine
app.engine("ejs", engine);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(session(sessionOptions)); // session middleware pehle lagana zaruri hai
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));




// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash message locals setup
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser=req.user;
  next();
});

// MongoDB connection
const port = 8080;


async function main() {
  await mongoose.connect(url);
}
main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Database connection error:", err));


app.get("/", (req, res) => {
  res.redirect("/listing");
});

// Routes
app.use("/listing", Listings);
app.use("/listing/:id/review", Reviews);
app.use("/",users);

// Global error handler
// app.use((err, req, res, next) => {
//   const { statusCode = 500, message = "Something went wrong" } = err;
//   res.render("listings/error", { statusCode, message, err });
// });
app.use((err, req, res, next) => {

  if (res.headersSent) {
      return next(err);  // IMPORTANT FIX
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Something went wrong";

  return res.status(statusCode).render("listings/error", {
      statusCode,
      message,
      err,
  });
});






// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
