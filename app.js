const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorController = require("./controllers/error");
const User = require("./models/user");

app.set("view engine", "ejs");
app.set("views", "views");

// next(); Allows the request to continue to the next middleware in line

// app.use("/", (req, res, next) => {
//   console.log("This always run!");
//   next();
// });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("644cc64e372498e361c78b3b");
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://quangquoc1542002:Yu8hW5AZ3NVvjcV5@cluster0.wu5wxo1.mongodb.net/shop"
    );

    const user = await User.findOne();
    if (!user) {
      const newUser = new User({
        username: "quangquoc",
        email: "quangquoc1542002@gmail.com",
        cart: { items: [] },
      });
      newUser.save();
    }
    app.listen(3000);
  } catch (error) {
    console.log(error);
  }
})();