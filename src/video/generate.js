const pexels = require('pexels');
const client = pexels.createClient('jZQuDCMfH0C4SXBUWbVhLFydTZkMR2Lsj2B7b3xnxkX65PgkTLxDQPH0');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const crypto = require('crypto');

function generateFileNameUUID() {
    return new Promise((resolve, reject) => {
        const fileName = `${crypto.randomUUID()}`;
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

        let fileName = await generateFileNameUUID();
        const filePath = path.normalize(__dirname + '/tmp/' + fileName + '.jpg');
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

function getAudioDuration(filePath) {
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

function renderOverlay(width, height, duration) {
    return new Promise(async (resolve, reject) => {
        const fileName = await generateFileNameUUID();
        const filePath = path.normalize(__dirname + '/tmp/' + fileName + '.mp4');
        ffmpeg()
            .on('start', () => { console.log('Overlay is being rendered.'); })
            .input('color=c=black:s=' + `'${width}'` + 'x' + `'${height}'`)
            .inputOptions('-f lavfi')
            .outputOptions('-t ' + duration)
            .output(filePath)
            .on('error', (err) => {
                console.error('An error occured while rendering the video:', err);
                reject('Overlay upload failed. Operation rejected.');
            })
            .on('end', () => {
                console.log('Overlay was succesfully rendered.');
                resolve(filePath);
            })
            .run();
    });
}

function createVideo(audio, image, overlay) {
    return new Promise(async (resolve, reject) => {
        const fileName = await generateFileNameUUID();
        const filePath = path.normalize(__dirname + '/tmp/' + fileName + '.mp4');

        ffmpeg()
            .on('start', () => {
                console.log('Final upload has started.');
            })
            .on('error', function (err, stdout, stderr) {
                console.log('Cannot process video: ' + err.message);
                reject();
            })
            .addInput(overlay)
            .addInput(audio)
            .addInput(image)
            .complexFilter([
                {
                    filter: 'scale',
                    inputs: '[2:v]',
                    options: 'iw*0.9:ih*0.9',
                    outputs: '[img]'
                },
                {
                    filter: 'scale',
                    inputs: '[0:v]',
                    options: 'w=1920:h=1080',
                    outputs: '[overlay]'
                },
                {
                    filter: 'overlay',
                    inputs: '[overlay][img]',
                    options: '(main_w-overlay_w)/2:(main_h-overlay_h)/2'
                }
            ])
            .output(filePath)
            .on('end', () => {
                try {
                    fs.unlinkSync(audio);
                    fs.unlinkSync(image);
                    fs.unlinkSync(overlay);
                    console.log('Final upload finished!');
                    resolve(fileName);
                } catch (error) {
                    console.log(error);
                }
            })
            .run();
    });
}


module.exports = {
    generateFileNameUUID,
    downloadImage,
    downloadAudio,
    getAudioDuration,
    renderOverlay,
    createVideo
};