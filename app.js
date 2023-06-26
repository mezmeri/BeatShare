require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const pexels = require('pexels');
const pexelsClient = pexels.createClient('jZQuDCMfH0C4SXBUWbVhLFydTZkMR2Lsj2B7b3xnxkX65PgkTLxDQPH0');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const PORT = process.env.PORT || 5500;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_TOKEN;
const bcrypt = require('bcrypt');
const validator = require('validator');

app.use(express.static(__dirname + '/resources/pages/'));
app.use(express.static(path.join(__dirname, 'resources')));

app.use(fileUpload());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function sendToDatabase(username, password, email) {
    try {
        console.log(username, password, email);
        // await client.connect();
        // let database = client.db('accounts');
        // let collection = database.collection('user_info');

        // const existingUser = await collection.findOne({
        //     $or: [{ username: username }, { email: email }]
        // });

        if (existingUser) {
            console.log(`Username or email already exists! We can't tell you which one due to safety reasons.`);
        }

        const newUser = {
            username: username,
            password: password,
            email: email
        };

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

app.post('/register', async (req, res) => {
    try {
        let { username, email, password } = req.body;

        const minLengthPassword = 8;
        const maxLengthPassword = 12;
        if (password.length < minLengthPassword || password.length > maxLengthPassword) {
            return res.status(400).send(`Password must be between ${minLengthPassword} and 12 characters long. Yours is currently ${password.length}.`);
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

        const checkUsername = validator.isAlphanumeric(username);
        if (!checkUsername) {
            return res.status(400).send(`The username ${username} contains symbols/characters, which are not allowed. Please remove them.`);
        } else {
            username = validator.trim(username);
        }

        sendToDatabase(username, password, email);

    } catch (error) {
        console.log('ERROR! ', error);
    }
});

app.post('/login', async (req, res) => {
});

app.post('/logout', (req, res) => {

});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));