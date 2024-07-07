// Importamos las funciones 'Schema' y 'model' de la biblioteca 'mongoose'
import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

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
    type: Number, 
    min: 0, 
    max: 5,
    required:true
  },
  created_at:{
    type: Date,
    default: Date.now
  }
})

reviewsSchema.plugin(mongoosePaginate);
export default model("Review",reviewsSchema,"reviews");
