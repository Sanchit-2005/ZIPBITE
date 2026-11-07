import { storage } from "../cloudConfig.js";
import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage });

router.post("/image", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file received" });
    }
    res.status(200).json({
      message: "Upload successful",
      imageUrl: req.file.path,
    });
  } catch (err) {
    console.error("Upload route error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
