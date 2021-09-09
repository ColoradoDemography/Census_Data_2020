require([
    "esri/WebMap",
    "esri/Basemap",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/widgets/Feature",
    "esri/renderers/support/ClassBreakInfo",
    "esri/renderers/ClassBreaksRenderer",
    "esri/widgets/Legend"
  ], function (WebMap, Basemap, FeatureLayer, MapView, Feature, ClassBreakInfo, ClassBreaksRenderer, Legend) {
/*     const fLayer = new FeatureLayer({
      portalItem: {
        id: "f430d25bf03744edbb1579e18c4bf6b8"
      },
      layerId: 2,
      outFields: ["*"]
    }); */
  // Default renderer
    var u18renderer = new ClassBreaksRenderer({
      type: "class-breaks",
      valueExpression: "100 - $feature.PCT_P0030001",
      legendOptions: {
        title: "Percent under 18"
      }
    });
    u18renderer.addClassBreakInfo({
      minValue: 0,
      maxValue: 14,
      symbol: {
        type: "simple-fill",  
        color: "#edf8fb"
      },
      label: "< 14%"
    });
    u18renderer.addClassBreakInfo({
      minValue: 14,
      maxValue: 18,
      symbol: {
        type: "simple-fill",  
        color: "#b2e2e2"
      },
      label: "14% to 18%"
    });    
    u18renderer.addClassBreakInfo({
      minValue: 18,
      maxValue: 22,
      symbol: {
        type: "simple-fill",  
        color: "#66c2a4"
      },
      label: "18% to 22%"
    });  
    u18renderer.addClassBreakInfo({
      minValue: 22,
      maxValue: 26,
      symbol: {
        type: "simple-fill",  
        color: "#2ca25f"
      },
      label: "22% to 26%"
    });
    u18renderer.addClassBreakInfo({
      minValue: 26,
      maxValue: 100,
      symbol: {
        type: "simple-fill",  
        color: "#b2e2e2"
      },
      label: "> 26%"
    }); 

    var popuptest = {
      title: ""
    };

    var countyLayer = new FeatureLayer({
      title: "County Data",
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/Census_2020_Redistricting_Counties/FeatureServer/0",
      definitionExpression: "State = 'Colorado'",
      renderer: u18renderer

    });
    var placeLayer = new FeatureLayer({
      title: "Place Data",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Place_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      popupTemplate: popuptest

    });
    var tractLayer = new FeatureLayer({
      title: "Tract Data",
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_2020_Redistricting_Tracts/FeatureServer/0"

    });
    var bgLayer = new FeatureLayer({
      title: "Block Group Data",
      url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Census_2020_Redistricting_Block_Groups/FeatureServer/0"
      
    });

    var fLayer = countyLayer;

    let grayBasemap = Basemap.fromId("gray-vector");
    const map = new WebMap({
      basemap: grayBasemap,
    });
    map.add(fLayer);

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-105.8, 39.202], // longitude, latitude
      zoom: 6,
      popup: {
        autoOpenEnabled: true
      }
    });

    /* var legend = new Legend({
      view: view
     }); */  

    view.when().then(function () {
      //Update the geography shown
      geoSelect = document.getElementById("geoDiv");
      geoSelect.addEventListener("change", generateRenderer);

      // Generate renderer on data change
      classSelect = document.getElementById("statDiv");
      classSelect.addEventListener("change", generateRenderer);

      
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

    function updateMap(){
      const geoLabel = geoselect.options[geoselect.selectedIndex].text;
      switch (geoLabel){
        case "County":
          countyLayer.visible = true;
          placeLayer.visible = false;
          tractLayer.visible = false;
          bgLayer.visible = false;
          break;
        case "Place":
          countyLayer.visible = false;
          placeLayer.visible = true;
          tractLayer.visible = false;
          bgLayer.visible = false;
          break;
        case "Tract":
          countyLayer.visible = false;
          placeLayer.visible = false;
          tractLayer.visible = true;
          bgLayer.visible = false;
          break;
        case "Block Group":
          countyLayer.visible = false;
          placeLayer.visible = false;
          tractLayer.visible = false;
          bgLayer.visible = true;
          break;
      }
    }

    // Renderers 
    
    
    //Create others depending on selected stat
    function generateRenderer() {
      // Over 18 percent
      var o18renderer = new ClassBreaksRenderer({
        type: "class-breaks",
        field: "PCT_P0030001",
        legendOptions: {
          title: "Percent 18 and Older"
        }
      });
      o18renderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 74,
        symbol: {
          type: "simple-fill",  
          color: "#edf8fb"
        },
        label: "< 74%"
      });
      o18renderer.addClassBreakInfo({
        minValue: 74,
        maxValue: 78,
        symbol: {
          type: "simple-fill",  
          color: "#b2e2e2"
        },
        label: "74% to 78%"
      });    
      o18renderer.addClassBreakInfo({
        minValue: 78,
        maxValue: 82,
        symbol: {
          type: "simple-fill",  
          color: "#66c2a4"
        },
        label: "78% to 82%"
      });  
      o18renderer.addClassBreakInfo({
        minValue: 82,
        maxValue: 86,
        symbol: {
          type: "simple-fill",  
          color: "#2ca25f"
        },
        label: "82% to 86%"
      });
      o18renderer.addClassBreakInfo({
        minValue: 86,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#b2e2e2"
        },
        label: "> 86%"
      });  
      // Under 18 percent
      /* var u18renderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "100 - $feature.PCT_P0030001",
        legendOptions: {
          title: "Percent under 18"
        }
      });
      u18renderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 14,
        symbol: {
          type: "simple-fill",  
          color: "edf8fb"
        },
        label: "< 14%"
      });
      u18renderer.addClassBreakInfo({
        minValue: 14,
        maxValue: 18,
        symbol: {
          type: "simple-fill",  
          color: "b2e2e2"
        },
        label: "14% to 18%"
      });    
      u18renderer.addClassBreakInfo({
        minValue: 18,
        maxValue: 22,
        symbol: {
          type: "simple-fill",  
          color: "66c2a4"
        },
        label: "18% to 22%"
      });  
      u18renderer.addClassBreakInfo({
        minValue: 22,
        maxValue: 26,
        symbol: {
          type: "simple-fill",  
          color: "2ca25f"
        },
        label: "22% to 26%"
      });
      u18renderer.addClassBreakInfo({
        minValue: 26,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "b2e2e2"
        },
        label: "> 26%"
      });  */
      //case statement to select renderer
      const geoLabel = geoselect.options[geoselect.selectedIndex].value;
      console.log(geoLabel);
      switch (geoLabel){
        case "County":
          fLayer = countyLayer;
          break;
        case "Place":
          fLayer = placeLayer;
          break;
        case "Tract":
          fLayer = tractLayer;
          break;
        case "Block Group":
          fLayer = bgLayer;
          break;
      }

      const statLabel = statselect.options[statselect.selectedIndex].value;
      console.log(statLabel);
      switch(statLabel){
        case "O18":
          fLayer.renderer = o18renderer;
          break;
        case "U18":
          fLayer.renderer = u18renderer;
          break; 
      }
      map.allLayers.remove;
      map.add(fLayer);
    }


    // Popups  

  }
);