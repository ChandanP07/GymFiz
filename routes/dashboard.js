const express = require("express");
const router = express.Router();
const Progress = require("../models/progress");
const Member = require("../models/member");
const { requireLogin } = require("../middleware/auth");


router.get("/dashboard", requireLogin, async (req, res) => {
  const user = await Member.findById(req.session.userId);
  const progress = await Progress.find({ userId: user._id }).sort({ date: -1 });

  const personalBests = await Progress.aggregate([
    { $match: { userId: user._id.toString() } },
    { $unwind: "$exercises" },
    {
      $group: {
        _id: "$exercises.name",
        maxWeight: { $max: "$exercises.weight" }
      }
    }
  ]);

  res.render("dashboard", {
    user,
    dailyProgress: progress.slice(0, 5),
    personalBests
  });
});



["Gymindex", "bmi", "nearByGym", "calorie", "homeExcercise", "injury", "DailyAnalysis"].forEach(page =>
  router.get(`/${page}`, (req, res) => res.render(page))
);

module.exports = router;
