require([
    "esri/WebMap",
    "esri/Basemap",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/widgets/Feature"
  ], function (WebMap, Basemap, FeatureLayer, MapView, Feature) {
/*     const fLayer = new FeatureLayer({
      portalItem: {
        id: "f430d25bf03744edbb1579e18c4bf6b8"
      },
      layerId: 2,
      outFields: ["*"]
    }); */

    var fLayer = new FeatureLayer({
      title: "County Data",
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/Census_2020_Redistricting_Counties/FeatureServer/0"
    });

    let grayBasemap = Basemap.fromId("gray-vector");
    const map = new WebMap({
      basemap: grayBasemap,
      layers: [fLayer]
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-105.8, 39.202], // longitude, latitude
      zoom: 6,
      popup: {
        autoOpenEnabled: false
      }
    });

    view.when().then(function () {
      // Create a default graphic for when the application starts
      const graphic = {
        popupTemplate: {
          content: "Mouse over features to show details..."
        }
      };

      // Provide graphic to a new instance of a Feature widget
      const feature = new Feature({
        container: "infodiv", 
        graphic: graphic,
        map: view.map,
        spatialReference: view.spatialReference
      });

      view.whenLayerView(fLayer).then(function (layerView) {
        let highlight;
        // listen for the pointer-move event on the View
        view.on("pointer-move", function (event) {
          // Perform a hitTest on the View
          view.hitTest(event).then(function (event) {
            // Make sure graphic has a popupTemplate
            let results = event.results.filter(function (result) {
              return result.graphic.layer.popupTemplate;
            });
            let result = results[0];
            highlight && highlight.remove();
            // Update the graphic of the Feature widget
            // on pointer-move with the result
            if (result) {
              feature.graphic = result.graphic;
              highlight = layerView.highlight(result.graphic);
            } else {
              feature.graphic = graphic;
            }
          });
        });
      });
    });
  });