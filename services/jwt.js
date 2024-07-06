import jwt from 'jwt-simple';
import moment from 'moment';

//Clave secreta
const secret = "SECRET_KEY_proye_laBonneReceTTe@";

// Método para generar tokens
const createToken = (user)=>{
  const payload = {
    userId: user._id,
    name:user.name,
    iat: moment().unix(),
    exp: moment().add(30, 'days').unix()
  }

  // Devolver el token creado
  return jwt.encode(payload, secret)
}

export {
  secret,
  createToken
}