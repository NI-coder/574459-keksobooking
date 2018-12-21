'use strict';
(function () {
  var xhr;
  var popupMessage;

  // найдём шаблон сообщения об успехе создания объявления
  var successMessageTemplate = document.querySelector('#success').content.querySelector('.success');
  // найдём шаблон сообщения об ошибке создания объявления
  var errorMessageTemplate = document.querySelector('#error').content.querySelector('.error');

  // функция обработки реакции сервера на запрос
  var renderServerResponse = function (onError) {
    var error;
    if (xhr.status !== 200) {
      switch (xhr.status) {
        case 400:
          error = 'Неверный запрос';
          break;
        case 401:
          error = 'Пользователь не авторизован';
          break;
        case 404:
          error = 'По данному запросу ничего не найдено';
          break;
        case 500:
          error = 'Внутренняя ошибка сервера. Попробуйте позже!';
          break;

        default:
          error = 'Cтатус ответа: ' + xhr.status + ' ' + xhr.statusText;
      }

      if (error) {
        onError(error);
      }
    }
  };

  // функция обработки ошибок выполнения запроса
  var renderRequestErrors = function (onError) {
    // сообщим об ошибке при отсутствии соединения с сервером
    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });

    // сообщим об ошибке при чрезмерной задержке ответа сервера
    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
    // установим время ожидания ответа сервера
    xhr.timeout = 1000;
  };

  // функция удаления попапа (ответа на запрос)
  var deletePopupMessage = function () {
    popupMessage.parentElement.removeChild(popupMessage);
    popupMessage = null;
    document.removeEventListener('keydown', onPopupMessageEscPress);
    document.removeEventListener('click', onWindowClick);
  };

  // обработчик удаления попапа (ответа на запрос) по Esc
  var onPopupMessageEscPress = function (evt) {
    if (popupMessage && evt.keyCode === window.utils.ESC_KEYCODE) {
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

  // функция загрузки данных с сервера
  var uploadData = function (onLoad, onError) {
    // API сервера
    var URL = 'https://js.dump.academy/keksobooking/data';

    // создадим объект запроса
    xhr = new XMLHttpRequest();
    // ожидаем ответ сервера в формате json
    xhr.responseType = 'json';

    // отслеживаем момент загрузки
    xhr.addEventListener('load', function () {
      // загрузим данные при успешном выполнении запроса
      if (xhr.status === 200) {
        onLoad(xhr.response);
      }
      // обработаем реакцию сервера на запрос
      renderServerResponse(onError);
    });

    // обработаем возможные ошибки выполнения запроса
    renderRequestErrors(onError);

    // формируем запрос на сервер и отправляем его
    xhr.open('GET', URL);
    xhr.send();
  };

  // функция выгрузки данных формы на сервер
  var unloadForm = function (data, onLoad, onError) {
    // API сервера
    var URL = 'https://js.dump.academy/keksobooking';

    xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    // отслеживаем момент окончания передачи данных формы на сервер
    xhr.addEventListener('load', function () {
      // загрузим данные при успешном выполнении запроса
      if (xhr.status === 200) {
        onLoad();
      }
      // обработаем реакцию сервера на запрос
      renderServerResponse(onError);
    });

    // обработаем возможные ошибки выполнения запроса
    renderRequestErrors(onError);

    xhr.open('POST', URL);
    xhr.send(data);
  };

  window.backend = {
    uploadData: uploadData,
    unloadForm: unloadForm,
    onSuccessSending: onSuccessSending,
    onFailRequest: onFailRequest
  };
})();
