'use strict';

(function () {
  var ESC_KEYCODE = 27;
  var MIN_X = 0;
  var MIN_Y = 130;
  var MAX_X = 1200;
  var MAX_Y = 630;
  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 65;
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
  var mainPin = document.querySelector('.map__pin--main');
  // найдём форму объявления
  var adForm = document.querySelector('.ad-form');
  // найдём поле адреса в форме объявления
  var addressInputField = adForm.querySelector('#address');
  // найдём форму фильтрации объявлений
  var filterForm = document.querySelector('.map__filters');
  // создадим виртуальный контейнер для временного хранения создаваемых элементов
  var fragment = document.createDocumentFragment();
  // Найдём кнопку очистки формы и возврата к первоначальному неактивному состоянию страницы
  var pageResetButton = adForm.querySelector('.ad-form__reset');
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

  window.utils = {
    MIN_X: MIN_X,
    MIN_Y: MIN_Y,
    MAX_X: MAX_X,
    MAX_Y: MAX_Y,
    MAIN_PIN_WIDTH: MAIN_PIN_WIDTH,
    MAIN_PIN_HEIGHT: MAIN_PIN_HEIGHT,
    MAIN_PIN_X: MAIN_PIN_X,
    MAIN_PIN_Y: MAIN_PIN_Y,
    PRICE_FIELD_MIN: PRICE_FIELD_MIN,
    ESC_KEYCODE: ESC_KEYCODE,
    map: map,
    mainPin: mainPin,
    adForm: adForm,
    addressInputField: addressInputField,
    filterForm: filterForm,
    fragment: fragment,
    pageResetButton: pageResetButton,
    titleField: titleField,
    typeField: typeField,
    priceField: priceField,
    timeInField: timeInField,
    timeOutField: timeOutField,
    roomsField: roomsField,
    guestsField: guestsField
  };
})();
