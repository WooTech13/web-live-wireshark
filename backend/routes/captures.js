const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuration Multer 2.0.2 (syntaxe mise à jour)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'capture-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
    files: 1 // Un seul fichier à la fois
  },
  fileFilter: function (req, file, cb) {
    // Accepter les fichiers .pcap et .pcapng
    const allowedExts = ['.pcap', '.pcapng', '.cap'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedExts.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers .pcap, .pcapng et .cap sont acceptés'));
    }
  }
});

// Route pour upload de captures
router.post('/upload', (req, res) => {
  upload.single('captureFile')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Fichier trop volumineux (max 500MB)' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier uploadé' });
    }
    
    res.json({ 
      message: 'Fichier uploadé avec succès',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      path: req.file.path
    });
  });
});

module.exports = router;