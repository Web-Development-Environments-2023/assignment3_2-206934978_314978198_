const axios = require("axios");
const { get } = require("../recipes");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");



/**
 * Get recipe details from spooncular response and extract the relevant recipe data for preview
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

async function getRecipeInstructions(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/analyzedInstructions`, {
        params: {
            apiKey: process.env.spooncular_apiKey
        }
    });
}


/*
 * This func returns the preview details of a recipe by it's id
*/
async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: glutenFree,
    };

}

/*
 * This func returns recipes by a query and it's amount of results
*/
async function getSearchRecipes(query, number, cuisine, diet, intolerances) {
    try {
        let res = await axios.get(`${api_domain}/complexSearch`,{
            params: {
                apiKey: process.env.spooncular_apiKey,
                query: query, 
                number: number,
                cuisine: cuisine, 
                diet: diet,
                intolerance: intolerances,
                fillIngredients: true,
                addRecipeInformation: true,
            }
        });
        res = await getPreviewRecipes(res.data.results);
        return res;
    } catch(error){
        console.log(error); 
    }
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
 * This func addes the last recipe were watched by a specific user
*/
async function postLastRecipe(user_name, recipe_id){
    await DButils.execQuery(`insert into mydb.watched values(${recipe_id}, '${user_name}', NOW())`);
}

/*
 * This func returns the full details of a recipe by it's id
*/
async function getFullDetailsOfRecipe(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, image, readyInMinutes, aggregateLikes, vegan, vegetarian, glutenFree, extendedIngredients, servings } = recipe_info.data;
    let instructions = await getRecipeInstructions(recipe_id);
    let analyze_Instructions = instructions.data;
    
    const fullDetails = {
        id: id,
        image: image,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        gluten_free: glutenFree,
        ingredients: extendedIngredients,
        analyze_Instructions: analyze_Instructions,
        servings: servings,
    }

    return fullDetails;
}


/*
 * This func returns the full details of my recipe by it's id
*/
async function getMyFullDetailsOfRecipe(recipe_id) {
    let recipe_info = await DButils.execQuery(`SELECT * FROM mydb.regularrecipes WHERE id='${recipe_id}'`);
    let { id, title, imageUrl, readyInMinutes, popularity, vegan, vegetarian, glutenFree, servings } = recipe_info[0];
    
    let instructions = await DButils.execQuery(`SELECT * FROM instructionrecipes WHERE recipe_id='${recipe_id}'`);
    let return_instructions = [];

    for (let i = 0; i < instructions.length; i++ ){
        return_instructions.push({number: instructions[i].instruction_id, step: instructions[i].instruction_data});
    }
    
    let ingredients = await DButils.execQuery(`SELECT * FROM ingredientsrecipes WHERE recipe_id='${recipe_id}'`);
    let return_ingredients = [];

    for (let i = 0; i < ingredients.length; i++ ){
        return_ingredients.push({number: i, original: ingredients[i].ingredient_name});
    }
    
    const fullDetails = {
        id: id,
        image: imageUrl,
        title: title,
        readyInMinutes: readyInMinutes,
        aggregateLikes: popularity,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        ingredients: return_ingredients,
        instructions: return_instructions,
        servings: servings,
    }

    return fullDetails;
}

/*
 * This func returns the preview details of dictionery that contains recipes' ids
*/
async function getPreviewRecipes(res){
    let response = [];

    for (let i = 0; i < res.length; i++){
        let recipeId = res[i].id == undefined ? res[i].recipe_id : res[i].id;
        if (recipeId == undefined) {
            recipeId = res[i];
        }
        response[i] = await getRecipeDetails(recipeId);
    }

    return response;
}


async function recipe_wached_by_user(user_name, recipe_id){
    const counter = await DButils.execQuery(`SELECT count(*) AS count FROM watched WHERE user_name='${user_name}' AND rec_id='${recipe_id}'`);
    if(counter[0].count >= 1){
        return true;
    }
    else{
        return false;
    }
}

exports.getRecipeDetails = getRecipeDetails;
exports.getSearchRecipes = getSearchRecipes;
exports.getRandomRecipes = getRandomRecipes;
exports.getLastThreeRecipes = getLastThreeRecipes;
exports.getFullDetailsOfRecipe = getFullDetailsOfRecipe;
exports.getMyFullDetailsOfRecipe = getMyFullDetailsOfRecipe;
exports.postLastRecipe = postLastRecipe;
exports.getPreviewRecipes = getPreviewRecipes;
exports.recipe_wached_by_user = recipe_wached_by_user;