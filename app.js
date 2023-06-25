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
        await client.connect();
        let database = client.db('accounts');
        let collection = database.collection('user_info');

        const existingUser = await collection.findOne({ username: `${username}` });
        const existingEmail = await collection.findOne({ email: `${email}` });

        if (existingUser) {
            console.log('User already exists!');
        }

        if (existingEmail) {
            console.log('Email already exists!');
        }

        const newUser = {
            username: `${username}`,
            password: `${password}`,
            email: `${email}`
        };

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

app.post('/register', async (req, res) => {
    try {
        const username = req.body.username;
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const email = req.body.email;
        sendToDatabase(username, hashedPassword, email);
    } catch (error) {
        console.log('ERROR! ', error);
    }
});

app.post('/login', async (req, res) => {
});

app.post('/logout', (req, res) => {

});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));