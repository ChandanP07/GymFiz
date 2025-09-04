const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const Member = require("../models/member");
const { validateSignup, validateLogin } = require("../middleware/validation");

router.get("/signup", (req, res) => res.render("signup"));

router.post("/signup", validateSignup, async (req, res) => {
  const { Username, email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  await new Member({ Username, email, password: hashed }).save();
  req.flash("success", "Signup successful! Please login.");
  res.redirect("/login");
});

router.get("/login", (req, res) => res.render("login"));


router.post("/login", validateLogin, async (req, res) => {
  const { email, password } = req.body;
  const user = await Member.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    req.session.userId = user._id;
    return res.redirect(user.isAdmin ? "/admin" : "/Gymindex");
  }
  req.flash("error", "Invalid email or password");
  res.redirect("/login");
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;
