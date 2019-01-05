'use strict';

(function () {
  var firstRecords;
  var renderingRecords;
  var offerPins;
  var shownPins;
  var popupCard;

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
  var onPopupCardEscPress = function (evt) {
    if (evt.keyCode === window.utils.ESC_KEYCODE && popupCard) {
      deletePopupCard();
    }
  };

  // функция удаления попапа
  var deletePopupCard = function () {
    popupCard.remove();
    popupCard = null;
    deletePrevPinClass();
    document.removeEventListener('keydown', onPopupCardEscPress);
  };

  // очищение карты от ранее отрисованной карточки-попапа
  var clearFromPrevPopupCard = function () {
    if (popupCard) {
      deletePopupCard();
    }
  };

  // снятие блокировки с интерактивных полей
  var makeFieldsActive = function (form) {
    Array.from(form.children).forEach(function (field) {
      field.disabled = '';
    });
  };

  // обработчик успешной загрузки данных с сервера
  var onSuccessGetting = function (records) {
    // присвоим id каждому объекту входящего массива данных и сохраним массив в переменную
    records.forEach(function (record, index) {
      record.id = 'advert' + index;
    });
    firstRecords = records;

    // активируем карту
    window.utils.map.classList.remove('map--faded');

    // разблокируем фильтры и форму заполнения объявления
    makeFieldsActive(window.utils.filterForm);
    makeFieldsActive(window.utils.adForm);
    window.utils.adForm.classList.remove('ad-form--disabled');

    // выгрузим теги всех меток в основную разметку и спрячем их
    window.map.offerPins = renderPins(firstRecords);

    // получим отфильтрованные данные для отрисовки меток на карте
    renderingRecords = window.selection.getRenderingData(firstRecords);

    // покажем на карте отфильтрованные метки объявлений
    shownPins =
    showFilteredPins(renderingRecords, window.map.offerPins);

    // установим меткам обработчики кликов
    window.map.addPinsHandlers = function (pins, datas) {
      pins.forEach(function (pin, index) {
        addPinsClickHandler(pin, datas[index]);
      });
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
    var mapPins = cards.map(function (card) {
      var mapPinElement = mapPinTemplate.cloneNode(true);
      mapPinElement.id = card.id;
      mapPinElement.style.left = card.location['x'] + 'px';
      mapPinElement.style.top = card.location['y'] + 'px';
      var mapPinImage = mapPinElement.querySelector('img');
      mapPinImage.src = card.author.avatar;
      mapPinImage.alt = card.offer.title;
      mapPinElement.classList.add('visually-hidden');
      return window.utils.fragment.appendChild(mapPinElement);
    });
    // выгружаем разметку меток из шаблона в основную разметку
    mapPinsBlock.appendChild(window.utils.fragment);

    return mapPins;
  };

  // функция отрисовки на карте отфильтрованных меток объявлений
  var showFilteredPins = function (records, pins) {
    var filteredPins = [];
    records.forEach(function (pinRecord) {
      var pinById = pins.find(function (pin) {
        return pin.id === pinRecord.id;
      });
      pinById.classList.remove('visually-hidden');
      filteredPins.push(pinById);
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
      clearFromPrevPopupCard();
      pin.classList.add('map__pin--active');
      popupCard = window.popupCard.get(data);
      document.addEventListener('keydown', onPopupCardEscPress);
      var closeButton = popupCard.querySelector('.popup__close');
      closeButton.addEventListener('click', function () {
        deletePopupCard();
      });
    });
  };

  // функция новой отрисовки меток объявлений после изменения значений фильтров
  var updatePins = function () {
    clearFromPrevPopupCard();
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
    deletePopupCard: deletePopupCard,
    offerPins: offerPins,
    onMainPinDrag: onMainPinDrag,
    onFilterChange: onFilterChange
  };
})();
