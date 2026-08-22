const scores = require('../models/scoresModel');
const { isValidId } = require('../utils/validators');

class scoresController {
  async findAllScores(req, res) {
    try {
      const sc = await scores.find();
      res.send(sc);
    }
    catch (error) {
      res.send({ error })
    }
  }

  async addNewScore(req, res) {
    let params = req.body;
    try {
      const done = await scores.create({experience: params.experience, user: params.user, score: params.score});
      res.send(done);
    }
    catch (error) {
      res.send({ error })
    }
  }

  async deleteScore(req, res) {
    let { _id } = req.body;
    if (!isValidId(_id)) return res.status(400).send({ error: 'Invalid id' });
    try {
      const removed = await scores.deleteOne({ _id: _id });
      res.send({ removed });
    }
    catch (error) {
      res.send({ error })
    }
  }

  async updateScore(req, res) {
    let params = req.body;  
    if (!isValidId(params._id)) return res.status(400).send({ error: 'Invalid id' });
    
    try {
      const updated = await scores.updateOne(
        { _id: params._id }, {experience: params.experience, user: params.user, score: params.score}
      );
      res.send({ updated });
    }
    catch (error) {
      res.send({ error });
    }
  }
}

module.exports = new scoresController();