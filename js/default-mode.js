'use strict';

(function () {
  var MAIN_PIN_FADE_POSITION = {
    x: Math.round(window.utils.MAIN_PIN_X + window.utils.MAIN_PIN_WIDTH / 2),
    y: Math.round(window.utils.MAIN_PIN_Y + window.utils.MAIN_PIN_HEIGHT / 2)
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
    setElementsDisable(window.utils.adForm);
    setElementsDisable(window.utils.filterForm);

    // поле адреса и начальные координаты дефолтной метки
    window.utils.addressInputField.readOnly = true;
    window.utils.addressInputField.value = MAIN_PIN_FADE_POSITION.x + ', ' + MAIN_PIN_FADE_POSITION.y;

    window.utils.mainPin.draggable = 'true';
  };
  setDefaultMode();

  window.defaultMode = {
    setDefaultMode: setDefaultMode
  };
})();
