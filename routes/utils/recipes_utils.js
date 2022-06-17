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



async function getRecipeDetails(recipe_id,user_name) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    previewDictionary = {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
    }

    
    // If there is a connected user - checks if he has watched/saved to favorite the recipe
    // if (!(user_name)) {
    //     previewDictionary['watched'] = false;
    //     previewDictionary['favorite'] = false;
    // }
    // else {        
    //     const users = await DButils.execQuery("SELECT user_name FROM users");     

    //     if (users.find((x) => x.user_name === user_name)) 
    //     {            
    //         const isSavedToMyfavorites = await user_utils.isFavorite(req.session.user_name, user_name);
    //         if (isSavedToMyfavorites)
    //             previewDictionary['favorite'] = true;
    //         else
    //             previewDictionary['favorite'] = false;

    //         // Checks if the recipe has been watched by the user
    //         const isWatched = await user_utils.isWatched(recipe_id, user_name);
    //         if (isWatched){
    //             previewDictionary['watched'] = true;
    //             var today = new Date();
    //             var dd = String(today.getDate()).padStart(2, '0');
    //             var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //             var yyyy = today.getFullYear();
    //             today = mm + '/' + dd + '/' + yyyy;
                
    //             await DButils.execQuery(`update watched set (date=${today}) where (rec_id=${recipe_id}, user_name='${req,session.user_name}')`);
    //         }
                
    //         else {
    //             previewDictionary['watched'] = false;

    //             var today = new Date();
    //             var dd = String(today.getDate()).padStart(2, '0');
    //             var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    //             var yyyy = today.getFullYear();
    //             today = mm + '/' + dd + '/' + yyyy;

    //             await DButils.execQuery(`insert into watched values (rec_id=${recipe_id}, user_name='${req,session.user_name}', date=${today})`);
    //         }
                
    //     // }
    // }

    return previewDictionary;
}


/*
* returns the preview of a list of recipes ids
 */
async function getPreviewRecipes(req, arrRecipesIds) 
{
    try
    {
        let res = []
        let recipesList =  await axios.get(`${api_domain}/informationBulk`, {
            params: {
                ids: arrRecipesIds,
                apiKey: process.env.spooncular_apiKey
            }
        })
        //extract the  preview
        for (let prevRecipe of recipesList.data)
        {
            let {id, image, title, preparationMinutes, aggregateLikes, vegan, vegetarian, glutenFree} = prevRecipe
            let previewDictionary =  {
                image: image,
                title: title,
                readyInMinutes: preparationMinutes,
                popularity: aggregateLikes,
                vegan: vegan,
                vegetarian: vegetarian,
                glutenFree: glutenFree,
            }

            if (!(req.session && req.session.user_name)) {
                previewDictionary['watched'] = false;
                previewDictionary['favorite'] = false;
            }
            else {
            const users = await DButils.execQuery("SELECT user_name FROM users")
                if (users.find((x) => x.user_name === req.session.user_name)) 
                {
                    //check if this user saved this recipe
                    const isSavedToMyfavorites = await user_utils.isFavorite(req.session.user_name, user_name);
                    if (isSavedToMyfavorites) 
                        previewDictionary['favorite'] = true;
                    else
                        previewDictionary['favorite'] = false;

                    //check if this user has watched the recipe
                    const isWatched = await user_utils.isWatched(req.session.user_name, user_name);
                    if (isWatched)
                        previewDictionary['watched'] = true;
                    else
                        previewDictionary['watched'] = false;    
                }
            // Adds the preview dictionnary to the result array
            res.push(preview_dict)
            }
        }
        return res
    }
    catch
    {
        console.log("err");
    }

}


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

    const dicts = res.data['results'];
    let resId = "";
    for(let i = 0; i < Object.keys(dicts).length; i++)
    {
        if (i !=  dicts.length - 1)
            resId = resId + dicts[i]['id'] + ", ";
        else
            resId = resId + dicts[i]['id'];
    }

    const previewOfRecipes = await getPreviewRecipes(req, resId);

    for(let i = 0; i < dicts.length; i++)
    {
        previewOfRecipes[i]['instructions'] = dicts[i]['analyzedInstructions']
    }
    return previewOfRecipes;
}


async function threeRandomRecipes(){
    const data =  await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
    return data;
}

async function getRandomRecipes() {
    let threeRecipes = await threeRandomRecipes();
    return threeRecipes.data;
}   

async function getLastThreeRecipes(user_name){
    const recipes = await DButils.execQuery(`SELECT rec_id FROM mydb.watched WHERE user_name='${user_name}' ORDER BY date desc limit 3`);
    return recipes;
}




exports.getRecipeDetails = getRecipeDetails;
exports.getSearchRecipes = getSearchRecipes;
exports.getRandomRecipes = getRandomRecipes;
exports.getLastThreeRecipes = getLastThreeRecipes;
exports.getPreviewRecipes = getPreviewRecipes;
