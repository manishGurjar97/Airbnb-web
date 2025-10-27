const listing = require("./models/listing");

function isAuthorized(req, res, next) {
  if (req.isAuthenticated()) {  // Passport ka built-in method
   
    return next();  // Authorized hai (user logged in hai)
  }
  req.session.redirectUrl=req.originalUrl;
  console.log(req.originalUrl);
  req.flash("error", "You must be logged in first!");
  res.redirect("/signup");
  
}

module.exports = isAuthorized;

module.exports.redirectUrl=(req,res,next)=>{
  if(  req.session.redirectUrl){
 res.locals.redirectUrl=  req.session.redirectUrl;
  }
  next();
};

const Listing = require("./models/listing");

module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params; // assuming route has /:id
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }
  if (!req.user._id.equals(listing.owner._id)) { // assuming listing.owner stores user._id
    req.flash("success", "You are not the owner of this listing");
    return res.redirect(`/listing/${id}`);
  }
  next();
};
