const express = require("express");

const { body } = require("express-validator");

const adminController = require("../controllers/admin");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  [
    body(
      "title",
      "Please enter a title with only numbers and text and at least 3 characters"
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl", "Please enter a image URL with valid format").isURL(),
    body("price", "Please enter the price in the correct format").isFloat(),
    body("description", "Please enter a description of 5 characters or more").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// /admin/edit-product => GET
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

// /admin/edit-product => POST
router.post(
  "/edit-product",
  [
    body(
      "title",
      "Please enter a title with only numbers and text and at least 3 characters"
    )
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("imageUrl", "Please enter the correct Image URL").isURL(),
    body("price", "Please enter the price in the correct format").isFloat(),
    body("description", "Please enter a description of 5 characters or more").isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// /admin/delete-product => POST
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
