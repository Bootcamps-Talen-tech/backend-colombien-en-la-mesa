// Importaciones
import { Router } from "express";
import { register,login, profile } from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";
const router = Router();


// Definir las rutas
router.post('/register', register);
router.post('/login', login);
router.get('/profile/:id', ensureAuth, profile);



export default router;