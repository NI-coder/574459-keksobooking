'use strict';

(function () {
  var MIN_X = 0;
  var MAX_X = 1200;
  var MIN_Y = 130;
  var MAX_Y = 630;
  var MAIN_PIN_WIDTH = 65;
  var MAIN_PIN_HEIGHT = 65;
  var MAIN_PIN_X = 570;
  var MAIN_PIN_Y = 375;
  var MAIN_PIN_ACTIVE_HEIGHT = MAIN_PIN_HEIGHT + 16;
  var MAIN_PIN_START_POSITION = {
    x: Math.round(MAIN_PIN_X + MAIN_PIN_WIDTH / 2),
    y: Math.round(MAIN_PIN_Y + MAIN_PIN_ACTIVE_HEIGHT)
  };
  var MIN_MAIN_PIN_PACE = 5;


  var minMainPinX = MIN_X - MAIN_PIN_WIDTH / 2;
  var maxMainPinX = MAX_X - MAIN_PIN_WIDTH / 2;
  var startCoords = {};
  var mainPinCurrentPosition = {};
  var dragged = false;

  // найдём основной блок разметки, в который будем вносить изменения
  var map = document.querySelector('.map');
  // найдём главную метку, активирующую карту
  var mainPin = map.querySelector('.map__pin--main');
  // найдём поле адреса в форме объявления
  var addressInputField = document.querySelector('#address');

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

    var defaultPinCurrentCoords = {
      x: mainPin.offsetLeft - shift.x,
      y: mainPin.offsetTop - shift.y
    };

    if (defaultPinCurrentCoords.y >= MIN_Y && defaultPinCurrentCoords.y <= MAX_Y && defaultPinCurrentCoords.x >= minMainPinX && defaultPinCurrentCoords.x <= maxMainPinX) {
      mainPin.style.top = defaultPinCurrentCoords.y + 'px';
      mainPin.style.left = defaultPinCurrentCoords.x + 'px';
    }

    // устанавливаем текущее положение стартовой метки в поле адреса
    mainPinCurrentPosition.x = Math.round(defaultPinCurrentCoords.x + MAIN_PIN_WIDTH / 2);
    mainPinCurrentPosition.y = defaultPinCurrentCoords.y + MAIN_PIN_ACTIVE_HEIGHT;
    addressInputField.value = mainPinCurrentPosition.x + ', ' + mainPinCurrentPosition.y;

    // запишем путь, пройденный стартовой меткой
    var defaultPinPaceX = mainPinCurrentPosition.x - MAIN_PIN_START_POSITION.x;
    var defaultPinPaceY = mainPinCurrentPosition.y - MAIN_PIN_START_POSITION.y;

    if (Math.abs(defaultPinPaceX) > MIN_MAIN_PIN_PACE || Math.abs(defaultPinPaceY) > MIN_MAIN_PIN_PACE) {
      dragged = true;
    }
  };

  // обработчик передвижения мыши фиксирует координаты стартовой метки в окне адреса
  var onMouseMove = function (moveEvt) {
    moveEvt.preventDefault();
    renderMainPinCoords(moveEvt);
  };

  // перетаскивание стартовой метки
  mainPin.addEventListener('mousedown', function (evt) {
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
    dragged: dragged,
  };
})();
