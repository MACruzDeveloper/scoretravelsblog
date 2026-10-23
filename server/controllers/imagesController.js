const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");
const Images = require("../models/imagesModel");
const fs = require("fs");
const { UPLOADS_DIR } = require("../utils/paths");

// Resolve a stored filename inside the uploads folder, refusing anything that escapes it
const resolveUpload = (filename) => {
  const filePath = path.resolve(UPLOADS_DIR, path.basename(filename));
  return filePath.startsWith(path.resolve(UPLOADS_DIR) + path.sep) ? filePath : null;
};

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
    const images = await Images.find({}).select('-pathname');
    res.status(200).json({ images });
  } catch (error) {
    console.error('Fetch images failed:', error.message)
    res.status(500).json({ ok: false, message: 'Error fetching images' })
  }
};

const delete_image = async (req, res) => {
  const { _id, filename } = req.params;
  const filePath = resolveUpload(filename);
  if (!filePath) return res.status(400).json({ ok: false, message: 'Invalid filename' });

  try {
    const image = await Images.findOne({ _id, filename });
    if (!image) return res.status(404).json({ ok: false, message: 'Image not found' });

    // A missing file on disk should not block removing the DB record
    await fs.promises.unlink(filePath).catch((err) => {
      if (err.code !== 'ENOENT') throw err
    });
    const deleted = await Images.deleteOne({ _id });
    res.send({ deleted });
  } catch (error) {
    console.error('Delete image failed:', error.message)
    res.status(500).json({ ok: false, message: 'Delete failed' });
  }
};

const update_image = async (req, res) => {
  const { _id, featured } = req.body;
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
