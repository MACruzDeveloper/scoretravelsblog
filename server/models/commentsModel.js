const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new mongoose.Schema ({
  // Display name of the author (legacy rows may hold an email)
  user: {type:String},
  userId: {type: Schema.Types.ObjectId, ref: 'users'},
  experience: {type: String, required: true},
  date: { type: Date, default: Date.now },
  content: {type: String}
});

commentSchema.index({ experience: 1, date: -1 });

module.exports =  mongoose.model('comments', commentSchema);
