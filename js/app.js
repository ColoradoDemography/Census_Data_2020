require([
    "esri/WebMap",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/widgets/Feature"
  ], function (WebMap, FeatureLayer, MapView, Feature) {
    const fLayer = new FeatureLayer({
      portalItem: {
        id: "f430d25bf03744edbb1579e18c4bf6b8"
      },
      layerId: 2,
      outFields: ["*"]
    });

    const map = new WebMap({
      portalItem: {
        // autocasts as new PortalItem
        id: "372b7caa8fe340b0a6300df93ef18a7e"
      },
      layers: [fLayer]
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-74, 41.5],
      zoom: 10,
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
        container: "sidebar",
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