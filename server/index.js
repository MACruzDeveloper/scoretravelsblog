const express = require("express");
const app = express();
const port = process.env.port || 3040;
require('dotenv').config();
const path = require('path');

// =============== BODY PARSER SETTINGS =====================
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// =============== DATABASE CONNECTION =====================
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
async function connecting() {
  try {
    await mongoose.connect(process.env.ATLAS_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    console.log('Connected to the DB')
  } catch (error) {
    console.log(error);
    console.log('ERROR: Seems like your DB is not running, please start it up !!!');
  }
}
connecting()

//================ CORS ================================
const cors = require('cors');
app.use(cors());

// =============== ROUTES ==============================
app.use('/users', require('./routes/usersRoute'));
app.use('/admin/categories', require('./routes/categoriesRoute'));
app.use('/admin/cities', require('./routes/citiesRoute'));
app.use('/admin/experiences', require('./routes/experiencesRoute'));
app.use('/admin/comments', require('./routes/commentsRoute'));
app.use('/admin/scores', require('./routes/scoresRoute'));
app.use('/images', require('./routes/imagesRoute'));
app.use('/emails', require('./routes/emailsRoutes.js'))

app.use('/static', express.static('../client/public'));
//app.use('/static', express.static(path.join(__dirname + '../client/public')))

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// =============== START SERVER =====================
app.listen(port, () =>
  console.log(`server listening on port ${port}`
));