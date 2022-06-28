const DButils = require("./DButils");

/*
 * This func mark a recipe as a favorite by a logged-in user
*/
async function markAsFavorite(user_name, recipe_id){
    await DButils.execQuery(`insert into myfavoriterecipes values (${recipe_id}, '${user_name}')`);
}


/*
 * This func return the all favorite recipes by the logged-in user
*/
async function getFavoriteRecipes(user_name){
    const recipes_id = await DButils.execQuery(`select rec_id from myfavoriterecipes where user_name='${user_name}'`);
    return recipes_id;
}


/*
 * This func create a new recipe by the logged-in user
*/
async function createRecipes(imageUrl, title, readyInMinutes, popularity, vegan, vegetarian, gluten_free, ingredients, instructions, servings, user_name){
    let id = await DButils.execQuery(`SELECT COUNT(*) as number FROM mydb.regularrecipes`);
    id = id[0].number + 1;
    await DButils.execQuery(`insert into mydb.regularrecipes values (${id},'${imageUrl}', '${title}', ${readyInMinutes}, ${popularity}, ${vegan}, ${vegetarian}, ${gluten_free}, '${ingredients}', '${instructions}', ${servings}, '${user_name}')`);
}


/*
 * This func returns if this recipe was watched by a specific user
*/
async function isWatched(recipe_id, user_name){
    const count = await DButils.execQuery(`SELECT COUNT(*) FROM watched WHERE (rec_id=${recipe_id}, user_name='${user_name})`);

    if (count == 0)
        return False;
    else
        return True;
}


/*
 * This func returns the all recipes of a logged-in user
*/
async function getMyRecipes(user_name){
    let res = [];
    let recipes_info = await DButils.execQuery(`SELECT * FROM regularrecipes where user_name='${user_name}' `)

    if (recipes_info == []){
        return res;
    }
    
    const watched_recipes = await DButils.execQuery(`SELECT rec_id FROM watched where user_name='${user_name}' `);
    const favorite_recipes = await DButils.execQuery(`SELECT rec_id FROM myfavoriterecipes where user_name='${user_name}' `);

    for (let recipe of recipes_info){
        
        let watched_rec = False;
        if (watched_recipes.find((x) => x.recipe_id === recipe['id']))
            watched_rec = True;
        
        let favorite_rec = False;
        if (favorite_recipes.find((x) => x.recipe_id === recipe['id']))
            favorite_rec = True;


        let recipe_dict = {
            name: recipe['recipe_name'],
            pic: recipe['recpic'],
            popularity: recipe['popularity'],
            vegan: recipe['vegan'],
            vegeterian: recipe['vegeterian'],
            gluten: recipe['gluten'],
            time_required: recipe['time_required'],
            watched: watched_rec,
            favorite: favorite_rec   
        }

        res.push(recipe_dict);
    }
    return res;
}


/*
 * returns the all recipes ids of my family recipes
*/
async function getMyFamilyRecipes(user_name){
    try {
        const recipesIds = await DButils.execQuery(`SELECT * from myfamilyrecipes where user_name='${user_name}'`);
        return recipesIds;
    }
    catch(err){
        throw { status: 400, message: "Your family has no even an one recipe!" };
    }

}





exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.createRecipes = createRecipes;
exports.getMyRecipes = getMyRecipes;
exports.isWatched = isWatched;
exports.getMyFamilyRecipes = getMyFamilyRecipes;

