const { validationResult } = require("express-validator");
const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasErrors: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postAddProduct = async (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasErrors: true,
        errorMessage: errors.array()[0].msg,
        product: {
          title: title,
          price: price,
          description: description,
          imageUrl: imageUrl,
        },
        validationErrors: errors.array(),
      });
    }
    const product = new Product({
      title: title,
      price: price,
      description: description,
      imageUrl: imageUrl,
      userId: req.user,
    });
    await product.save();
    res.redirect("/");
  } catch (error) {
    // res.redirect("/500");
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
    // return res.status(500).render("admin/edit-product", {
    //   pageTitle: "Add Product",
    //   path: "/admin/add-product",
    //   editing: false,
    //   hasErrors: true,
    //   errorMessage: "Database operation failed, please try again.",
    //   product: {
    //     title: title,
    //     price: price,
    //     description: description,
    //     imageUrl: imageUrl,
    //   },
    //   validationErrors: [],
    // });
  }
};

exports.getEditProduct = async (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.redirect("/");
    }
    console.log(product);
    res.render("admin/edit-product", {
      product: product,
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: editMode,
      hasErrors: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  try {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    const updatedImageUrl = req.body.imageUrl;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: true,
        hasErrors: true,
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
        product: {
          title: updatedTitle,
          price: updatedPrice,
          description: updatedDescription,
          imageUrl: updatedImageUrl,
          _id: prodId,
        },
      });
    }

    const product = await Product.findById(prodId);
    if (product.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    product.title = updatedTitle;
    product.price = updatedPrice;
    product.description = updatedDescription;
    product.imageUrl = updatedImageUrl;
    await product.save();
    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ userId: req.user._id });
    // .select("title price -_id")
    // .populate("userId", 'username');
    // console.log(products);
    res.render("admin/products", {
      prods: products,
      pageTitle: "Admin Products",
      path: "/admin/products",
    });
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};

exports.postDeleteProduct = async (req, res, next) => {
  const prodId = req.body.productId;
  try {
    await Product.deleteOne({ _id: prodId, userId: req.user._id });
    res.redirect("/admin/products");
  } catch (error) {
    const err = new Error(error);
    err.httpStatusCode = 500;
    return next(err);
  }
};
