const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true},
  description: String
})

module.exports =  mongoose.model('categories', categorySchema);
