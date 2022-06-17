const DButils = require("./DButils");

async function markAsFavorite(user_name, recipe_id){
    await DButils.execQuery(`insert into myfavoriterecipes values (${recipe_id}, '${user_name}')`);
}

async function getFavoriteRecipes(user_name){
    const recipes_id = await DButils.execQuery(`select rec_id from myfavoriterecipes where user_name='${user_name}'`);
    return recipes_id;
}

// async function createRecipes(recipe_name, pic, description, time_required, popularity, vegan, vegeterian, gluten, ingredients, instruction, num_of_meals, user_name){
//     let id = await DButils.execQuery(`SELECT COUNT(*) as number FROM regularrecipes`);
//     id = id[0].number + 1;
//     await DButils.execQuery(`insert into regularrecipes values (${id},'${pic}', '${description}', ${time_required}, '${popularity}', '${vegan}', '${vegeterian}', '${gluten}', '${ingredients}', '${num_of_meals}', '${instruction}', '${recipe_name}', '${user_name}')`);
//     // await DButils.execQuery(
//     //     `INSERT INTO mydb.regularrecipes (id,recpic,descripton,timerequired,popularity,vegan,vegetarian,gluten,ingredientlist,num_of_meals,insructions,recipe_name,user_name) VALUES (${id},'${pic}', '${description}', '${time_required}', '${popularity}', '${vegan}', '${vegeterian}', '${gluten}', '${ingredients}', '${num_of_meals}', '${instruction}', '${recipe_name}', '${user_name}')`
//     //   );
// }




async function createRecipes(image, title, readyInMinutes, popularity, vegan, vegeterian, glutenFree, ingredients, instructions, servings){
    let id = await DButils.execQuery(`SELECT COUNT(*) as number FROM regularrecipes`);
    id = id[0].number + 1;
    await DButils.execQuery(`insert into regularrecipes values (${id},'${image}', '${title}', ${readyInMinutes}, ${popularity}, ${vegan}, ${vegeterian}, ${glutenFree}, '${ingredients}', '${instructions}', '${servings},)`);
    // await DButils.execQuery(
    //     `INSERT INTO mydb.regularrecipes (id,recpic,descripton,timerequired,popularity,vegan,vegetarian,gluten,ingredientlist,num_of_meals,insructions,recipe_name,user_name) VALUES (${id},'${pic}', '${description}', '${time_required}', '${popularity}', '${vegan}', '${vegeterian}', '${gluten}', '${ingredients}', '${num_of_meals}', '${instruction}', '${recipe_name}', '${user_name}')`
    //   );
}

async function isWatched(recipe_id, user_name){
    const count = await DButils.execQuery(`SELECT COUNT(*) FROM watched WHERE (rec_id=${recipe_id}, user_name='${user_name})`);

    if (count == 0)
        return False;
    else
        return True;
}

async function getMyRecipes(user_name){
    let results = [];
    let recipes_info = await DButils.execQuery(`SELECT * FROM regularrecipes where user_name='${user_name}' `)

    if (recipes_info == []){
        return results;
    }
    
    const watched_recipes = await DButils.execQuery(`SELECT rec_id FROM watched where user_name='${user_name}' `);
    const favorite_recipes = await DButils.execQuery(`SELECT rec_id FROM myfavoriterecipes where user_name='${user_name}' `);

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

