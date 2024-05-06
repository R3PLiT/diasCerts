const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    course: { type: String, required: true },
    courseAbbr: { type: String },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // instituteName: { type: String, required: true },
    // active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
