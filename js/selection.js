'use strict';

(function () {
  var MAP_PIN_QUANTITY = 5;
  var Price = {
    LOW: 10000,
    HIGH: 50000
  };

  var nameToFilterName = {
    'housing-type': 'type',
    'housing-price': 'price',
    'housing-rooms': 'rooms',
    'housing-guests': 'guests'
  };

  // функция заполнения объекта, собирающего выбор полей фильтрации
  var getFilterValues = function () {
    // найдём все выделенные поля формы фильтрации
    var markedFilters = document.querySelectorAll('.map__filters option:checked:not([value="any"]), .map__filters input:checked');

    return Array.from(markedFilters).map(function (field) {
      var filterName = field.name
        ? field.value
        : nameToFilterName[field.parentElement.name];
      return {
        name: filterName,
        value: field.value
      };
    });
  };

  // функция приведения свойства price в объекте массива первичных данных к формату соответствующего фильтра в разметке
  var getPrice = function (price) {
    var interval = {
      middle: price >= Price.LOW && price <= Price.HIGH,
      low: price < Price.LOW,
      high: price > Price.HIGH
    };
    return Object.keys(interval).find(function (key) {
      return interval[key];
    });
  };

  // функция приведения массива features к формату объекта
  var getFeatures = function (features) {
    return features.reduce(function (offer, feature) {
      offer[feature] = feature;
      return offer;
    }, {});
  };

  // функция получения массива данных, готового для отрисовки меток на карте
  var getRenderingData = function (records) {
    var filterValues = getFilterValues();
    var filteredRecords = records.filter(function (card) {
      // перезапишем свойства price и features в объектах полученных с сервера первичных данных
      var price = getPrice(card.offer.price);
      var features = getFeatures(card.offer.features);
      // дополним объекты первичных данных вновь сформированными свойствами
      var offer = Object.assign({}, card.offer, {price: price}, features);

      // вернём отфильтрованные объекты
      return filterValues.every(function (filter) {
        return offer[filter.name] === filter.value;
      });
    });

    return filteredRecords.slice(0, MAP_PIN_QUANTITY);
  };

  // добавим обработчик изменений на форму фильтрации похожих объявлений
  window.utils.filterForm.addEventListener('change', window.map.onFilterChange);

  window.selection = {
    getRenderingData: getRenderingData
  };
})();
