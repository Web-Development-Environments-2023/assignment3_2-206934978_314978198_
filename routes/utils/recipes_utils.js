const axios = require("axios");
const api_domain = "https://api.spoonacular.com/recipes";



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



async function getRecipeDetails(recipe_id) {
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
    if (!(req.session && req.session.username)) {
        previewDictionary['watched'] = false;
        previewDictionary['favorite'] = false;
    }
    else {
        const users = await DButils.execQuery("SELECT username FROM users")
        if (users.find((x) => x.username === req.session.username)) 
        {
            const isSavedToMyfavorites = await user_utils.isFavorite(req.session.username, username);
            if (is_saved_to_favorites)
                previewDictionary['favorite'] = true;
            else
                previewDictionary['favorite'] = false;

            // Checks if the recipe has been watched by the user
            const isWatched = await user_utils.isWatched(req.session.username, username);
            if (isWatched)
                previewDictionary['watched'] = true;
            else
                previewDictionary['watched'] = false;
        }
    }

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

        if (!(req.session && req.session.username)) {
            previewDictionary['watched'] = false;
            previewDictionary['favorite'] = false;
        }
        else {
          const users = await DButils.execQuery("SELECT username FROM users")
            if (users.find((x) => x.username === req.session.username)) 
            {
                //check if this user saved this recipe
                const isSavedToMyfavorites = await user_utils.isFavorite(req.session.username, username);
                if (isSavedToMyfavorites) 
                    previewDictionary['favorite'] = true;
                else
                    previewDictionary['favorite'] = false;

                //check if this user has watched the recipe
                const isWatched = await user_utils.isWatched(req.session.username, username);
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
    return await axios.get(`${api_domain}/random`, {
        params: {
            number: 3,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRandomRecipes() {
    let threeRecipes = await threeRandomRecipes();
    return threeRecipes.data
}   



exports.getRecipeDetails = getRecipeDetails;
exports.getSearchRecipes = getSearchRecipes;
exports.getRandomRecipes = getRandomRecipes;