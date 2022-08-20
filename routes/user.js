var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipes_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  if (req.session && req.session.user_name) {
    DButils.execQuery("SELECT user_name FROM mydb.users").then((users) => {
      if (users.find((x) => x.user_name === req.session.user_name)) {
        req.user_name = req.session.user_name;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});

router.post('/myRecipes', async(req, res, next) =>{
  try{
    //Regular recieps
    const imageUrl = req.body.image;
    const title = req.body.title;
    const readyInMinutes = req.body.readyInMinutes;
    const popularity = req.body.popularity;
    const vegan = req.body.vegan;
    const vegetarian = req.body.vegetarian;
    const gluten_free = req.body.gluten_free;
    const ingredients = req.body.ingrediants;
    const instructions = req.body.instructions;
    const servings = req.body.servings;
    const user_name = req.session.user_name;

    console.log(req.body.ingrediants);
    console.log(ingredients);
    console.log(req.body.instructions);
    console.log(instructions);
    

    //Creating the recip
    await user_utils.createRecipes(imageUrl, title, readyInMinutes, popularity, vegan, vegetarian, gluten_free, ingredients, instructions, servings, user_name);

    res.status(200).send("Created successfully");

  } catch(error){
    next(error);
  }
});

/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_name = req.session.user_name;
    console.log(req.body.rec_id)
    const recipe_id = req.body.rec_id;
    
    await user_utils.markAsFavorite(user_name, recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
      console.log("here");
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_name = req.session.user_name;
    
    //Gets all the user's favorite recipes' ids
    const recipes_id = await user_utils.getFavoriteRecipes(user_name);

    let arr_rec_id = [];
    recipes_id.map((elem) => arr_rec_id.push(elem.recipe_id));
    //Gets all the user's favorite recipes' details 
    const results = await recipes_utils.getPreviewRecipes(arr_rec_id);
    
    res.status(200).send(results);
  
  } catch(error){
    next(error); 
  }
});

router.get('/isAFavorites', async (req, res, next)=>{
  try{
    const result = await user_utils.isFavoriteRecipe(req.session.user_name, req.query.recipeId);
    res.status(200).send(result);
  } catch(error){
    next(error);
  }
});

/**
 * This path returns the recipes that were created by the logged-in user
 */
 router.get('/myRecipes', async (req,res,next) => {
  try{
    // Gets the preview of all the recipes that were saved for that user
    console.log("in get/myRecipes, the user_name is: " + req.session.user_name);
    const results = await user_utils.getMyRecipes(req.session.user_name);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }

});

// router.get('/lastSearch', async (req,res,next) => {
//   try{
//     console.log(req.session);
//   }catch (err){
//     next(err);
//   }
// });



/**
 * This path returns the saved family recipes of the logged-in user
 */
router.get('/myFamilyRecipies', async (req,res,next) => {
  try {
    const user_name = req.session.user_name;
    let recipes = await user_utils.getMyFamilyRecipes(user_name);

    // let arrRecipesIds = [];
    // //arr of recipes ids
    // recipes_id.map((element) => arrRecipesIds.push(element.recipe_id)); 

    let result = [];

    for (let i = 0; i < recipes.length; i++){
        // let recipeId = res[i].id == undefined ? res[i].recipe_id : res[i].id;
        result[i] = {
          id: recipes[i].recipe_id,
          title: recipes[i].title,
          readyInMinutes: recipes[i].when_cooked,
          image: recipes[i].imageUrl,
          aggregateLikes: recipes[i].aggregateLikes,
          vegan: recipes[i].vegan,
          vegetarian: recipes[i].vegetarian,
          gluten_free: recipes[i].gluten_free,
      };
  
    }
    
    // let result = await recipes_utils.getPreviewRecipes(arrRecipesIds);
    res.status(200).send(result);
  } catch(err){
    next(err); 
  }
});

module.exports = router;
