const router = require('express').Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const File = require('../model/fileSchema');
const { v4: uuidv4 } = require('uuid');
require('../db/conn');


let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const originalFileName = path.parse(file.originalname).name;
    const uniqueName = `${originalFileName}-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 }, // 100mb
}).array('myfiles', 10); // Accept up to 10 files

router.post('/', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    // Save each file to the database
    try {
      const files = req.files.map((file) => {
        return {
          filename: file.filename,
          uuid: uuidv4(),
          path: file.path,
          size: file.size,
        };
      });

      const response = await File.insertMany(files);
      const fileUrls = response.map((file) => `${process.env.APP_BASE_URL}/files/${file.uuid}`);
      res.json({ files: fileUrls });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Failed to save files to the database' });
    }
  });
});

router.post('/send', async (req, res) => {
  // Your existing code for sending the file

  // ...
});

module.exports = router;