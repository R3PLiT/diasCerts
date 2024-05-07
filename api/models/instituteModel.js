const mongoose = require("mongoose");

const instituteSchema = new mongoose.Schema(
  {
    instituteName: { type: String, required: true, unique: true },
    instituteAbbr: { type: String, required: true, unique: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Institute = mongoose.model("Institute", instituteSchema);

module.exports = Institute;
