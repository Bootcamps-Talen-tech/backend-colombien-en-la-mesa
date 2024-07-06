// Importamos las funciones 'Schema' y 'model' de la biblioteca 'mongoose'
import { Schema, model } from "mongoose";

const reviewsSchema = Schema({
  user:{
    type: Schema.ObjectId,
    required:true
  },
  recipe:{
    type: Schema.ObjectId,
    required:true
  },
  comment:{
    type:String,
    required:true
  },
  rating:{
    type:Int,
    required:true
  },
  created_at:{
    type: Date,
    default: Date.now
  }
})

export default model("Review",reviewsSchema,"reviews");