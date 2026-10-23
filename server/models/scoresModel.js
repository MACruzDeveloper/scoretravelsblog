const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scoreSchema = new mongoose.Schema ({
  experience: {type: String, required: true, ref: 'experiences' },
  // Display name of the voter (legacy rows may hold an email)
  user: {type: String},
  userId: {type: Schema.Types.ObjectId, ref: 'users'},
  score: {type: Number, min: 1, max: 5}
});

// One vote per user and experience. Partial so legacy rows without userId don't collide.
scoreSchema.index(
  { experience: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $exists: true } } }
);

module.exports =  mongoose.model('scores', scoreSchema);
