const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { getBucket } = require('../config/db');

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid proof document ID format" });
    }

    const proofId = new mongoose.Types.ObjectId(id);
    const bucket = getBucket();

    if (!bucket) {
      console.error("GridFS bucket is not initialized");
      return res.status(500).json({ error: "File storage not available" });
    }

    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection not available");
      return res.status(500).json({ error: "Database connection not available" });
    }

    const fileExists = await db.collection("uploads.files").findOne({ _id: proofId });
    
    if (!fileExists) {
      return res.status(404).json({ error: "Proof document not found" });
    }

    // Set appropriate headers for file download/viewing
    res.set("Content-Type", fileExists.contentType || "application/pdf");
    res.set("Content-Disposition", `inline; filename="${fileExists.filename || 'proof-document'}"`);
    res.set("Cache-Control", "public, max-age=3600");
    
    // Handle CORS if needed
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET");

    const downloadStream = bucket.openDownloadStream(proofId);
    
    downloadStream.on('error', (error) => {
      console.error("Error streaming proof document:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to retrieve proof document" });
      }
    });

    // Handle response errors
    res.on('error', (error) => {
      console.error("Error sending response:", error);
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Error fetching proof document:", error);
    if (error.name === 'BSONTypeError' || error.message.includes('ObjectId')) {
      return res.status(400).json({ error: "Invalid proof document ID" });
    }
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to retrieve proof document" });
    }
  }
});

module.exports = router;

