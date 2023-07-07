require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5500;
const bcrypt = require('bcrypt');
const validator = require('validator');

// Modules
require('./src/routes/video.js');
const database = require('./config/database.js');
const { videoRoute } = require('./src/routes/video.js');

database.client.connect();

app.use(express.static(__dirname + '/resources/pages/'));
app.use(express.static(path.join(__dirname, 'resources')));

app.use(fileUpload());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(videoRoute);

const sendToDatabase = async (email, password) => {
    try {
        let database = database.client.db('accounts');
        let collection = database.collection('user_info');

        const newUser = {
            email: email,
            password: password
        };

        return collection.insertOne(newUser);

    } catch (err) {
        console.error(err);
    }
};

const doesUserExist = function (email) {
    return new Promise(async (resolve, reject) => {
        let database = client.db('accounts');
        let collection = database.collection('user_info');
        const existingUser = await collection.findOne({ "email": email });

        if (existingUser) {
            resolve(true);
        } else {
            resolve(false);
        }
    });
};

app.post('/register', async (req, res) => {
    try {

        let { email, password, reenter_password } = req.body;

        if (password !== reenter_password) {
            return res.status(400).send(`The passwords do not match. Please try again.`);
        }

        const minLengthPassword = 8;
        if (password.length < minLengthPassword) {
            return res.status(400).send(`Passwords must be at least ${minLengthPassword} characters long. Yours is currently only ${password.length} characters.`);
        } else {
            password = await bcrypt.hash(password, 10);
        }

        const checkEmail = validator.isEmail(email);
        if (!checkEmail) {
            return res.status(400).send(`Email is not valid. Did you remember to add a domain? (.com)`);
        } else {
            email = validator.normalizeEmail(email);
            email = validator.trim(email);
        }

        await doesUserExist(email).then(async response => {
            if (response === false) {
                let result = await sendToDatabase(email, password);
                if (result.acknowledged) {
                    res.status(200).send('You have succesfully created a BeatShare account. An activation email has been sent to you.');
                }
            } else {
                res.status(400).send('Email already in use.');
            }
        });

    } catch (error) {
        console.log('ERROR! ', error);
    }
});

app.post('/login', (req, res) => {

});

app.post('/logout', (req, res) => {

});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));