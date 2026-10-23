const comments = require('../models/commentsModel')
const experiences = require('../models/experiencesModel')
const { notFound } = require('../utils/httpErrors')

// Full list for moderation (admin)
const findAllComments = async (req, res) => {
  res.send(await comments.find().select('-userId').sort({ date: -1 }))
}

// The author always comes from the token, never from the request body
const addNewComment = async (req, res) => {
  const { experience, content } = req.body
  if (!(await experiences.exists({ _id: experience }))) throw notFound('Experience not found')
  const done = await comments.create({ user: req.user.username, userId: req.user._id, experience, content })
  res.send(done)
}

const deleteComment = async (req, res) => {
  const removed = await comments.deleteOne({ _id: req.params.id })
  if (!removed.deletedCount) throw notFound('Comment not found')
  res.send({ removed })
}

// Admins can only moderate the text; author and experience stay unchanged
const updateComment = async (req, res) => {
  const updated = await comments.updateOne({ _id: req.params.id }, { content: req.body.content })
  if (!updated.matchedCount) throw notFound('Comment not found')
  res.send({ updated })
}

module.exports = { findAllComments, addNewComment, deleteComment, updateComment }
