// Importaciones
import Recipes from "../models/recipes.js";
import Reviews from "../models/reviews.js";


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
    const userId = req.params.id;
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    console.log('userIda', userId);
    console.log('page', page);
    console.log('itemsPerPage', itemsPerPage);

    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsPerPage,
      populate: {
        path: 'user',
        select: '-recipe -comment -rating'
      },
      lean: true
    }
    console.log('options:', options);

    const user_review = await Reviews.paginate({ user: userId}, options)
    console.log('Reviews per user:', user_review);
    

    //console.log('Test ok');
    return res.status(200).send({
      status: "success",
      message: "Test ok ShowUserReviews"
    });
  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error en registro de usuario"
    });
  }

}

//--- Método para ver comentarios de una receta  ---
export const ShowRecipeReviews = async (req, res) => {
  try{
    console.log('Test ok');
    return res.status(200).send({
      status: "success",
      message: "Test ok ShowRecipeReviews"
    });
  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error en registro de usuario"
    });
  }

}

//--- Método para eliminar comentario ---
export const deleteReview = async (req, res) => {
  try{
    console.log('Test ok');
    return res.status(200).send({
      status: "success",
      message: "Test ok delete"
    });
  }catch(error){
    console.log('Error en registro de usuario:', error);
    return res.status(500).send({
      status: "Error",
      message: "Error en registro de usuario"
    });
  }
}
