// module qui permet de gerer les variables d environement pour pouvoir aller chercher le token_key par ex
require("dotenv").config();
require("./config/database").connect();
var bcrypt = require('bcryptjs');
var jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");


// pour gérer le model user 
// importing user context
const User = require("./model/user");


const express = require("express");
const app = express();
app.use(express.json());
// Logic goes here pourrai utiliser app comme module 
// Register

app.post("/register", async (req, res) => {
    // Our register logic starts here
    try {


        // Get user input
        const { first_name, last_name, email, password } = req.body;
        // Validate user input si je n ai pas d username password etc
        if (!(email && password && first_name && last_name)) {
            res.status(400).send("All input is required");
        }


        // check if user already exist
        // Validate if user exist in our database
        // cherche dans la base si un user existe déja
        const oldUser = await User.findOne({ email });
        //si un user existe déja -> retourne status 409
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }


        //Encrypt user password
        // j attend le cryptage du password
        encryptedPassword = await bcrypt.hash(password, 10);

        // une fois c est etapes reussies : pas de user existant et encryptage du mdp je peux enregistrer le nouvel user 
        // Create user in our database
        const user = await User.create({
            first_name,
            last_name,
            email: email.toLowerCase(), // sanitize: convert email to lowercase
            password: encryptedPassword,  // password encrypté
        });

        // creation du token
        // Create token
        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,   // token_key correspond au mdp secret qui vient de process.env
            {
                expiresIn: "2h",
            }
        );
        // save user token
        user.token = token;
        // return new user
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
    // Our register logic ends here
});
// Login
app.post("/login", (req, res) => {
    // our login logic goes here
});


app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
});

module.exports = app;



