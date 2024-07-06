//Importaciones 
import connection from './database/connection.js';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import routerUser from './routes/user.js';
import routerRecipes from './routes/recipes.js'

//Conexion a la base de datos
connection()

//Creamos el sercidor de node
const app = express();
const port = 3900;

//Configurar cors para permite que las peticiones se hagan correctamente cliente y servidor
app.use(cors());

// Conversión de datos (body a objetos JS)
app.use(json());
app.use(urlencoded({extended:true}));

// Configurar rutas
app.use('/api/user', routerUser)
app.use('/api/recipes', routerRecipes)

// Configurar el servidor para escuchar las peticiones HTTP
app.listen(port,()=>{
  console.log("Conexion correcta al Servidor")
})




