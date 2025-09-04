const express = require("express");
const router = express.Router();
const Member = require("../models/member");
const Workout = require("../models/workout");
const Progress = require("../models/progress");

const injuryVideos = [
  { title: "Knee Rehab", url: "https://example.com/knee" },
  { title: "Back Relief", url: "https://example.com/back" }
];

const homeExerciseVideos = [
  { title: "Push Workout", url: "https://example.com/push" },
  { title: "Cardio Blast", url: "https://example.com/cardio" }
];

router.get("/admin", async (req, res) => {
  const users = await Member.find({ isAdmin: false });
  const progressReports = await Progress.find({});
  const workouts = await Workout.find({});
  res.render("adminDashboard", {
    users,
    progressReports,
    workouts,
    videos: [...injuryVideos, ...homeExerciseVideos]
  });
});

module.exports = router;
