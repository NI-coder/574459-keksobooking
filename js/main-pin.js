'use strict';

(function () {
  var MIN_MAIN_PIN_PACE = 5;

  var mainPinActiveHeight = window.utils.MAIN_PIN_HEIGHT + 16;
  var mainPinStartPosition = {
    x: Math.round(window.utils.MAIN_PIN_X + window.utils.MAIN_PIN_WIDTH / 2),
    y: Math.round(window.utils.MAIN_PIN_Y + mainPinActiveHeight)
  };
  var minMainPinX = window.utils.MIN_X - window.utils.MAIN_PIN_WIDTH / 2;
  var maxMainPinX = window.utils.MAX_X - window.utils.MAIN_PIN_WIDTH / 2;
  var startCoords = {};
  var mainPinCurrentPosition = {};
  var dragged = false;

  // функция расчёта координат стартовой метки и их записи в окно адреса
  var renderMainPinCoords = function (action) {
    var shift = {
      x: startCoords.x - action.clientX,
      y: startCoords.y - action.clientY
    };

    startCoords = {
      x: action.clientX,
      y: action.clientY
    };

    var mainPinCurrentCoords = {
      x: window.utils.mainPin.offsetLeft - shift.x,
      y: window.utils.mainPin.offsetTop - shift.y
    };

    if (mainPinCurrentCoords.y >= window.utils.MIN_Y && mainPinCurrentCoords.y <= window.utils.MAX_Y && mainPinCurrentCoords.x >= minMainPinX && mainPinCurrentCoords.x <= maxMainPinX) {
      window.utils.mainPin.style.top = mainPinCurrentCoords.y + 'px';
      window.utils.mainPin.style.left = mainPinCurrentCoords.x + 'px';
    }

    // устанавливаем текущее положение стартовой метки в поле адреса
    mainPinCurrentPosition.x = Math.round(mainPinCurrentCoords.x + window.utils.MAIN_PIN_WIDTH / 2);
    mainPinCurrentPosition.y = mainPinCurrentCoords.y + mainPinActiveHeight;
    window.utils.addressInputField.value = mainPinCurrentPosition.x + ', ' + mainPinCurrentPosition.y;

    // запишем путь, пройденный стартовой меткой
    var mainPinPaceX = mainPinCurrentPosition.x - mainPinStartPosition.x;
    var mainPinPaceY = mainPinCurrentPosition.y - mainPinStartPosition.y;

    if (Math.abs(mainPinPaceX) > MIN_MAIN_PIN_PACE || Math.abs(mainPinPaceY) > MIN_MAIN_PIN_PACE) {
      window.mainPin.dragged = true;
    }
  };

  // обработчик передвижения мыши фиксирует координаты стартовой метки в окне адреса
  var onMouseMove = function (moveEvt) {
    moveEvt.preventDefault();
    renderMainPinCoords(moveEvt);
  };

  // перетаскивание стартовой метки
  window.utils.mainPin.addEventListener('mousedown', function (evt) {
    evt.preventDefault();

    startCoords = {
      x: evt.clientX,
      y: evt.clientY
    };

    var onMouseUp = function (upEvt) {
      upEvt.preventDefault();

      // отжатие кнопки мыши дублирует расчёт и запись координат стартовой метки
      renderMainPinCoords(upEvt);

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  window.mainPin = {
    dragged: dragged
  };
})();
