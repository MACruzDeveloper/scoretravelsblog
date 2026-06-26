const router = require("express").Router()
const controller = require("../controllers/imagesController")
const multer = require("multer")

router.get("/fetch_images", controller.fetch_images)
router.post("/update_image", controller.update_image)
router.delete("/delete_image/:_id/:filename", controller.delete_image)

// UPLOAD IMAGES ROUTE AND RELATED FUNCTIONS
const upload = multer({ storage: multer.memoryStorage() }).single("file")
router.post("/upload", upload, async (req, res) => {
  console.log("req.body =======>", req.body)
  return await controller.upload_image(req, res)
})

module.exports = router
