const express = require("express");
const passport = require("passport");
const router = express.Router();
const{redirectUrl}=require("../AuthenticationMiddleware.js")
const usercontroller=require("../controllers/users.js");
// Signup form
router.get("/signup", (req, res) => {
  res.render("user/signup");
});

// Handle signup
router.post("/signup",usercontroller.signup);

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
  usercontroller.login
);

// Logout
router.get("/logout",usercontroller.logout);

module.exports = router;
