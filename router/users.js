const express=require("express");
const passport = require("passport");
const router=express.Router();
const User=require("../models/user.js");


router.get("/signup",(req,res)=>{
    res.render("user/signup");
});
router.post("/signup", async (req,res)=>{
    try{
let{username,email,password}=req.body;
    const newuser=new User({username,email});
    let user=await User.register(newuser,password);
    req.flash("success","new user successfuly register");
    res.redirect("/listing");
    } catch(e){
      req.flash("success",e.message);
      res.redirect("/signup");
    }
    
})

router.get("/login",(req,res)=>{
    res.render("user/login");
});




router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    req.flash("success", "Welcome to our website!");
    res.redirect("/listing");
  }
);

module.exports=router;