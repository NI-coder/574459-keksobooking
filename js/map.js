'use strict';

(function () {
  var firstRecords;
  var renderingRecords;
  var offerPins;
  var shownPins;
  var popupCard;
  var addPinsHandlers;

  // найдём блок, в который будем вставлять метки
  var mapPinsBlock = window.utils.map.querySelector('.map__pins');
  // найдём шаблон метки
  var mapPinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');

  // функция удаления класса у отработавшей метки
  var deletePrevPinClass = function () {
    var prevPin = mapPinsBlock.querySelector('.map__pin--active');
    if (prevPin) {
      prevPin.classList.remove('map__pin--active');
    }
  };

  // функция удаления попапа по Esc
  var onPopupEscPress = function (evt) {
    if (evt.keyCode === window.utils.ESC_KEYCODE && popupCard) {
      deletePopup();
    }
  };

  // функция удаления попапа
  var deletePopup = function () {
    popupCard.remove();
    popupCard = null;
    deletePrevPinClass();
    document.removeEventListener('keydown', onPopupEscPress);
  };

  // очищение карты от ранее отрисованной карточки-попапа
  var clearFromPrevPopup = function () {
    if (popupCard) {
      deletePopup();
    }
  };

  // обработчик успешной загрузки данных с сервера
  var onSuccessGetting = function (records) {
    // присвоим id каждому объекту входящего массива данных и сохраним массив в переменную
    records.map(function (record, index) {
      record.id = 'advert' + index;
    });
    firstRecords = records;

    // активируем карту
    window.utils.map.classList.remove('map--faded');

    // разблокируем фильтры и форму заполнения объявления
    for (var i = 0; i < window.utils.filterForm.children.length; i++) {
      window.utils.filterForm.children[i].disabled = '';
    }
    window.utils.adForm.classList.remove('ad-form--disabled');
    for (i = 0; i < window.utils.adForm.children.length; i++) {
      window.utils.adForm.children[i].disabled = '';
    }

    // выгрузим теги всех меток в основную разметку и спрячем их
    window.map.offerPins = renderPins(firstRecords);

    // получим отфильтрованные данные для отрисовки меток на карте
    renderingRecords = window.selection.getRenderingData(firstRecords);

    // покажем на карте отфильтрованные метки объявлений
    shownPins =
    showFilteredPins(renderingRecords, window.map.offerPins);

    // установим меткам обработчики кликов
    window.map.addPinsHandlers = function (pins, datas) {
      for (i = 0; i < pins.length; i++) {
        addPinsClickHandler(pins[i], datas[i]);
      }
    };
    window.map.addPinsHandlers(shownPins, renderingRecords);

    // навесим обработчики событий для валидации значений формы объявления
    window.formValidity.addFieldsListener();

    // дадим возможность возвратить страницу к первоначальному дефолтному состоянию
    window.utils.pageResetButton.addEventListener('click', window.rollback.resetPage);

    // удалим обработчик клика по стартовой метке
    window.utils.mainPin.removeEventListener('mouseup', onMainPinDrag);
    // сбросим состояние dragged у дефолтной метки
    window.mainPin.dragged = false;
  };

  // создадим DOM-элементы меток объявлений на основе массива входных данных и скроем их
  var renderPins = function (cards) {
    var mapPins = [];
    cards.map(function (card, index) {
      if (card.offer) {
        var mapPinElement = mapPinTemplate.cloneNode(true);
        mapPinElement.id = card.id;
        mapPinElement.style = 'left:' + card.location['x'] + 'px; top:' + card.location['y'] + 'px;';
        var mapPinImage = mapPinElement.querySelector('img');
        mapPinImage.src = card.author.avatar;
        mapPinImage.alt = card.offer.title;
        mapPins[index] = window.utils.fragment.appendChild(mapPinElement);
        mapPins[index].classList.add('visually-hidden');
      }
    });
    // выгружаем разметку меток из шаблона в основную разметку
    mapPinsBlock.appendChild(window.utils.fragment);

    return mapPins;
  };

  // функция отрисовки на карте отфильтрованных меток объявлений
  var showFilteredPins = function (records, pins) {
    var filteredPins = [];
    records.forEach(function (pinRecord) {
      pins.forEach(function (pin) {
        if (pin.id === pinRecord.id) {
          pin.classList.remove('visually-hidden');
          filteredPins.push(pin);
        }
      });
    });
    return filteredPins;
  };

  // функция активации карты и интерактивных полей
  var onMainPinDrag = function () {
    if (window.mainPin.dragged) {
      // Загрузим массив объявлений с сервера
      window.backend.loadData(onSuccessGetting, window.responseMessage.onFailRequest);
    }
  };
  // создадим возможность активации карты и интерактивных полей
  window.utils.mainPin.addEventListener('mouseup', onMainPinDrag);

  // клик по метке связывает данные с получением и отрисовкой карточки объявления
  var addPinsClickHandler = function (pin, data) {
    pin.addEventListener('click', function () {
      clearFromPrevPopup();
      pin.classList.add('map__pin--active');
      popupCard = window.shownAd.getPopupCard(data);
      document.addEventListener('keydown', onPopupEscPress);
      var closeButton = popupCard.querySelector('.popup__close');
      closeButton.addEventListener('click', function () {
        deletePopup();
      });
    });
  };

  var updatePins = function () {
    clearFromPrevPopup();
    shownPins.forEach(function (pin) {
      pin.classList.add('visually-hidden');
    });
    renderingRecords = window.selection.getRenderingData(firstRecords);
    shownPins =
    showFilteredPins(renderingRecords, window.map.offerPins);
    window.map.addPinsHandlers(shownPins, renderingRecords);
  };

  // обработчик изменений в фильтрах карты
  var onFilterChange = function () {
    window.debounce(updatePins);
  };

  window.map = {
    deletePopup: deletePopup,
    offerPins: offerPins,
    addPinsHandlers: addPinsHandlers,
    onMainPinDrag: onMainPinDrag,
    onFilterChange: onFilterChange
  };
})();
