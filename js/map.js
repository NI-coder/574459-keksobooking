'use strict';

var OFFER_CARDS_QUANTITY = 8;
var DEFAULT_PIN_WIDTH = 65;
var DEFAULT_PIN_HEIGHT = 65;
var DEFAULT_PIN_ACTIVE_HEIGHT = DEFAULT_PIN_HEIGHT + 16;
var DEFAULT_PIN_X = 570;
var DEFAULT_PIN_Y = 375;
var DEFAULT_PIN_FADE_POSITION = {
  x: Math.round(DEFAULT_PIN_X + DEFAULT_PIN_WIDTH / 2),
  y: Math.round(DEFAULT_PIN_Y + DEFAULT_PIN_HEIGHT / 2)
};
var DEFAULT_PIN_START_POSITION = {
  x: Math.round(DEFAULT_PIN_X + DEFAULT_PIN_WIDTH / 2),
  y: Math.round(DEFAULT_PIN_Y + DEFAULT_PIN_ACTIVE_HEIGHT)
};
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
var ESC_KEYCODE = 27;

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

// найдём основной блок разметки, в который будем вносить изменения
var map = document.querySelector('.map');

// найдём блок, в который будем вставлять метки
var mapPinsBlock = document.querySelector('.map__pins');

// найдём шаблон метки
var mapPinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

// найдём метку по умолчанию, активирующую карту
var defaultPin = mapPinsBlock.querySelector('.map__pin--main');

// найдём блок, перед которым будем вставлять карточки объявлений
var mapFiltersContainer = document.querySelector('.map__filters-container');

// найдём шаблон карточки объявлений
var mapCardTemplate = document.querySelector('#card').content.querySelector('.map__card');

// найдём форму фильтрации объявлений
var filterForm = document.querySelector('.map__filters');

// найдём форму объявления
var adForm = document.querySelector('.ad-form');

// найдём поле адреса
var addressInput = document.querySelector('#address');

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

var popupCard;

// функция удаления попапа по Esc
var onPopupEscPress = function (evt) {
  if (evt.keyCode === ESC_KEYCODE && popupCard) {
    deletePopup();
  }
};

// функция удаления попапа
var deletePopup = function () {
  popupCard.parentElement.removeChild(popupCard);
  popupCard = null;
  document.removeEventListener('keydown', onPopupEscPress);
};

