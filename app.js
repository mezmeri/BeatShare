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
    const audioDuration = await getAudioDuration(audio);
    await renderOverlay(1920, 1080, Math.round(audioDuration));
    // return createVideo(audio, image);
});

async function getAudioDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                let duration = metadata.format.duration;
                resolve(duration);
            }
        });
    });
}

async function renderOverlay(width, height, duration) {
    ffmpeg()
        .on('start', () => { console.log('Upload has started'); })
        .input('color=c=black:s=' + `'${width}'` + 'x' + `'${height}'`)
        .inputOptions('-f lavfi')
        .outputOptions('-t ' + duration)
        .output(__dirname + '/tmp/' + 'overlay.mp4')
        .on('error', (err) => { console.error('An error occured while rendering the video:', err); })
        .on('end', () => {

        })
        .run();

}

function createVideo(audio, image) {
    ffmpeg()
        .on('start', () => { console.log('Upload has started'); })
        .addInput(__dirname + '/tmp/' + 'overlay.mp4')
        .addInput(image)
        .addInput(audio)
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