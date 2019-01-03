'use strict';

(function () {
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];
  var PREVIEWS_BLOCK_LENGTH = 12;

  // Найдём input[type = 'file'], через который будем загружать картинку с жёсткого диска
  var fileChooser = window.utils.adForm.querySelector('#images');
  // Найдём элемент img, в котором будет отображаться загруженная картинка
  var previewsBlock = window.utils.adForm.querySelector('.ad-form__photo');

  // при выборе пользователем файла картинки проверим формат этой картинки
  fileChooser.addEventListener('change', function () {
    var file = fileChooser.files[0];
    var fileName = file.name.toLowerCase();

    var matches = FILE_TYPES.some(function (it) {
      return fileName.endsWith(it);
    });

    // и при наличии должного формата загрузим картинки по протоколу DataURL
    if (matches) {
      var reader = new FileReader();

      reader.addEventListener('load', function () {
        var preview = window.avatar.preview.cloneNode(true);
        preview.src = reader.result;
        preview.width = '70';
        preview.height = '70';
        preview.alt = 'Фотография объекта';
        // ограничим количество загружаемых фотографий
        if (Array.from(previewsBlock.children).length < PREVIEWS_BLOCK_LENGTH) {
          previewsBlock.appendChild(preview);
        }
      });

      reader.readAsDataURL(file);
    }
  });
})();
