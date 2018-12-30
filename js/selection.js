'use strict';

(function () {
  var MAP_PIN_QUANTITY = 5;

  var priceRank;
  var features;
  var shownPinsNumber;
  var filterValues = {
    index: 0
  };
  var nameToFilterName = {
    'housing-type': 'type',
    'housing-price': 'price',
    'housing-rooms': 'rooms',
    'housing-guests': 'guests',
    'filter-wifi': 'wifi',
    'filter-dishwasher': 'dishwasher',
    'filter-parking': 'parking',
    'filter-washer': 'washer',
    'filter-elevator': 'elevator',
    'filter-conditioner': 'conditioner'
  };

  // функция заполнения объекта, собирающего выбор полей фильтрации
  var fillFilterValues = function () {
    // найдём все выделенные поля формы фильтрации
    var markedFilters = document.querySelectorAll('.map__filters option:checked:not([value="any"]), .map__filters input:checked');
    markedFilters.forEach(function (field) {
      if (!field.name) {
        var filterName = nameToFilterName[field.parentElement.name];
        filterValues[filterName] = field.value;
        filterValues.index++;
      } else {
        filterValues[field.value] = field.value;
        filterValues.index++;
      }
    });
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
      middle: dataCard.offer.price >= 10000 && dataCard.offer.price <= 50000,
      low: dataCard.offer.price < 10000,
      high: dataCard.offer.price > 50000
    };

    if (filterValues.price && priceRank[filterValues.price]) {
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
  var getRenderingData = function (records) {
    var randeringRecords = [];
    filterValues = {};
    filterValues.index = 0;
    fillFilterValues();

    var filteredRecords = records.filter(function (card) {
      card.totalRank = 0;
      setTypeRank(card, 'type');
      setPriceRank(card);
      setCapacityDataRanks(card, 'rooms');
      setCapacityDataRanks(card, 'guests');
      setFeaturesDataRanks(card);
      if (filterValues.index !== card.totalRank) {
        card.totalRank = 0;
      }
      return card.totalRank === filterValues.index;
    });

    shownPinsNumber = filteredRecords.length < MAP_PIN_QUANTITY ? filteredRecords.length : MAP_PIN_QUANTITY;

    randeringRecords = filteredRecords.slice(0, shownPinsNumber);

    return randeringRecords;
  };

  // добавим обработчик изменений на форму фильтрации похожих объявлений
  window.utils.filterForm.addEventListener('change', window.map.onFilterChange);

  window.selection = {
    getRenderingData: getRenderingData
  };
})();
