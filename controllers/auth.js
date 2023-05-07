const User = require("../models/user");
const bcrypt = require("bcryptjs");

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

exports.postLogin = async (req, res, next) => {
  // res.setHeader("Set-Cookie", "loggedIn=true; HttpOnly");
  try {
    const email = req.body.email;
    const password = req.body.password;
    // Check email
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email or password !");
      return res.redirect("/login");
    }

    // Check password
    const doMatch = await bcrypt.compare(password, user.password);
    if (doMatch) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      return req.session.save((error) => {
        console.log(error);
        res.redirect("/");
      });
    }
    req.flash("error", "Invalid email or password !");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    errorMessage: message,
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    const userDoc = await User.findOne({ email: email });
    if (userDoc) {
      req.flash("error", "Email already exists, please re-enter another email !");
      return res.redirect("/signup");
    }

    const hashPassword = await bcrypt.hash(password, 12);
    const user = new User({
      username: username,
      email: email,
      password: hashPassword,
      cart: { item: [] },
    });
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);
    res.redirect("/");
  });
};
