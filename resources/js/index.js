let priceCard_starter = document.getElementById('starter-price-card');
let priceCard_established = document.getElementById('established-price-card');

const starterCardButton = document.getElementById('starter-card-button');
const establishedCardButton = document.getElementById('established-card-button');

starterCardButton.addEventListener('click', () => {
    priceCard_starter.style.transition = 'outline 0.1s ease';
    priceCard_starter.style.outline = '3px solid rgb(118, 28, 255)';
    priceCard_starter.style.outlineOffset = '5px';

    priceCard_established.style.outline = '0px';
    priceCard_established.style.outlineOffset = '0px';
});

establishedCardButton.addEventListener('click', () => {
    priceCard_established.style.transition = 'outline 0.1s ease';
    priceCard_established.style.outline = '3px solid rgb(118, 28, 255)';
    priceCard_established.style.outlineOffset = '5px';

    priceCard_starter.style.outline = '0px';
    priceCard_starter.style.outlineOffset = '0px';
});