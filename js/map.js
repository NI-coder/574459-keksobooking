'use strict';

var MIN_X = 50; // произвольные данные, надо менять
var MIN_Y = 130;
var MAX_X = 1150; // произвольные данные, надо менять
var MAX_Y = 630;
var OFFER_CARDS_QUANTITY = 8;
var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;
var MIN_PRICE = 1000;
var MAX_PRICE = 1000000;
var MAX_ROOMS_NUMBER = 5;
var MAX_GUESTS_NUMBER = 10;

// генератор случайных чисел в диапазоне
var getRandomNum = function (min, max) {
  return Math.round(Math.random() * (max - min)) + min;
};

// координаты метки локации
//var getLocation = function () {
//  var x = getRandomNum(MIN_X, MAX_X);
//  var y = getRandomNum(MIN_Y, MAX_Y);
//  var location = [x, y];
//  return location;
//};

// массив адресов аватарок
var avatars = ['img/avatars/user01.png', 'img/avatars/user02.png', 'img/avatars/user03.png', 'img/avatars/user04.png', 'img/avatars/user05.png', 'img/avatars/user06.png', 'img/avatars/user07.png', 'img/avatars/user08.png'];

// массив названий объявлений
var titles = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец', 'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик', 'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];

// тип помещения
var types = ['palace', 'flat', 'house', 'bungalo'];
var getTypeOfAccomodation = function (j) {
  if (j < 2) {
    var currentType = types[1];
  }
  if (j >= 2 && j < 4) {
    currentType = types[0];
  }
  if (j >= 4 && j < 6) {
    currentType = types[2];
  }
  if (j >= 6) {
    currentType = types[3];
  }
  return currentType;
};

// дополнительные фичи
var featuresArr = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var getFeatures = function (features) {
  var featuresNew = [];
  featuresNew.length = getRandomNum(1, 6);
  for (var k = 0; k < featuresNew.length; k++) {
    featuresNew[k] = features[k];
  }
  return featuresNew;
};

// фотографии в случайном порядке
var photosArr = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

var getShuffledPhotos = function (photosList) {
  var shuffledPhotos = [];
  for (var i = 0; i < photosList.length; i++) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = photosList[i];
    photosList[i] = photosList[j];
    photosList[j] = tmp;
  }
  for (i = 0; i < photosList.length; i++) {
    shuffledPhotos[i] = photosList[i];
  }
  return shuffledPhotos;
};

// создаём массив объектов - карточек объявлений
var getOfferCardsList = function () {
  var offerCardsList = [];

  for (var i = 0; i < OFFER_CARDS_QUANTITY; i++) {
//    var currentLocation = getLocation();
    offerCardsList[i] = {
      author: {
        avatar: avatars[i]
      },
      location: {
        x: getRandomNum(MIN_X, MAX_X) - PIN_WIDTH / 2,
        y: getRandomNum(MIN_Y, MAX_Y) - PIN_HEIGHT
      },
      offer: {
        title: titles[i],
        address: location['x'] + ', ' + location['y'],
        price: getRandomNum(MIN_PRICE, MAX_PRICE),
        type: getTypeOfAccomodation(i),
        rooms: getRandomNum(1, MAX_ROOMS_NUMBER),
        guests: getRandomNum(1, MAX_GUESTS_NUMBER),
        checkin: getRandomNum(12, 14) + ':00',
        checkout: getRandomNum(12, 14) + ':00',
        features: getFeatures(featuresArr),
        description: "",
        photos: getShuffledPhotos(photosArr)
      }
    };
  }
  return offerCardsList;
};
var offerCardsList = getOfferCardsList();

// найдём основной блок разметки, в который будем вносить изменения
var map = document.querySelector('.map');
map.classList.remove('map--faded');

// найдём блок, в который будем вставлять метки
var mapPinsBlock = document.querySelector('.map__pins');

// найдём шаблон метки
var mapPinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

// создадим виртуальный контейнер для временного хранения создаваемых меток
var fragment = document.createDocumentFragment();

