import { Router } from 'express';
const router = Router();
import { saveRecipes, showRecipe, deleteRecipe,recipeUser, uploadMedia, showAllRecipes, previewRecipes, showMedia } from '../controllers/recipes.js';
import { ensureAuth } from '../middlewares/auth.js';
import multer from 'multer';
import recipes from '../models/recipes.js';
import { checkEntityExists } from '../middlewares/checkEntityExists.js';


// Configuración de subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null,"./uploads/recipes/")
  },
  filename: (req, file, cb)=>{
    cb(null,"pub-"+Date.now()+"-"+file.originalname)
  }
});

// Middleware para subida de archivos
const uploads = multer({storage})
// Definir las rutas
router.post('/recipe', ensureAuth, saveRecipes);
router.get('/show-recipe/:id', ensureAuth, showRecipe );
router.delete('/delete-recipe/:id', ensureAuth, deleteRecipe);
router.get('/recipe-user/:id/:page?', ensureAuth, recipeUser);
router.post('/upload-media/:id',[ensureAuth, checkEntityExists(recipes,'id'),uploads.single("file0")], uploadMedia)
router.get('/media/:file', showMedia); 
router.get('/show-all-recipes/:page?', ensureAuth, showAllRecipes);
router.get('/preview-Recipes', previewRecipes)

// Exportar el Router
export default router;