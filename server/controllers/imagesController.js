const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const Images = require("../models/imagesModel");
const fs = require("fs");
const { UPLOADS_DIR } = require("../utils/paths");
const { resolveUpload, unlinkUpload, countExperiencesUsing } = require("../services/imageService");

const upload_image = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ ok: false, message: 'No file uploaded' })
    }

    fs.mkdirSync(UPLOADS_DIR, { recursive: true })
    // Generated name: never trust the client's original filename
    const filename = `${Date.now()}-${crypto.randomUUID()}.avif`
    const outputPath = path.join(UPLOADS_DIR, filename)
    const image = sharp(req.file.buffer)
    const metadata = await image.metadata()

    await image
      .rotate()
      .avif({ quality: 70, effort: 6 })
      .toFile(outputPath)

    const title = req.body.title || ''
    await Images.create({
      filename,
      title,
      width: metadata.width || null,
      height: metadata.height || null
    })

    return res.status(200).json({ filename, title })
  } catch (error) {
    console.error('Upload failed:', error.message)
    return res.status(500).json({ ok: false, message: 'Upload failed' })
  }
};

const fetch_images = async (req, res) => {
  try {
    // Newest first (ObjectIds grow with creation time)
    const images = await Images.find({}).select('-pathname').sort({ _id: -1 });
    res.status(200).json({ images });
  } catch (error) {
    console.error('Fetch images failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error fetching images' })
  }
};

// The filename comes from the database record, never from the URL
const delete_image = async (req, res) => {
  const _id = req.params.id;
  try {
    const image = await Images.findById(_id);
    if (!image) return res.status(404).json({ ok: false, message: 'Image not found' });
    const filename = image.filename;
    const filePath = resolveUpload(filename);
    if (!filePath) return res.status(400).json({ ok: false, message: 'Invalid filename' });

    const usedBy = await countExperiencesUsing(filename);
    if (usedBy) {
      return res.status(409).json({ ok: false, message: `Image is used by ${usedBy} experience(s). Remove it from them first` });
    }

    await unlinkUpload(filePath);
    const deleted = await Images.deleteOne({ _id });
    res.send({ deleted });
  } catch (error) {
    console.error('Delete image failed:', error.message)
    res.status(500).json({ ok: false, message: 'Delete failed' });
  }
};

const update_image = async (req, res) => {
  const _id = req.params.id;
  const { featured } = req.body;
  try {
    const updated = await Images.updateOne({ _id }, { featured });
    res.send({ updated });
  }
  catch (error) {
    console.error('Update image failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error updating image' });
  }
}

module.exports = {
  upload_image,
  fetch_images,
  delete_image,
  update_image
};
