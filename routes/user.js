var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

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


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_name = req.session.user_name;
    const recipe_id = req.body.rec_id;
    await user_utils.markAsFavorite(user_name,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_name = req.session.user_name;
    //Checking if user is connected
    if (user_name != null && req.session){

      const all_users = await DButils.execQuery("SELECT user_name FROM mydb.users");
      
      if (all_users.find((x) => x.user_name === req.session.user_name)){
        //Gets all the "favorite"'s recipes' ids of the connected uder 
        const recipes_id = await user_utils.getFavoriteRecipes(user_name);
        let recipes_id_array = [];
        
        //Extracts into an array
        recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
        
        const results = await recipe_utils.getPreviewRecipes(req, recipes_id_array);
        res.status(200).send(results);
      }      
    }
    else{
      res.status(201).send("User is not connected");
    }    
  } catch(error){
    next(error); 
  }
});


// router.post('/myRecipies', async(req, res, next) =>{
//   try{
//     //Regular recieps
//     const name = req.body.name;
//     const pic = req.body.pic;
//     const description = req.body.description;
//     const time_required = req.body.time_required;
//     const popularity = req.body.popularity;
//     const vegan = req.body.vegan;
//     const vegeterian = req.body.vegeterian;
//     const gluten = req.body.gluten;
//     const ingredients = req.body.ingredients;
//     const instruction = req.body.instruction;
//     const num_of_meals = req.body.num_of_meals;
//     const user_name = req.session.user_name;

//     //Creating the recipe
//     const recipe = await user_utils.createRecipes(name, pic, description, time_required, popularity, vegan, vegeterian, gluten, ingredients, instruction, num_of_meals, user_name);

//     res.send("Created successfully");

//   } catch(error){
//     next(error);
//   }
// });


router.post('/myRecipies', async(req, res, next) =>{
  try{
    //Regular recieps
    const image = req.body.image;
    const title = req.body.title;
    const readyInMinutes = req.body.readyInMinutes;
    const popularity = req.body.popularity;
    const vegan = req.body.vegan;
    const vegetarian = req.body.vegetarian;
    const glutenFree = req.body.glutenFree;
    const ingredients = req.body.ingredients;
    const instructions = req.body.instructions;
    const servings = req.body.servings;

    //Creating the recip
    const recipe = await user_utils.createRecipes(image, title, readyInMinutes, popularity, vegan, vegeterian, glutenFree, ingredients, instructions, servings);

    res.send("Created successfully");

  } catch(error){
    next(error);
  }
});


/**
 * This path returns the recipes that were created by the logged-in user
 */
 router.get('/myRecipies', async (req,res,next) => {
  try{
    // Gets the preview of all the recipes that were saved for that user
    const results = await user_utils.getMyRecipes(req.session.user_name);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }

});


/**
 * This path returns the recipes that were created by the logged-in user
 */
 router.get('/favorites1', async (req,res,next) => {
  try{
    const user_name = req.session.user_name;

    const results = await user_utils.getMyRecipes(user_name);

    res.status(200).send(results);
  }catch (error) {
    next(error);
  }

});


/**
 * This path returns the saved family recipes of the logged-in user
 */
router.get('/family', async (req,res,next) => {
  try {
    const user_name = req.session.user_id;
    const recipes_id = await user_utils.getMyFamilyRecipes(user_name);

    let arrRecipesIds = [];
    //arr of recipes ids
    recipes_id.map((element) => arrRecipesIds.push(element.recipe_id)); 

    const results = await recipe_utils.getRecipesPreview(arrRecipesIds);
    res.status(200).send(results);
  } catch(error){
    next(error); 
  }
});

module.exports = router;
