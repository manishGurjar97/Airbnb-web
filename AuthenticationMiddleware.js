
const Listing = require("./models/listing");
const Review= require("./models/review");

module.exports.isAuthenticated=(req, res, next)=>{
  if (req.isAuthenticated()) {  // Passport ka built-in method
   
    return next();  // Authorized hai (user logged in hai)
  }
  req.session.redirectUrl=req.originalUrl;
  console.log(req.originalUrl);
  req.flash("error", "You must be logged in first!");
  res.redirect("/signup");
  
}



module.exports.redirectUrl=(req,res,next)=>{
  if(  req.session.redirectUrl){
 res.locals.redirectUrl=  req.session.redirectUrl;
  }
  next();
};















module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;

    // Listing find karo
    let listing = await Listing.findById(id);

    // Listing exist nahi karti
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listing");
    }

    // Check: logged in user = owner ?
    if (!listing.owner.equals(req.user._id)) {
        req.flash("error", "You are not the owner!");
        return res.redirect(`/listing/${id}`);
    }

    // Sab thik hai → next middleware
    next();
};
  


module.exports.isReviewOwner = async (req, res, next) => {
    const { id, reviewid } = req.params;

    const review = await Review.findById(reviewid);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listing/${id}`);
    }

    // 🟢 Agar user exist nahi karta
    if (!req.user) {
        req.flash("success", "You are not the owner of this review!");
        return res.redirect(`/listing/${id}`);
    }

    // 🟢 Check: kya review k author aur current user match hote hain?
    if (!review.author.equals(req.user._id)) {
        req.flash("success", "You are not the owner of this review!");
        return res.redirect(`/listing/${id}`);
    }

    next();
};

module.exports.validateScema = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validatereview = (req, res, next) => {
  // debug: print incoming body so you can verify shape
 

  const { error } = reviewschema.validate(req.body); // <-- validate req.body (not { listing: req.body })
  if (error) {
    const msg = error.details.map(el => el.message).join(', ');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};