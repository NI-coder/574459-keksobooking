'use strict';

(function () {
  var activePins;
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
  var onPopupEscPress = function (evt) {
    if (evt.keyCode === window.utils.ESC_KEYCODE && popupCard) {
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
      mapPins[i] = window.utils.fragment.appendChild(mapPinElement);
    }

    // выгружаем разметку меток из шаблона в основную разметку
    mapPinsBlock.appendChild(window.utils.fragment);

    return mapPins;
  };

  // функция активации карты и интерактивных полей
  var onMainPinDrag = function () {
    if (window.mainPin.dragged) {
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

      // создадим базу данных
      var dataCards = window.data.getDataList();

      // выгрузим теги меток в основную разметку
      window.map.activePins = renderPins(dataCards);

      // установим меткам обработчики кликов
      var addPinsHandlers = function (pins, datas) {
        for (i = 0; i < pins.length; i++) {
          addPinsClickHandler(pins[i], datas[i]);
        }
      };
      addPinsHandlers(window.map.activePins, dataCards);

      // навесим обработчики событий для валидации значений формы объявления
      window.formValidity.addFieldsListener();

      // дадим возможность возвратить страницу к первоначальному дефолтному состоянию
      window.utils.pageResetButton.addEventListener('click', window.reset.resetPage);

      // удалим обработчик клика по стартовой метке
      window.utils.mainPin.removeEventListener('mouseup', onMainPinDrag);
      // сбросим состояние dragged у дефолтной метки
      window.mainPin.dragged = false;
    }
  };

  // активируем карту и интерактивные поля
  window.utils.mainPin.addEventListener('mouseup', onMainPinDrag);

  // клик по метке связывает данные с получением и отрисовкой карточки объявления
  var addPinsClickHandler = function (pin, data) {
    pin.addEventListener('click', function () {
      deletePrevPinClass();
      clearFromPrevPopup();
      pin.classList.add('map__pin--active');
      popupCard = window.popupCard.getPopupCard(data);
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