// создадим метки
for (var i = 0; i < OFFER_CARDS_QUANTITY; i++) {
  var mapPinElement = mapPinTemplate.cloneNode(true);
  mapPinElement.style = 'left:' + offerCardsList[i].location['x'] + 'px; top:' + offerCardsList[i].location['y'] + 'px;';
  var offerAuthor = offerCardsList[i].author;
  var mapPinImage = mapPinElement.querySelector('img');
  mapPinImage.src = offerAuthor.avatar;
  mapPinImage.alt = offerCardsList[i].offer.title;
  fragment.appendChild(mapPinElement);
}

// выгружаем разметку меток из шаблона в основную разметку
mapPinsBlock.appendChild(fragment);

// найдём блок, перед которым будем вставлять карточки объявлений
var mapFiltersContainer = document.querySelector('.map__filters-container');

// найдём шаблон карточки объявлений
var mapCardTemplate = document.querySelector('#card').content.querySelector('.map__card');

// создадим DOM-элементы объявлений
for (i = 0; i < OFFER_CARDS_QUANTITY; i++) {
  var mapCardElement = mapCardTemplate.cloneNode(true);
  mapCardElement.classList.add('visually-hidden');

  var offerTitle = mapCardElement.querySelector('.popup__title');
  offerTitle.textContent = offerCardsList[i].offer.title;

  var offerAddress = mapCardElement.querySelector('.popup__text--address');
  offerAddress.textContent = offerCardsList[i].offer.address;

  var offerPrice = mapCardElement.querySelector('.popup__text--price');
  offerPrice.textContent = offerCardsList[i].offer.price + ' ₽/ночь';

  var offerType = mapCardElement.querySelector('.popup__type');
  if (offerCardsList[i].offer.type === 'flat') {
    offerType.textContent = 'Квартира';
  }
  if (offerCardsList[i].offer.type === 'bungalo') {
    offerType.textContent = 'Бунгало';
  }
  if (offerCardsList[i].offer.type === 'house') {
    offerType.textContent = 'Дом';
  }
  if (offerCardsList[i].offer.type === 'palace') {
    offerType.textContent = 'Дворец';
  }

  var offerСapacity = mapCardElement.querySelector('.popup__text--capacity');
  offerСapacity.textContent = offerCardsList[i].offer.rooms + ' комнаты для ' + offerCardsList[i].offer.guests + ' гостей';

  var offerTime = mapCardElement.querySelector('.popup__text--time');
  offerTime.textContent = 'Заезд после ' + offerCardsList[i].offer.checkin + ', выезд до ' + offerCardsList[i].offer.checkout;

  var offerFeatures = mapCardElement.querySelector('.popup__features');
  for (var j = 0; j < offerFeatures.children.length; j++) {
    if (j < offerCardsList[i].offer.features.length) {
      offerFeatures.children[j].textContent = offerCardsList[i].offer.features[j];
    } else {
      offerFeatures.children[j].classList.add('visually-hidden');
    }
  }

  var offerDescription = mapCardElement.querySelector('.popup__description');
  offerDescription.textContent = offerCardsList[i].offer.description;

  var offerPhotos = mapCardElement.querySelector('.popup__photos');
  for (j = 0; j < offerCardsList[i].offer.photos.length - 1; j++) {
    var newPhoto = offerPhotos.children[0].cloneNode(true);
    offerPhotos.appendChild(newPhoto);
  }
  for (j = 0; j < offerCardsList[i].offer.photos.length; j++) {
    offerPhotos.children[j].src = offerCardsList[i].offer.photos[j];
  }

  var offerAvatar = mapCardElement.querySelector('.popup__avatar');
  offerAvatar.src = offerCardsList[i].author.avatar;

  fragment.appendChild(mapCardElement);
}

// выгружаем разметку объявлений из шаблона в необходимое место в основной разметке
map.insertBefore(fragment, mapFiltersContainer);

var mapPin = map.querySelectorAll('.map__pin');
var mapPinMain = map.querySelector('.map__pin--main');
var mapCard = map.querySelectorAll('.map__card');
// var mapCardClose = map.querySelectorAll('.popup__close');

for (i = 0; i < mapPin.length; i++) {
  mapPin[2].addEventListener('click', function (evt) {
  evt.preventDefault();
  mapPin[2].classList.add('map__pin--active');
  mapCard[2].classList.remove('visually-hidden');
}
