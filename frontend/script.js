const form = document.getElementById('uploadForm');
form.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

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
            const row = document.createElement('div');
            row.className = "row";

            if (data.total_results > 0) {
                searchResultPictures.style.display = 'block';
            }

            if (data.total_results === 0) {
                const p = document.createElement('p');
                p.innerText = "There's no pictures that matches your search word.";

                const div = document.createElement('div');
                div.appendChild(p);
                searchAPIArea.appendChild(div);
                searchAPIArea.insertAdjacentElement('afterend', div);
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

    getSelectedImageData();
};

function getSelectedImageData () {
    let pictureURLSource = [];

    let imageContainer = document.getElementById('pictureSearchResults');

    imageContainer.addEventListener('click', function (event) {
        let pictureData = event.target.currentSrc;
        if (event.target.className === 'pictureResult') {
            // Only one picture should be stored, so before we insert the image into the array it checks if there already is a picture in there.
            if (pictureURLSource.length > 0) {
                pictureURLSource.splice(0, 1);
                pictureURLSource.push(pictureData);
            } else {
                pictureURLSource.push(pictureData);
            }
        }

    });

    bufferDataToBackend(pictureURLSource);
}

function bufferDataToBackend (source) {
    form.addEventListener('submit', async (sendDataToBackend) => {
        sendDataToBackend.preventDefault();
        let url = 'http://localhost:5500';
        const formData = new FormData();

        const fileInput = document.getElementById('upload-beat-input');
        // formData.append('beatFile', fileInput.files[0]);
        const json = JSON.stringify({ picture_data: source });
        formData.append('picture_data', json);

        await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: formData,
        });

        console.log('Data sent!');
    });
};

// pressing enter in the search bar starts the API call
input_searchForPicture.onfocus = function () {
    input_searchForPicture.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            input_searchForPicture.blur();
            button_searchForPicture.focus();
            initPexelsAPI(input_searchForPicture.value);
        }
    });
};