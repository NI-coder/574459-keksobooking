'use strict';

(function () {
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];

  // Найдём input[type = 'file'], через который будем загружать картинку с жёсткого диска
  var fileChooser = window.utils.adForm.querySelector('#avatar');
  // Найдём элемент img, в котором будет отображаться загруженная картинка
  var preview = window.utils.adForm.querySelector('.ad-form-header__preview img');

  // при выборе пользователем файла картинки проверим формат этой картинки
  fileChooser.addEventListener('change', function () {
    var file = fileChooser.files[0];
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });

    // и при наличии должного формата загрузим картинку по протоколу DataURL
    if (matches) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        preview.src = reader.result;
      });

      reader.readAsDataURL(file);
    }
  });

  window.avatar.preview = preview;
})();
