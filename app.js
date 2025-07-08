const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { User, Product } = require("./models");
const app = express();
const PORT = 4000;

mongoose.connect("mongodb://127.0.0.1:27017/farmeasy", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

let currentUser = null;

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, userType } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ email, userType });
    await user.save();
  }

  currentUser = user;

  if (user.userType === "farmer") {
    res.redirect("/farmer/dashboard");
  } else {
    res.redirect("/buyer/dashboard");
  }
});

app.get("/farmer/dashboard", async (req, res) => {
  if (!currentUser || currentUser.userType !== "farmer") {
    return res.redirect("/login");
  }
  const products = await Product.find({ farmerEmail: currentUser.email });
  res.render("farmer_dashboard", { user: currentUser, products });
});

app.post("/farmer/add-product", async (req, res) => {
  if (!currentUser || currentUser.userType !== "farmer") {
    return res.redirect("/login");
  }
  const { name, category, price } = req.body;
  const product = new Product({
    name,
    category,
    price,
    farmerEmail: currentUser.email,
  });
  await product.save();
  res.redirect("/farmer/dashboard");
});

app.get("/buyer/dashboard", async (req, res) => {
    if (!currentUser || currentUser.userType !== "buyer") return res.redirect("/login");
    const products = await Product.find({ buyerEmail: null }); // ✅ Only show unsold products
    res.render("buyer_dashboard", { user: currentUser, products });
  });

app.get("/logout", (req, res) => {
  currentUser = null;
  res.redirect("/");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
app.get("/buyer/purchases", async (req, res) => {
    if (!currentUser || currentUser.userType !== "buyer") {
      return res.redirect("/login");
    }
    const purchases = await Product.find({ buyerEmail: currentUser.email });
    res.render("buyer_purchases", { user: currentUser, purchases });
  });