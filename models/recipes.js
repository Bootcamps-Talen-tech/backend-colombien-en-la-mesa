// Importamos las funciones 'Schema' y 'model' de la biblioteca 'mongoose'
import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const recipesSchema =  Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type:String,
    required:true
  },
  ingredients:{
    type:String,
    required:true
  },
  instructions:{
    type:String,
    required:true
  },
  image:{
    type:String,
    default: "default.png"
  },
  author:{
    type: Schema.ObjectId,
    ref: "User",
    required:true
  },
  reviews:{
    type:[String], // Array de strings para almacenar múltiples reseñas
    default: [],// Array vacío por defecto
  },
  created_at:{
    type: Date,
    default: Date.now
  }
})


// Añadir pluggin de paginación
recipesSchema.plugin(mongoosePaginate);

export default model("Recipe",recipesSchema ,"recipes");