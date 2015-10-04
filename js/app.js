var config = require('../config.json');
var $ = require('jquery');
var L = require('leaflet');
var _ = require('lodash');
var parks = require("../data/parks.geojson");
require('leaflet-providers');
require('esri-leaflet');
var turf = require('turf');
var Chart = require('chart.js');

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
  "api" : "acs5",
  // "year" : 2013,
  "variables": [
    "population",     // Total Population
    "income",         // Median Income
    "poverty_family", // Number of Families Below Poverty
    "poverty",        // Number of x Below Poverty
    "B01001_003E",	  // Male:!!Under 5 years
    "B01001_004E",	  // Male:!!5 to 9 years
    "B01001_005E",	  // Male:!!10 to 14 years
    "B01001_006E",	  // Male:!!15 to 17 years
    "B01001_027E",	  // Female:!!Under 5 years
    "B01001_028E",	  // Female:!!5 to 9 years
    "B01001_029E",	  // Female:!!10 to 14 years
    "B01001_030E",	  // Female:!!15 to 17 years
    "C27012_001E"     // Total Health Insurance Coverage Status and Type by Work Experience by Age
    // "DP05_0001E",  // 1. Total Population
    // "DP02_0055PE", // 2. Percent of Population in Elementary School
                   // 3. Percent of Multi-family homes vs. single units
    // "DP04_0009PE", //   2 units
    // "DP04_0010PE", //   3 or 4 units
    // "DP04_0011PE", //   5 to 9 units
    // "DP04_0012PE", //   10 to 19 units
    // "DP04_0013PE", //   20 or more units
    // "DP03_0119PE", // 4. Percentage of families below poverty line
    // "DP03_0096PE"  // 5. Percentage of population that has health insurance
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

function calcParkProportion(feature) {
  // get acreage of census block, clip overlapping parks and divide
  var blockArea = turf.area(feature);
  var overlapArea = 0;
  for (i=0;i<parks.features.length;i++) {
    var overlap = turf.intersect(feature, parks.features[i])
    if (overlap) {
      overlapArea += turf.area(overlap);
    }
  }
  return (overlapArea/blockArea*100)
}

function onEachCensusFeature(feature, layer) {
  var name = feature.properties.NAME;
  var population = Number(feature.properties.population);
  var poverty = Number(feature.properties.poverty) / population * 100;
  var insurance = 100 - (Number(feature.properties.C27012_001E) / population * 100);
  // var poverty = Number(feature.properties.DP03_0119PE);
  // var insurance = Number(feature.properties.DP03_0096PE);
  // var elementary = Number(feature.properties.DP02_0055PE);

  var kidsRawArray = [
    feature.properties.B01001_003E,	  // Male:!!Under 5 years
    feature.properties.B01001_004E,	  // Male:!!5 to 9 years
    feature.properties.B01001_005E,	  // Male:!!10 to 14 years
    feature.properties.B01001_006E,	  // Male:!!15 to 17 years
    feature.properties.B01001_027E,	  // Female:!!Under 5 years
    feature.properties.B01001_028E,	  // Female:!!5 to 9 years
    feature.properties.B01001_029E,	  // Female:!!10 to 14 years
    feature.properties.B01001_030E,	  // Female:!!15 to 17 years
  ];

  var kidsNumArray = _.map(kidsRawArray, function(n) {
    return Number(n);
  });

  var kidsSum = _.reduce(kidsNumArray, function(total, n){
    return total + n;
  });

  var kids = kidsSum / population * 100;

  var multiFamilyArray = [feature.properties.DP04_0009PE, feature.properties.DP04_0010PE, feature.properties.DP04_0011PE, feature.properties.DP04_0012PE, feature.properties.DP04_0013PE];
  var multiFamily = _.reduce(multiFamilyArray, function(total, n) {
    return total + feature.properties[n];
  });

  var featureData = {
    "poverty": poverty.toFixed(2),
    "insurance": insurance.toFixed(2),
    "kids" : kids.toFixed(2)
  };

  // var parkAreaPercentage = calcParkProportion(feature)

  var popupContent = '<li>Poverty Rate: ' + poverty.toFixed(2) + '%</li> \
                      <li>No Health Insurance Coverage: ' + insurance.toFixed(2) + '%</li> \
                      <li>Percent of Children (under 18): ' + kids.toFixed(2) + '%</li> \
                      ';

  if (feature.properties) {
      layer.bindPopup(popupContent);
      layer.on('click', function(e){
        $(".data-list").empty();
        $(".data-list").append(popupContent);
        createChart(featureData);
      })
  }
};

function removeLoadingIcon(){
  $(".loading").remove();
  $(".data").removeClass("hidden");
};

function createChart(featureData){
  var ctx = document.getElementById("myChart").getContext("2d");

  var data = {
      labels: ["Poverty Rate", "No Health Insurance Coverage", "Percent of Children (under 18)"],
      datasets: [
          {
              label: "My First dataset",
              fillColor: "rgba(220,220,220,0.2)",
              strokeColor: "rgba(220,220,220,1)",
              pointColor: "rgba(220,220,220,1)",
              pointStrokeColor: "#fff",
              pointHighlightFill: "#fff",
              pointHighlightStroke: "rgba(220,220,220,1)",
              data: [featureData.poverty, featureData.insurance, featureData.kids]
          }
      ]
  };

  var options = {
      //Boolean - Whether to show lines for each scale point
      scaleShowLine : true,

      //Boolean - Whether we show the angle lines out of the radar
      angleShowLineOut : false,

      //Boolean - Whether to show labels on the scale
      scaleShowLabels : false,

      // Boolean - Whether the scale should begin at zero
      scaleBeginAtZero : true,

      //String - Colour of the angle line
      angleLineColor : "rgba(0,0,0,.1)",

      //Number - Pixel width of the angle line
      angleLineWidth : 1,

      //String - Point label font declaration
      pointLabelFontFamily : "'Arial'",

      //String - Point label font weight
      pointLabelFontStyle : "normal",

      //Number - Point label font size in pixels
      pointLabelFontSize : 10,

      //String - Point label font colour
      pointLabelFontColor : "#666",

      //Boolean - Whether to show a dot for each point
      pointDot : true,

      //Number - Radius of each point dot in pixels
      pointDotRadius : 3,

      //Number - Pixel width of point dot stroke
      pointDotStrokeWidth : 1,

      //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
      pointHitDetectionRadius : 20,

      //Boolean - Whether to show a stroke for datasets
      datasetStroke : true,

      //Number - Pixel width of dataset stroke
      datasetStrokeWidth : 2,

      //Boolean - Whether to fill the dataset with a colour
      datasetFill : true,

      //String - A legend template
      legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>",
      scaleOverride: true,
      scaleSteps: 5,
      scaleStepWidth: 20,
      startScaleValue: 0
  }
  var myRadarChart = new Chart(ctx).Radar(data, options);
};


//--------------------
// Leaflet UI Controls
var overlayMaps = {
    'Parks': parkLayer,
    'Census Tracts': censusLayer
};

L.control.layers(null, overlayMaps, {
    collapsed: true,
    autoZIndex: true,
}).addTo(map);
