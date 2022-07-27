var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a 3 random recipe
 */
//localhost:3000/recipes/random
router.get("/random", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRandomRecipes();
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});



/**
 * This path gets a query and returns few recipies which are ansewring it
 * number - int (5,10,15)
 */
 router.get("/search", async (req, res, next) => {
  try {
    const query = req.query.searchQuery
    const number = req.query.number;
    const cuisine = req.query.cuisine;
    const diet = req.query.diet;
    const intolerances = req.query.intolerances;

    const recipes = await recipes_utils.getSearchRecipes(req, query, number, cuisine, diet, intolerances);
    
    if (recipes.length == 0){
      res.send("There is no results!");
      return;
    }

    res.send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a full details of the 3 latest recipes
 */
//localhost:3000/recipes/170000
router.get("/watched", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getLastThreeRecipes(req.session.user_name);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});



/**
 * This path returns a full details of a recipe by its name
 */
// localhost:3000/recipes/chocolata
// router.get("/:recipeName", async (req, res, next) => {
//   try {
//     const recipe = await recipes_utils.getRecipeDetails(req.params.recipeName);
//     res.send(recipe);
//   } catch (error) {
//     next(error);
//   }
// });

/**
 * This path returns the full details of a recipe by it's id
 */
 router.get("/fullDetailes", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getFullDetailsOfRecipe(req.query.recipeid);
    if (req.session && req.session.user_name){
      recipes_utils.postLastRecipe(req.session.user_name, recipe.id);
    }
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});


/**
 * This path returns a full details of a recipe by its id
 */
//localhost:3000/recipes/170000
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.query.id);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});



module.exports = router;
