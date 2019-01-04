'use strict';

(function () {
  var FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png'];
  var reader;

  // Найдём input[type = 'file'] для загрузки с жёсткого диска аватара пользователя и фотографий объекта
  var fileAvatarChooser = window.utils.adForm.querySelector('#avatar');
  var filePhotosChooser = window.utils.adForm.querySelector('#images');
  // Найдём элементы img, в которых будут отображаться загруженные картинки
  var avatarPreview = window.utils.adForm.querySelector('.ad-form-header__preview img');
  var photoPreviewsBlock = window.utils.adForm.querySelector('.ad-form__photo');

  // функция загрузки картинки с жёсткого диска
  var getImage = function (fileChooser, onReaderLoad) {
    // при выборе пользователем аватара проверим формат этой картинки
    fileChooser.addEventListener('change', function () {
      var file = fileChooser.files[0];
      var fileName = file.name.toLowerCase();

      var matches = FILE_TYPES.some(function (it) {
        return fileName.endsWith(it);
      });

      // при наличии должного формата загрузим картинку по протоколу DataURL
      if (matches) {
        reader = new FileReader();
        reader.addEventListener('load', onReaderLoad);
        reader.readAsDataURL(file);
      }
    });
  };

  // обработчик загрузки аватара пользователя
  var onAvatarReaderLoad = function () {
    avatarPreview.src = reader.result;
  };

  // обработчик загрузки фотографий сдаваемого объекта
  var onPhotosReaderLoad = function () {
    var preview = document.createElement('img');
    preview.src = reader.result;
    preview.width = '70';
    preview.height = '70';
    preview.alt = 'Фотография объекта';
    photoPreviewsBlock.appendChild(preview);
  };

  // загрузим аватар и фотографии сдаваемого объекта недвижимости
  getImage(fileAvatarChooser, onAvatarReaderLoad);
  getImage(filePhotosChooser, onPhotosReaderLoad);

  window.pictureLoader = {
    avatarPreview: avatarPreview,
    photoPreviewsBlock: photoPreviewsBlock
  };
})();
