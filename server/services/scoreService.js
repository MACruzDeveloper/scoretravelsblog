const Scores = require('../models/scoresModel')
const Experiences = require('../models/experiencesModel')

// The experience score is the average of its votes, always computed on the server.
// With no votes left the score is cleared.
const recalculateExperienceScore = async (experienceId) => {
  const [stats] = await Scores.aggregate([
    { $match: { experience: String(experienceId), score: { $gte: 1, $lte: 5 } } },
    { $group: { _id: null, avg: { $avg: '$score' }, count: { $sum: 1 } } }
  ])
  const score = stats ? Math.round(stats.avg * 10) / 10 : null
  await Experiences.updateOne({ _id: experienceId }, { score })
  return { score, count: stats ? stats.count : 0 }
}

module.exports = { recalculateExperienceScore }
