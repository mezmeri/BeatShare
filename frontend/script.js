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
    const proxyEndPoint = 'http://localhost:5500';
    let url = `${proxyEndPoint}/api/v1/search?query=${input}&orientation=square&per_page=4`;

    await fetch(url, {
        headers: {
            'Authorization': 'jZQuDCMfH0C4SXBUWbVhLFydTZkMR2Lsj2B7b3xnxkX65PgkTLxDQPH0',
        },
    })
        .then(result => {
            if (result.ok) {
                searchResultPictures.style.display = 'block';
                return result.json();
            } else {
                throw new Error('Status did not return with 2XX.');
            }
        })
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

                image.src = data.photos[i].src.original;
                image.alt = data.photos[i].alt;

                row.appendChild(column);
                column.appendChild(image);
                pictureResultsDiv.insertAdjacentElement('afterbegin', row);
            }
        }).catch(err => console.error('😫😫', err)
        );
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