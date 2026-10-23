const scores = require('../models/scoresModel');
const experiences = require('../models/experiencesModel');
const { recalculateExperienceScore } = require('../services/scoreService');

class scoresController {
  async findAllScores(req, res) {
    try {
      const sc = await scores.find().select('-userId');
      res.send(sc);
    }
    catch (error) {
      console.error('Fetch scores failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error fetching scores' })
    }
  }

  // One vote per user: voting again updates the previous vote
  async addNewScore(req, res) {
    const { experience, score } = req.body;
    try {
      const exists = await experiences.exists({ _id: experience });
      if (!exists) return res.status(404).json({ ok: false, message: 'Experience not found' })

      const done = await scores.findOneAndUpdate(
        { experience, userId: req.user._id },
        { experience, userId: req.user._id, user: req.user.username, score },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true }
      );
      const summary = await recalculateExperienceScore(experience);
      res.send({ ok: true, score: done.score, experienceScore: summary.score, votes: summary.count });
    }
    catch (error) {
      console.error('Create score failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error creating score' })
    }
  }

  async deleteScore(req, res) {
    const { _id } = req.body;
    try {
      const existing = await scores.findById(_id);
      if (!existing) return res.status(404).json({ ok: false, message: 'Score not found' })
      const removed = await scores.deleteOne({ _id });
      await recalculateExperienceScore(existing.experience);
      res.send({ removed });
    }
    catch (error) {
      console.error('Delete score failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error deleting score' })
    }
  }

  async updateScore(req, res) {
    const { _id, score } = req.body;
    try {
      const existing = await scores.findById(_id);
      if (!existing) return res.status(404).json({ ok: false, message: 'Score not found' })
      const updated = await scores.updateOne({ _id }, { score }, { runValidators: true });
      await recalculateExperienceScore(existing.experience);
      res.send({ updated });
    }
    catch (error) {
      console.error('Update score failed:', error.message)
      res.status(500).json({ ok: false, message: 'Error updating score' })
    }
  }
}

module.exports = new scoresController();
