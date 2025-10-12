function isAuthorized(req, res, next) {
  if (req.isAuthenticated()) {  // Passport ka built-in method
    return next();  // Authorized hai (user logged in hai)
  }
  req.flash("error", "You must be logged in first!");
  res.redirect("/signup");
}

module.exports = isAuthorized;
