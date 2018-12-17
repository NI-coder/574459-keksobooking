'use strict';
(function () {
  var OFFER_CARDS_QUANTITY = 8;
  var PIN_WIDTH = 50;
  var PIN_HEIGHT = 70;
  var MIN_X = 0;
  var MIN_Y = 130;
  var MAX_X = 1200;
  var MAX_Y = 630;
  var MIN_PRICE = 1000;
  var MAX_PRICE = 1000000;
  var MAX_ROOMS_NUMBER = 5;
  var MAX_GUESTS_NUMBER = 10;

  // адреса аватарок
  var avatars = ['img/avatars/user01.png', 'img/avatars/user02.png', 'img/avatars/user03.png', 'img/avatars/user04.png', 'img/avatars/user05.png', 'img/avatars/user06.png', 'img/avatars/user07.png', 'img/avatars/user08.png'];

  // названия объявлений
  var titles = ['Большая уютная квартира', 'Маленькая неуютная квартира', 'Огромный прекрасный дворец', 'Маленький ужасный дворец', 'Красивый гостевой домик', 'Некрасивый негостеприимный домик', 'Уютное бунгало далеко от моря', 'Неуютное бунгало по колено в воде'];

  // типы помещения
  var types = ['palace', 'flat', 'house', 'bungalo'];

  // дополнительные фичи
  var features = ['wifi', 'dishwasher', 'parking', 'washer', 'elevator', 'conditioner'];

  // фотографии
  var initialPhotos = [
    'http://o0.github.io/assets/images/tokyo/hotel1.jpg', 'http://o0.github.io/assets/images/tokyo/hotel2.jpg', 'http://o0.github.io/assets/images/tokyo/hotel3.jpg'
  ];

  // генератор случайных чисел в диапазоне
  var getRandomNum = function (min, max) {
    var rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
  };

  // выбор случайного элемента массива
  var getRandElement = function (elements) {
    var randElementIndex = getRandomNum(0, elements.length - 1);
    var currentElement = elements[randElementIndex];
    return currentElement;
  };

  // выбор случайного количества элементов массива
  var getNumberOfElements = function (elements) {
    var arraysMaxLength = getRandomNum(1, elements.length);
    var newElements = elements.slice(0, arraysMaxLength);
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

  // создаём массив объектов - входных данных для карточек объявлений
  var getDataList = function () {
    var dataCards = [];
    for (var i = 0; i < OFFER_CARDS_QUANTITY; i++) {
      var currentLocation = getLocation();
      dataCards[i] = {
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
          features: getNumberOfElements(features),
          description: '',
          photos: getShuffledArray(initialPhotos)
        }
      };
    }
    return dataCards;
  };

  window.getDataList = getDataList;
})();
