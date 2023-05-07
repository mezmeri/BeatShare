const form = document.getElementById('uploadForm');
form.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});


const videoBackground = document.querySelectorAll('.videobackground');
videoBackground.forEach(element => {
    element.ondragstart = function () {
        return false;
    };
});

const input_searchForPicture = document.getElementById('searchForPicture');
const button_searchForPicture = document.getElementById('searchForPictureButton');
const searchResultPictures = document.getElementById('selectAlbumCover');


const initPexelsAPI = async (input) => {
    const json = `{"result":"${input}"}`;
    const body = JSON.parse(json);

    const proxyEndPoint = 'http://localhost:5500/api';

    await fetch(`${proxyEndPoint}/search?query=${input}&per_page=4`, {

    })
        .then(result => result.json())
        .then(data => {
            console.log(data);
            const row = document.createElement('div');
            row.className = "row";

            for (let i = 0; i < data.photos.length; i++) {
                // Current hidden div
                const pictureResultsDiv = document.getElementById('pictureSearchResults');

                const column = document.createElement('div');
                column.className = 'col';
                const image = document.createElement('img');
                image.src = data.photos[i].url;

                row.appendChild(column);
                column.appendChild(image);
                pictureResultsDiv.insertAdjacentElement('afterbegin', row);
            }
        }).catch(err => console.error('😫😫', err));
};

input_searchForPicture.onfocus = function () {
    input_searchForPicture.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            input_searchForPicture.blur();
            button_searchForPicture.focus();
            searchResultPictures.style.display = 'block';

            initPexelsAPI(input_searchForPicture.value);
        }
    });
};