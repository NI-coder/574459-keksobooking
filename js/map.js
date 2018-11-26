'use strict';

var OFFER_CARDS_QUANTITY = 8;
var PIN_WIDTH = 50;
var PIN_HEIGHT = 70;
var MIN_X = 0;
var MIN_Y = 130;
var MAX_X = 1150;
var MAX_Y = 630;
var MIN_PRICE = 1000;
var MAX_PRICE = 1000000;
var MAX_ROOMS_NUMBER = 5;
var MAX_GUESTS_NUMBER = 10;

// генератор случайных чисел в диапазоне
var getRandomNum = function (min, max) {
  var rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

// функция удаления всех потомков из родителя
var removeChildren = function (element) {
  while (element.lastChild) {
    element.removeChild(element.lastChild);
  }
};

// координаты метки локации
var getLocation = function () {
  var x = getRandomNum(MIN_X, MAX_X) - PIN_WIDTH / 2;
  var y = getRandomNum(MIN_Y, MAX_Y) - PIN_HEIGHT;
  var location = [x, y];
  return location;
};

// массив адресов аватарок
var avatars = ['img/avatars/user01.png', 'img/avatars/user02.png', 'img/avatars/user03.png', 'img/avatars/user04.png', 'img/avatars/user05.png', 'img/avatars/user06.png', 'img/avatars/user07.png', 'img/avatars/user08.png'];

// массив названий объявлений
var titles = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец', 'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик', 'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];

// тип помещения
var types = ['palace', 'flat', 'house', 'bungalo'];
var getTypeOfAccomodation = function () {
  var randTypeIndex = getRandomNum(0, types.length - 1);
  var currentType = types[randTypeIndex];
  return currentType;
};

// дополнительные фичи
var features = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];
var getFeatures = function (initFeatures) {
  var currentFeatures = [];
  currentFeatures.length = getRandomNum(1, 6);
  for (var k = 0; k < currentFeatures.length; k++) {
    currentFeatures[k] = initFeatures[k];
  }
  return currentFeatures;
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
  var offerCards = [];

  for (var i = 0; i < OFFER_CARDS_QUANTITY; i++) {
    var currentLocation = getLocation();
    offerCards[i] = {
      author: {
        avatar: avatars[i]
      },
      location: {
        x: currentLocation[0],
        y: currentLocation[1]
      },
      offer: {
        title: titles[i],
        address: currentLocation[0] + ', ' + currentLocation[1],
        price: getRandomNum(MIN_PRICE, MAX_PRICE),
        type: getTypeOfAccomodation(),
        rooms: getRandomNum(1, MAX_ROOMS_NUMBER),
        guests: getRandomNum(1, MAX_GUESTS_NUMBER),
        checkin: getRandomNum(12, 14) + ':00',
        checkout: getRandomNum(12, 14) + ':00',
        features: getFeatures(features),
        description: '',
        photos: getShuffledPhotos(photosArr)
      }
    };
  }
  return offerCards;
};
var offerCards = getOfferCardsList();

// найдём основной блок разметки, в который будем вносить изменения
var map = document.querySelector('.map');
map.classList.remove('map--faded');

// найдём блок, в который будем вставлять метки
var mapPinsBlock = document.querySelector('.map__pins');

// найдём шаблон метки
var mapPinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

// создадим виртуальный контейнер для временного хранения создаваемых меток
var fragment = document.createDocumentFragment();

// создадим метки на основе массива входных данных
var getMapPins = function (cards) {
  for (var i = 0; i < cards.length; i++) {
    var mapPinElement = mapPinTemplate.cloneNode(true);
    mapPinElement.style = 'left:' + cards[i].location['x'] + 'px; top:' + cards[i].location['y'] + 'px;';
    var mapPinImage = mapPinElement.querySelector('img');
    mapPinImage.src = cards[i].author.avatar;
    mapPinImage.alt = cards[i].offer.title;
    fragment.appendChild(mapPinElement);
  }

  // выгружаем разметку меток из шаблона в основную разметку
  var mapPins = mapPinsBlock.appendChild(fragment);

  return mapPins;
};
getMapPins(offerCards);

// найдём блок, перед которым будем вставлять карточки объявлений
var mapFiltersContainer = document.querySelector('.map__filters-container');

// найдём шаблон карточки объявлений
var mapCardTemplate = document.querySelector('#card').content.querySelector('.map__card');

