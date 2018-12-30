'use strict';

(function () {
  var MAP_PIN_QUANTITY = 5;

  var priceRank;
  var features;
  var shownPinsNumber;
  var filterValues = {
    index: 0
  };

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

  // функция удаления свойств объекта, собирающего значения фильтров
  var deleteFilterValuesProperty = function (property) {
    if (property) {
      delete filterValues[property];
    }
  };

  // функции заполнения объекта, собирающего значения основных фильтров
  var fillMainFiltersValue = function (filter, filterItem) {
    deleteFilterValuesProperty(filterItem);
    if (filter.value !== 'any') {
      filterValues[filterItem] = filter.value;
      filterValues.index++;
    }
  };
  var fillFeatureFiltersValue = function (filter, filterItem) {
    deleteFilterValuesProperty(filterItem);
    if (filter.checked) {
      filterValues[filterItem] = filter.value;
      filterValues.index++;
    }
  };

  // функции выставления рейтинга объектам массива исходных данных по сходству с выбором фильтров
  var setTypeRank = function (dataCard) {
    if (filterValues.type && filterValues.type === dataCard.offer.type) {
      dataCard.totalRank++;
    }
  };
  var setCapacityDataRanks = function (dataCard, filterItem) {
    if (filterValues[filterItem] && +filterValues[filterItem] === dataCard.offer[filterItem]) {
      dataCard.totalRank++;
    }
  };
  var setPriceRank = function (dataCard) {
    priceRank = {
      any: 0,
      middle: dataCard.offer.price >= 10000 && dataCard.offer.price <= 50000 ? 1 : 0,
      low: dataCard.offer.price <= 10000 ? 1 : 0,
      high: dataCard.offer.price >= 50000 ? 1 : 0,
    };

    if (filterValues.price && priceRank[filterValues.price] === 1) {
      dataCard.totalRank++;
    }
  };
  var setFeaturesDataRanks = function (dataCard) {
    if (dataCard.offer.features) {
      features = dataCard.offer.features;
      features.forEach(function (feature) {
        if (filterValues[feature]) {
          dataCard.totalRank++;
        }
      });
    }
  };

  // функция получения массива данных, готового для отрисовки меток на карте
  var getRenderingData = function (data) {
    var randeringData = [];
    filterValues.index = 0;
    fillMainFiltersValue(typeFilter, 'type');
    fillMainFiltersValue(priceFilter, 'price');
    fillMainFiltersValue(roomsFilter, 'rooms');
    fillMainFiltersValue(guestsFilter, 'guests');
    fillFeatureFiltersValue(wifiFilter, 'wifi');
    fillFeatureFiltersValue(dishwasherFilter, 'dishwasher');
    fillFeatureFiltersValue(parkingFilter, 'parking');
    fillFeatureFiltersValue(washerFilter, 'washer');
    fillFeatureFiltersValue(elevatorFilter, 'elevator');
    fillFeatureFiltersValue(conditionerFilter, 'conditioner');

    data.forEach(function (card) {
      card.totalRank = 0;
      setTypeRank(card, 'type');
      setPriceRank(card);
      setCapacityDataRanks(card, 'rooms');
      setCapacityDataRanks(card, 'guests');
      setFeaturesDataRanks(card);

      if (filterValues.index !== card.totalRank) {
        card.totalRank = 0;
      }
    });

    var filteredData = data.filter(function (rankedCard) {
      return rankedCard.totalRank === filterValues.index;
    });

    shownPinsNumber = filteredData.length < MAP_PIN_QUANTITY ? filteredData.length : MAP_PIN_QUANTITY;

    randeringData = filteredData.slice(0, shownPinsNumber);

    return randeringData;
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
    getRenderingData: getRenderingData
  };
})();
