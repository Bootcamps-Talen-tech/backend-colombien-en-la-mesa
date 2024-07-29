import { Router } from "express";
import { register, login, profile, uploadImage, showImage, getAllUsers } from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuración de subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/users/';
    fs.mkdirSync(dir, { recursive: true });  // Asegura que el directorio exista
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'user-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = Router();

// Definir las rutas
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', ensureAuth, profile);
router.post('/upload-image/:id', [ensureAuth, upload.single('file0')], uploadImage);
router.get('/image/:file', showImage);
router.get('/users', ensureAuth, getAllUsers);

export default router;