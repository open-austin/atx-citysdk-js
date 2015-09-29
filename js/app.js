var config = require('../config.json');
var $ = require('jquery');
var L = require('leaflet');
var _ = require('lodash');
var parks = require("../data/parks.geojson");
require('leaflet-providers');
require('esri-leaflet');

var grayscale = L.esri.basemapLayer('Gray');
var grayscaleLabels = L.esri.basemapLayer('GrayLabels');

var map = L.map('map', {
    center: config.map_center,
    zoom: config.zoom_level,
    scrollWheelZoom: false,
    layers: [grayscale, grayscaleLabels]
});

// adding parks shapefiles to Map
var parkLayer = L.geoJson(parks, {
    style: function style() {
        return {
            fillColor: '#56DD54',
            weight: 1,
            opacity: 0.7,
            color: '#44A048',
            fillOpacity: 0.7,
        };
    },
    onEachFeature: onEachParkFeature,
}).addTo(map);

function onEachParkFeature(feature, layer) {
    var parkName = feature.properties.PARK_NAME;
    var parkAcres = feature.properties.PARK_ACRES.toFixed(2);
    var parkType = feature.properties.PARK_TYPE;
    var popupContent = '<p><span class="park-title">' + parkName + '</span> \
						<br>' + parkAcres + ' Acres \
						<br>Park Type: ' + parkType + '</p>';

    if (feature.properties) {
        layer.bindPopup(popupContent);
    }
  };


//------------
// Census SDK
var sdk = new CitySDK();
var censusModule = sdk.modules.census;
censusModule.enable(config.citySDK_token);


var request = {
  "lat": config.city_lat,
  "lng": config.city_lng,
  "level": "county",
  "sublevel": "true",
  "variables": [
    "income",
    "population",
    "poverty",
    "C27012_001E" // Total Health Insurance Coverage Status and Type by Work Experience by Age
    // "B27001_001E" // Total Health Insurance Coverage Status by Sex by Age
    // Population under 18
    // Population over 60
    // Housing Density
  ]
};

var censusLayer = L.geoJson().addTo(map);

L.Util.setOptions(censusLayer, {
  style: {
    weight: 1,
    opacity: 1,
    color: config.colors.purple4,
    fillColor: "transparent",
    dashArray: '3',
    fillOpacity: 0.7
  },
  onEachFeature: onEachCensusFeature
});

censusModule.GEORequest(request, function (response) {

  window.CensusData = response;

  response.features.forEach(function(f) {
    censusLayer.addData(f);
    removeLoadingIcon();
  })
});

function onEachCensusFeature(feature, layer) {
  var name = feature.properties.NAME;
  var population = Number(feature.properties.population);
  var poverty = Number(feature.properties.poverty) / population * 100;
  var insurance = Number(feature.properties.C27012_001E) / population * 100;
  var popupContent = '<li>Poverty Rate: ' + poverty.toFixed(2) + '%</li> \
                      <li>Health Insurance Coverage: ' + insurance.toFixed(2) + '%</li>';


  if (feature.properties) {
      layer.bindPopup(popupContent);
      layer.on('click', function(e){
        $(".data-list").empty();
        $(".data-list").append(popupContent);
      })
  }
};

function removeLoadingIcon(){
  $(".loading").remove();
  $(".data").removeClass("hidden");
}

// Leaflet UI Controls
var overlayMaps = {
    'Parks': parkLayer,
    'Census Tracts': censusLayer
};

L.control.layers(null, overlayMaps, {
    collapsed: true,
    autoZIndex: true,
}).addTo(map);
