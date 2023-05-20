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

async function downloadImage (url) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');

        const fileName = `img_${crypto.randomUUID()}.jpg`;

        const filePath = path.join(__dirname + '/tmp', fileName);
        return fs.writeFileSync(filePath, imageBuffer);

        console.log(`Successfully stored image in /tmp.`);
    } catch (error) {
        console.error(error);
    }
}

app.post('/', (req, res) => {
    console.log('upload has started');
    let pictureURL = req.body.picture_data;
    let beat;
    let uploadPath_beat;
    let uploadPath_picture;

    beat = req.files.beatFile;

    const waitForImageToDownload = new Promise((res, rej) => {
        downloadImage(pictureURL);
        res({

        });
    });

    uploadPath_beat = path.normalize(__dirname + '/tmp/' + beat.name);

    beat.mv(uploadPath_beat, (err) => {
        if (err) return res.status(500).send(err);
    });

    res.status(204).send();

    return createVideo(uploadPath_beat, uploadPath_picture);

});

function createVideo (beat, backgroundPicture) {

    let video = ffmpeg()
        .on('start', () => { console.log('Upload has started'); })
        .addInput(backgroundPicture)
        .addInput(beat)
        .size('1920x1080')
        .autopad('black')
        .output(path.normalize(__dirname + '/tmp/' + 'output.mp4'))
        .on('end', () => {
            try {
                fs.unlinkSync(beat);
                fs.unlinkSync(backgroundPicture);

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
