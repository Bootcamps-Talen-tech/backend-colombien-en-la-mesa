//importaciones de libreria
import mongoose from "mongoose";

// Middleware para verificar si una entidad existe
export const checkEntityExists = (model, ownerIdField = 'id') => {
  return async (req, res, next) => {
    try {
      let entityId;

      // Verificar si el ownerIdField es 'id' o 'author' para saber de dónde obtener el ID
      if (ownerIdField === 'id') {
        entityId = req.params.id;// Obtener el ID de la URL (recipes, por ejemplo)
      } else if (ownerIdField === 'author') {
        entityId = req.user.userId;// Obtener el ID del usuario desde el token (para usuarios, por ejemplo)
      } else {
        // Si ownerIdField no es 'id' ni 'user_id', devolvemos un error 400
        return res.status(400).send({
          status: "error",
          message: `Parámetro de ID no reconocido: ${ownerIdField}`
        })
      }

      // Verificar si el ID es válido
      if (!mongoose.Types.ObjectId.isValid(entityId)) {
        return res.status(400).send({
          status: "error",
          message: `ID no válido: ${entityId}`
        })
      }

      // Utilizamos el modelo proporcionado para buscar una entidad en la base de datos por su ID
      // 'entityId' es el ID de la entidad que estamos buscando
      const entityExists = await model.findById(entityId);

      //verificamo la busqueda del documento
      if (!entityExists) {
        return res.status(404).send({
          status: "error",
          message: `No existe la entidad con el ID ${entityId}`
        })
      }

      // Agregar la entidad encontrada al objeto request para que esté disponible en los controladores, si es necesario
      req.entity = entityExists;

      // Pasar al siguiente middleware
      next()
    } catch (error) {
      // Capturar cualquier otro error inesperado y devolver una respuesta 500
      return res.status(500).send({
        status: "error",
        message: "Error al verificar la entidad",
        error: error.message
      });
    }
  }
}