// создадим DOM-элемент карточки объявления
var getMapOfferCard = function (card) {
  var mapCardElement = mapCardTemplate.cloneNode(true);
  // mapCardElement.classList.add('visually-hidden');

  var offerTitle = mapCardElement.querySelector('.popup__title');
  offerTitle.textContent = card.offer.title;

  var offerAddress = mapCardElement.querySelector('.popup__text--address');
  offerAddress.textContent = card.offer.address;

  var offerPrice = mapCardElement.querySelector('.popup__text--price');
  offerPrice.textContent = card.offer.price + ' ₽/ночь';

  var offerType = mapCardElement.querySelector('.popup__type');
  var typesRus = {
    palace: 'Дворец',
    flat: 'Квартира',
    house: 'Дом',
    bungalo: 'Бунгало'
  };
  offerType.textContent = typesRus[card.offer.type];

  var getOfferСapacity = function () {
    var offerСapacity = mapCardElement.querySelector('.popup__text--capacity');
    var roomsRus = 'комнаты';
    var guestsRus = 'гостей';
    if (card.offer.rooms === 1) {
      roomsRus = 'комната';
    }
    if (card.offer.rooms >= 5) {
      roomsRus = 'комнат';
    }
    if (card.offer.guests === 1) {
      guestsRus = 'гостя';
    }
    offerСapacity.textContent = card.offer.rooms + ' ' + roomsRus + ' для ' + card.offer.guests + ' ' + guestsRus;
    return offerСapacity.textContent;
  };
  getOfferСapacity();

  var offerTime = mapCardElement.querySelector('.popup__text--time');
  offerTime.textContent = 'Заезд после ' + card.offer.checkin + ', выезд до ' + card.offer.checkout;

  var getOfferFeatures = function () {
    var offerFeatures = mapCardElement.querySelector('.popup__features');
    if (card.offer.features.length > 0) {
      removeChildren(offerFeatures);

      var featuresClasses = {
        wifi: 'popup__feature--wifi',
        dishwasher: 'popup__feature--dishwasher',
        parking: 'popup__feature--parking',
        washer: 'popup__feature--washer',
        elevator: 'popup__feature--elevator',
        conditioner: 'popup__feature--conditioner'
      };

      for (var i = 0; i < card.offer.features.length; i++) {
        var offerFeaturesElement = document.createElement('li');
        offerFeaturesElement.className = 'popup__feature ' + featuresClasses[card.offer.features[i]];
        offerFeatures.appendChild(offerFeaturesElement);
      }
    }
  };
  getOfferFeatures();

  var offerDescription = mapCardElement.querySelector('.popup__description');
  offerDescription.textContent = card.offer.description;

  var offerPhotos = mapCardElement.querySelector('.popup__photos');
  if (card.offer.photos.length > 0) {
    for (var j = 0; j < card.offer.photos.length - 1; j++) {
      var newPhoto = offerPhotos.children[0].cloneNode(true);
      offerPhotos.appendChild(newPhoto);
    }
    for (j = 0; j < card.offer.photos.length; j++) {
      offerPhotos.children[j].src = card.offer.photos[j];
    }
  }

  var offerAvatar = mapCardElement.querySelector('.popup__avatar');
  offerAvatar.src = card.author.avatar;

  var mapOfferCard = fragment.appendChild(mapCardElement);
  return mapOfferCard;
};
var mapOfferCard = getMapOfferCard(offerCards[0]);

// выгружаем разметку объявления из шаблона в необходимое место в основной разметке
map.insertBefore(mapOfferCard, mapFiltersContainer);

// var mapPin = map.querySelectorAll('.map__pin');
// var mapCard = map.querySelectorAll('.map__card');

// слушаем клики по меткам объявлений и открываем объявления
// for (i = 0; i < mapPin.length; i++) {
//  mapPin[i].addEventListener('click', function (evt) {
//    evt.preventDefault();
//    mapCard[i].classList.remove('visually-hidden');
//    if (!mapPin[i].classList.contains('map__pin--main')) {
//      mapPin[i].classList.add('map__pin--active');
//    }
//  });
// }

// слушаем клики по кнопке закрытия и закрываем объявление
// var mapCardClose = map.querySelectorAll('.popup__close');
// for (i = 0; i < mapCard.length; i++) {
//  mapCardClose[i].addEventListener('click', function (evt) {
//    evt.preventDefault();
//    if (!mapCard[i].classList.contains('visually-hidden')) {
//      mapCard[i].classList.add('visually-hidden');
//    }
//  });
// }
