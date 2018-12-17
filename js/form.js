'use strict';

(function () {
  var PRICE_FIELD_MIN = {
    bungalo: 0,
    flat: 1000,
    house: 5000,
    palace: 10000
  };

  // Введём словарь, описывающий допустимые значения поля количества гостей, зависяших от значений поля количества комнат
  var roomsToGuestsAmount = {
    1: {
      permitted: ['1'],
      textError: 'только для одного гостя'
    },
    2: {
      permitted: ['1', '2'],
      textError: 'для двух и менее гостей'
    },
    3: {
      permitted: ['1', '2', '3'],
      textError: 'для трёх и менее гостей'
    },
    100: {
      permitted: ['0'],
      textError: 'не для гостей'
    }
  };

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

  // функция синхронизации изменений в двух полях формы
  var setFormFieldsCoherence = function (field1, field2) {
    var selectedField1Index = field1.selectedIndex;
    if (field1.children[selectedField1Index]) {
      field2.children[selectedField1Index].selected = true;
    }
  };

  // Обработчик ошибки ввода в поле заголовка
  var onTitleFieldChange = function () {
    if (titleField.validity.tooShort) {
      titleField.setCustomValidity('Длина заголовка должна быть более 30 символов');
    } else if (titleField.validity.tooLong) {
      titleField.setCustomValidity('Длина заголовка не должна превышать 100 символов');
    } else if (titleField.validity.valueMissing) {
      titleField.setCustomValidity('Обязательное поле');
    } else {
      titleField.setCustomValidity('');
    }
  };

  // установим зависимость минимальной цены от типа жилья
  var onTypeFieldChange = function () {
    var selectedTypeIndex = typeField.selectedIndex;
    if (typeField.children[selectedTypeIndex]) {
      var housingType = typeField.children[selectedTypeIndex].value;
      priceField.min = PRICE_FIELD_MIN[housingType];
      priceField.placeholder = PRICE_FIELD_MIN[housingType];
    }
    onPriceFieldChange();
  };

  // Обработчик ошибки ввода в поле цены
  var onPriceFieldChange = function () {
    if (priceField.validity.rangeUnderflow) {
      priceField.setCustomValidity('Цена должна быть больше указанной  минимальной цены, соответствующей типу жилья');
    } else if (priceField.validity.rangeOverflow) {
      priceField.setCustomValidity('Цена не должна превышать 1 000 000 руб.');
    } else if (priceField.validity.valueMissing) {
      priceField.setCustomValidity('Обязательное поле');
    } else {
      priceField.setCustomValidity('');
    }
  };

  // обработчик изменений в поле времени заезда
  var onTimeInFieldChange = function () {
    setFormFieldsCoherence(timeInField, timeOutField);
  };

  // обработчик изменений в поле времени выезда
  var onTimeOutFieldChange = function () {
    setFormFieldsCoherence(timeOutField, timeInField);
  };

  // Введём функцию, регистрирующую валидность поля выбора количества мест
  var getGuestsFieldValidity = function () {
    var currentGuestsFieldValidity = false;
    var textGuestsError = '';
    var selectedRoomsIndex = roomsField.selectedIndex;
    var selectedGuestsIndex = guestsField.selectedIndex;
    var selectedGuestsValue = guestsField.children[selectedGuestsIndex].value;
    if (roomsField.children[selectedRoomsIndex]) {
      // Свойство объекта roomsAmount должно быть равно выбранному значению поля комнат.
      var currentRoomsValue = roomsField.children[selectedRoomsIndex].value;
      // Значение поля количества мест должно входить в массив значений свойства объекта roomsAmount.
      var validityIndex = roomsToGuestsAmount[currentRoomsValue].permitted.indexOf(selectedGuestsValue);
      // Если значение отсутствует в соответствующем массиве объекта roomsAmount, то validityIndex будет равен -1, а само значение недопустимо
      if (validityIndex !== -1) {
        currentGuestsFieldValidity = true;
      } else {
        textGuestsError = roomsToGuestsAmount[currentRoomsValue].textError;
      }
    }

    return {
      validityStatus: currentGuestsFieldValidity,
      textError: textGuestsError
    };
  };

  // Обработчик изменений в полях комнат и гостей сообщает об ошибке ввода при её наличии
  var onGuestAndRoomsChange = function () {
    var guestsFieldValidity = getGuestsFieldValidity();
    if (!guestsFieldValidity.validityStatus) {
      guestsField.setCustomValidity(guestsFieldValidity.textError);
    } else {
      guestsField.setCustomValidity('');
    }
  };

  window.form = {
    onTitleFieldChange: onTitleFieldChange,
    onTypeFieldChange: onTypeFieldChange,
    onPriceFieldChange: onPriceFieldChange,
    onTimeInFieldChange: onTimeInFieldChange,
    onTimeOutFieldChange: onTimeOutFieldChange,
    onGuestAndRoomsChange: onGuestAndRoomsChange
  };
})();
