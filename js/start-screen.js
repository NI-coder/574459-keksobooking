'use strict';

(function () {
  var mainPinFadePosition = {
    x: Math.round(window.utils.MAIN_PIN_X + window.utils.MAIN_PIN_WIDTH / 2),
    y: Math.round(window.utils.MAIN_PIN_Y + window.utils.MAIN_PIN_HEIGHT / 2)
  };

  // функция блокировки доступа к интерактивным элементам
  var makeFieldsDisable = function (form) {
    Array.from(form.children).forEach(function (field) {
      field.disabled = 'disabled';
    });
  };

  // установим параметры начального неактивного состояния
  var setDefaultMode = function () {
    // заблокируем доступ к полям в форме подачи объявления и в фильтре объявлений
    makeFieldsDisable(window.utils.adForm);
    makeFieldsDisable(window.utils.filterForm);

    // поле адреса и начальные координаты дефолтной метки
    window.utils.addressInputField.readOnly = true;
    window.utils.addressInputField.value = mainPinFadePosition.x + ', ' + mainPinFadePosition.y;

    window.utils.mainPin.draggable = 'true';
  };
  setDefaultMode();

  window.startScreen = {
    setDefaultMode: setDefaultMode
  };
})();
