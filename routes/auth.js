var express = require("express");
var router = express.Router();
const MySql = require("../routes/utils/MySql");
const DButils = require("../routes/utils/DButils");
const bcrypt = require("bcrypt");

router.post("/Register", async (req, res, next) => {
  try {
    // parameters exists
    // valid parameters
    // user_name exists
    let user_details = {
      user_name: req.body.user_name,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      country: req.body.country,
      password: req.body.password,
      email: req.body.email,
      // profilePic: req.body.profilePic
    };
    console.log(user_details);
    let users = [];
    users = await DButils.execQuery("SELECT user_name from users");

    if (users.find((x) => x.user_name === user_details.user_name))
      throw { status: 409, message: "user_name was taken" };

    if (users.find((x) => x.email === user_details.email))
      throw { status: 409, message: "email was taken" };

    // add the new user_name
    let hash_password = bcrypt.hashSync(
      user_details.password,
      parseInt(process.env.bcrypt_saltRounds)
    );
    await DButils.execQuery(
      `INSERT INTO mydb.users (user_name,firstname,lastname,country,password,email) VALUES ('${user_details.user_name}', '${user_details.firstname}', '${user_details.lastname}',
      '${user_details.country}', '${hash_password}', '${user_details.email}')`
    );
    res.status(201).send({ message: "user created", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Login", async (req, res, next) => {
  try {
    // check that user_name exists
    const users = await DButils.execQuery("SELECT user_name FROM users");
    if (!users.find((x) => x.user_name === req.body.user_name))
      throw { status: 401, message: "user_name or Password incorrect" };

    // check that the password is correct
    const user = (
      await DButils.execQuery(
        `SELECT * FROM users WHERE user_name = '${req.body.user_name}'`
      )
    )[0];

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      throw { status: 401, message: "user_name or Password incorrect" };
    }

    // Set cookie
    req.session.user_name = user.user_name;


    // return cookie
    res.status(200).send({ message: "login succeeded", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/Logout", function (req, res) {
  req.session.reset(); // reset the session info --> send cookie when  req.session == undefined!!
  res.send({ success: true, message: "logout succeeded" });
});

module.exports = router;