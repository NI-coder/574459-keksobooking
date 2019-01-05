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

  // функция обработки реакции сервера на запрос
  var getXHR = function (success, fail) {
    // создадим объект запроса
    var xhr = new XMLHttpRequest();

    // ожидаем ответ сервера в формате json
    xhr.responseType = 'json';

    // отслеживаем момент загрузки
    xhr.addEventListener('load', function () {
      // загрузим данные при успешном выполнении запроса
      if (xhr.status === SUCCESS_CODE) {
        success(xhr.response);
      } else {
        // обработаем реакцию сервера на запрос
        var error = codeErrorToText[xhr.status] || 'Cтатус ответа: ' + xhr.status + ' ' + xhr.statusText;
        fail(error);
      }
    });

    // обработаем возможные ошибки выполнения запроса
    setRequestErrorsInterpreter(xhr, fail);

    return xhr;
  };

  // функция обработки ошибок выполнения запроса
  var setRequestErrorsInterpreter = function (xhr, fail) {
    // сообщим об ошибке при отсутствии соединения с сервером
    xhr.addEventListener('error', function () {
      fail('Произошла ошибка соединения');
    });

    // сообщим об ошибке при чрезмерной задержке ответа сервера
    xhr.addEventListener('timeout', function () {
      fail('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });
    // установим время ожидания ответа сервера
    xhr.timeout = REQUEST_TIMEOUT;
  };

  // функция загрузки данных с сервера
  var loadData = function (onLoad, onError) {
    // создадим объект запроса
    var xhr = getXHR(onLoad, onError);
    // формируем запрос на сервер и отправляем его
    xhr.open('GET', DATA_URL);
    xhr.send();
  };

  // функция выгрузки данных формы на сервер
  var uploadForm = function (data, onLoad, onError) {
    var xhr = getXHR(onLoad, onError);
    xhr.open('POST', FORM_URL);
    xhr.send(data);
  };

  window.backend = {
    loadData: loadData,
    uploadForm: uploadForm,
  };
})();
