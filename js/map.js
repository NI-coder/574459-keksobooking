'use strict';

(function () {
  var ESC_KEYCODE = 27;
  var FEATURES_CLASSES = {
    wifi: 'popup__feature--wifi',
    dishwasher: 'popup__feature--dishwasher',
    parking: 'popup__feature--parking',
    washer: 'popup__feature--washer',
    elevator: 'popup__feature--elevator',
    conditioner: 'popup__feature--conditioner'
  };
  var TYPES_RUS = {
    palace: 'Дворец',
    flat: 'Квартира',
    house: 'Дом',
    bungalo: 'Бунгало'
  };

  var activePins;
  var popupCard;

  // найдём основной блок разметки, в который будем вносить изменения
  var map = document.querySelector('.map');
  // найдём блок, в который будем вставлять метки
  var mapPinsBlock = map.querySelector('.map__pins');
  // найдём главную метку, активирующую карту
  var mainPin = map.querySelector('.map__pin--main');
  // найдём шаблон метки
  var mapPinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
  // найдём шаблон карточки объявлений
  var mapCardTemplate = document.querySelector('#card').content.querySelector('.map__card');
  // создадим виртуальный контейнер для временного хранения создаваемых элементов
  var fragment = document.createDocumentFragment();
  // найдём форму фильтрации объявлений
  var filterForm = document.querySelector('.map__filters');
  // найдём форму объявления
  var adForm = document.querySelector('.ad-form');
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
  // найдём блок, перед которым будем вставлять карточки объявлений
  var mapFiltersContainer = document.querySelector('.map__filters-container');

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

  // функция активации карты и интерактивных полей
  var onMainPinDrag = function () {
    if (window.mainPin.dragged) {
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
      var dataCards = window.getDataList();

      // выгрузим теги меток в основную разметку
      activePins = renderPins(dataCards);

      // установим меткам обработчики кликов
      var addPinsHandlers = function (pins, datas) {
        for (i = 0; i < pins.length; i++) {
          addPinsClickHandler(pins[i], datas[i]);
        }
      };

      addPinsHandlers(activePins, dataCards);

      // установим валидность значений и сообщим об ошибке ввода в поле заголовка объявления
      titleField.addEventListener('change', window.form.onTitleFieldChange);

      // установим зависимость минимальной цены от типа жилья
      typeField.addEventListener('change', window.form.onTypeFieldChange);

      // установим валидность значений и сообщим об ошибке ввода в поле цены
      priceField.addEventListener('change', window.form.onPriceFieldChange);

      // синхронизируем поля времени заезда и выезда
      timeInField.addEventListener('change', window.form.onTimeInFieldChange);
      timeOutField.addEventListener('change', window.form.onTimeOutFieldChange);

      // установим валидность значений поля количества гостей, синхронизировав его с полем выбора количества комнат, и сообщим об ошибке ввода в поле гостей
      roomsField.addEventListener('change', window.form.onGuestAndRoomsChange);
      guestsField.addEventListener('change', window.form.onGuestAndRoomsChange);

      // дадим возможность возвратить страницу к первоначальному дефолтному состоянию
      pageResetButton.addEventListener('click', window.reset.resetPage);

      // удалим обработчик клика по стартовой метке
      mainPin.removeEventListener('mouseup', onMainPinDrag);
      // сбросим состояние dragged у дефолтной метки
      window.mainPin.dragged = false;
    }
  };

  // активируем карту и интерактивные поля
  mainPin.addEventListener('mouseup', onMainPinDrag);

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

  window.map = {
    deletePopup: deletePopup,
    activePins: activePins,
    onMainPinDrag: onMainPinDrag
  };
})();
