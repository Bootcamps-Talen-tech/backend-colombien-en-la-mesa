// Importamos las funciones 'Schema' y 'model' de la biblioteca 'mongoose'
import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';


// Definimos el esquema para el modelo de usuario
const UserSchema = Schema({
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    required: true,
    unique: true
  },
  password:{
    type: String,
    required: true
  },
  image: {
    type: String,
    default: "default.png"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

UserSchema.plugin(mongoosePaginate);

export default model("User", UserSchema, "users")
