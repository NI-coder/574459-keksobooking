'use strict';

(function () {
  // функция, сбрасывающая страницу до дефолтного состояния
  var resetPage = function () {
    // дезактивируем карту
    window.utils.map.classList.add('map--faded');

    // удалим теги меток из разметки
    window.map.activePins.forEach(function (pin) {
      pin.remove();
    });

    // удалим из разметки DOM-элемент отрисованной карточки объявления
    var shownCard = window.utils.map.querySelector('.map__card');
    if (shownCard) {
      window.map.deletePopup();
    }

    // вернём начальные координаты дефолтной метке
    window.utils.mainPin.style.left = window.utils.MAIN_PIN_X + 'px';
    window.utils.mainPin.style.top = window.utils.MAIN_PIN_Y + 'px';

    // обнулим значения полей формы до дефолтного состояния
    window.utils.adForm.reset();
    window.utils.priceField.placeholder = window.utils.PRICE_FIELD_MIN.flat;
    window.utils.priceField.min = window.utils.PRICE_FIELD_MIN.flat;


    // установим параметры начального неактивного состояния фильтрам и форме объявления
    window.defaultMode.setDefaultMode();
    window.utils.adForm.classList.add('ad-form--disabled');

    // Сбросим обработчики прослушивания полей формы
    window.utils.titleField.removeEventListener('change', window.form.onTitleFieldChange);
    window.utils.typeField.removeEventListener('change', window.form.onTypeFieldChange);
    window.utils.priceField.removeEventListener('change', window.form.onPriceFieldChange);
    window.utils.timeInField.removeEventListener('change', window.form.onTimeInFieldChange);
    window.utils.timeOutField.removeEventListener('change', window.form.onTimeOutFieldChange);
    window.utils.roomsField.removeEventListener('change', window.form.onGuestAndRoomsChange);
    window.utils.guestsField.removeEventListener('change', window.form.onGuestAndRoomsChange);
    // удалим обработчик сброса значений до дефолта
    window.utils.pageResetButton.removeEventListener('click', resetPage);

    // добавим возможность повторной активации карты и интерактивных полей
    window.utils.mainPin.addEventListener('mouseup', window.map.onMainPinDrag);
  };

  window.reset = {
    resetPage: resetPage
  };
})();
