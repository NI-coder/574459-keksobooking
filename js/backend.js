'use strict';
(function () {
  var DATA_URL = 'https://js.dump.academy/keksobooking/data';
  var FORM_URL = 'https://js.dump.academy/keksobooking';
  var SUCCESS_CODE = 200;
  var REQUEST_TIMEOUT = 1000;

  var codeErrorToText = {
    '400': 'Неверный запрос',
    '401': 'Пользователь не авторизован',
    '404': 'По данному запросу ничего не найдено',
    '500': 'Внутренняя ошибка сервера. Попробуйте позже!'
  };

  var xhr;

  // функция обработки реакции сервера на запрос
  var setServerResponseInterpreter = function (onError) {
    var error;
    if (!codeErrorToText[xhr.status]) {
      error = 'Cтатус ответа: ' + xhr.status + ' ' + xhr.statusText;
    }
    error = codeErrorToText[xhr.status] || xhr.statusText;
    if (error) {
      onError(error);
    }
  };

  // функция обработки ошибок выполнения запроса
  var setRequestErrorsInterpreter = function (onError) {
    // сообщим об ошибке при отсутствии соединения с сервером
    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });

    // сообщим об ошибке при чрезмерной задержке ответа сервера
    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
    // установим время ожидания ответа сервера
    xhr.timeout = REQUEST_TIMEOUT;
  };

  // функция загрузки данных с сервера
  var loadData = function (onLoad, onError) {
    // создадим объект запроса
    xhr = new XMLHttpRequest();
    // ожидаем ответ сервера в формате json
    xhr.responseType = 'json';

    // отслеживаем момент загрузки
    xhr.addEventListener('load', function () {
      // загрузим данные при успешном выполнении запроса
      if (xhr.status === SUCCESS_CODE) {
        onLoad(xhr.response);
      } else {
        // обработаем реакцию сервера на запрос
        setServerResponseInterpreter(onError);
      }
    });
    // обработаем возможные ошибки выполнения запроса
    setRequestErrorsInterpreter(onError);

    // формируем запрос на сервер и отправляем его
    xhr.open('GET', DATA_URL);
    xhr.send();
  };

  // функция выгрузки данных формы на сервер
  var unloadForm = function (data, onLoad, onError) {
    xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    // отслеживаем момент окончания передачи данных формы на сервер
    xhr.addEventListener('load', function () {
      // загрузим данные при успешном выполнении запроса
      if (xhr.status === SUCCESS_CODE) {
        onLoad();
      } else {
        // обработаем реакцию сервера на запрос
        setServerResponseInterpreter(onError);
      }
    });
    // обработаем возможные ошибки выполнения запроса
    setRequestErrorsInterpreter(onError);

    xhr.open('POST', FORM_URL);
    xhr.send(data);
  };

  window.backend = {
    loadData: loadData,
    unloadForm: unloadForm,
  };
})();
