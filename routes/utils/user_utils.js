const DButils = require("./DButils");

async function markAsFavorite(user_name, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_name}',${recipe_id})`);
}

async function getFavoriteRecipes(user_name){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_name='${user_name}'`);
    return recipes_id;
}

async function createRecipes(recipe_name, pic, description, time_required, popularity, vegan, vegeterian, gluten, ingredients, instruction, num_of_meals, user_name){
    let id = await DButils.execQuery(`SELECT COUNT(*) as number FROM regularrecipes`);
    id = id[0].number + 1;
    const recipes_id = await DButils.execQuery(`insert into regularrecipes values (id=${id}, recipe_name='${recipe_name}', recpic='${pic}', recdescription='${description}', timerequired=${time_required}, popularity='${popularity}, vegan='${vegan}', vegetarian='${vegeterian}', ingredientlist='${ingredients}', instructions='${instruction}', nu_of_meals='${num_of_meals}', user_name='${user_name}')`);
}

async function isWatched(recipe_id, user_name){
    const count = await DButils.watched(`SELECT COUNT(*) WHERE (rec_id=${recipe_id}, user_name='${user_name})`);

    if (count == 0)
        return False;
    else
        return True;
}

async function getMyRecipes(user_name){
    let results = [];
    let recipes_info = await DButils.execQuery(`SELECT * FROM regularrecipes where username='${user_name}' `)

    if (recipes_info == []){
        return results;
    }
    
    const watched_recipes = await DButils.execQuery(`SELECT recipe_id FROM watchedrecipes where username='${user_name}' `);
    const favorite_recipes = await DButils.execQuery(`SELECT recipe_id FROM myfavoriterecipes where username='${user_name}' `);

    for (let recipe of recipes_info){
        let watched_rec = False;
        
        if (watched_recipes.find((x) => x.recipe_id === recipe['id'])){
            watched_rec = True;
        }
        
        let favorite_rec = False;
        
        if (favorite_recipes.find((x) => x.recipe_id === recipe['id'])){
            favorite_rec = True;
        }   

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

        results.push(recipe_dict);
    }
    return results;
}


/*
 * returns the all recipes ids of my family recipes
*/
async function getMyFamilyRecipes(user_name){
    const recipesIds = await DButils.execQuery(`SELECT * from myfamilyrecipes where user_name='${user_name}'`);
    return recipesIds;
}





exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
exports.createRecipes = createRecipes;
exports.getMyRecipes = getMyRecipes;
exports.isWatched = isWatched;
exports.getMyFamilyRecipes = getMyFamilyRecipes;

