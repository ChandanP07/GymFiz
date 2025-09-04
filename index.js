// Load environment variables
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const flash = require("connect-flash");

const app = express();
const port = process.env.PORT || 8080;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/GymProject", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || "gym_secret_key",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // change to true if using HTTPS
}));
app.use(flash());

// Flash messages available in all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Attach user to response locals for views
const Member = require("./models/member");
app.use(async (req, res, next) => {
  if (req.session.userId) {
    res.locals.user = await Member.findById(req.session.userId);
  } else {
    res.locals.user = null;
  }
  next();
});

// --- Routes ---
app.use("/", require("./routes/auth"));       // login, signup, logout
app.use("/", require("./routes/dashboard"));  // dashboard, general pages
app.use("/", require("./routes/admin"));      // admin panel
app.use("/api", require("./routes/api"));     // API endpoints for workouts, analytics

// --- Default route ---
app.get("/", (req, res) => {
  res.redirect(req.session.userId ? "/Gymindex" : "/login");
});

// --- Start Server ---
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
