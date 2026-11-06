import { cloudinary, storage } from "../cloudConfig.js";
import express from "express";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage });
router.post("/image", upload.single("image"), (req, res) => {
  res.status(200).json({
    message: "Upload successful",
    imageUrl: req.file.path,
  });
});
export default router;
