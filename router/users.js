const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user.js");
const{redirectUrl}=require("../AuthenticationMiddleware.js")

// Signup form
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

// Handle signup
router.post("/signup", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email });
    const user = await User.register(newUser, password);

    req.login(user, (err) => {
      if (err) return next(err);
      req.flash("success", "New user successfully registered!");
      res.redirect("/listing");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
});

// Login form
router.get("/login", (req, res) => {
  res.render("user/login");
});

// Handle login
router.post(
  "/login",redirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "You logged in successfully!");
    const currentAction=res.locals.redirectUrl||"/listing"
    res.redirect(currentAction);
  }
);

// Logout
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You logged out successfully!");
    res.redirect("/listing");
  });
});

module.exports = router;
