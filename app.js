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
const membership = require('./src/routes/membership');
const generateVideo = require('./src/video/generate');

app.use(express.static(path.normalize(__dirname + '/resources/css')));
app.use(express.static(path.normalize(__dirname + '/resources/js')));
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



membership.setupMembershipRoutes(app);
generateVideo.generate(app);

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));