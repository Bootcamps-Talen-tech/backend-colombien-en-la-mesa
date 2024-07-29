
import Recipes from "../models/recipes.js";
import fs from 'fs';
import path from 'path';

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
    let page = req.params.page ? parseInt(req.params.page, 12) : 1;

    // Número de usuarios que queremos mostrar por página
    let itemsRecPage = req.query.limit ? parseInt(req.query.limit, 12) : 12;

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

//-- Método para subir archivos (imagen) a las publicaciones que hacemos
export const uploadMedia = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipeExists = await Recipes.findById(recipeId);
    if (!recipeExists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la receta"
      });
    }

    if (!req.file) {
      return res.status(404).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    const image = req.file.originalname;
    const imageSplit = image.split(".");
    const extension = imageSplit[imageSplit.length - 1];

    if (!["png", "jpg", "jpeg", "gif"].includes(extension.toLowerCase())) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send({
        status: "error",
        message: "Extensión del archivo es inválida."
      });
    }

    const fileSize = req.file.size;
    const maxFileSize = 1 * 1024 * 1024; // 1 MB
    if (fileSize > maxFileSize) {
      fs.unlinkSync(req.file.path);
      return res.status(400).send({
        status: "error",
        message: "El tamaño del archivo excede el límite (máx 1 MB)"
      });
    }

    const actualFilePath = path.resolve("./uploads/recipes/", req.file.filename);
    try {
      fs.statSync(actualFilePath);
    } catch (error) {
      return res.status(404).send({
        status: "error",
        message: "El archivo no existe o hubo un error al verificarlo"
      });
    }

    const recipeUpdated = await Recipes.findByIdAndUpdate(
      recipeId,
      { image: req.file.filename },
      { new: true }
    );

    if (!recipeUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error al subir el archivo a la receta"
      });
    }

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

// Método para mostrar el archivo subido a la publicación
export const showMedia = (req, res) => {
  try {
    // Obtener el parámetro del archivo desde la url
    const file = req.params.file;

    // Crear el path real de la imagen
    const filePath = "./uploads/recipes/" + file;
    fs.stat(filePath, (error, exists) => {
      if (!exists) {
        return res.status(404).send({
          status: "error",
          message: "No existe la imagen"
        });
      }
      // Si lo encuentra nos devuelve un archivo
      return res.sendFile(path.resolve(filePath));
    });
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar archivo en la publicación"
    });
  }
}

// Método para mostrar todas las recetas con paginación
export const showAllRecipes = async (req, res) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user || !req.user.userId) {
      return res.status(401).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    // Obtener el número de página y el límite de elementos por página desde los parámetros de la solicitud
    let page = req.query.page ? parseInt(req.query.page, 12) : 1;
    let limit = req.query.limit ? parseInt(req.query.limit, 12) : 12;

    // Configurar las opciones de la paginación
    const options = {
      page: page,
      limit: limit,
      populate: {
        path: 'author',
        select: 'name'
      },
      sort: { createdAt: -1 } // Ordenar por fecha de creación descendente
    };

    // Obtener todas las recetas de la base de datos con paginación
    const recipes = await Recipes.paginate({}, options);

    // Verificar si se encontraron recetas
    if (!recipes.docs || recipes.docs.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay recetas disponibles"
      });
    }

    // Devolver respuesta exitosa con todas las recetas y la información de paginación
    return res.status(200).send({
      status: "success",
      message: "Recetas encontradas",
      recipes: recipes.docs,
      total: recipes.totalDocs,
      pages: recipes.totalPages,
      page: recipes.page,
      limit: recipes.limit
    });
  } catch (error) {
    console.error(error); // Imprimir el error en la consola para depuración
    return res.status(500).send({
      status: "error",
      message: "Error al obtener las recetas",
      error: error.message // Incluir el mensaje de error en la respuesta
    });
  }
};

/*vista previa */
export const previewRecipes = async (req, res) => {
  try {
    // Obtener las últimas 6 recetas ordenadas por fecha de creación descendente
    const recipes = await Recipes.find()
      .select('title description ingredients image')
      .sort({ createdAt: -1 })
      .limit(6);

      console.log(recipes)
    // Verificar si se encontraron recetas
    if (!recipes || recipes.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay recetas disponibles para mostrar"
      });
    }

    // Devolver respuesta exitosa con las recetas limitadas
    return res.status(200).send({
      status: "success",
      message: "Vista previa de recetas encontrada",
      previews: recipes
    });
  } catch (error) {
    console.error("Error al obtener la vista previa de recetas:", error);
    return res.status(500).send({
      status: "error",
      message: "Error al obtener la vista previa de recetas",
      error: error.message
    });
  }
};

// Método para editar una receta
export const editRecipe = async (req, res) => {
  try {
    // Verificar si el usuario está autenticado y tiene un userId
    if (!req.user || !req.user.userId) {
      return res.status(401).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    // Obtener el id de la receta desde los parámetros de la solicitud
    const recipeId = req.params.id;

    // Obtener datos del body
    const params = req.body;

    // Verificar que lleguen los parámetros necesarios desde el body
    if (!params.title || !params.description || !params.ingredients || !params.instructions) {
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el título, descripción, ingredientes, instrucciones de la receta"
      });
    }

    // Verificar si la receta existe y pertenece al usuario autenticado
    const recipeExists = await Recipes.findOne({ _id: recipeId, author: req.user.userId });
    if (!recipeExists) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado la receta o no tienes permiso para editarla"
      });
    }

    // Actualizar los detalles de la receta
    const updatedRecipe = await Recipes.findByIdAndUpdate(
      recipeId,
      params,
      { new: true } // Devolver el documento actualizado
    );

    // Verificar si la actualización fue exitosa
    if (!updatedRecipe) {
      return res.status(500).send({
        status: "error",
        message: "No se ha podido actualizar la receta"
      });
    }

    // Devolver respuesta exitosa
    return res.status(200).send({
      status: "success",
      message: "Receta actualizada con éxito",
      updatedRecipe
    });
  } catch (error) {
    console.error(error); // Imprimir el error en la consola para depuración
    return res.status(500).send({
      status: "error",
      message: "Error al actualizar la receta",
      error: error.message // Incluir el mensaje de error en la respuesta
    });
  }
};