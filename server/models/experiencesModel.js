const mongoose = require('mongoose')
const Schema = mongoose.Schema

const experienceSchema = new mongoose.Schema ({
  user: { type: String },
  title: { type: String, required: true },
  city: { type: Schema.Types.ObjectId, ref: 'cities' },
  category: { type: String, ref: 'categories' },
  date: { type: Date, default: Date.now },
  image: { type: String, default: '' },
  images: { type: [String], default: [], maxlength: 5 },
  content: { type: String },
  score: { type: Number },
})

module.exports =  mongoose.model('experiences', experienceSchema)
