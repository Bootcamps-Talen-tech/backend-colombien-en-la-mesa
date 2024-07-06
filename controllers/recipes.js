import Recipes from "../models/recipes.js";
import fs from 'fs';
import path from "path";

// Método para hacer una publicación
export const saveRecipes = async (req, res) => {
  try {
    // Verificar si el usuario está autenticado y tiene un userId
    if (!req.user || !req.user.userId) {
      return res.status(401).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    // Obtener datos del body
    const params = req.body;
    console.log(params);

    // Verificar que lleguen los parámetros necesarios desde el body
    if (!params.title || !params.description || !params.ingredients || !params.instructions) {
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el título, descripción, ingredientes, instrucciones y autor de la receta"
      });
    }

    // Crear el objeto del modelo
    let newRecipe = new Recipes(params);

    // Agregar la información del usuario autenticado al objeto de la nueva publicación
    newRecipe.author = req.user.userId;
    console.log(newRecipe);

    // Guardar la nueva publicación en la BD
    const recipeStored = await newRecipe.save();

    // Verificar si se guardó la publicación en la BD
    if (!recipeStored) {
      return res.status(500).send({
        status: "error",
        message: "No se ha guardado la receta"
      });
    }

    // Devolver respuesta exitosa 
    return res.status(200).send({
      status: "success",
      message: "¡Receta creada con éxito!",
      recipeStored
    });
  } catch (error) {
    console.error(error); // Imprimir el error en la consola para depuración
    return res.status(500).send({
      status: "error",
      message: "Error al crear receta",
      error: error.message // Incluir el mensaje de error en la respuesta
    });
  }
};

//-- Método para mostrar la publicación
export const showRecipe = async (req, res) => {
  try {

    // Obtener el id de la receta de la url
    const recipeId = req.params.id;

    // Buscar la publicación por id desde la BD
    const recipeStored = await Recipes.findById(recipeId).populate('author', 'name')

    // Verificar si se encontró la receta
    if (!recipeStored) {
      return res.status(500).send({
        status: "error",
        message: "no existe receta"
      });
    }

    // Devolver respuesta exitosa 
    return res.status(200).send({
      status: "success",
      message: "Receta encontrada",
      publication: recipeStored
    });
  } catch (error) {
    console.error(error); // Imprimir el error en la consola para depuración
    return res.status(500).send({
      status: "error",
      message: "Error al crear receta",
      error: error.message // Incluir el mensaje de error en la respuesta
    });
  }
}

//-- Método para eliminar una receta
export const deleteRecipe = async (req, res) => {
  try {
    // Obtener el id de la publicación que se quiere eliminar
    const recipeId = req.params.id;

    // Encontrar y eliminar la publicación
    const recipeDeleted = await Recipes.findOneAndDelete({ author: req.user.userId, _id: recipeId }).populate('author', 'name');

    // Verificar si se encontró y eliminó la publicación
    if (!recipeDeleted) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado o no tienes permiso para eliminar esta Receta"
      });
    }

    // Devolver respuesta exitosa 
    return res.status(200).send({
      status: "success",
      message: "Receta elimida con exito"
    })
  } catch (error) {
    console.log("Error al eliminar la receta", error);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar la Receta"
    });
  }
}

//-- Método para listar receta de un usuario
export const recipeUser = async (req, res) => {
  try {
    // Obtener el id del usuario
    const userId = req.params.id;

    // Asignar el número de página
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;

    // Número de usuarios que queremos mostrar por página
    let itemsRecPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    // Configurar las opciones de la consulta
    const options = {
      page: page,
      limit: itemsRecPage,
      sort: { created_at: -1 },
      populate: {
        path: 'author',
        select: '-password  -__v -email'
      },
      lean: true
    };

    console.log("options:", options);

    // Buscar las publicaciones del usuario
    const recipes = await Recipes.paginate({ author: userId }, options)

    if (!recipes.docs || recipes.docs.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para mostrar"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).send({
      status: "success",
      message: "Receta del usuario: ",
      recipes: recipes.docs,
      total: recipes.totalDocs,
      pages: recipes.totalPages,
      page: recipes.page,
      limit: recipes.limit
    });
  } catch (error) {
    console.log("Error al mostrar la receta:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al listar las receta"
    });
  }
}

// Método para subir archivos (imagen) a las publicaciones que hacemos
export const uploadMedia = async (req, res) => {
  try {
    // Obtener el id de la receta
    const recipeId = req.params.id;

    // Verificar si la receta existe en la base de datos antes de subir el archivo
    const recipeExists = await Recipes.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la receta"
      });
    }

    // Comprobar que el archivo fue subido correctamente
    if (!req.file) {
      return res.status(404).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    // Obtener el nombre del archivo y la extensión
    const image = req.file.originalname;
    const extension = path.extname(image).toLowerCase().substr(1);

    // Validar la extensión del archivo
    if (!["png", "jpg", "jpeg", "gif"].includes(extension)) {
      fs.unlinkSync(req.file.path); // Eliminar archivo subido
      return res.status(400).send({
        status: "error",
        message: "Extensión de archivo inválida. Permitido: png, jpg, jpeg, gif"
      });
    }

    // Validar el tamaño del archivo (máximo 1MB)
    const fileSize = req.file.size;
    const maxFileSize = 1 * 1024 * 1024; // 1 MB
    if (fileSize > maxFileSize) {
      fs.unlinkSync(req.file.path); // Eliminar archivo subido
      return res.status(400).send({
        status: "error",
        message: "El tamaño del archivo excede el límite máximo de 1 MB"
      });
    }

    // Ruta del archivo actual en el sistema de archivos
    const filePath = path.resolve("./uploads/recipes/", req.file.filename);

    // Verificar si el archivo realmente existe en el sistema de archivos
    try {
      fs.statSync(filePath);
    } catch (error) {
      return res.status(404).send({
        status: "error",
        message: "El archivo no existe o hubo un error al verificarlo"
      });
    }

    // Actualizar la receta con el nombre del archivo
    const recipeUpdated = await Recipes.findByIdAndUpdate(
      recipeId,
      { file: req.file.filename },
      { new: true }
    );

    if (!recipeUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error al subir el archivo a la receta"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).send({
      status: "success",
      message: "Archivo subido con éxito",
      recipe: recipeUpdated,
      file: req.file
    });

  } catch (error) {
    console.error("Error al subir el archivo:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al subir el archivo a la receta",
      error: error.message
    });
  }
};