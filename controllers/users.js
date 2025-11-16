const User = require("../models/user.js");
module.exports.signup=async (req, res, next) => {
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
};

module.exports.login=(req, res) => {
    req.flash("success", "You logged in successfully!");
    const currentAction=res.locals.redirectUrl||"/listing"
    res.redirect(currentAction);
  };

  module.exports.logout=(req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You logged out successfully!");
    res.redirect("/listing");
  })};