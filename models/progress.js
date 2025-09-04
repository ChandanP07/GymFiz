const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema({
  userId: String,
  date: Date,
  exercises: [{ name: String, sets: Number, reps: Number, weight: Number }]
});

module.exports = mongoose.model("Progress", progressSchema);
