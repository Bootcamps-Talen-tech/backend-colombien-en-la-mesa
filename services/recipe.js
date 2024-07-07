import Recipes from "../models/recipes.js";

export const searchRecipeById = async (recipeId)=>{
  const recipe = await Recipes.findById(recipeId)
  return recipe;
}
