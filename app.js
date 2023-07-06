require('dotenv').config();
const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');
const cors = require('cors');
const pexels = require('pexels').createClient(process.env.PEXEL_TOKEN);
const path = require('path');
const fs = require('fs');
const PORT = process.env.PORT || 5500;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.DB_TOKEN;
const bcrypt = require('bcrypt');
const validator = require('validator');
const crypto = require('crypto');

// Modules
const generate = require('./src/video/generate.js');

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

app.post('/api/search', (req, res) => {
    let query = req.body.result;

    pexels.photos.search({ query, orientation: "square", size: "large", per_page: 4 }).then(result => {
        res.json(result);

    });
});

app.post('/video', async (req, res) => {
    const image = await generate.downloadImage(req.body.picture_data);
    const audio = await generate.downloadAudio(req.files.beatFile);
    const audioDuration = await generate.getAudioDuration(audio);
    const overlay = await generate.renderOverlay(1920, 1080, Math.round(audioDuration));

    await generate.createVideo(audio, image, overlay).then(id => {
        res.json({ videoId: id });
    });
});

app.get('/video/:videoId', (req, res) => {
    const { videoId } = req.params;
    const videoPath = path.normalize(__dirname + '/tmp/' + videoId + '.mp4');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', fs.statSync(videoPath).size);

    const stream = fs.createReadStream(videoPath);
    stream.pipe(res);
});

const sendToDatabase = async (email, password) => {
    try {
        let database = client.db('accounts');
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
        client.connect();
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