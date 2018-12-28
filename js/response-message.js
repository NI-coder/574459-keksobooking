'use strict';

(function () {
  var popupMessage;

  // найдём шаблон сообщения об успехе создания объявления
  var successMessageTemplate = document.querySelector('#success').content.querySelector('.success');
  // найдём шаблон сообщения об ошибке создания объявления
  var errorMessageTemplate = document.querySelector('#error').content.querySelector('.error');

  // функция удаления попапа (ответа на запрос)
  var deletePopupMessage = function () {
    popupMessage.remove();
    popupMessage = null;
    document.removeEventListener('keydown', onPopupMessageEscPress);
    document.removeEventListener('click', onWindowClick);
  };

  // обработчик удаления попапа (ответа на запрос) по Esc
  var onPopupMessageEscPress = function (evt) {
    if (evt.keyCode === window.utils.ESC_KEYCODE) {
      deletePopupMessage();
    }
  };

  // обработчик удаления попапа (ответа на запрос) по клику
  var onWindowClick = function (evt) {
    evt.preventDefault();
    if (popupMessage) {
      deletePopupMessage();
    }
  };

  // обработчик успешной отправки формы на сервер
  var onSuccessSending = function () {
    window.rollback.resetPage();
    popupMessage = successMessageTemplate.cloneNode(true);
    window.utils.adForm.appendChild(popupMessage);
    document.addEventListener('keydown', onPopupMessageEscPress);
    document.addEventListener('click', onWindowClick);
  };

  // обработчик ошибки запроса
  var onFailRequest = function (message) {
    errorMessageTemplate.children[0].innerHTML = message;
    popupMessage = errorMessageTemplate.cloneNode(true);
    window.utils.map.appendChild(popupMessage);
    document.addEventListener('keydown', onPopupMessageEscPress);
    document.addEventListener('click', onWindowClick);
  };

  window.responseMessage = {
    onSuccessSending: onSuccessSending,
    onFailRequest: onFailRequest
  };
})();
