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
};

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
        console.log(pictureURL);
        return getSelectedImage(pictureURL);
    }
});


function getSelectedImage (url) {
    console.log('getSelectedImage', url);

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        sendDataToBackend(url);
    });
}

async function sendDataToBackend (source) {
    console.log('sendDataToBackend', source);
    const formData = new FormData();
    formData.append('picture_data', source);

    try {
        const response = await fetch('http://localhost:5500', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            console.error('Data sending failed:', response.status, response.statusText);
        } else {
            console.log('Data sent!');
        }
    } catch (error) {
        console.error(error);
    }
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