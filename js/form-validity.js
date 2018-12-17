'use strict';

(function () {
  var addFieldsListener = function () {
    // установим валидность значений и сообщим об ошибке ввода в поле заголовка объявления
    window.utils.titleField.addEventListener('change', window.form.onTitleFieldChange);

    // установим зависимость минимальной цены от типа жилья
    window.utils.typeField.addEventListener('change', window.form.onTypeFieldChange);

    // установим валидность значений и сообщим об ошибке ввода в поле цены
    window.utils.priceField.addEventListener('change', window.form.onPriceFieldChange);

    // синхронизируем поля времени заезда и выезда
    window.utils.timeInField.addEventListener('change', window.form.onTimeInFieldChange);
    window.utils.timeOutField.addEventListener('change', window.form.onTimeOutFieldChange);

    // установим валидность значений поля количества гостей, синхронизировав его с полем выбора количества комнат, и сообщим об ошибке ввода в поле гостей
    window.utils.roomsField.addEventListener('change', window.form.onGuestAndRoomsChange);
    window.utils.guestsField.addEventListener('change', window.form.onGuestAndRoomsChange);
  };

  window.formValidity = {
    addFieldsListener: addFieldsListener
  };
})();
