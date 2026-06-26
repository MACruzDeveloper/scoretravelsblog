const path = require("path");
const sharp = require("sharp");
const Images = require("../models/imagesModel");
const fs = require("fs");

const upload_image = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    console.log(`req.body =======>`, req.body)

    const outputDir = path.join(__dirname, '..', '..', 'client', 'public', 'images')
    fs.mkdirSync(outputDir, { recursive: true })
    const originalName = path.parse(req.file.originalname).name
    const filename = `${Date.now()}-${originalName}.avif`
    const outputPath = path.join(outputDir, filename)
    const image = sharp(req.file.buffer)
    const metadata = await image.metadata()

    await image
      .avif({ quality: 70, effort: 6 })
      .toFile(outputPath)

    await Images.create({
      pathname: outputPath,
      filename,
      title: req.body.title || '',
      width: metadata.width || null,
      height: metadata.height || null
    })

    return res.status(200).json({ filename, title: req.body.title || '' })
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
