'use strict';

(function () {
  var popupMessage;

  // найдём тег <main>
  var main = document.querySelector('main');
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

  // функция отрисовки всплывающего сообщения
  var renderPopupMessage = function (messageTemplate) {
    popupMessage = messageTemplate.cloneNode(true);
    main.appendChild(popupMessage);
    document.addEventListener('keydown', onPopupMessageEscPress);
    document.addEventListener('click', onWindowClick);
  };

  // обработчик успешной отправки формы на сервер
  var onSuccessSending = function () {
    window.rollback.resetPage();
    renderPopupMessage(successMessageTemplate);
  };

  // обработчик ошибки запроса
  var onFailRequest = function (message) {
    errorMessageTemplate.children[0].textContent = message;
    renderPopupMessage(errorMessageTemplate);
  };

  window.responseMessage = {
    onSuccessSending: onSuccessSending,
    onFailRequest: onFailRequest
  };
})();
