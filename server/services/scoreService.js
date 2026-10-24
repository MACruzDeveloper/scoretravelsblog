const mongoose = require('mongoose')
const Scores = require('../models/scoresModel')
const Experiences = require('../models/experiencesModel')

// The experience score is the average of its votes, always computed on the server.
// With no votes left the score is cleared.
const recalculateExperienceScore = async (experienceId) => {
  const [stats] = await Scores.aggregate([
    { $match: { experience: new mongoose.Types.ObjectId(String(experienceId)), score: { $gte: 1, $lte: 5 } } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } },
  ])
  const score = stats ? Math.round(stats.avg * 10) / 10 : null
  const votes = stats ? stats.count : 0
  await Experiences.updateOne({ _id: experienceId }, { score, votes })
  return { score, count: votes }
}

module.exports = { recalculateExperienceScore }
