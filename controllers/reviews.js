// Importaciones
import Recipes from "../models/recipes.js";
import Reviews from "../models/reviews.js";
import { searchUserById } from "../services/user.js";
import { searchRecipeById } from "../services/recipe.js";


//--- Método para Registrar de usuarios ---
export const addReview = async (req, res) => {
  try{
    // Verificar si el usuario está autenticado y tiene un userId
    if (!req.user || !req.user.userId) {
      return res.status(401).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    // Verificar si receta existe
    const recipeId = req.params.id;
    const recipeInfo = await Recipes.findById(recipeId).select('author _id');
    if(!recipeInfo) {
      return res.status(400).send({
        status: "error",
        message: "La receta a comentar no existe"
      });
    }

    // Veirficar que no sea el mismo creador de la receta quien comenta
    if( req.user.userId == recipeInfo.author){
      return res.status(400).send({
        status: "error",
        message: "No puedes comentar tu receta"
      });
    }

	  // Traerse datos del body
	  const params = req.body;
    if(!params.comment || !params.rating) {
      return res.status(400).send({
        status: "error",
        message: "No se tiene el comentario o la calificación"
      });
    }

    //Validar que el usuario no tenga comentarios en la receta
    const existedComment = await Reviews.find({
      user: req.user.userId,
      recipe: req.params.id
    })
    if( existedComment.length > 0){
      return res.status(400).send({
        status: "error",
        message: "Ya coamentaste esta receta"
      });
    }

    // Crear objeto tipo Reviews
    const review_to_save = new Reviews({
      user: req.user.userId,
      recipe: req.params.id,
      comment: params.comment,
      rating: params.rating,
    });
	    
    //Registrar reviews
    const register_review = await review_to_save.save()
      .then(()=>{
        return res.status(200).json({
          status: "success",
          review_to_save
        });
      })
      .catch((error)=>{
        return res.status(400).send({
          status: "error",
          message: error
        });
      });
    
  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error al añadir comentario"
    });
  }
}

//--- Método para ver comentarios deun usuario ---
export const ShowUserReviews = async (req, res) => {
  try{
    const userData = await searchUserById( req.params.id);
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    if (!userData) {
      return res.status(401).send({
        status: "error",
        message: "Usuario no encontrado"
      });
    }


    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      populate: {
        path: 'recipe',
      },
      select: 'comment rating created_at'
    }

    const user_review = await Reviews.paginate({ user: userData.id}, options)

    //console.log('Reviews per user:', user_review);
    return res.status(200).send({
      status: "success",
      message: "Reviews encontrados",
      user_review
    });
  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error en la busqueda de comentarios por usuario"
    });
  }

}

//--- Método para ver comentarios de una receta  ---
export const ShowRecipeReviews = async (req, res) => {
  try{
    const recipeData = await searchRecipeById( req.params.id);
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    if (!recipeData) {
      return res.status(401).send({
        status: "error",
        message: "Receta no encontrado"
      });
    }

    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      populate: {
        path: 'user',
      },
      select: 'comment rating created_at'
    }

    const recipe_review = await Reviews.paginate({ recipe: recipeData.id}, options)

    //console.log('Reviews per user:', user_review);
    return res.status(200).send({
      status: "success",
      message: "Reviews encontrados",
      recipe_review
    });

  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error e consulta de receta"
    });
  }
}

//--- Método para eliminar comentario ---
export const deleteReview = async (req, res) => {
  try{
    // Verificar si el usuario está autenticado y tiene un userId
    if (!req.user || !req.user.userId) {
      return res.status(401).send({
        status: "error",
        message: "Usuario no autenticado o no existe"
      });
    }
    console.log('userId:', req.user.userId);

    // Verificar si receta existe
    const reviewId = req.params.id;
    const reviewInfo = await Reviews.findById(reviewId)
    if(!reviewInfo) {
      return res.status(400).send({
        status: "error",
        message: "el comentario a eliminar no existe"
      });
    }
    
    // Se verifica si quien quiere eliminar el comentatio es el autor del comentario o la receta
    // Son logs dos unicos que lo pueden eliminar
    const recipeData = await searchRecipeById( reviewInfo.recipe);
    let canEliminated = false;
    if(req.user.userId == reviewInfo.user || req.user.userId == recipeData.author){
       canEliminated = true;
    }
    if(!canEliminated){
      return res.status(400).send({
        status: "error",
        message: "No puedes eliminar el comentario, no eres el autor de comentario o la receta"
      });
    }

    const delete_proces = await Reviews.findByIdAndDelete(reviewId)
    if(!delete_proces){
      return res.status(400).send({
        status: "error",
        message: "No se puedes eliminar el comentarioi, vuelva a intentarlo"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "comentario eliminado",
      delete_proces
    });
  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error en eliminación de comentario"
    });
  }
}
