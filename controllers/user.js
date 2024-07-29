// Importaciones
import User from '../models/user.js';
import bcrypt from 'bcrypt';
import { createToken } from '../services/jwt.js';
import path from 'path';
import fs from 'fs';

//--- Método para Registrar de usuarios ---
export const register = async (req, res) => {
  try {
    // Recoger datos de la petición
    let params = req.body;

    // Validaciones: verificamos que los datos obligatorios estén presentes
    if (!params.name || !params.email || !params.password) {
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar"
      });
    }

    // Crear una instancia del modelo User con los datos validados
    let userToSave = new User(params);

    // Buscar si ya existe un usuario con el mismo email o nick
    const existingUser = await User.findOne({
      $or: [
        { email: userToSave.email.toLowerCase() }
      ]
    });

    // Si encuentra un usuario, devuelve un mensaje indicando que ya existe
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "Este Usuario ya existe"
      });
    }

    // Cifrar contraseña
    const salt = await bcrypt.genSalt(10);
    const hasedPassword = await bcrypt.hash(userToSave.password, salt);
    userToSave.password = hasedPassword;

    // Guardar el usuario en la base de datos
    await userToSave.save();

    // Devolver respuesta exitosa y el usuario registrado 
    return res.status(201).json({
      status: "created",
      message: "Usuario registrado con éxito",
      user: {
        id: userToSave.id,
        name: userToSave.name,
      }
    })
  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Error en registro de usuarios"
    })
  }
}

//--- Método para subir imagen de usuario ---
export const uploadImage = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No se ha subido ningún archivo"
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { image: req.file.filename },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Imagen subida correctamente",
      user
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al subir la imagen del usuario"
    });
  }
}

//--- Método para mostrar la imagen del usuario ---
export const showImage = (req, res) => {
  try {
    const file = req.params.file;
    const filePath = "./uploads/users/" + file;

    fs.stat(filePath, (error, exists) => {
      if (!exists) {
        return res.status(404).json({
          status: "error",
          message: "No existe la imagen"
        });
      }
      return res.sendFile(path.resolve(filePath));
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al mostrar la imagen del usuario"
    });
  }
}

//--- Método para autenticar usuarios ---
export const login = async (req, res) => {
  try {
    // Recoger los parámetros del body
    let params = req.body;

    // Validar si llegaron el email y password
    if (!params.email || !params.password) {
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar"
      })
    }

    // Buscar en la BD si existe el email que nos envió el usuario
    let user = await User.findOne({email: params.email.toLowerCase()});

    // Si no existe el user
    if(!user){
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado"
      })
    }

    // Comprobar si el password recibido es igual al que está almacenado en la BD
    const validPasword = await bcrypt.compare(params.password, user.password);

    // Si los passwords no coinciden
    if(!validPasword){
      return res.status(401).json({
        status: "error",
        message: "Contraseña incorrecta"
      })
    }

    // Generar token de autenticación
    const token = createToken(user);

    // Devolver Token generado y los datos del usuario
    return res.status(200).json({
      status:"success",
      message:"login existoso",
      token,
      user:{
        id:user._id,
        name:user.name,
        email:user.email,
        image:user.image,
        created_at: user.created_at
      }
    })

  } catch (error) {
    return res.status(500).json({
      status: "Error",
      message: "Error en el login del usuarioER"
    })
  }
}

//--- Método para mostrar el perfil del usuario ---
export const profile = async (req, res) =>{
  try {
    // Obtener el ID del usuario desde los parámetros de la URL
    const userId = req.params.id;

     // Verificar si el ID recibido del usuario autenticado existe
     if(!req.user || !req.user.userId){
      return res.status(404).send({
        status: "error",
        message: "Usuario no autenticado"
      });
     }

     // Buscar al usuario en la BD, excluimos la contraseña, rol, versión.
     const userProfile = await User.findById(userId).select('-password -__v');

     // Verificar si el usuario existe
     if(!userProfile){
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado"
      });
     }

      // Información de seguimiento - (req.user.userId = Id del usuario autenticado)
      
      
      // Devolver la información del perfil del usuario
    return res.status(200).json({
      status: "success",
      user: userProfile
      
    });
  } catch (error) {
    return res.status(500).send({
      status: "Error",
      message: "Error en el login del usuarioER"
    })
  }
}

//--- Método para ver todos los usuarios ---
export const getAllUsers = async (req, res) => {
  try {
    // Opciones de paginación (puedes ajustar los valores según tus necesidades)
    const options = {
      page: parseInt(req.query.page) || 1, // Página actual
      limit: parseInt(req.query.limit) || 10 // Número de usuarios por página
    };

    // Buscar todos los usuarios con paginación
    const users = await User.paginate({}, options);

    // Devolver la lista de usuarios
    return res.status(200).json({
      status: "success",
      users: users.docs,
      totalPages: users.totalPages,
      currentPage: users.page,
      totalUsers: users.totalDocs
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener la lista de usuarios"
    });
  }
}