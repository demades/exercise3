import "ol/ol.css";
import GeoJSON from "ol/format/GeoJSON";
import Map from "ol/Map";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { Fill, Stroke, Style, Text } from "ol/style";

var url = "https://disease.sh/v3/covid-19/countries";

var style = new Style({
  fill: new Fill({
    color: "rgba(255, 255, 255, 0.6)"
  }),
  stroke: new Stroke({
    color: "#319FD3",
    width: 1
  }),
  text: new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "#000"
    }),
    stroke: new Stroke({
      color: "#fff",
      width: 3
    })
  })
});

var vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: "data/geojson/countries.geojson",
    format: new GeoJSON()
  }),
  style: function (feature) {
    style.getText().setText(feature.get("name"));
    return style;
  }
});

var map = new Map({
  layers: [vectorLayer],
  target: "map",
  view: new View({
    center: [0, 0],
    zoom: 1
  })
});

var highlightStyle = new Style({
  stroke: new Stroke({
    color: "#f00",
    width: 1
  }),
  fill: new Fill({
    color: "rgba(255,0,0,0.1)"
  }),
  text: new Text({
    font: "12px Calibri,sans-serif",
    fill: new Fill({
      color: "#000"
    }),
    stroke: new Stroke({
      color: "#f00",
      width: 3
    })
  })
});

var featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: function (feature) {
    highlightStyle.getText().setText(feature.get("name"));
    return highlightStyle;
  }
});

var highlight;
var displayFeatureInfo = function (pixel) {
  var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  var info = document.getElementById("info");
  if (feature) {
    fetch(url)
      .then(function (resp) {
        return resp.json();
      })
      .then(function (data) {
        for (let prop in data) {
          if (data[prop].country === feature.get("name")) {
            info.innerHTML = data[prop].country + " " + data[prop].deaths;
            console.log(data[prop].country + " " + data[prop].deaths);
          }
        }
      });
  } else {
    info.innerHTML = "&nbsp;";
  }

  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

map.on("pointermove", function (evt) {
  if (evt.dragging) {
    return;
  }
  var pixel = map.getEventPixel(evt.originalEvent);
  displayFeatureInfo(pixel);
});

map.on("click", function (evt) {
  displayFeatureInfo(evt.pixel);
});
