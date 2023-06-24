require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const pexels = require('pexels');
const client = pexels.createClient('jZQuDCMfH0C4SXBUWbVhLFydTZkMR2Lsj2B7b3xnxkX65PgkTLxDQPH0');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const PORT = process.env.PORT || 5500;
const bodyparser = require('body-parser');
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_TOKEN;

app.use(express.static(__dirname + '/resources/pages/'));
app.use(express.static(path.join(__dirname, 'resources')));

app.use(fileUpload());
app.use(cors());
app.use(bodyparser.json());
app.use(express.json());

const dbClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToDB() {
    try {
        await dbClient.connect();
        let database = dbClient.db('songdata');
        database.collection('songs')
            .insertOne({ artist: "yoghurt", song: "in my tummy" });


        console.log('Successfully connected to database');
    } catch (err) {
        console.error(err);
    }
}

connectToDB().catch(console.dir);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));