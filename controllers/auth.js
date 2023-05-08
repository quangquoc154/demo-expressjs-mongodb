const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

const User = require("../models/user");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

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
    // If password is incorrect
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
      req.flash(
        "error",
        "Email already exists, please re-enter another email !"
      );
      return res.redirect("/signup");
    } else if (password !== confirmPassword) {
      req.flash(
        "error",
        "Confirm password is incorrect !"
      );
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
    // Send email signup succeeded
    await transporter.sendMail({
      to: email,
      from: "duongtin1542002@gmail.com",
      subject: "Signup succeeded!",
      html: "<h1>You successfully signed up!</h1>",
    });
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

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, async (error, buffer) => {
    if (error) {
      console.log(error);
      return res.redirect("/reset");
    }
    // Create resetToken and save into users collection
    const token = buffer.toString("hex");
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      req.flash("error", "No account with that an email found.");
      return res.redirect("/reset");
    }
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000;
    await user.save();
    res.redirect("/");
    // Send email reset password
    await transporter.sendMail({
      to: req.body.email,
      from: "duongtin1542002@gmail.com",
      subject: "Password reset",
      html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
      `,
    });
  });
};

exports.getNewPassword = async (req, res, next) => {
  const token = req.params.token;
  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  });
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/newPassword", {
    path: "/new-password",
    pageTitle: "New Password",
    errorMessage: message,
    userId: user._id.toString(),
    passwordToken: token,
  });
};

exports.postNewPassword = async (req, res, next) => {
  try {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;

    const user = await User.findOne({
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
      _id: userId,
    });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
};
