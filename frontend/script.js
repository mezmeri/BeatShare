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
            console.log(data);
            const row = document.createElement('div');
            row.className = "row";

            if (data.total_results > 0) {
                searchResultPictures.style.display = 'block';
            }

            if (data.total_results === 0) {
                const p = document.createElement('p');
                p.innerText = "No pictures with the specific filters could be found. try again.";

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
                image.src = data.photos[i].src.large;
                image.alt = data.photos[i].alt;
                image.className = "pictureResult";

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
            initPexelsAPI(input_searchForPicture.value);
        }
    });
};