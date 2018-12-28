'use strict';

(function () {
  var MAP_PIN_QUANTITY = 5;

  // перечисление критериев похожести объектов по их свойствам
  var PropertyRank = {
    TYPE: 7,
    PRICE: 7,
    ROOMS: 5,
    GUESTS: 7,
    WIFI: 3,
    DISHWASHER: 1,
    PARKING: 3,
    WASHER: 1,
    ELEVATOR: 1,
    CONDITIONER: 3,
  };

  var priceRank;
  var features;
  var newData = [];

  // найдём DOM-элементы фильтров
  var typeFilter = window.utils.map.querySelector('#housing-type');
  var priceFilter = window.utils.map.querySelector('#housing-price');
  var roomsFilter = window.utils.map.querySelector('#housing-rooms');
  var guestsFilter = window.utils.map.querySelector('#housing-guests');
  var wifiFilter = window.utils.map.querySelector('#filter-wifi');
  var dishwasherFilter = window.utils.map.querySelector('#filter-dishwasher');
  var parkingFilter = window.utils.map.querySelector('#filter-parking');
  var washerFilter = window.utils.map.querySelector('#filter-washer');
  var elevatorFilter = window.utils.map.querySelector('#filter-elevator');
  var conditionerFilter = window.utils.map.querySelector('#filter-conditioner');

  // функция выставления рейтинга объектам массива исходных данных по сходству с выбором основных фильтров
  var getMainDataRanks = function (dataCard, filter, filterItem) {
    if (filter.value === 'any' || filter.value === dataCard.offer[filterItem]) {
      dataCard.totalRank += PropertyRank[filterItem.toUpperCase()];
    }
  };

  var setPriceRank = function (dataCard, filter) {
    priceRank = {
      any: PropertyRank.PRICE,
      middle: dataCard.offer.price >= 10000 && dataCard.offer.price <= 50000 ? PropertyRank.PRICE : 0,
      low: dataCard.offer.price <= 10000 ? PropertyRank.PRICE : 0,
      high: dataCard.offer.price >= 50000 ? PropertyRank.PRICE : 0,
    };
    dataCard.priceRank = PropertyRank.PRICE;
    dataCard.totalRank += priceRank[filter.value];
    return dataCard.totalRank;
  };

  // функция выставления рейтинга объектам массива исходных данных по сходству с выбором дополнительных услуг
  var getFeaturesDataRanks = function (dataCard, featureFilter, featureItem) {
    if (dataCard.offer.features) {
      features = dataCard.offer.features;
      features.forEach(function (feature) {
        if (featureFilter.checked && feature === featureItem) {
          dataCard.totalRank += PropertyRank[featureItem.toUpperCase()];
        }
      });
    }
  };

  // функция получения объектами массива данных рейтинга сходства с данными фильтров
  var getRankedData = function (data) {
    var rankedData = [];
    data.forEach(function (card) {
      card.priceRank = 0;
      card.totalRank = 0;
      getMainDataRanks(card, typeFilter, 'type');
      setPriceRank(card, priceFilter);
      getMainDataRanks(card, roomsFilter, 'rooms');
      getMainDataRanks(card, guestsFilter, 'guests');
      getFeaturesDataRanks(card, wifiFilter, 'wifi');
      getFeaturesDataRanks(card, dishwasherFilter, 'dishwasher');
      getFeaturesDataRanks(card, parkingFilter, 'parking');
      getFeaturesDataRanks(card, washerFilter, 'washer');
      getFeaturesDataRanks(card, elevatorFilter, 'elevator');
      getFeaturesDataRanks(card, conditionerFilter, 'conditioner');
      rankedData.push(card);
    });

    return rankedData;
  };

  // создадим копию массива данных и отсортируем его по убыванию рейтинга сходства с данными фильтров
  var getRenderingData = function (data) {
    newData = data.slice()
    .sort(function (first, second) {
      if (first.totalRank > second.totalRank) {
        return -1;
      } else if (first.totalRank < second.totalRank) {
        return 1;
      } else {
        if (first.priceRank > second.priceRank) {
          return -1;
        } else if (first.priceRank < second.priceRank) {
          return 1;
        } else {
          return 0;
        }
      }
    });
    // ограничим длину нового массива и отфильтруем его по первому элементу
    newData.length = MAP_PIN_QUANTITY;
    var maxRank = newData[0].totalRank;
    var filteredData = newData.filter(function (dataItem) {
      return dataItem.totalRank === maxRank;
    });

    return filteredData;
  };

  // функция добавления обработчиков в фильтры настройки объявлений
  var addFilterListeners = function () {
    typeFilter.addEventListener('change', window.map.onFilterChange);
    priceFilter.addEventListener('change', window.map.onFilterChange);
    roomsFilter.addEventListener('change', window.map.onFilterChange);
    guestsFilter.addEventListener('change', window.map.onFilterChange);
    wifiFilter.addEventListener('change', window.map.onFilterChange);
    dishwasherFilter.addEventListener('change', window.map.onFilterChange);
    parkingFilter.addEventListener('change', window.map.onFilterChange);
    washerFilter.addEventListener('change', window.map.onFilterChange);
    elevatorFilter.addEventListener('change', window.map.onFilterChange);
    conditionerFilter.addEventListener('change', window.map.onFilterChange);
  };

  // повесим обработчики изменений на фильтры настройки похожих объявлений
  addFilterListeners();

  window.selection = {
    getRankedData: getRankedData,
    getRenderingData: getRenderingData
  };
})();
