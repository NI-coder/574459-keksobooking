'use strict';

(function () {
  var FEATURES_CLASSES = {
    wifi: 'popup__feature--wifi',
    dishwasher: 'popup__feature--dishwasher',
    parking: 'popup__feature--parking',
    washer: 'popup__feature--washer',
    elevator: 'popup__feature--elevator',
    conditioner: 'popup__feature--conditioner'
  };
  var TYPES_RUS = {
    palace: 'Дворец',
    flat: 'Квартира',
    house: 'Дом',
    bungalo: 'Бунгало'
  };

  // найдём шаблон карточки объявлений
  var mapCardTemplate = document.querySelector('#card').content.querySelector('.map__card');
  // найдём блок, перед которым будем вставлять карточки объявлений
  var mapFiltersContainer = document.querySelector('.map__filters-container');

  // подготовим детали текста о вместимости предлагаемой недвижимости
  var getСapacityData = function (roomsNum, guestsNum) {
    var roomsRus = 'комнаты';
    var guestsRus = guestsNum === 1 ? 'гостя' : 'гостей';
    if (roomsNum === 1) {
      roomsRus = 'комната';
    }
    if (roomsNum >= 5) {
      roomsRus = 'комнат';
    }
    return {
      roomsNum: roomsRus,
      guestsNum: guestsRus
    };
  };

  // сформируем DOM-элемент списка дополнительных характеристик размещения
  var setOfferFeatures = function (featureItems, offerCard) {
    featureItems.classList.add('visually-hidden');
    featureItems.innerHTML = '';
    if (offerCard.offer.features.length > 0) {
      featureItems.classList.remove('visually-hidden');
      offerCard.offer.features.map(function (feature) {
        var featureItem = document.createElement('li');
        featureItem.className = 'popup__feature ' + FEATURES_CLASSES[feature];
        featureItems.appendChild(featureItem);
      });
    }
  };

  // сформируем DOM-элемент списка фотографий
  var setOfferPhotos = function (photos, offerCard) {
    photos.classList.add('visually-hidden');
    if (offerCard.offer.photos.length > 0) {
      photos.classList.remove('visually-hidden');
      offerCard.offer.photos.map(function (pic, index, pics) {
        if (index < pics.length - 1) {
          var newPhoto = photos.children[0].cloneNode(true);
          photos.appendChild(newPhoto);
        }
        photos.children[index].src = pic;
      });
    }
  };

  // получение DOM-элемента карточки объявления
  var getPopupCard = function (card) {
    var mapCardElement = mapCardTemplate.cloneNode(true);
    var offerTitle = mapCardElement.querySelector('.popup__title');
    var offerAddress = mapCardElement.querySelector('.popup__text--address');
    var offerPrice = mapCardElement.querySelector('.popup__text--price');
    var offerType = mapCardElement.querySelector('.popup__type');
    var offerСapacity = mapCardElement.querySelector('.popup__text--capacity');
    var capacityDatas = getСapacityData(card.offer.rooms, card.offer.guests);
    var offerTime = mapCardElement.querySelector('.popup__text--time');
    var offerFeatures = mapCardElement.querySelector('.popup__features');
    var offerDescription = mapCardElement.querySelector('.popup__description');
    var offerPhotos = mapCardElement.querySelector('.popup__photos');
    var offerAvatar = mapCardElement.querySelector('.popup__avatar');

    offerTitle.textContent = card.offer.title;
    offerAddress.textContent = card.offer.address;
    offerPrice.textContent = card.offer.price + ' ₽/ночь';
    offerType.textContent = TYPES_RUS[card.offer.type];
    offerСapacity.textContent = card.offer.rooms + ' ' + capacityDatas.roomsNum + ' для ' + card.offer.guests + ' ' + capacityDatas.guestsNum;
    offerTime.textContent = 'Заезд после ' + card.offer.checkin + ', выезд до ' + card.offer.checkout;
    setOfferFeatures(offerFeatures, card);
    offerDescription.textContent = card.offer.description;
    setOfferPhotos(offerPhotos, card);
    offerAvatar.src = card.author.avatar;

    // загрузим сформированную разметку во временное хранилище
    var popupInFragment = window.utils.fragment.appendChild(mapCardElement);

    // выгружаем разметку объявления из временного хранилища в необходимое место в основной разметке
    return window.utils.map.insertBefore(popupInFragment, mapFiltersContainer);
  };

  window.shownAd = {
    getPopupCard: getPopupCard
  };
})();
