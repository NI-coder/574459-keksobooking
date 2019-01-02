'use strict';

(function () {
  var MAP_PIN_QUANTITY = 5;

  var priceRank;
  var shownPinsNumber;
  var filterValues = [];
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
      var filterValue = {};
      var filterName = field.name ? field.value : nameToFilterName[field.parentElement.name];
      filterValue[filterName] = field.value;
      filterValues.push(filterValue);
    });
  };

  // функции выставления рейтинга объектам массива исходных данных по сходству с выбором фильтров
  var setMainDataRanks = function (dataCard, filterItem) {
    filterValues.forEach(function (field) {
      if (field[filterItem] && field[filterItem] === dataCard.offer[filterItem].toString()) {
        dataCard.totalRank++;
      }
    });
  };

  var setFeaturesDataRanks = function (dataCard) {
    if (dataCard.offer.features) {
      dataCard.offer.features.forEach(function (feature) {
        filterValues.forEach(function (field) {
          if (field[feature]) {
            dataCard.totalRank++;
          }
        });
      });
    }
  };

  // функция получения массива данных, готового для отрисовки меток на карте
  var getRenderingData = function (records) {
    var randeringRecords = [];
    filterValues.length = 0;
    fillFilterValues();

    var filteredRecords = records.filter(function (card) {
      card.totalRank = 0;
      priceRank = {
        any: 0,
        middle: card.offer.price >= 10000 && card.offer.price <= 50000,
        low: card.offer.price < 10000,
        high: card.offer.price > 50000
      };

      filterValues.forEach(function (field) {
        if (field.price && priceRank[field.price]) {
          card.totalRank++;
        }
      });
      setMainDataRanks(card, 'type');
      setMainDataRanks(card, 'rooms');
      setMainDataRanks(card, 'guests');
      setFeaturesDataRanks(card);

      return card.totalRank === filterValues.length;
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
