// Importaciones
import { connect } from "mongoose";
import 'dotenv/config'

const db_url = process.env.DB_URL ;

console.log('url conección:', db_url);
const connection = async()=>{
  try {
    await connect(db_url);
    console.log("Conectado correctamente a la BD");
  } catch (error) {
    console.log(error);
    throw new error("¡No se ha podido conectar a la base de datos!");
  }
}

export default connection;
