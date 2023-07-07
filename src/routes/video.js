require('dotenv').config();
const videoRoute = require('express').Router();
const generate = require('../video/generate');
const pexels = require('pexels').createClient(process.env.PEXEL_TOKEN);
const path = require('path');
const fs = require('fs');

videoRoute.post('/api/search', (req, res) => {
    let query = req.body.result;

    pexels.photos.search({ query, orientation: "square", size: "large", per_page: 4 }).then(result => {
        res.json(result);

    });
});

videoRoute.post('/video', async (req, res) => {
    const image = await generate.downloadImage(req.body.picture_data);
    const audio = await generate.downloadAudio(req.files.beatFile);
    const audioDuration = await generate.getAudioDuration(audio);
    const overlay = await generate.renderOverlay(1920, 1080, Math.round(audioDuration));

    await generate.createVideo(audio, image, overlay).then(id => {
        res.json({ videoId: id });
    });
});

videoRoute.get('/video/:videoId', (req, res) => {
    const { videoId } = req.params;
    const videoPath = path.normalize('C:/Users/madss/Documents/Programmering/BeatShare/src/video/tmp/' + videoId + '.mp4');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', fs.statSync(videoPath).size);

    const stream = fs.createReadStream(videoPath);
    stream.pipe(res);

});

module.exports = {
    videoRoute
};