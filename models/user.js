const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

userSchema.methods.addToCart = function (prodId) {
  const cartProduct = this.cart.items.find(
    (cp) => cp.productId.toString() == prodId.toString()
  );
  // Check product in cart
  if (cartProduct) {
    cartProduct.quantity += 1;
  } else {
    this.cart.items.push({ productId: new ObjectId(prodId), quantity: 1 });
  }
  return this.save();
};

userSchema.methods.removeFormCart = function (productId) {
  const updateCartItems = this.cart.items.filter(
    (item) => item.productId.toString() !== productId.toString()
  );
  this.cart.items = updateCartItems;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { item: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);