// очищение карты от ранее отрисованной карточки-попапа
var clearFromEarlierPopup = function () {
  var popup = map.querySelector('.map__card');
  if (popup) {
    deletePopup();
  }
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

// создадим виртуальный контейнер для временного хранения создаваемых меток
var fragment = document.createDocumentFragment();

// создадим метки на основе массива входных данных
var renderPins = function (cards) {
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

  return mapPinsBlock.querySelectorAll('.map__pin:not(.map__pin--main)');
};

// подготовим детали текста о вместимости предлагаемой недвижимости
var getСapacityData = function (roomsNum, guestsNum) {
  var roomsRus = 'комнаты';
  var guestsRus = guestsNum === 1 ? 'гостя' : 'гостей';
  if (roomsNum === 1) {
    roomsRus = 'комната';
  }
  if (roomsNum >= 5) {
    roomsRus = 'комнат';
  }
  return {
    roomsNum: roomsRus,
    guestsNum: guestsRus
  };
};

// сформируем DOM-элемент списка дополнительных характеристик размещения
var setOfferFeatures = function (featureItems, offerCard) {
  featureItems.innerHTML = '';
  if (offerCard.offer.features.length > 0) {
    for (var i = 0; i < offerCard.offer.features.length; i++) {
      var featureItem = document.createElement('li');
      featureItem.className = 'popup__feature ' + FEATURES_CLASSES[offerCard.offer.features[i]];
      featureItems.appendChild(featureItem);
    }
  }
};

// сформируем DOM-элемент списка фотографий
var setOfferPhotos = function (photos, offerCard) {
  if (offerCard.offer.photos.length > 0) {
    for (var j = 0; j < offerCard.offer.photos.length; j++) {
      if (j < offerCard.offer.photos.length - 1) {
        var newPhoto = photos.children[0].cloneNode(true);
        photos.appendChild(newPhoto);
      }
      photos.children[j].src = offerCard.offer.photos[j];
    }
  }
};

// получение DOM-элемента карточки объявления
var getPopupCard = function (card) {
  var mapCardElement = mapCardTemplate.cloneNode(true);
  var offerTitle = mapCardElement.querySelector('.popup__title');
  var offerAddress = mapCardElement.querySelector('.popup__text--address');
  var offerPrice = mapCardElement.querySelector('.popup__text--price');
  var offerType = mapCardElement.querySelector('.popup__type');
  var offerСapacity = mapCardElement.querySelector('.popup__text--capacity');
  var capacityDatas = getСapacityData(card.offer.rooms, card.offer.guests);
  var offerTime = mapCardElement.querySelector('.popup__text--time');
  var offerFeatures = mapCardElement.querySelector('.popup__features');
  var offerDescription = mapCardElement.querySelector('.popup__description');
  var offerPhotos = mapCardElement.querySelector('.popup__photos');
  var offerAvatar = mapCardElement.querySelector('.popup__avatar');

  offerTitle.textContent = card.offer.title;
  offerAddress.textContent = card.offer.address;
  offerPrice.textContent = card.offer.price + ' ₽/ночь';
  offerType.textContent = TYPES_RUS[card.offer.type];
  offerСapacity.textContent = card.offer.rooms + ' ' + capacityDatas.roomsNum + ' для ' + card.offer.guests + ' ' + capacityDatas.guestsNum;
  offerTime.textContent = 'Заезд после ' + card.offer.checkin + ', выезд до ' + card.offer.checkout;
  setOfferFeatures(offerFeatures, card);
  offerDescription.textContent = card.offer.description;
  setOfferPhotos(offerPhotos, card);
  offerAvatar.src = card.author.avatar;

  // загрузим сформированную разметку во временное хранилище
  var popupInFragment = fragment.appendChild(mapCardElement);

  // выгружаем разметку объявления из временного хранилища в необходимое место в основной разметке
  return map.insertBefore(popupInFragment, mapFiltersContainer);
};

// установим параметры начального неактивного состояния
var setDefaultMode = function () {
  // заблокируем доступ к полям в форме подачи объявления
  var blockAdd = function (add) {
    for (var i = 0; i < add.children.length; i++) {
      add.children[i].disabled = 'disabled';
    }
  };

  // заблокируем доступ к полям в форме фильтрации
  var blockFilter = function (filter) {
    for (var i = 0; i < filter.children.length; i++) {
      filter.children[i].disabled = 'disabled';
    }
  };

  blockAdd(adForm);
  blockFilter(filterForm);

  // поле адреса и начальные координаты дефолтной метки
  addressInput.disabled = 'readonly';
  addressInput.value = DEFAULT_PIN_FADE_POSITION.x + ', ' + DEFAULT_PIN_FADE_POSITION.y;

  defaultPin.draggable = 'true';
};
setDefaultMode();

// функция активации карты и интерактивных полей
var onDefaultPinDrag = function () {
  // активируем карту
  map.classList.remove('map--faded');

  // разблокируем фильтры и форму заполнения объявления
  for (var i = 0; i < filterForm.children.length; i++) {
    filterForm.children[i].disabled = '';
  }
  adForm.classList.remove('ad-form--disabled');
  for (i = 0; i < adForm.children.length; i++) {
    adForm.children[i].disabled = '';
  }

  // установим начальные координаты дефолтной активированной метки
  addressInput.value = DEFAULT_PIN_START_POSITION.x + ', ' + DEFAULT_PIN_START_POSITION.y;

  // создадим базу данных
  var dataCards = getDataList();

  // выгрузим теги меток в основную разметку
  var activePins = renderPins(dataCards);

  // установим меткам обработчики кликов
  var addPinsHandlers = function (pins, datas) {
    for (i = 0; i < pins.length; i++) {
      addPinsClickHandler(pins[i], datas[i]);
    }
  };
  addPinsHandlers(activePins, dataCards);

  // удалим обработчик клика по стартовой метке
  defaultPin.removeEventListener('mouseup', onDefaultPinDrag);
};

// активируем карту и интерактивные поля
defaultPin.addEventListener('mouseup', onDefaultPinDrag);

// клик по метке связывает данные с получением и отрисовкой карточки объявления
var addPinsClickHandler = function (pin, data) {
  pin.addEventListener('click', function () {
    clearFromEarlierPopup();
    popupCard = getPopupCard(data);
    document.addEventListener('keydown', onPopupEscPress);
    var closeButton = popupCard.querySelector('.popup__close');
    closeButton.addEventListener('click', function () {
      deletePopup(popupCard);
    });
  });
};
