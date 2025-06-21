const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const member = require("./models/member.js");
const port = 8080;
const bodyParser = require('body-parser');
const cors = require('cors');


main()
    .then(() => {
        console.log("connection successful");
    })
    .catch(err => console.log(err));


async function main() {
    await mongoose.createConnection('mongodb://127.0.0.1:27017/GymProject');
}

app.use(express.json());
app.use(express.static('public'));
app.set("views", path.join(__dirname,"views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 8080;


app.get("/", async(req,res) => {
    res.render("Gymindex.ejs");
})

app.get("/bmi", async(req,res) => {
    res.render("bmi.ejs");
})

app.get("/nearByGym", async(req,res) => {
    res.render("nearByGym.ejs");
})

app.get("/calorie", async(req,res) => {
    res.render("calorie.ejs");
})

app.get("/SignUp", async (req,res) => {
    res.render("SignUp.ejs");
})

app.get("/homeExcercise", async (req,res) => {
    res.render("homeExcercise.ejs");
})

app.get("/injury", async (req,res) => {
    res.render("injury.ejs");
})


app.post("/", async(req,res) => {
    let {Username ,email ,password} = req.body;
    let newMember = new member ({
        Username: Username,
        email : email,
        password : password,
        created_at : new Date()
    })
    console.log(newMember);
    newMember.save().then(res => {console.log("response send successfully")}) .catch(err => {console.log(err)});
    res.redirect("/");
})














app.use(cors());
app.use(bodyParser.json());

// Database connection
mongoose.createConnection('mongodb://localhost/gym-progress', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
// .then(() => console.log("MongoDB connected"))
// .catch(err => console.error("MongoDB connection error:", err));

// Schema definition
const progressSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  exercises: [{
    name: String,
    sets: Number,
    reps: Number,
    weight: Number
  }]
});

const Progress = mongoose.model('Progress', progressSchema);

// Routes
// Serve static files (like HTML, CSS, and JS)
// app.use(express.static(path.join(__dirname, 'public')));

// Serve the index.html file on the root path
app.get('/DailyAnalysis', (req, res) => {
//   res.sendFile(path.join(__dirname, 'views', 'DailyAnalysis.ejs'));
    res.render("DailyAnalysis.ejs");
});

// Save progress
app.post('/api/progress', async (req, res) => {
  try {
    const { userId, date, exercises } = req.body;
    const newProgress = new Progress({ userId, date, exercises });
    await newProgress.save();
    res.status(200).json({ message: "Progress saved!", data: newProgress });
  } catch (err) {
    res.status(500).json({ error: "Failed to save progress" });
  }
});

// Fetch all progress of a user
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.params.userId });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// Fetch analytics
app.get('/api/analytics/:userId', async (req, res) => {
  try {
    const [personalBests, workouts] = await Promise.all([
      Progress.aggregate([
        { $match: { userId: req.params.userId } },
        { $unwind: "$exercises" },
        { $group: { 
            _id: "$exercises.name", 
            maxWeight: { $max: "$exercises.weight" } 
        }}
      ]),
      Progress.find({ userId: req.params.userId })
    ]);
    res.json({ 
      personalBests, 
      totalWorkouts: workouts.length,
      avgPerWorkout: workouts.reduce((sum, w) => sum + w.exercises.length, 0) / workouts.length || 0 
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Fetch streak (consecutive workout days)
app.get('/api/streak/:userId', async (req, res) => {
  try {
    const workouts = await Progress.find({ userId: req.params.userId }).sort({ date: -1 });
    let streak = 0;
    for (let i = 0; i < workouts.length - 1; i++) {
      const diffDays = (new Date(workouts[i].date) - new Date(workouts[i + 1].date)) / (1000 * 60 * 60 * 24);
      if (diffDays === 1) streak++;
      else break;
    }
    res.json({ streakDays: streak });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate streak" });
  }
});


app.listen(port, () => {
    console.log("server is listening in port");
})




