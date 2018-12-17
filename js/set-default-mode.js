'use strict';

(function () {
  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 65;
  var MAIN_PIN_X = 570;
  var MAIN_PIN_Y = 375;
  var MAIN_PIN_FADE_POSITION = {
    x: Math.round(MAIN_PIN_X + MAIN_PIN_WIDTH / 2),
    y: Math.round(MAIN_PIN_Y + MAIN_PIN_HEIGHT / 2)
  };

  // найдём главную метку, активирующую карту
  var mainPin = document.querySelector('.map__pin--main');
  // найдём форму объявления
  var adForm = document.querySelector('.ad-form');
  // найдём поле адреса в форме объявления
  var addressInputField = adForm.querySelector('#address');
  // найдём форму фильтрации объявлений
  var filterForm = document.querySelector('.map__filters');

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
    addressInputField.value = MAIN_PIN_FADE_POSITION.x + ', ' + MAIN_PIN_FADE_POSITION.y;

    mainPin.draggable = 'true';
  };

  window.setDefaultMode = setDefaultMode();
})();
