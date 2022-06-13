var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
//localhost:3000/recipes/170000
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



/**
 * This path returns a full details of a random recipe
 */
//localhost:3000/recipes/random
router.get("/:random", async (req, res, next) => {
  try {
    const randomRecipeId = await recipes_utils.getRandomRecipe();
    const recipe = await recipes_utils.getRecipeDetails(randomRecipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



/**
 * This path returns a full details of a random recipe
 */
//localhost:3000/recipes/complexSearch
router.get("/:complexSearch", async (req, res, next) => {
  try {
    const complexRecipeId = await recipes_utils.getComplexSearch(req.params.complexSearch);
    const recipe = await recipes_utils.getRecipeDetails(complexRecipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns a full details of a recipe by its name
 */
//localhost:3000/recipes/chocolata
router.get("/:recipeName", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeName);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns full details of the 5 top recipes by its popularity
 */
//localhost:3000/recipes/top5
router.get("/:recipeTop5", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeTop5);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns full details of the 10 top recipes by its popularity
 */
//localhost:3000/recipes/top10
router.get("/:recipeTop10", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeTop10);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns full details of the 15 top recipes by its popularity
 */
//localhost:3000/recipes/top10
router.get("/:recipeTop15", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeTop15);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
