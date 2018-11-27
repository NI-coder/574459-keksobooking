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
var TYPES_RUS = {
  palace: 'Дворец',
  flat: 'Квартира',
  house: 'Дом',
  bungalo: 'Бунгало'
};
var FEATURES_CLASSES = {
  wifi: 'popup__feature--wifi',
  dishwasher: 'popup__feature--dishwasher',
  parking: 'popup__feature--parking',
  washer: 'popup__feature--washer',
  elevator: 'popup__feature--elevator',
  conditioner: 'popup__feature--conditioner'
};

// найдём основной блок разметки, в который будем вносить изменения
var map = document.querySelector('.map');

// найдём блок, в который будем вставлять метки
var mapPinsBlock = document.querySelector('.map__pins');

// найдём шаблон метки
var mapPinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

// найдём блок, перед которым будем вставлять карточки объявлений
var mapFiltersContainer = document.querySelector('.map__filters-container');

// найдём шаблон карточки объявлений
var mapCardTemplate = document.querySelector('#card').content.querySelector('.map__card');

// генератор случайных чисел в диапазоне
var getRandomNum = function (min, max) {
  var rand = min + Math.random() * (max + 1 - min);
  return Math.floor(rand);
};

// выбор случайного элемента массива
var getRandElement = function (element) {
  var randElementIndex = getRandomNum(0, element.length - 1);
  var currentElement = element[randElementIndex];
  return currentElement;
};

// генератор случайной длины массива в пределах длины первоначального массива
var getNewArrayLength = function (elements) {
  var newElements = [];
  newElements.length = getRandomNum(1, elements.length);
  for (var i = 0; i < newElements.length; i++) {
    newElements[i] = elements[i];
  }
  return newElements;
};

// генератор случайного порядка элементов в массиве
var getShuffledArray = function (elements) {
  var shuffledElements = [];
  for (var i = 0; i < elements.length; i++) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = elements[i];
    elements[i] = elements[j];
    elements[j] = tmp;
  }
  for (i = 0; i < elements.length; i++) {
    shuffledElements[i] = elements[i];
  }
  return shuffledElements;
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

// дополнительные фичи
var features = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];

// массив фотографий
var initialPhotos = [
  'http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
];

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
        type: getRandElement(types),
        rooms: getRandomNum(1, MAX_ROOMS_NUMBER),
        guests: getRandomNum(1, MAX_GUESTS_NUMBER),
        checkin: getRandomNum(12, 14) + ':00',
        checkout: getRandomNum(12, 14) + ':00',
        features: getNewArrayLength(features),
        description: '',
        photos: getShuffledArray(initialPhotos)
      }
    };
  }
  return offerCards;
};
var offerCards = getOfferCardsList();

// покажем основной блок разметки, в который будем вносить изменения
map.classList.remove('map--faded');

// создадим виртуальный контейнер для временного хранения создаваемых меток
var fragment = document.createDocumentFragment();

// создадим метки на основе массива входных данных
var renderMapPins = function (cards) {
  for (var i = 0; i < cards.length; i++) {
    var mapPinElement = mapPinTemplate.cloneNode(true);
    mapPinElement.style = 'left:' + cards[i].location['x'] + 'px; top:' + cards[i].location['y'] + 'px;';
    var mapPinImage = mapPinElement.querySelector('img');
    mapPinImage.src = cards[i].author.avatar;
    mapPinImage.alt = cards[i].offer.title;
    fragment.appendChild(mapPinElement);
  }
  // выгружаем разметку меток из шаблона в основную разметку
  mapPinsBlock.appendChild(fragment);
};
renderMapPins(offerCards);

// создадим DOM-элемент карточки объявления
var setMapOfferCard = function (card) {
  var mapCardElement = mapCardTemplate.cloneNode(true);
  var offerTitle = mapCardElement.querySelector('.popup__title');
  var offerAddress = mapCardElement.querySelector('.popup__text--address');
  var offerPrice = mapCardElement.querySelector('.popup__text--price');
  var offerType = mapCardElement.querySelector('.popup__type');
  var offerСapacity = mapCardElement.querySelector('.popup__text--capacity');
  var offerTime = mapCardElement.querySelector('.popup__text--time');
  var offerFeatures = mapCardElement.querySelector('.popup__features');
  var offerDescription = mapCardElement.querySelector('.popup__description');
  var offerPhotos = mapCardElement.querySelector('.popup__photos');
  var offerAvatar = mapCardElement.querySelector('.popup__avatar');

  // mapCardElement.classList.add('visually-hidden');
  offerTitle.textContent = card.offer.title;
  offerAddress.textContent = card.offer.address;
  offerPrice.textContent = card.offer.price + ' ₽/ночь';
  offerType.textContent = TYPES_RUS[card.offer.type];

  var setOfferСapacity = function () {
    var roomsRus = 'комнаты';
    var guestsRus = card.offer.guests === 1 ? 'гостя' : 'гостей';
    if (card.offer.rooms === 1) {
      roomsRus = 'комната';
    }
    if (card.offer.rooms >= 5) {
      roomsRus = 'комнат';
    }
    offerСapacity.textContent = card.offer.rooms + ' ' + roomsRus + ' для ' + card.offer.guests + ' ' + guestsRus;
  };
  setOfferСapacity();

  offerTime.textContent = 'Заезд после ' + card.offer.checkin + ', выезд до ' + card.offer.checkout;

  var setOfferFeatures = function () {
    offerFeatures.innerHTML = '';
    if (card.offer.features.length > 0) {
      for (var i = 0; i < card.offer.features.length; i++) {
        var offerFeaturesElement = document.createElement('li');
        offerFeaturesElement.className = 'popup__feature ' + FEATURES_CLASSES[card.offer.features[i]];
        offerFeatures.appendChild(offerFeaturesElement);
      }
    }
  };
  setOfferFeatures();

  offerDescription.textContent = card.offer.description;

  if (card.offer.photos.length > 0) {
    for (var j = 0; j < card.offer.photos.length; j++) {
      if (j < card.offer.photos.length - 1) {
        var newPhoto = offerPhotos.children[0].cloneNode(true);
        offerPhotos.appendChild(newPhoto);
      }
      offerPhotos.children[j].src = card.offer.photos[j];
    }
  }

  offerAvatar.src = card.author.avatar;

  // загрузим сформированную разметку во временное хранилище
  var mapCardInFragment = fragment.appendChild(mapCardElement);

  // выгружаем разметку объявления из временного хранилища в необходимое место в основной разметке
  map.insertBefore(mapCardInFragment, mapFiltersContainer);
};
setMapOfferCard(offerCards[0]);

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
