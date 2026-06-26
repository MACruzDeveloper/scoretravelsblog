const mongoose = require("mongoose");

const imagesSchema = new mongoose.Schema({
  title: String,
  featured: { 
    type: Boolean, 
    default: false 
  },
  pathname: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  width: Number,
  height: Number
});

module.exports = mongoose.model("images", imagesSchema);
