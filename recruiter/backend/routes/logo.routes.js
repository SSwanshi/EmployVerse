const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getBucket } = require('../config/db');

router.get('/:id', async (req, res) => {
  try {
    const logoId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getBucket();

    const db = mongoose.connection.db;
    const fileExists = await db.collection("uploads.files").findOne({ _id: logoId });
    
    if (!fileExists) {
      return res.status(404).json({ error: "Image not found" });
    }

    const downloadStream = bucket.openDownloadStream(logoId);
    res.set("Content-Type", fileExists.contentType || "image/png");
    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).json({ error: "Failed to retrieve image", details: error.message, stack: error.stack });
  }
});

module.exports = router;

