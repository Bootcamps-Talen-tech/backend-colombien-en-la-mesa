// Importaciones
import { Router } from "express";
import { addReview, ShowUserReviews, ShowRecipeReviews, deleteReview } from "../controllers/reviews.js";
import { ensureAuth } from "../middlewares/auth.js";
const router = Router();


// Definir las rutas
router.post('/add/:id', ensureAuth, addReview);
router.get('/show-by-recipe/:page?', ShowRecipeReviews);
router.get('/show-by-user/:page?', ShowUserReviews);
router.delete('/delete/:id', ensureAuth, deleteReview);

export default router;
