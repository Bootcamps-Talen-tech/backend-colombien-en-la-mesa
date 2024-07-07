import User from '../models/user.js';

// Método para generar tokens
export const searchUserById = async (userId)=>{
  const user = await User.findById(userId)
  return user;
}

