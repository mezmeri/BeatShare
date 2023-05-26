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
const sharp = require('sharp');

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

function generatePictureFileNameUUID() {
    return new Promise((resolve, reject) => {
        const fileName = `img-${crypto.randomUUID()}.jpg`;
        if (fileName) {
            resolve(fileName);
        } else {
            reject('File name could not be generated.');
        }
    });
}

async function downloadImage(url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        let fileName = await generatePictureFileNameUUID();
        const filePath = path.normalize(__dirname + '/tmp/' + fileName);
        fs.writeFileSync(filePath, imageBuffer);

        return filePath;
    } catch (error) {
        console.error(error);
    }
}

function resizeImage(inputPath, outputPath, width, height) {
    return new Promise((resolve, reject) => {
        sharp(inputPath)
            .resize(width, height)
            .toFile(outputPath, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(outputPath);
                }
            });
    });
}

async function downloadBeat(file) {
    const filePath = path.normalize(__dirname + '/tmp/' + file.name);
    file.mv(filePath, (err) => {
        if (err) return res.status(500).send(err);
    });

    return filePath;
}

app.post('/', async (req, res) => {
    let beatFilePath = await downloadBeat(req.files.beatFile);
    let imageFilePath = await downloadImage(req.body.picture_data);

    const outputPath = path.normalize(__dirname + '/tmp/' + '/resizedImg/' + 'resized.jpg');

    await resizeImage(imageFilePath, outputPath, 200, 200).then((resizedImage) => {
        createVideo(beatFilePath, resizedImage);
    });

    res.status(204).send();
});

function createVideo(beat, image) {

    ffmpeg(image)
        .on('start', () => { console.log('Upload has started'); })
        .input(beat)
        .complexFilter([
            '[v:0]scale=w=1920:h=1080[image]',
            '[v:1]scale=w=1920:h=1080[beat]',
            '[image][beat]overlay=(main_w-overlay_w)/2:(main_h-overlay_h)/2'
        ])
        .autopad('black')
        .output('output.mp4')
        .on('end', () => {
            try {
                fs.unlinkSync(beat);
                fs.unlinkSync(image);

                console.log('Upload finished!');
            } catch (error) {
                console.log(error);
            }
        })
        .run();
}

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));