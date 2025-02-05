// Importaciones
import { Router } from "express";
import { addReview, ShowUserReviews, ShowRecipeReviews, deleteReview, getRecipeAverageRating } from "../controllers/reviews.js";
import { ensureAuth } from "../middlewares/auth.js";
const router = Router();


// Definir las rutas
router.post('/add/:id', ensureAuth, addReview);
router.get('/show-by-user/:id?/:page?', ShowUserReviews);
router.get('/show-by-recipe/:id?/:page?', ShowRecipeReviews);
router.delete('/delete/:id', ensureAuth, deleteReview);
router.get('/average-rating/:id', getRecipeAverageRating);


export default router;
