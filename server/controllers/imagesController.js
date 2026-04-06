const multer = require("multer");
const Images = require("../models/imagesModel");
const fs = require("file-system");

const upload_image = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log(`req.body =======>`, req.body)

    await Images.create({
      pathname: req.file.path,
      filename: req.file.filename,
      title: req.body.title || ''
    })
    return res.status(200).json({ file: req.file, title: req.body.title || '' })
  } catch (error) {
    console.log("error =====>", error)
    return res.status(500).json({ error: error.message || 'Upload failed' })
  }
};

const fetch_images = async (req, res) => {
  try {
    const images = await Images.find({});
    res.status(200).json({ images });
  } catch (error) {
    console.log("error =====>", error);
  }
};

const delete_image = async (req, res) => {
  const { _id, filename } = req.params;
  try {
    const deleted = await Images.deleteOne({ _id });
    fs.unlink(`../client/public/images/${filename}`, err => {
      if (err) throw err;
      console.log(`${filename} was deleted`);
      //return res.status(200).json({ message: `${filename} was deleted` });
    });
    res.send({ deleted });
  } catch (error) {
    console.log("error =====>", error);
  }
};

const update_image = async (req, res) => {
  let params = req.body;  
    
    try {
      const updated = await Images.updateOne(
        { _id: params._id }, {featured: params.featured}
      );
      res.send({ updated });
    }
    catch (error) {
      res.send({ error });
    };
}

module.exports = {
  upload_image,
  fetch_images,
  delete_image,
  update_image
};
