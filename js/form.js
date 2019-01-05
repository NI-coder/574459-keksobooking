'use strict';

(function () {
  // Cловарь, описывающий допустимые значения поля количества гостей, зависяших от значений поля количества комнат
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

  // функция синхронизации изменений в двух полях формы
  var setFormFieldsCoherence = function (field1, field2) {
    var selectedField1Index = field1.selectedIndex;
    if (field1.children[selectedField1Index]) {
      field2.children[selectedField1Index].selected = true;
    }
  };

  // Обработчик ошибки ввода в поле заголовка
  var onTitleFieldChange = function () {
    if (window.utils.titleField.validity.tooShort) {
      window.utils.titleField.setCustomValidity('Длина заголовка должна быть более 30 символов');
    } else if (window.utils.titleField.validity.tooLong) {
      window.utils.titleField.setCustomValidity('Длина заголовка не должна превышать 100 символов');
    } else if (window.utils.titleField.validity.valueMissing) {
      window.utils.titleField.setCustomValidity('Обязательное поле');
    } else {
      window.utils.titleField.setCustomValidity('');
    }
  };

  // установим зависимость минимальной цены от типа жилья
  var onTypeFieldChange = function () {
    var selectedTypeIndex = window.utils.typeField.selectedIndex;
    if (window.utils.typeField.children[selectedTypeIndex]) {
      var housingType = window.utils.typeField.children[selectedTypeIndex].value;
      window.utils.priceField.min = window.utils.PriceFieldMin[housingType.toUpperCase()];
      window.utils.priceField.placeholder = window.utils.PriceFieldMin[housingType.toUpperCase()];
    }
    onPriceFieldChange();
  };

  // Обработчик ошибки ввода в поле цены
  var onPriceFieldChange = function () {
    if (window.utils.priceField.validity.rangeUnderflow) {
      window.utils.priceField.setCustomValidity('Цена должна быть больше указанной  минимальной цены, соответствующей типу жилья');
    } else if (window.utils.priceField.validity.rangeOverflow) {
      window.utils.priceField.setCustomValidity('Цена не должна превышать 1 000 000 руб.');
    } else if (window.utils.priceField.validity.valueMissing) {
      window.utils.priceField.setCustomValidity('Обязательное поле');
    } else {
      window.utils.priceField.setCustomValidity('');
    }
  };

  // обработчик изменений в поле времени заезда
  var onTimeInFieldChange = function () {
    setFormFieldsCoherence(window.utils.timeInField, window.utils.timeOutField);
  };

  // обработчик изменений в поле времени выезда
  var onTimeOutFieldChange = function () {
    setFormFieldsCoherence(window.utils.timeOutField, window.utils.timeInField);
  };

  // Введём функцию, регистрирующую валидность поля выбора количества мест
  var getGuestsFieldValidity = function () {
    var currentGuestsFieldValidity = false;
    var textGuestsError = '';
    var selectedRoomsIndex = window.utils.roomsField.selectedIndex;
    var selectedGuestsIndex = window.utils.guestsField.selectedIndex;
    var selectedGuestsValue = window.utils.guestsField.children[selectedGuestsIndex].value;
    if (window.utils.roomsField.children[selectedRoomsIndex]) {
      // Свойство словаря roomsToGuestsAmount должно быть равно выбранному значению поля комнат.
      var currentRoomsValue = window.utils.roomsField.children[selectedRoomsIndex].value;
      // Значение поля количества мест должно входить в массив значений свойства словаря roomsToGuestsAmount.
      var validityIndex = roomsToGuestsAmount[currentRoomsValue].permitted.indexOf(selectedGuestsValue);
      // Если значение отсутствует в соответствующем массиве словаря roomsToGuestsAmount, то validityIndex будет равен -1, а само значение недопустимо
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
    var validityMessage = guestsFieldValidity.validityStatus ? window.utils.guestsField.setCustomValidity('') : window.utils.guestsField.setCustomValidity(guestsFieldValidity.textError);
    return validityMessage;
  };

  // при отправке формы блокируем действие по умолчанию и заменяем его AJAX запросом
  window.utils.adForm.addEventListener('submit', function (evt) {
    window.backend.uploadForm(new FormData(window.utils.adForm), window.responseMessage.onSuccessSending, window.responseMessage.onFailRequest);
    evt.preventDefault();
  });

  window.form = {
    onTitleFieldChange: onTitleFieldChange,
    onTypeFieldChange: onTypeFieldChange,
    onPriceFieldChange: onPriceFieldChange,
    onTimeInFieldChange: onTimeInFieldChange,
    onTimeOutFieldChange: onTimeOutFieldChange,
    onGuestAndRoomsChange: onGuestAndRoomsChange
  };
})();
