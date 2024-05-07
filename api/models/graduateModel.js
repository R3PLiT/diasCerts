const mongoose = require("mongoose");

const graduateSchema = new mongoose.Schema(
  {
    titleName: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // instituteName: { type: String, required: true },
    // active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Graduate = mongoose.model("Graduate", graduateSchema);

module.exports = Graduate;
