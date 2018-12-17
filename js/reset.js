'use strict';

(function () {
  var MAIN_PIN_X = 570;
  var MAIN_PIN_Y = 375;
  var PRICE_FIELD_MIN = {
    bungalo: 0,
    flat: 1000,
    house: 5000,
    palace: 10000
  };

  // найдём основной блок разметки, в который будем вносить изменения
  var map = document.querySelector('.map');
  // найдём главную метку, активирующую карту
  var mainPin = map.querySelector('.map__pin--main');
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

  // функция, сбрасывающая страницу до дефолтного состояния
  var resetPage = function () {
    // дезактивируем карту
    map.classList.add('map--faded');

    // удалим теги меток из разметки
    window.map.activePins.forEach(function (pin) {
      pin.remove();
    });

    // удалим из разметки DOM-элемент отрисованной карточки объявления
    var shownCard = map.querySelector('.map__card');
    if (shownCard) {
      window.map.deletePopup();
    }

    // вернём начальные координаты дефолтной метке
    mainPin.style.left = MAIN_PIN_X + 'px';
    mainPin.style.top = MAIN_PIN_Y + 'px';

    // обнулим значения полей формы до дефолтного состояния
    adForm.reset();
    priceField.placeholder = PRICE_FIELD_MIN.flat;
    priceField.min = PRICE_FIELD_MIN.flat;


    // установим параметры начального неактивного состояния фильтрам и форме объявления
    window.setDefaultMode();
    adForm.classList.add('ad-form--disabled');

    // Сбросим обработчики прослушивания полей формы
    titleField.removeEventListener('change', window.form.onTitleFieldChange);
    typeField.removeEventListener('change', window.form.onTypeFieldChange);
    priceField.removeEventListener('change', window.form.onPriceFieldChange);
    timeInField.removeEventListener('change', window.form.onTimeInFieldChange);
    timeOutField.removeEventListener('change', window.form.onTimeOutFieldChange);
    roomsField.removeEventListener('change', window.form.onGuestAndRoomsChange);
    guestsField.removeEventListener('change', window.form.onGuestAndRoomsChange);
    // удалим обработчик сброса значений до дефолта
    pageResetButton.removeEventListener('click', resetPage);

    // добавим возможность повторной активации карты и интерактивных полей
    mainPin.addEventListener('mouseup', window.map.onMainPinDrag);
  };

  window.reset = {
    resetPage: resetPage
  };
})();
