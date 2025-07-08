const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  userType: { type: String, enum: ["farmer", "buyer"], required: true },
});

const User = mongoose.model("User", userSchema);

const productSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    farmerEmail: String,
    buyerEmail: { type: String, default: null } // <- new field
  });
  

const Product = mongoose.model("Product", productSchema);

module.exports = { User, Product };
