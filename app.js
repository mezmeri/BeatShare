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
    const overlay = await renderOverlay(1920, 1080, Math.round(audioDuration));

    return createVideo(audio, image, overlay);
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
    return new Promise((resolve, reject) => {
        const filePath = path.normalize(__dirname + '/tmp/' + 'overlay.mp4');
        ffmpeg()
            .on('start', () => { console.log('Overlay is being uploaded.'); })
            .input('color=c=black:s=' + `'${width}'` + 'x' + `'${height}'`)
            .inputOptions('-f lavfi')
            .outputOptions('-t ' + duration)
            .output(filePath)
            .on('error', (err) => {
                console.error('An error occured while rendering the video:', err);
                reject('Overlay upload failed. Operation rejected.');
            })
            .on('end', () => {
                console.log('Overlay was succesfully uploaded.');
                resolve(filePath);
            })
            .run();
    });
}

function createVideo(audio, image, overlay) {
    const filePath = path.normalize(__dirname + '/tmp/' + `Video created with BeatShare.mp4`);
    ffmpeg()
        .on('start', () => { console.log('Final upload has started'); })
        .addInput(image)
        .addInput(audio)
        .addInput(overlay)
        .complexFilter([
            '[0:v]scale=iw*0.5:ih*0.5[img]', // Resize the image to 50% of its original size
            '[1:v]scale=w=1920:h=1080[beat]', // Resize the beat video to 1920x1080
            '[2:v][img]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2[bg]', // Overlay the image on the black background
        ])
        .output(filePath)
        .on('end', () => {
            try {
                fs.unlinkSync(audio);
                fs.unlinkSync(image);
                fs.unlinkSync(__dirname + '/tmp/' + 'overlay.mp4');
                console.log('Final upload finished!');
            } catch (error) {
                console.log(error);
            }
        })
        .run();
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));