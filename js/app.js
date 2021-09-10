require([
    "esri/WebMap",
    "esri/Basemap",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/widgets/Feature",
    "esri/renderers/support/ClassBreakInfo",
    "esri/renderers/ClassBreaksRenderer",
    "esri/widgets/Legend",
    "esri/widgets/Expand"
  ], function (WebMap, Basemap, FeatureLayer, MapView, Feature, ClassBreakInfo, ClassBreaksRenderer, Legend, Expand) {
  // Default renderer
    var u18renderer = new ClassBreaksRenderer({
      type: "class-breaks",
      valueExpression: "100 - (($feature.POP18/$feature.TOTALPOP)*100)",
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
        color: "#006d2c"
      },
      label: "> 26%"
    }); 

    var popuptest = {
      title: "{NAMELSAD20}",
      content:
      "<b>Total Population</b>  {TOTALPOP}<br>"+
      "<b>Under 18 Population</b>  {$feature.TOTALPOP - $feature.POP18}, {(($feature.TOTALPOP - $feature.POP18)/$feature.TOTALPOP)*100}%<br>"+
      "<b>18 and Older Population</b>  {POP18}, {($feature.POP18/$feature.TOTALPOP)*100}%<br>"
    };

    var countyLayer = new FeatureLayer({
      title: "Counties",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_County_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      visible: true

    });
    var placeLayer = new FeatureLayer({
      title: "Census Places",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_Place_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      //popupTemplate: popuptest,
      visible: false

    });
    var tractLayer = new FeatureLayer({
      title: "Census Tracts",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_Tract_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      visible: false
    });
    var bgLayer = new FeatureLayer({
      title: "Block Groups",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_BG_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      visible: false
    });

    let grayBasemap = Basemap.fromId("gray-vector");
    const map = new WebMap({
      basemap: grayBasemap,
      layers: [countyLayer, placeLayer, tractLayer, bgLayer]
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-105.397803, 39.168709], // longitude, latitude
      zoom: 6,
      popup: {
        autoOpenEnabled: true
      }
    });

    var legend = new Legend({
      view: view
    });

    var expand1 = new Expand({
      view: view,
      content: legend,
      expandIconClass: "esri-icon-documentation",
      expandTooltip: "Legend"
    });

    view.ui.add([expand1], "top-right");

    view.when().then(function () {
      //Update the geography shown
      geoSelect = document.getElementById("geoDiv");
      geoSelect.addEventListener("change", generateRenderer);

      catSelect = document.getElementById("catDiv");
      catSelect.addEventListener("change", generateRenderer);

      // Generate renderer on data change
      classSelect = document.getElementById("statDiv");
      classSelect.addEventListener("change", generateRenderer);

      
      // Create a default graphic for when the application starts
      const graphic = {
        popupTemplate: {
          content: "Click on a geography to show details..."
        }
      };

      // Provide graphic to a new instance of a Feature widget
      const feature = new Feature({
        container: "infodiv", 
        graphic: graphic,
        map: view.map,
        spatialReference: view.spatialReference
      });

      /* view.whenLayerView(fLayer).then(function (layerView) {
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
      }); */
    });

    //Create others depending on selected stat
    function generateRenderer() {
      //variables for case statements to select renderers
      const geoLabel = geoselect.options[geoselect.selectedIndex].value;
      const statLabel = statselect.options[statselect.selectedIndex].value;
      
      // Renderers
      // 18 and Older
      var o18renderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.POP18/$feature.TOTALPOP)*100",
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
          color: "#006d2c"
        },
        label: "> 86%"
      });  
      // White Non-Hispanic percent
      var whiterenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.NHWHITE/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Non-Hispanic White"
        }
      });
      whiterenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 40,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 40%"
      });
      whiterenderer.addClassBreakInfo({
        minValue: 40,
        maxValue: 60,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "40% to 60%"
      });
      whiterenderer.addClassBreakInfo({
        minValue: 60,
        maxValue: 75,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "60% to 75%"
      });
      whiterenderer.addClassBreakInfo({
        minValue: 75,
        maxValue: 85,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "75% to 85%"
      });
      whiterenderer.addClassBreakInfo({
        minValue: 85,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#253494"
        },
        label: "> 85%"
      });
      // Hispanic percent
      var hisprenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.Hispanic/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Hispanic"
        }
      });
      hisprenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 10%"
      });
      hisprenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 20,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "10% to 20%"
      });
      hisprenderer.addClassBreakInfo({
        minValue: 20,
        maxValue: 30,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "20% to 30%"
      });
      hisprenderer.addClassBreakInfo({
        minValue: 30,
        maxValue: 50,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "30% to 50%"
      });
      hisprenderer.addClassBreakInfo({
        minValue: 50,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#253494"
        },
        label: "> 50%"
      });
      // Black percent
      var blackrenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.NHBLACK/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Non-Hispanic Black"
        }
      });
      blackrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 1,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 1%"
      });
      blackrenderer.addClassBreakInfo({
        minValue: 1,
        maxValue: 2,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "1% to 2%"
      });
      blackrenderer.addClassBreakInfo({
        minValue: 2,
        maxValue: 4,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "2% to 4%"
      });
      blackrenderer.addClassBreakInfo({
        minValue: 4,
        maxValue: 8,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "4% to 8%"
      });
      blackrenderer.addClassBreakInfo({
        minValue: 8,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#253494"
        },
        label: "> 8%"
      });
      // Asian percent
      var asianrenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "(($feature.NHASIAN+$feature.NHPI)/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Non-Hispanic Asian"
        }
      });
      asianrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 1,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 1%"
      });
      asianrenderer.addClassBreakInfo({
        minValue: 1,
        maxValue: 2,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "1% to 2%"
      });
      asianrenderer.addClassBreakInfo({
        minValue: 2,
        maxValue: 4,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "2% to 4%"
      });
      asianrenderer.addClassBreakInfo({
        minValue: 4,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "> 4%"
      });
      // Native American percent
      var amerrenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.NHAMERI/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Non-Hispanic American Indian"
        }
      });
      amerrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 2,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 2%"
      });
      amerrenderer.addClassBreakInfo({
        minValue: 2,
        maxValue: 5,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "2% to 5%"
      });
      amerrenderer.addClassBreakInfo({
        minValue: 5,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "5% to 10%"
      });
      amerrenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "> 10%"
      });
      
      // Other percent
      var otherrenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.OTHERALONE/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Other Race (Hispanic and Non-Hispanic)"
        }
      });
      otherrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 2,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 2%"
      });
      otherrenderer.addClassBreakInfo({
        minValue: 2,
        maxValue: 4,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "2% to 4%"
      });
      otherrenderer.addClassBreakInfo({
        minValue: 4,
        maxValue: 8,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "4% to 8%"
      });
      otherrenderer.addClassBreakInfo({
        minValue: 8,
        maxValue: 12,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "8% to 12%"
      });
      otherrenderer.addClassBreakInfo({
        minValue: 12,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#253494"
        },
        label: "> 12%"
      });
            // Multi percent
      var multirenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.MULTIALONE/$feature.TOTALPOP)*100",
        legendOptions: {
          title: "Percent Two or More Races (Hispanic and Non-Hispanic"
        }
      });
      multirenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 8,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 8%"
      });
      multirenderer.addClassBreakInfo({
        minValue: 8,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#a1dab4"
        },
        label: "8% to 10%"
      });
      multirenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 12,
        symbol: {
          type: "simple-fill",  
          color: "#41b6c4"
        },
        label: "10% to 12%"
      });
      multirenderer.addClassBreakInfo({
        minValue: 12,
        maxValue: 14,
        symbol: {
          type: "simple-fill",  
          color: "#2c7fb8"
        },
        label: "12% to 14%"
      });
      multirenderer.addClassBreakInfo({
        minValue: 14,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#253494"
        },
        label: "> 14%"
      });
      // Vacancy percent
      var vacrenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "($feature.VACANT/$feature.HOUSEUNIT)*100",
        legendOptions: {
          title: "Percent Vacant"
        }
      });
      vacrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 5,
        symbol: {
          type: "simple-fill",  
          color: "#ffffd4"
        },
        label: "< 5%"
      });
      vacrenderer.addClassBreakInfo({
        minValue: 5,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#fed98e"
        },
        label: "5% to 10%"
      });
      vacrenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 15,
        symbol: {
          type: "simple-fill",  
          color: "#fe9929"
        },
        label: "10% to 15%"
      });
      vacrenderer.addClassBreakInfo({
        minValue: 15,
        maxValue: 40,
        symbol: {
          type: "simple-fill",  
          color: "#d95f0e"
        },
        label: "15% to 40%"
      });
      vacrenderer.addClassBreakInfo({
        minValue: 40,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#993404"
        },
        label: "> 40%"
      });
      // GQ Renderer
      var gqrenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        field: statLabel,
        legendOptions: {
          title: statselect.options[statselect.selectedIndex].text + " Population"
        }
      });
      gqrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "No"
      });
      gqrenderer.addClassBreakInfo({
        minValue: 1,
        maxValue: 5000000,
        symbol: {
          type: "simple-fill",  
          color: "#e53226"
        },
        label: "Yes"
      });
      // Popups  
      

      //console.log(geoLabel);
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

      //console.log(statLabel);
      switch(statLabel){
        case "O18":
          countyLayer.renderer = o18renderer;
          placeLayer.renderer = o18renderer;
          tractLayer.renderer = o18renderer;
          bgLayer.renderer = o18renderer;
          break;
        case "U18":
          countyLayer.renderer = u18renderer;
          placeLayer.renderer = u18renderer;
          tractLayer.renderer = u18renderer;
          bgLayer.renderer = u18renderer;
          break; 
        case "WHITE":
          countyLayer.renderer = whiterenderer;
          placeLayer.renderer = whiterenderer;
          tractLayer.renderer = whiterenderer;
          bgLayer.renderer = whiterenderer;
          break;
        case "HISP":
          countyLayer.renderer = hisprenderer;
          placeLayer.renderer = hisprenderer;
          tractLayer.renderer = hisprenderer;
          bgLayer.renderer = hisprenderer;
          break;
        case "BLACK":
          countyLayer.renderer = blackrenderer;
          placeLayer.renderer = blackrenderer;
          tractLayer.renderer = blackrenderer;
          bgLayer.renderer = blackrenderer;
          break;
        case "NANH":
          countyLayer.renderer = amerrenderer;
          placeLayer.renderer = amerrenderer;
          tractLayer.renderer = amerrenderer;
          bgLayer.renderer = amerrenderer;
          break;
        case "APNH":
          countyLayer.renderer = asianrenderer;
          placeLayer.renderer = asianrenderer;
          tractLayer.renderer = asianrenderer;
          bgLayer.renderer = asianrenderer;
          break;
        case "OTHER":
          countyLayer.renderer = otherrenderer;
          placeLayer.renderer = otherrenderer;
          tractLayer.renderer = otherrenderer;
          bgLayer.renderer = otherrenderer;
          break;
        case "MULTI":
          countyLayer.renderer = multirenderer;
          placeLayer.renderer = multirenderer;
          tractLayer.renderer = multirenderer;
          bgLayer.renderer = multirenderer;
          break;
        case "VACANT":
          countyLayer.renderer = vacrenderer;
          placeLayer.renderer = vacrenderer;
          tractLayer.renderer = vacrenderer;
          bgLayer.renderer = vacrenderer;
          break;
        case "GQPOP":
        case "INSTITPOP":
        case "CORRPOP":
        case "JUVPOP":
        case "NURSINGPOP":
        case "OINSTITPOP":
        case "NONINSTPOP":
        case "COLLEGEPOP":
        case "MILITPOP":
        case "ONINSTITPO":
          console.log(statselect.options[statselect.selectedIndex].value);
          countyLayer.renderer = gqrenderer;
          placeLayer.renderer = gqrenderer;
          tractLayer.renderer = gqrenderer;
          bgLayer.renderer = gqrenderer;
          break;
      }
    }

    

  }
);