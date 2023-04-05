const form = document.getElementById('uploadForm');
form.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();
    }
});

const videoBackground = document.querySelectorAll(".videobackground");
videoBackground.forEach(element => {
    element.ondragstart = function () {
        return false;
    };
});

const searchForPictureInput = document.getElementById('searchForPicture');
const searchForPictureButton = document.getElementById('searchForPictureButton');
const searchResultPictures = document.getElementById('selectForeground');
searchForPictureInput.onfocus = function () {
    searchForPictureInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            searchForPictureInput.blur();
            searchForPictureButton.focus();
            searchResultPictures.style.display = 'block';
        }
    });
};

const initPexelsAPI = async function () {
    await fetch('/token')
        .then(res => res.json())
        .then(data => console.log(data));
};

initPexelsAPI();