// Import express
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const pexels = require('pexels');

const fs = require('fs');

const ffmpeg = require('fluent-ffmpeg');

const path = require('path');
const { log } = require('console');

// Load port
const PORT = process.env.PORT || 5500;

app.use(express.json());
app.use(express.static("frontend"));
app.use(express.static(__dirname + '/script.js'));
app.use(express.static(__dirname + '/token.js'));
app.use(fileUpload());

app.get('/token', (req, res) => {
    // call api from here?
});

// get the uploaded beat + cover picture and place it in /tmp/;
app.post('/', (req, res) => {
    // let beatFile;
    // let beatCoverPicture;
    // let uploadPath_beatFile;
    // let uploadPath_beatCoverPicture;

    // beatFile = req.files.beatFile;
    // // beatCoverPicture = req.files.beatCoverPicture;

    // uploadPath_beatFile = path.normalize(__dirname + '/tmp/' + beatFile.name);
    // // uploadPath_beatCoverPicture = path.normalize(__dirname + '/tmp/' + beatCoverPicture.name);

    // // beatFile.mv(uploadPath_beatFile, (err) => {
    // //     if (err) return res.status(500).send(err);
    // // });

    // // beatCoverPicture.mv(uploadPath_beatCoverPicture, (err) => {
    // //     if (err) return res.status(500).send(err);
    // // });

    // res.status(204).send();

    // return createVideo(uploadPath_beatFile, uploadPath_beatCoverPicture);

});

function createVideo(beat, backgroundPicture) {

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
app.get('/', (req, res) => {
    const range = req.headers.range;
    if (!range) {
        res.status(400).send('error');
    }
    const videoPath = path.normalize(__dirname + '/tmp/' + 'output.mp4');
    const videoSize = fs.statSync(videoPath).size;
    const chunkSize = 10 ** 6;

    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + chunkSize, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Range": 'bytes',
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };

    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));