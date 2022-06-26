const axios = require("axios");
const { get } = require("../recipes");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */
async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}


/*
 * This func returns a details of a recipe by it's id
*/
async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, gluten_free } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: gluten_free,
    };

}


/*
 * This func returns recipes by a query and it's amount of results
*/
async function getSearchRecipes(req, query, number, cuisine, diet, intolerances) {
    let res = await axios.get(`${api_domain}/complexSearch`,
    {
        params: {
            apiKey: process.env.spooncular_apiKey,
            query: query, 
            number: number,
            cuisine: cuisine, 
            diet: diet,
            intolerances: intolerances,
            instructionsRequired: true,
            addRecipeInformation: true,
        },
    })

    const dct = res.data['results'];
    let result_id = [];
    const len = dct.length;

    for(let i = 0; i < Object.keys(dct).length; i++)
    {    
        result_id[i] = dct[i]['id'];
    }
    
    return result_id;
}

/*
 * This func returns three random recipes
*/
async function threeRandomRecipes(){
    const data =  await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return data;
}


/*
 * This func calls the threeRandomRecipes above
*/
async function getRandomRecipes() {
    let threeRecipes = await threeRandomRecipes();
    return threeRecipes.data;
}   


/*
 * This func returns the last three recipes which were watched by a specific user
*/
async function getLastThreeRecipes(user_name){
    const recipes = await DButils.execQuery(`SELECT rec_id FROM mydb.watched WHERE user_name='${user_name}' ORDER BY date desc limit 3`);
    return recipes;
}


/*
 * This func returns the full details of a recipe by it's id
*/
async function getFullDetailsOfRecipe(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, imageUrl, title, readyInMinutes, popularity, vegan, vegetarian, gluten_free, ingredients, instructions, servings } = recipe_info.data;
    ext_Ingredients = ext_Ingredients.map((exIng) => ({name:exIng.name, amount: exIng.amount, unit:exIng.unit}))
    analyze_Instructions = analyzedInstructions.map((anInstr) => ({name:anInstr.name, steps: (anInstr.steps).map((instep)=> ({number:instep.number, step:instep.step}))}))
    
    const fullDetails = {
        id: id,
        imageUrl: imageUrl,
        title: title,
        readyInMinutes: readyInMinutes,
        popularity: popularity,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: gluten_free,
        ingredients: ingredients,
        instructions: instructions,
        servings: servings,
    }

    return fullDetails;
}




exports.getRecipeDetails = getRecipeDetails;
exports.getSearchRecipes = getSearchRecipes;
exports.getRandomRecipes = getRandomRecipes;
exports.getLastThreeRecipes = getLastThreeRecipes;
exports.getFullDetailsOfRecipe = getFullDetailsOfRecipe;
