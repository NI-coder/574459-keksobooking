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

var activePins;
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

// Введём словарь, описывающий допустимые значения поля количества гостей, зависяших от значений поля количества комнат
var roomsToGuestsAmount = {
  1: {
    permitted: ['1'],
    textError: 'только для одного гостя'
  },
  2: {
    permitted: ['1', '2'],
    textError: 'для двух и менее гостей'
  },
  3: {
    permitted: ['1', '2', '3'],
    textError: 'для трёх и менее гостей'
  },
  100: {
    permitted: ['0'],
    textError: 'не для гостей'
  }
};

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

// найдём поле ввода заголовка объявления
var titleField = adForm.querySelector('#title');
// найдём поля ввода цены и выбора типа жилья
var typeField = adForm.querySelector('#type');
var priceField = adForm.querySelector('#price');
// найдём поля ввода времени заезда и выезда
var timeInField = adForm.querySelector('#timein');
var timeOutField = adForm.querySelector('#timeout');
// найдём поля ввода количества комнат и гостей
var roomsField = adForm.querySelector('#room_number');
var guestsField = adForm.querySelector('#capacity');
// Найдём кнопку очистки формы и возврата к первоначальному неактивному состоянию страницы
var pageResetButton = adForm.querySelector('.ad-form__reset');

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
  if (dragged) { // результат работы onMouseMove()
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
    activePins = renderPins(dataCards);

    // установим меткам обработчики кликов
    var addPinsHandlers = function (pins, datas) {
      for (i = 0; i < pins.length; i++) {
        addPinsClickHandler(pins[i], datas[i]);
      }
    };

    addPinsHandlers(activePins, dataCards);

    // сообщим об ошибке ввода в поле заголовка объявления
    titleField.addEventListener('input', onTitleFieldWrongInput);
    // titleField.addEventListener('invalid', onTitleFieldWrongInput);

    // установим зависимость минимальной цены от типа жилья
    typeField.addEventListener('change', onTypeFieldChange);

    // сообщим об ошибке ввода в поле цены
    priceField.addEventListener('input', onPriceFieldWrongInput);
    // priceField.addEventListener('invalid', onPriceFieldWrongInput);

    // синхронизируем поля времени заезда и выезда
    timeInField.addEventListener('change', onTimeInFieldChange);
    timeOutField.addEventListener('change', onTimeOutFieldChange);

    // сообщим об ошибках ввода значений в поле выбора количества гостей при изменениях в обоих полях выбора (комнат и гостей)
    roomsField.addEventListener('change', onGuestAndRoomsChange);
    guestsField.addEventListener('change', onGuestAndRoomsChange);
    // guestsField.addEventListener('invalid', onGuestAndRoomsChange);

    // возможность возвратить страницу к первоначальному дефолтному состоянию
    pageResetButton.addEventListener('click', resetPage);

    // удалим обработчик клика по стартовой метке
    defaultPin.removeEventListener('mouseup', onDefaultPinDrag);
    // сбросим состояние dragged у дефолтной метки
    dragged = false;
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

// Обработчик ошибки ввода в поле заголовка
var onTitleFieldWrongInput = function () {
  if (titleField.validity.tooShort) {
    titleField.setCustomValidity('Длина заголовка должна быть более 30 символов');
    titleField.classList.add('error__ad-form');
  } else if (titleField.validity.tooLong) {
    titleField.setCustomValidity('Длина заголовка не должна превышать 100 символов');
    titleField.classList.add('error__ad-form');
  } else if (titleField.validity.valueMissing) {
    titleField.setCustomValidity('Обязательное поле');
    titleField.classList.add('error__ad-form');
  } else {
    titleField.setCustomValidity('');
    titleField.classList.remove('error__ad-form');
  }
};

// установим зависимость минимальной цены от типа жилья
var setMinPriceFromType = function () {
  var selectedTypeIndex = typeField.selectedIndex;
  if (typeField.children[selectedTypeIndex]) {
    var housingType = typeField.children[selectedTypeIndex].value;
    priceField.min = PRICE_FIELD_MIN[housingType];
    priceField.placeholder = PRICE_FIELD_MIN[housingType];
  }
};

// Обработчик ошибки ввода в поле цены
var onPriceFieldWrongInput = function () {
  if (priceField.validity.rangeUnderflow) {
    priceField.setCustomValidity('Цена должна быть больше указанной  минимальной цены, соответствующей типу жилья');
    priceField.classList.add('error__ad-form');
  } else if (priceField.validity.rangeOverflow) {
    priceField.setCustomValidity('Цена не должна превышать 1 000 000 руб.');
    priceField.classList.add('error__ad-form');
  } else if (priceField.validity.valueMissing) {
    priceField.setCustomValidity('Обязательное поле');
    priceField.classList.add('error__ad-form');
  } else {
    priceField.setCustomValidity('');
    priceField.classList.remove('error__ad-form');
  }
};

// Обработчик изменений в поле типа жилья синхронизован с сообщениями об ошибке в поле цены
var onTypeFieldChange = function () {
  setMinPriceFromType();
//  onPriceFieldWrongInput();
};

// обработчик изменений в поле времени заезда
var onTimeInFieldChange = function () {
  var selectedTimeInIndex = timeInField.selectedIndex;
  if (timeInField.children[selectedTimeInIndex]) {
    timeOutField.children[selectedTimeInIndex].selected = true;
  }
};

// обработчик изменений в поле времени выезда
var onTimeOutFieldChange = function () {
  var selectedTimeOutIndex = timeOutField.selectedIndex;
  if (timeOutField.children[selectedTimeOutIndex]) {
    timeInField.children[selectedTimeOutIndex].selected = true;
  }
};

// Введём функцию, регистрирующую валидность поля выбора количества мест
var getGuestsFieldValidity = function () {
  var currentGuestsFieldValidity = false;
  var textGuestsError = '';
  var selectedGuestsIndex = guestsField.selectedIndex;
  var selectedGuestsValue = guestsField.children[selectedGuestsIndex].value;
  // Переберём элементы поля выбора количества комнат
  for (var i = 0; i < roomsField.children.length; i++) {
    // Если текущий элемент выбран,
    if (roomsField.children[i].selected) {
      // Свойство объекта roomsAmount должно быть равно текущему значению поля выбора комнат.
      var currentRoomsValue = roomsField.children[i].value;
      // Значение поля количества мест должно входить в массив значений свойства объекта roomsAmount.
      var validityIndex = roomsToGuestsAmount[currentRoomsValue].permitted.indexOf(selectedGuestsValue);
      // Если значение отсутствует в соответствующем массиве объекта roomsAmount, то validityIndex будет равен -1, а само значение недопустимо
      if (validityIndex !== -1) {
        currentGuestsFieldValidity = true;
      } else {
        textGuestsError = roomsToGuestsAmount[currentRoomsValue].textError;
      }
    }
  }

  return {
    validityStatus: currentGuestsFieldValidity,
    textError: textGuestsError
  };
};

// Обработчик изменений в полях комнат и гостей сообщает об ошибке ввода при её наличии
var onGuestAndRoomsChange = function () {
  var guestsFieldValidity = getGuestsFieldValidity();
  if (!guestsFieldValidity.validityStatus) {
    guestsField.setCustomValidity(guestsFieldValidity.textError);
    guestsField.classList.add('error__ad-form');
  } else {
    guestsField.setCustomValidity('');
    if (guestsField.classList.contains('error__ad-form')) {
      guestsField.classList.remove('error__ad-form');
    }
  }
};

// функция удаления обводки у невалидных полей формы
var deliteInvalidFieldOutline = function (field) {
  if (field.classList.contains('error__ad-form')) {
    field.classList.remove('error__ad-form');
  }
};

// функция, сбрасывающая страницу до дефолтного состояния
var resetPage = function () {
  // дезактивируем карту
  map.classList.add('map--faded');

  // удалим теги меток из разметки
  activePins.forEach(function (pin) {
    pin.remove();
  });

  // удалим из разметки DOM-элемент отрисованной карточки объявления
  var shownCard = map.querySelector('.map__card');
  if (shownCard) {
    deletePopup();
  }

  // вернём начальные координаты дефолтной метке
  defaultPin.style.left = DEFAULT_PIN_X + 'px';
  defaultPin.style.top = DEFAULT_PIN_Y + 'px';

  // обнулим значения полей формы до дефолтного состояния
  adForm.reset();

  // установим параметры начального неактивного состояния фильтрам и форме объявления
  setDefaultMode();
  adForm.classList.add('ad-form--disabled');

  // уберём красную обводку невалидных полей, если она есть
  deliteInvalidFieldOutline(titleField);
  deliteInvalidFieldOutline(priceField);
  deliteInvalidFieldOutline(guestsField);

  // Сбросим обработчики прослушивания полей формы
  titleField.removeEventListener('input', onTitleFieldWrongInput);
  typeField.removeEventListener('change', onTypeFieldChange);
  priceField.removeEventListener('input', onPriceFieldWrongInput);
  timeInField.removeEventListener('change', onTimeInFieldChange);
  timeOutField.removeEventListener('change', onTimeOutFieldChange);
  roomsField.removeEventListener('change', onGuestAndRoomsChange);
  guestsField.removeEventListener('change', onGuestAndRoomsChange);
  // удалим обработчик сброса значений до дефолта
  pageResetButton.removeEventListener('click', resetPage);

  // добавим возможность повторной активации карты и интерактивных полей
  defaultPin.addEventListener('mouseup', onDefaultPinDrag);
};
