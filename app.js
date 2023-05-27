const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const pexels = require('pexels');
const client = pexels.createClient('jZQuDCMfH0C4SXBUWbVhLFydTZkMR2Lsj2B7b3xnxkX65PgkTLxDQPH0');
const app = express();
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');
const PORT = process.env.PORT || 5500;
const bodyParser = require('body-parser');

app.use(express.static("frontend"));
app.use(express.static(__dirname + '/script.js'));
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.post('/api/search', (req, res) => {
    let query = req.body.result;

    client.photos.search({ query, orientation: "square", size: "large", per_page: 4 }).then(result => {
        res.json(result);

    });
});

function generateImageFileNameUUID() {
    return new Promise((resolve, reject) => {
        const fileName = `img-${crypto.randomUUID()}.jpg`;
        if (fileName) {
            resolve(fileName);
        } else {
            reject('File name could not be generated. Please try again.');
        }
    });
}

async function downloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        let fileName = await generateImageFileNameUUID();
        const filePath = path.normalize(__dirname + '/tmp/' + fileName);
        fs.writeFileSync(filePath, imageBuffer);

        return filePath;
    } catch (error) {
        console.error(error);
    }
}

async function downloadAudio(file) {
    const filePath = path.normalize(__dirname + '/tmp/' + file.name);
    file.mv(filePath, (err) => {
        if (err) return res.status(500).send(err);
    });

    return filePath;
}

app.post('/', async (req, res) => {
    const image = await downloadImage(req.body.picture_data);
    const audio = await downloadAudio(req.files.beatFile);
    await renderOverlay(1920, 1080, 60);

    return createVideo(audio, image);
});

async function renderOverlay(width, height, duration) {
    ffmpeg()
        .on('start', () => { console.log('Upload has started'); })
        .input('color=c=black:s=' + `'${width}'` + 'x' + `'${height}'`)
        .inputOptions('-f lavfi')
        .outputOptions('-t ' + duration)
        .output(__dirname + '/tmp/' + 'result.mp4')
        .on('error', (err) => { console.error('An error occured while rendering the video:', err); })
        .on('end', () => {

        })
        .run();

}

function createVideo(audio, image) {
    ffmpeg()
        .on('start', () => { console.log('Upload has started'); })
        .addInput(image)
        .addInput(audio)
        .complexFilter('scale=640:480')
        .output('final.mp4')
        .on('end', () => {
            try {
                fs.unlinkSync(audio);
                fs.unlinkSync(image);
                console.log('Upload finished!');
            } catch (error) {
                console.log(error);
            }
        })
        .run();
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));