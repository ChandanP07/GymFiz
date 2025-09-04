const express = require("express");
const router = express.Router();
const Workout = require("../models/workout");
const Progress = require("../models/progress");

// Save workout
router.post("/workout", async (req, res) => {
  try {
    const { userId, date, exercises } = req.body;
    await Workout.create({ userId, date, exercises });
    res.status(201).json({ message: "Workout saved" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Save progress report
router.post("/progress", async (req, res) => {
  try {
    const newProgress = await new Progress(req.body).save();
    res.json({ message: "Progress saved", data: newProgress });
  } catch (err) {
    res.status(500).json({ error: "Save error" });
  }
});

// Get all progress for a user
router.get("/progress/:userId", async (req, res) => {
  const data = await Progress.find({ userId: req.params.userId });
  res.json(data);
});

// Get analytics for a user
router.get("/analytics/:userId", async (req, res) => {
  const [bests, workouts] = await Promise.all([
    Progress.aggregate([
      { $match: { userId: req.params.userId } },
      { $unwind: "$exercises" },
      {
        $group: {
          _id: "$exercises.name",
          maxWeight: { $max: "$exercises.weight" }
        }
      }
    ]),
    Progress.find({ userId: req.params.userId })
  ]);

  res.json({
    personalBests: bests,
    totalWorkouts: workouts.length,
    avgPerWorkout:
      workouts.reduce((sum, w) => sum + w.exercises.length, 0) / workouts.length || 0
  });
});

// Get streak for a user
router.get("/streak/:userId", async (req, res) => {
  const logs = await Progress.find({ userId: req.params.userId }).sort({ date: -1 });
  let streak = 0;
  for (let i = 0; i < logs.length - 1; i++) {
    const diff = (new Date(logs[i].date) - new Date(logs[i + 1].date)) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  res.json({ streakDays: streak });
});

module.exports = router;
