const scores = require('../models/scoresModel')
const experiences = require('../models/experiencesModel')
const { recalculateExperienceScore } = require('../services/scoreService')
const { notFound } = require('../utils/httpErrors')

// Full list for the admin
const findAllScores = async (req, res) => {
  res.send(await scores.find().select('-userId'))
}

// One vote per user: voting again updates the previous vote
const addNewScore = async (req, res) => {
  const { experience, score } = req.body
  if (!(await experiences.exists({ _id: experience }))) throw notFound('Experience not found')
  const done = await scores.findOneAndUpdate(
    { experience, userId: req.user._id },
    { experience, userId: req.user._id, user: req.user.username, score },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
  )
  const summary = await recalculateExperienceScore(experience)
  res.send({ ok: true, score: done.score, experienceScore: summary.score, votes: summary.count })
}

const deleteScore = async (req, res) => {
  const existing = await scores.findById(req.params.id)
  if (!existing) throw notFound('Score not found')
  const removed = await scores.deleteOne({ _id: existing._id })
  await recalculateExperienceScore(existing.experience)
  res.send({ removed })
}

const updateScore = async (req, res) => {
  const existing = await scores.findById(req.params.id)
  if (!existing) throw notFound('Score not found')
  const updated = await scores.updateOne({ _id: existing._id }, { score: req.body.score }, { runValidators: true })
  await recalculateExperienceScore(existing.experience)
  res.send({ updated })
}

module.exports = { findAllScores, addNewScore, deleteScore, updateScore }
