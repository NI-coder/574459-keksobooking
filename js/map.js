'use strict';

(function () {
  var firstData;
  var rankedData;
  var renderingData;
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
  var onSuccessGetting = function (data) {
    // сохраним данные в переменную
    firstData = data;
    // дополним массив полученных с сервера данных рейтингом сходства с данными фильтров
    rankedData = window.selection.getRankedData(firstData);

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
    window.map.offerPins = renderPins(rankedData);

    // получим отфильтрованные данные для отрисовки меток на карте
    renderingData = window.selection.getRenderingData(rankedData);

    // покажем на карте отфильтрованные метки объявлений
    shownPins =
    showFilteredPins(renderingData, window.map.offerPins);

    // установим меткам обработчики кликов
    window.map.addPinsHandlers = function (pins, datas) {
      for (i = 0; i < pins.length; i++) {
        addPinsClickHandler(pins[i], datas[i]);
      }
    };
    window.map.addPinsHandlers(shownPins, renderingData);

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
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].offer) {
        var mapPinElement = mapPinTemplate.cloneNode(true);
        mapPinElement.style = 'left:' + cards[i].location['x'] + 'px; top:' + cards[i].location['y'] + 'px;';
        var mapPinImage = mapPinElement.querySelector('img');
        mapPinImage.src = cards[i].author.avatar;
        mapPinImage.alt = cards[i].offer.title;
        mapPins[i] = window.utils.fragment.appendChild(mapPinElement);
        // скроем все метки
        mapPins[i].classList.add('visually-hidden');
      }
    }
    // выгружаем разметку меток из шаблона в основную разметку
    mapPinsBlock.appendChild(window.utils.fragment);

    return mapPins;
  };

  // функция отрисовки на карте отфильтрованных меток объявлений
  var showFilteredPins = function (data, pins) {
    var filteredPins = [];
    data.forEach(function (pinData) {
      var pinDataX = pinData.location.x + 'px';
      var pinDataY = pinData.location.y + 'px';
      for (var i = 0; i < pins.length; i++) {
        if (pins[i].style.left === pinDataX && pins[i].style.top === pinDataY) {
          pins[i].classList.remove('visually-hidden');
          filteredPins.push(pins[i]);
        }
      }
    });
    return filteredPins;
  };

  // функция активации карты и интерактивных полей
  var onMainPinDrag = function () {
    if (window.mainPin.dragged) {
      // Загрузим массив объявлений с сервера
      window.backend.uploadData(onSuccessGetting, window.responseMessage.onFailRequest);
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
    rankedData = window.selection.getRankedData(firstData);
    renderingData = window.selection.getRenderingData(rankedData);
    shownPins =
    showFilteredPins(renderingData, window.map.offerPins);
    window.map.addPinsHandlers(shownPins, renderingData);
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
