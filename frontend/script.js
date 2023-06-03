const form = document.getElementById('uploadForm');
form.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

input_searchForPicture.onfocus = function () {
    input_searchForPicture.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            input_searchForPicture.blur();
            button_searchForPicture.focus();
            initPexelsAPI(input_searchForPicture.value);
        }
    });
};

const input_searchForPicture = document.getElementById('searchForPicture');
const button_searchForPicture = document.getElementById('searchForPictureButton');
const searchResultPictures = document.getElementById('selectAlbumCover');
const searchAPIArea = document.getElementById('searchPictureAPI');

const initPexelsAPI = async (input) => {
    const url = 'http://localhost:5500/api/search';

    const json = `{"result":"${input}"}`;
    const body = JSON.parse(json);

    await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(result => result.json())
        .then(data => {
            // TODO: Make a separate function for the picture generation
            const row = document.createElement('div');
            row.className = "row";

            if (data.total_results === 0) {
                const noPictureErr = document.createElement('p');
                noPictureErr.innerText = "There's no pictures that matches your search word.";

                const div = document.createElement('div');
                div.appendChild(noPictureErr);
                searchAPIArea.appendChild(div);
                searchAPIArea.insertAdjacentElement('afterend', div);
            }

            if (data.total_results > 0) {
                searchResultPictures.style.display = 'block';
            }

            for (let i = 0; i < data.photos.length; i++) {
                const pictureResultsDiv = document.getElementById('pictureSearchResults');

                const column = document.createElement('div');
                column.className = 'col';

                const image = document.createElement('img');
                image.className = "pictureResult";
                image.src = data.photos[i].src.large;
                image.alt = data.photos[i].alt;

                row.appendChild(column);
                column.appendChild(image);
                pictureResultsDiv.insertAdjacentElement('afterbegin', row);
            }
        }).catch(err => console.error('😫😫', err)
        );
};

function highlightSelectedImage(source) {
    const videoPreviewSection = document.getElementById('videoPreviewSection');
    let image = document.createElement('img');
    image.src = source;
    image.id = 'imagepreview';

    videoPreviewSection.appendChild(image);
}

const pictureSearchResults = document.getElementById('pictureSearchResults');
pictureSearchResults.addEventListener('click', function (event) {
    let pictureURL = [];
    let pictureDataSrc = event.target.currentSrc;

    if (event.target.className === 'pictureResult') {
        if (pictureURL.length > 0) {
            pictureURL.splice(0, 1);
            pictureURL.push(pictureDataSrc);
        } else {
            pictureURL.push(pictureDataSrc);
        }
        // highlightSelectedImage(pictureURL);
        return getSelectedImage(pictureURL);
    }
});

function getSelectedImage(url) {
    urlArray = [url];

    if (urlArray.length > 0) {
        urlArray.splice(0, 1);
        urlArray.push(url);
    } else {
        urlArray.push(url);
    }

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendDataToBackend(urlArray);
    });
}

function createSpinner() {
    const div1 = document.createElement('div');
    div1.className = 'd-flex justify-content-center';
    div1.id = 'spinner';
    const div2 = document.createElement('div');
    div2.className = 'spinner-border';
    div2.role = 'status';
    const span = document.createElement('span');
    span.className = 'visually-hidden';

    div1.appendChild(div2);
    div2.appendChild(span);
    videoPreviewSection.appendChild(div2);
}

async function sendDataToBackend(source) {
    const formData = new FormData();
    const fileInput = document.getElementById('upload-beat-input');
    formData.append('picture_data', source);
    formData.append('beatFile', fileInput.files[0]);

    await fetch('http://localhost:5500', {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (!response.ok) {
                console.error('Data sending failed:', response.status, response.statusText);
            } else {
                console.log('Data sent!');
            }
            return response.blob();
        })
        .then(() => {
            getVideoFromBackendAndPlayIt();
        })
        .catch(err => console.warn(err))
        .finally(() => {
            const spinner = document.getElementById('spinner');
            spinner.classList.add('spinner-disable');
        });

};

async function getVideoFromBackendAndPlayIt() {
    const videoSource = 'http://localhost:5500/video';
    await fetch(videoSource)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to fetch video:' + response.status);
            } else {
                console.log(response);
                const videoElement = document.createElement('video');
                videoElement.id = 'beat-video';
                videoElement.src = response.url;
                videoElement.controls = true;

                const videoPreviewSection = document.getElementById('videoPreviewSection');
                videoPreviewSection.style.display = 'block';
                videoPreviewSection.appendChild(videoElement);
            }
        }).catch(err => console.warn(err));
}