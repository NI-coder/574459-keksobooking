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
var MIN_DEFAULT_PIN_PACE = 5;
var PRICE_FIELD_MIN = {
  bungalo: 0,
  flat: 1000,
  house: 5000,
  palace: 10000
};

var popupCard;
var startCoords = {};
var defaultPinCurrentPosition = {};
var dragged = false;

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
var addressInputField = document.querySelector('#address');

// создадим виртуальный контейнер для временного хранения создаваемых элементов
var fragment = document.createDocumentFragment();

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

// функция удаления класса у отработавшей метки
var deletePrevPinClass = function () {
  var prevPin = mapPinsBlock.querySelector('.map__pin--active');
  if (prevPin) {
    prevPin.classList.remove('map__pin--active');
  }
};

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
var clearFromPrevPopup = function () {
  if (popupCard) {
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

// создадим метки на основе массива входных данных
var renderPins = function (cards) {
  var mapPins = [];
  for (var i = 0; i < cards.length; i++) {
    var mapPinElement = mapPinTemplate.cloneNode(true);
    mapPinElement.style = 'left:' + cards[i].location['x'] + 'px; top:' + cards[i].location['y'] + 'px;';
    var mapPinImage = mapPinElement.querySelector('img');
    mapPinImage.src = cards[i].author.avatar;
    mapPinImage.alt = cards[i].offer.title;
    mapPins[i] = fragment.appendChild(mapPinElement);
  }

  // выгружаем разметку меток из шаблона в основную разметку
  mapPinsBlock.appendChild(fragment);

  return mapPins;
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

// функция блокировки доступа к интерактивным элементам
var setElementsDisable = function (elem) {
  for (var i = 0; i < elem.children.length; i++) {
    elem.children[i].disabled = 'disabled';
  }
};

// установим параметры начального неактивного состояния
var setDefaultMode = function () {
  // заблокируем доступ к полям в форме подачи объявления и в фильтре объявлений
  setElementsDisable(adForm);
  setElementsDisable(filterForm);

  // поле адреса и начальные координаты дефолтной метки
  addressInputField.readOnly = true;
  addressInputField.value = DEFAULT_PIN_FADE_POSITION.x + ', ' + DEFAULT_PIN_FADE_POSITION.y;

  defaultPin.draggable = 'true';
};
setDefaultMode();

// обработчик передвижения мыши фиксирует координаты стартовой метки в окне адреса
var onMouseMove = function (moveEvt) {
  moveEvt.preventDefault();

  var shift = {
    x: startCoords.x - moveEvt.clientX,
    y: startCoords.y - moveEvt.clientY
  };

  startCoords = {
    x: moveEvt.clientX,
    y: moveEvt.clientY
  };

  defaultPin.style.top = (defaultPin.offsetTop - shift.y) + 'px';
  defaultPin.style.left = (defaultPin.offsetLeft - shift.x) + 'px';

  // устанавливаем текущее положение стартовой метки в поле адреса
  defaultPinCurrentPosition.x = Math.round((defaultPin.offsetLeft - shift.x) + DEFAULT_PIN_WIDTH / 2);
  defaultPinCurrentPosition.y = (defaultPin.offsetTop - shift.y) + DEFAULT_PIN_ACTIVE_HEIGHT;
  addressInputField.value = defaultPinCurrentPosition.x + ', ' + defaultPinCurrentPosition.y;

  // запишем путь, пройденный стартовой меткой
  var defaultPinPaceX = defaultPinCurrentPosition.x - DEFAULT_PIN_START_POSITION.x;
  var defaultPinPaceY = defaultPinCurrentPosition.y - DEFAULT_PIN_START_POSITION.y;

  if (Math.abs(defaultPinPaceX) > MIN_DEFAULT_PIN_PACE || Math.abs(defaultPinPaceY) > MIN_DEFAULT_PIN_PACE) {
    dragged = true;
  }
};

// перетаскивание стартовой метки
defaultPin.addEventListener('mousedown', function (evt) {
  evt.preventDefault();

  startCoords = {
    x: evt.clientX,
    y: evt.clientY
  };

  var onMouseUp = function (upEvt) {
    upEvt.preventDefault();

    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
});

// функция активации карты и интерактивных полей
var onDefaultPinDrag = function () {
  if (dragged) {
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
  }
};

// активируем карту и интерактивные поля
defaultPin.addEventListener('mouseup', onDefaultPinDrag);

// клик по метке связывает данные с получением и отрисовкой карточки объявления
var addPinsClickHandler = function (pin, data) {
  pin.addEventListener('click', function () {
    deletePrevPinClass();
    clearFromPrevPopup();
    pin.classList.add('map__pin--active');
    popupCard = getPopupCard(data);
    document.addEventListener('keydown', onPopupEscPress);
    var closeButton = popupCard.querySelector('.popup__close');
    closeButton.addEventListener('click', function () {
      deletePopup();
    });
  });
};

// найдём поле ввода заголовка объявления
var titleField = adForm.querySelector('#title');

// сообщим об ошибке ввода в поле заголовка объявления
titleField.addEventListener('invalid', function () {
  if (titleField.validity.tooShort) {
    titleField.setCustomValidity('Длина заголовка должна быть более 30 символов');
  } else if (titleField.validity.tooLong) {
    titleField.setCustomValidity('Длина заголовка не должна превышать 100 символов');
  } else if (titleField.validity.valueMissing) {
    titleField.setCustomValidity('Обязательное поле');
  } else {
    titleField.setCustomValidity('');
  }
});

// найдём поля ввода цены и выбора типа жилья
var priceField = adForm.querySelector('#price');
var typeField = adForm.querySelector('#type');

// обработчик изменения значения поля типа жилья
var onTypeFieldChange = function () {
  for (var i = 0; i < typeField.children.length; i++) {
    if (typeField.children[i].selected) {
      var housingType = typeField.children[i].value;
      priceField.min = PRICE_FIELD_MIN[housingType];
      priceField.placeholder = PRICE_FIELD_MIN[housingType];
    }
  }
};
// установим зависимость минимальной цены от типа жилья
typeField.addEventListener('change', onTypeFieldChange);

// сообщим об ошибке ввода в поле цены
priceField.addEventListener('invalid', function () {
  if (priceField.validity.rangeUnderflow) {
    priceField.setCustomValidity('Цена должна быть больше указанной  минимальной цены, соответствующей типу жилья');
  } else if (priceField.validity.rangeOverflow) {
    priceField.setCustomValidity('Цена не должна превышать 1 000 000 руб.');
  } else if (priceField.validity.valueMissing) {
    priceField.setCustomValidity('Обязательное поле');
  } else {
    priceField.setCustomValidity('');
  }
});

// найдём поля ввода времени заезда и выезда
var timeInField = adForm.querySelector('#timein');
var timeOutField = adForm.querySelector('#timeout');

// обработчик изменений в поле времени заезда
var onTimeInFieldChange = function () {
  for (var i = 0; i < timeInField.children.length; i++) {
    if (timeInField.children[i].selected) {
      timeOutField.children[i].selected = true;
    }
  }
};

// обработчик изменений в поле времени выезда
var onTimeOutFieldChange = function () {
  for (var i = 0; i < timeOutField.children.length; i++) {
    if (timeOutField.children[i].selected) {
      timeInField.children[i].selected = true;
    }
  }
};

// синхронизируем полей времени заезда и выезда
timeInField.addEventListener('change', onTimeInFieldChange);
timeOutField.addEventListener('change', onTimeOutFieldChange);


// ПЕРВЫЙ ВАРИАНТ
// найдём поля ввода количества комнат и гостей
var roomsField = adForm.querySelector('#room_number');
var guestsField = adForm.querySelector('#capacity');

// функция обновления доступности всех опций поля выбора (комнат и мест)
var updateElementsAccessibility = function (field) {
  for (var i = 0; i < field.children.length; i++) {
    field.children[i].disabled = false;
  }
};

// обработчик изменений в поле ввода количества комнат
var onRoomsFieldChange = function () {
  var selectedRoomsIndex = roomsField.selectedIndex;
  var lastElementIndex = roomsField.children.length - 1;

  // обновляем доступность всех опций
  updateElementsAccessibility(guestsField);
  updateElementsAccessibility(roomsField);

  // связываем друг с другом последние опции полей ввода комнат и гостей
  if (selectedRoomsIndex === lastElementIndex) {
    guestsField.children[selectedRoomsIndex].selected = true;
    // запрещаем доступ к остальным опциям поля количества гостей
    for (var i = 0; i < lastElementIndex; i++) {
      guestsField.children[i].disabled = true;
    }
  }

  // связываем остальные опции полей количества комнат и гостей
  // Переберём элементы поля выбора комнат
  for (i = 0; i < lastElementIndex; i++) {
    // если текущий элемент поля комнат выбран, то выбираем элемент поля гостей с таким же значением
    if (roomsField.children[selectedRoomsIndex].value === guestsField.children[i].value) {
      guestsField.children[i].selected = true;
      // закрываем доступ к элементам выбора количества гостей, меньшим текущего выбранного элемента
      for (var j = i - 1; j >= 0; j--) {
        guestsField.children[j].disabled = true;
      }
      guestsField.children[lastElementIndex].disabled = true;
    }
  }
};

// обработчик изменений в поле ввода количества гостей
var onGuestsFieldChange = function () {
  var selectedGuestsIndex = guestsField.selectedIndex;
  var lastElementIndex = guestsField.children.length - 1;

  // обновляем доступность всех опций количества гостей
  updateElementsAccessibility(roomsField);

  // связываем друг с другом последние опции полей ввода комнат и гостей
  if (selectedGuestsIndex === lastElementIndex) {
    roomsField.children[selectedGuestsIndex].selected = true;
    // все опции поля количества комнат остаются доступны
    updateElementsAccessibility(roomsField);
  }
  // связываем остальные опции полей количества комнат и гостей
  // Переберём элементы поля количества гостей
  for (var i = 0; i < lastElementIndex; i++) {
    // если текущий элемент поля гостей выбран, то:
    if (guestsField.children[i].selected) {
      // объявляем вспомогательную переменную, регистрирующую минимальный индекс доступных элементов поля выбора комнат
      var minAvailableRoomsIndex = lastElementIndex - 1 - i;
      // запрещаем доступ к элементам поля комнат с меньшим индексом
      for (var j = 0; j < minAvailableRoomsIndex; j++) {
        roomsField.children[j].disabled = true;
      }
    }
  }
};

// синхронизируем поле ввода количества гостей с полем количества комнат
roomsField.addEventListener('change', onRoomsFieldChange);

// синхронизируем поле количества комнат с полем количества гостей
guestsField.addEventListener('change', onGuestsFieldChange);


//  ВТОРОЙ ВАРИАНТ
// Введём функцию, описывающую логику взаимосвязи полей ввода количества комнат и количества мест, регистрирующую валидность поля выбора количества мест
var getGuestsFieldValidity = function () {
  // введём переменную, регистрирующую валидность поля выбора количества мест
  var currentGuestsFieldValidity = false;

  // Если выбраны последние элементы, то
  var lastElementIndex = guestsField.children.length - 1;
  if (roomsField.children[lastElementIndex].selected && guestsField.children[lastElementIndex].selected) {
    currentGuestsFieldValidity = true;

    return currentGuestsFieldValidity;
  }

  // Переберём элементы поля выбора комнат
  for (var i = 0; i < lastElementIndex; i++) {
    // если текущий элемент поля комнат выбран, то
    if (roomsField.children[i].selected) {
      // введём перменную, создающую обратную зависимость начала прохождения внутреннего цикла от порядкового номера итерации внешнего цикла
      var innerCycleStarter = lastElementIndex - 1 - i;
      // Перебираем массив поля выбора количества мест без последнего[3] элемента, начиная с предпоследнего[2], при этом на каждой следующей итерации внешнего цикла будем уменьшать начало отсчёта на один элемент
      for (var j = innerCycleStarter; j < lastElementIndex && j >= 0; j++) {
        if (guestsField.children[j].selected) {
          currentGuestsFieldValidity = true;
          return currentGuestsFieldValidity;
        }
      }
    }
  }

  return currentGuestsFieldValidity;
};
var guestsFieldValidity = getGuestsFieldValidity();

// guestsField.addEventListener('change', getGuestsFieldValidity);
// roomsField.addEventListener('change', getGuestsFieldValidity);

guestsField.addEventListener('invalid', function () {
  if (!guestsFieldValidity) {
    guestsField.setCustomValidity('На 1 гостя должно приходиться не менее 1 комнаты');
  }
});
