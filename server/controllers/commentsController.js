const comments = require('../models/commentsModel');
const experiences = require('../models/experiencesModel');

class commentsController {
  async findAllComments(req, res) {
    try {
      const comms = await comments.find().select('-userId');
      res.send(comms);
    }
    catch (error) {
      console.error('Fetch comments failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error fetching comments' })
    }
  }

  // The author always comes from the token, never from the request body
  async addNewComment(req, res) {
    const { experience, content } = req.body;
    try {
      const exists = await experiences.exists({ _id: experience });
      if (!exists) return res.status(404).json({ ok: false, message: 'Experience not found' })

      const done = await comments.create({
        user: req.user.username,
        userId: req.user._id,
        experience,
        content
      });
      res.send(done);
    }
    catch (error) {
      console.error('Create comment failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error creating comment' })
    }
  }

  async deleteComment(req, res) {
    const { _id } = req.body;
    try {
      const removed = await comments.deleteOne({ _id });
      res.send({ removed });
    }
    catch (error) {
      console.error('Delete comment failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error deleting comment' })
    }
  }

  // Admins can only moderate the text; author and experience stay unchanged
  async updateComment(req, res) {
    const { _id, content } = req.body;
    try {
      const updated = await comments.updateOne({ _id }, { content });
      res.send({ updated });
    }
    catch (error) {
      console.error('Update comment failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error updating comment' })
    }
  }
}

module.exports = new commentsController();
