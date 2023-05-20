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

app.use(express.json());
app.use(express.static("frontend"));
app.use(express.static(__dirname + '/script.js'));
app.use(fileUpload());
app.use(cors());

app.post('/api/search', (req, res) => {
    let query = req.body.result;

    client.photos.search({ query, orientation: "square", size: "medium", per_page: 4 }).then(result => {
        res.json(result);

    });
});

function generatePictureFileNameUUID () {
    return new Promise((resolve, reject) => {
        const fileName = `img_${crypto.randomUUID()}.jpg`;
        if (fileName) {
            resolve(fileName);
        } else {
            reject('File name could not be generated.');
        }
    });
}

async function downloadImage (url) {
    try {
        let fileName;
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        fileName = await generatePictureFileNameUUID();
        const filePath = path.join(__dirname + '/tmp/' + fileName);
        fs.writeFileSync(filePath, imageBuffer);

        return fileName;

    } catch (error) {
        console.error(error);
    }
}

app.post('/', async (req, res) => {
    console.log('Upload has started');
    imageURL = req.body.picture_data;
    let image_filePath;
    let imageTitle;
    let beat;
    let beat_filePath;

    // Dev comment

    try {
        imageTitle = await downloadImage(imageURL);
    } catch (error) {
        console.error(error);
    }

    beat = req.files.beatFile;
    beat_filePath = path.normalize(__dirname + '/tmp/' + beat.name);

    beat.mv(beat_filePath, (err) => {
        if (err) return res.status(500).send(err);
    });

    res.status(204).send();

    return createVideo(beat_filePath, image_filePath);
});

function createVideo (beat, image) {

    let video = ffmpeg()
        .on('start', () => { console.log('Upload has started'); })
        .addInput(image)
        .addInput(beat)
        .size('1920x1080')
        .autopad('black')
        .output(path.normalize(__dirname + '/tmp/' + 'output.mp4'))
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

// Stream videofile
// app.get('/', (req, res) => {
//     const range = req.headers.range;
//     if (!range) {
//         res.status(400).send('error');
//     }
//     const videoPath = path.normalize(__dirname + '/tmp/' + 'output.mp4');
//     const videoSize = fs.statSync(videoPath).size;
//     const chunkSize = 10 ** 6;

//     const start = Number(range.replace(/\D/g, ""));
//     const end = Math.min(start + chunkSize, videoSize - 1);
//     const contentLength = end - start + 1;
//     const headers = {
//         "Content-Range": `bytes ${start}-${end}/${videoSize}`,
//         "Accept-Range": 'bytes',
//         "Content-Length": contentLength,
//         "Content-Type": "video/mp4"
//     };

//     res.writeHead(206, headers);
//     const videoStream = fs.createReadStream(videoPath, { start, end });
//     videoStream.pipe(res);
// });

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));