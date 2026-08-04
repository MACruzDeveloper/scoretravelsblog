const router = require("express").Router()
const controller = require("../controllers/imagesController")
const multer = require("multer")
const { requireAuth } = require("../middleware/auth")

router.get("/fetch_images", controller.fetch_images)
router.post("/update_image", requireAuth, controller.update_image)
router.delete("/delete_image/:_id/:filename", requireAuth, controller.delete_image)

// UPLOAD IMAGES ROUTE AND RELATED FUNCTIONS
const upload = multer({ storage: multer.memoryStorage() }).single("file")
router.post("/upload", requireAuth, upload, async (req, res) => {
  return await controller.upload_image(req, res)
})

module.exports = router
