const DButils = require("./DButils");

async function markAsFavorite(user_name, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_name}',${recipe_id})`);
}

async function getFavoriteRecipes(user_name){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_name='${user_name}'`);
    return recipes_id;
}



exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
