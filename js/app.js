require([
    "esri/WebMap",
    "esri/Basemap",
    "esri/layers/FeatureLayer",
    "esri/views/MapView",
    "esri/widgets/Feature",
    "esri/renderers/support/ClassBreakInfo",
    "esri/renderers/ClassBreaksRenderer",
    "esri/smartMapping/renderers/predominance",
    "esri/widgets/Legend",
    "esri/widgets/Expand",
    "esri/popup/content/ColumnChartMediaInfo",
    "esri/popup/content/PieChartMediaInfo",
    "esri/popup/content/support/ChartMediaInfoValue",
    "esri/popup/content/FieldsContent",
    "esri/widgets/Print"
  ], function (WebMap, Basemap, FeatureLayer, MapView, Feature, ClassBreakInfo, ClassBreaksRenderer, predominanceRendererCreator, Legend, Expand, ColumnChartMediaInfo, PieChartMediaInfo, ChartMediaInfoValue, FieldsContent, Print) {
  
    //Access infodiv for popups
    var popdiv = document.getElementById("infodiv");
  
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

    let outlinerenderer = {
      type: "simple",  // autocasts as new SimpleRenderer()
      symbol: {
        type: "simple-fill",
        style: "none",
        color: "black",
        outline: {  // autocasts as new SimpleLineSymbol()
          width: 2,
          color: "black"
        }
      }
    };

    const labelClass = {
      // autocasts as new LabelClass()
      symbol: {
        type: "text",  // autocasts as new TextSymbol()
        color: "black",
        font: {  // autocast as new Font()
          family: "Playfair Display",
          size: 8,
          weight: "bold"
        }
      },
      labelPlacement: "above-center",
      labelExpressionInfo: {
        expression: "$feature.NAME20"
      },
      maxScale: 1000000
    };

    var popupage = {
      title: "{NAMELSAD20}",
      content:[{
      type: "fields",
            fieldInfos: [
              {
                fieldName: "TOTALPOP",
                label: "Total Population",
                format: {
                  digitSeparator: true
                }
              },
              {
                fieldName: "UNDER18",
                label: "Population Under 18",
                format: {
                  digitSeparator: true
                }
              },
              {
                fieldName: "POP18",
                label: "Population 18 and Older",
                format: {
                  digitSeparator: true
                }
              }
            ]
      },{
        type: "media",
        mediaInfos: [
          {
            title: "Population by Age Group",
            type: "column-chart",
            caption: "",
            value: {
              fields: ["UNDER18", "POP18"],
              normalizeField: null,
              tooltipField: "TOOLTIP ON HOVER"
            }
          }]
      }],
      expressionInfos: [{
        name: "under18",
        expression: "Text($feature.TOTALPOP-$feature.POP18, '#,###')"
      },{
        name: "under18num",
        expression: "$feature.TOTALPOP-$feature.POP18"
      },{
        name: "over18",
        expression: "Text($feature.POP18, '#,###')"
      },{
        name: "pop",
        expression: "Text($feature.TOTALPOP, '#,###')"
      },{
        name: "under18pct",
        expression: "Round((($feature.TOTALPOP-$feature.POP18)/$feature.TOTALPOP)*100,2)"
      },{
        name: "over18pct",
        expression: "Round(($feature.POP18/$feature.TOTALPOP)*100,2)"
      }],
      fieldInfos: [{
        fieldName: "TOTALPOP",
        format: {
          digitSeparator: true,
          places: 0
          },
      fieldName: "POP18",
          format: {
            digitSeparator: true,
            places: 0
            }
      }]
    };

    function u18(feature){
      let u18tot = feature.graphics.attributes.TOTALPOP - feature.graphics.attributes.POP18;
      return u18tot;
    }

    var countyOutline = new FeatureLayer({
      title: "County Outline",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_County_Data_2020/FeatureServer/0",
      popupEnabled: false,
      labelingInfo: [labelClass],
      renderer: outlinerenderer
    })
    
    var countyLayer = new FeatureLayer({
      title: "Counties",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_County_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      popupTemplate: popupage,
      opacity: .75,
      visible: true

    });
    var placeLayer = new FeatureLayer({
      title: "Census Places",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_Place_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      popupTemplate: popupage,
      opacity: .75,
      visible: false

    });
    var tractLayer = new FeatureLayer({
      title: "Census Tracts",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_Tract_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      popupTemplate: popupage,
      opacity: .75,
      visible: false
    });
    var bgLayer = new FeatureLayer({
      title: "Block Groups",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_BG_Data_2020/FeatureServer/0",
      renderer: u18renderer,
      popupTemplate: popupage,
      opacity: .75,
      visible: false
    });

    var fLayer = countyLayer;

    let topoBasemap = Basemap.fromId("topo-vector");
    const map = new WebMap({
      basemap: topoBasemap,
      layers: [countyLayer, placeLayer, tractLayer, bgLayer, countyOutline]
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-105.397803, 39.168709], // longitude, latitude
      zoom: 7,
      popup: {
        autoOpenEnabled: false
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

    var print = new Print({
      view: view,
      // specify your own print service
      printServiceUrl:
        "https://dola-online.maps.arcgis.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
    });

    var expand2 = new Expand({
      view: view,
      content: print,
      expandIconClass: "esri-icon-printer",
      expandTooltip: "Print"
    });

    view.ui.add([expand1], "top-right");
    //view.ui.add([expand2], "bottom-right");

    view.when().then(function () {
      //Update the geography shown
      geoSelect = document.getElementById("geoDiv");
      geoSelect.addEventListener("change", generateRenderer);
      geoSelect.addEventListener("change", hidediv);
      function hidediv() {
        popdiv.style.display = "none";
      }

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

      view.whenLayerView(fLayer).then(function (layerView) {
        let highlight;
        // listen for the pointer-move event on the View
        view.on("click", function (event) {
          // Perform a hitTest on the View
          view.hitTest(event).then(function (event) {
            popdiv.style.display = "initial";
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


    //Create others depending on selected stat
    function generateRenderer() {
      //variables for case statements to select renderers
      const geoLabel = geoselect.options[geoselect.selectedIndex].value;
      const catLabel = catselect.options[catselect.selectedIndex].value;
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
        valueExpression: "($feature."+ statLabel + "/$feature.TOTALPOP)*100",
        legendOptions: {
          title: statselect.options[statselect.selectedIndex].text + " Population"
        }
      });
      gqrenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#ffffff",
          opacity: 1
        },
        label: "None"
      });
      gqrenderer.addClassBreakInfo({
        minValue: 0.00000001,
        maxValue: 1,
        symbol: {
          type: "simple-fill",  
          color: "#ffffcc"
        },
        label: "< 1%"
      });
      gqrenderer.addClassBreakInfo({
        minValue: 1,
        maxValue: 2,
        symbol: {
          type: "simple-fill",  
          color: "#c2e699"
        },
        label: "1% to 2%"
      });
      gqrenderer.addClassBreakInfo({
        minValue: 2,
        maxValue: 5,
        symbol: {
          type: "simple-fill",  
          color: "#78c679"
        },
        label: "2% to 5%"
      });
      gqrenderer.addClassBreakInfo({
        minValue: 5,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#238443"
        },
        label: "> 5%"
      });

  // Prevalence
    var prevrenderer = {
        type: "unique-value",
        field: "PREV",
        legendOptions: {
          title: "Most Prevalent Race or Ethnicity"
        },
      uniqueValueInfos:[
        {
          value: "Hispanic",
          symbol: {
            type: "simple-fill",  
            color: "red"
          },
          label: "Hispanic"
        },
        {
          value: "White",
          symbol: {
            type: "simple-fill",  
            color: "yellow"
          },
          label: "White"
        },
        {
          value: "Black",
          symbol: {
            type: "simple-fill",  
            color: "blue"
          },
          label: "White"
        },
        {
          value: "Native American",
          symbol: {
            type: "simple-fill",  
            color: "purple"
          },
          label: "Native American"
        },
        {
          value: "Asian/Pacific Islander",
          symbol: {
            type: "simple-fill",  
            color: "green"
          },
          label: "Asian/Pacific Islander"
        }
      ]
    };

    // 2nd Prevalence
    var secondrenderer = {
      type: "unique-value",
      field: "PREV2",
      legendOptions: {
        title: "Most Prevalent Race or Ethnicity"
      },
    uniqueValueInfos:[
      {
        value: "Hispanic",
        symbol: {
          type: "simple-fill",  
          color: "red"
        },
        label: "Hispanic"
      },
      {
        value: "White",
        symbol: {
          type: "simple-fill",  
          color: "yellow"
        },
        label: "White"
      },
      {
        value: "Black",
        symbol: {
          type: "simple-fill",  
          color: "blue"
        },
        label: "White"
      },
      {
        value: "Native American",
        symbol: {
          type: "simple-fill",  
          color: "purple"
        },
        label: "Native American"
      },
      {
        value: "Asian/Pacific Islander",
        symbol: {
          type: "simple-fill",  
          color: "green"
        },
        label: "Asian/Pacific Islander"
      }
    ]
  };                        

  
        
      //Population Change renderer
      var popchangerenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "(($feature.TOTALPOP - $feature.POP10)/$feature.POP10)*100",
        legendOptions: {
          title: "Percent Population Change"
        }
      });
      popchangerenderer.addClassBreakInfo({
        minValue: -100,
        maxValue: -10,
        symbol: {
          type: "simple-fill",  
          color: "#2c7bb6"
        },
        label: "> 10% Loss"
      });
      popchangerenderer.addClassBreakInfo({
        minValue: -10,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#abd9e9"
        },
        label: "0% to 10% Loss"
      });    
      popchangerenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#ffffbf"
        },
        label: "0% to 10% Gain"
      });  
      popchangerenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 20,
        symbol: {
          type: "simple-fill",  
          color: "#fdae61"
        },
        label: "10% to 20% Gain"
      });
      popchangerenderer.addClassBreakInfo({
        minValue: 20,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#d7191c"
        },
        label: "> 20% Gain"
      }); 

      //Under 18 Population Change renderer
      var u18changerenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "(($feature.UNDER18 - $feature.U1810)/$feature.U1810)*100",
        legendOptions: {
          title: "Percent Under 18 Population Change"
        }
      });
      u18changerenderer.addClassBreakInfo({
        minValue: -100,
        maxValue: -10,
        symbol: {
          type: "simple-fill",  
          color: "#4575b4"
        },
        label: "> 10% Loss"
      });
      u18changerenderer.addClassBreakInfo({
        minValue: -10,
        maxValue: -5,
        symbol: {
          type: "simple-fill",  
          color: "#91bfdb"
        },
        label: "5% to 10% Loss"
      });    
      u18changerenderer.addClassBreakInfo({
        minValue: -5,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#e0f3f8"
        },
        label: "0% to 5% Loss"
      });  
      u18changerenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#fc8d59"
        },
        label: "0% to 10% Gain"
      });
      u18changerenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#d7191c"
        },
        label: "> 10% Gain"
      });

      //Over 18 Population Change renderer
      var o18changerenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "(($feature.POP18 - $feature.O1810)/$feature.O1810)*100",
        legendOptions: {
          title: "Percent Under 18 Population Change"
        }
      });
      o18changerenderer.addClassBreakInfo({
        minValue: -100,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#e0f3f8"
        },
        label: "> 0% Loss"
      });
      o18changerenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 5,
        symbol: {
          type: "simple-fill",  
          color: "#fee090"
        },
        label: "0% to 5% Gain"
      });    
      o18changerenderer.addClassBreakInfo({
        minValue: 5,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#fdae61"
        },
        label: "5% to 10% Gain"
      });  
      o18changerenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 20,
        symbol: {
          type: "simple-fill",  
          color: "#f46d43"
        },
        label: "10% to 20% Gain"
      });
      o18changerenderer.addClassBreakInfo({
        minValue: 20,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#d73027"
        },
        label: "> 20% Gain"
      });

      //Hispanic Population Change renderer
      var hispchangerenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "(($feature.HISPANIC - $feature.HISP10)/$feature.HISP10)*100",
        legendOptions: {
          title: "Percent Hispanic Population Change"
        }
      });
      hispchangerenderer.addClassBreakInfo({
        minValue: -100,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#e0f3f8"
        },
        label: "> 0% Loss"
      });
      hispchangerenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#fee090"
        },
        label: "0% to 10% Gain"
      });    
      hispchangerenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 20,
        symbol: {
          type: "simple-fill",  
          color: "#fdae61"
        },
        label: "10% to 20% Gain"
      });  
      hispchangerenderer.addClassBreakInfo({
        minValue: 20,
        maxValue: 40,
        symbol: {
          type: "simple-fill",  
          color: "#f46d43"
        },
        label: "20% to 40% Gain"
      });
      hispchangerenderer.addClassBreakInfo({
        minValue: 40,
        maxValue: 200,
        symbol: {
          type: "simple-fill",  
          color: "#d73027"
        },
        label: "> 40% Gain"
      });

      //White Population Change renderer
      var whitechangerenderer = new ClassBreaksRenderer({
        type: "class-breaks",
        valueExpression: "(($feature.NHWHITE - $feature.NHW10)/$feature.NHW10)*100",
        legendOptions: {
          title: "Percent Non-Hispanic White Population Change"
        }
      });
      whitechangerenderer.addClassBreakInfo({
        minValue: -100,
        maxValue: -5,
        symbol: {
          type: "simple-fill",  
          color: "#2c7bb6"
        },
        label: "> 5% Loss"
      });
      whitechangerenderer.addClassBreakInfo({
        minValue: -5,
        maxValue: 0,
        symbol: {
          type: "simple-fill",  
          color: "#abd9e9"
        },
        label: "0% to 5% Loss"
      });    
      whitechangerenderer.addClassBreakInfo({
        minValue: 0,
        maxValue: 5,
        symbol: {
          type: "simple-fill",  
          color: "#ffffbf"
        },
        label: "0% to 5% Gain"
      });  
      whitechangerenderer.addClassBreakInfo({
        minValue: 5,
        maxValue: 10,
        symbol: {
          type: "simple-fill",  
          color: "#fdae61"
        },
        label: "5% to 10% Gain"
      });
      whitechangerenderer.addClassBreakInfo({
        minValue: 10,
        maxValue: 100,
        symbol: {
          type: "simple-fill",  
          color: "#d7191c"
        },
        label: "> 10% Gain"
      });

            //Black Population Change renderer
            var blackchangerenderer = new ClassBreaksRenderer({
              type: "class-breaks",
              valueExpression: "(($feature.NHBLACK - $feature.NHB10)/$feature.NHB10)*100",
              legendOptions: {
                title: "Percent Non-Hispanic Black Population Change"
              }
            });
            blackchangerenderer.addClassBreakInfo({
              minValue: -1000,
              maxValue: -10,
              symbol: {
                type: "simple-fill",  
                color: "#2c7bb6"
              },
              label: "> 10% Loss"
            });
            blackchangerenderer.addClassBreakInfo({
              minValue: -10,
              maxValue: 0,
              symbol: {
                type: "simple-fill",  
                color: "#abd9e9"
              },
              label: "0% to 10% Loss"
            });    
            blackchangerenderer.addClassBreakInfo({
              minValue: 0,
              maxValue: 20,
              symbol: {
                type: "simple-fill",  
                color: "#ffffbf"
              },
              label: "0% to 20% Gain"
            });  
            blackchangerenderer.addClassBreakInfo({
              minValue: 20,
              maxValue: 40,
              symbol: {
                type: "simple-fill",  
                color: "#fdae61"
              },
              label: "20% to 40% Gain"
            });
            blackchangerenderer.addClassBreakInfo({
              minValue: 40,
              maxValue: 1000,
              symbol: {
                type: "simple-fill",  
                color: "#d7191c"
              },
              label: "> 40% Gain"
            });

            //American Indian Population Change renderer
            var amerchangerenderer = new ClassBreaksRenderer({
              type: "class-breaks",
              valueExpression: "(($feature.NHAMERI - $feature.NHAMER10)/$feature.NHAMER10)*100",
              legendOptions: {
                title: "Percent Non-Hispanic American Indian Population Change"
              }
            });
            amerchangerenderer.addClassBreakInfo({
              minValue: -1000,
              maxValue: -10,
              symbol: {
                type: "simple-fill",  
                color: "#2c7bb6"
              },
              label: "> 10% Loss"
            });
            amerchangerenderer.addClassBreakInfo({
              minValue: -10,
              maxValue: 0,
              symbol: {
                type: "simple-fill",  
                color: "#abd9e9"
              },
              label: "0% to 10% Loss"
            });    
            amerchangerenderer.addClassBreakInfo({
              minValue: 0,
              maxValue: 20,
              symbol: {
                type: "simple-fill",  
                color: "#ffffbf"
              },
              label: "0% to 20% Gain"
            });  
            amerchangerenderer.addClassBreakInfo({
              minValue: 20,
              maxValue: 40,
              symbol: {
                type: "simple-fill",  
                color: "#fdae61"
              },
              label: "20% to 40% Gain"
            });
            amerchangerenderer.addClassBreakInfo({
              minValue: 40,
              maxValue: 1000,
              symbol: {
                type: "simple-fill",  
                color: "#d7191c"
              },
              label: "> 40% Gain"
            });

            //Asian Population Change renderer
            var asianchangerenderer = new ClassBreaksRenderer({
              type: "class-breaks",
              valueExpression: "(($feature.NHASIANPI - $feature.NHASPI10)/$feature.NHASPI10)*100",
              legendOptions: {
                title: "Percent Non-Hispanic Asian/Pacific Islander Population Change"
              }
            });
            asianchangerenderer.addClassBreakInfo({
              minValue: -1000,
              maxValue: -10,
              symbol: {
                type: "simple-fill",  
                color: "#2c7bb6"
              },
              label: "> 10% Loss"
            });
            asianchangerenderer.addClassBreakInfo({
              minValue: -10,
              maxValue: 0,
              symbol: {
                type: "simple-fill",  
                color: "#abd9e9"
              },
              label: "0% to 10% Loss"
            });    
            asianchangerenderer.addClassBreakInfo({
              minValue: 0,
              maxValue: 20,
              symbol: {
                type: "simple-fill",  
                color: "#ffffbf"
              },
              label: "0% to 20% Gain"
            });  
            asianchangerenderer.addClassBreakInfo({
              minValue: 20,
              maxValue: 40,
              symbol: {
                type: "simple-fill",  
                color: "#fdae61"
              },
              label: "20% to 40% Gain"
            });
            asianchangerenderer.addClassBreakInfo({
              minValue: 40,
              maxValue: 1000,
              symbol: {
                type: "simple-fill",  
                color: "#d7191c"
              },
              label: "> 40% Gain"
            });

            //Housing Unit Change renderer
            var huchangerenderer = new ClassBreaksRenderer({
              type: "class-breaks",
              valueExpression: "(($feature.HOUSEUNIT - $feature.HU10)/$feature.HU10)*100",
              legendOptions: {
                title: "Percent Housing Unit Change"
              }
            });
            huchangerenderer.addClassBreakInfo({
              minValue: -1000,
              maxValue: -5,
              symbol: {
                type: "simple-fill",  
                color: "#2c7bb6"
              },
              label: "> 5% Loss"
            });
            huchangerenderer.addClassBreakInfo({
              minValue: -5,
              maxValue: 0,
              symbol: {
                type: "simple-fill",  
                color: "#abd9e9"
              },
              label: "0% to 5% Loss"
            });    
            huchangerenderer.addClassBreakInfo({
              minValue: 0,
              maxValue: 10,
              symbol: {
                type: "simple-fill",  
                color: "#ffffbf"
              },
              label: "0% to 10% Gain"
            });  
            huchangerenderer.addClassBreakInfo({
              minValue: 10,
              maxValue: 20,
              symbol: {
                type: "simple-fill",  
                color: "#fdae61"
              },
              label: "10% to 20% Gain"
            });
            huchangerenderer.addClassBreakInfo({
              minValue: 20,
              maxValue: 1000,
              symbol: {
                type: "simple-fill",  
                color: "#d7191c"
              },
              label: "> 20% Gain"
            });

            //Group Quarters Change renderer
            var gqchangerenderer = new ClassBreaksRenderer({
              type: "class-breaks",
              valueExpression: "(($feature.GQPOP - $feature.GQPOP10)/$feature.GQPOP10)*100",
              legendOptions: {
                title: "Percent Group Quarters Population Change"
              }
            });
            gqchangerenderer.addClassBreakInfo({
              minValue: -1000,
              maxValue: -10,
              symbol: {
                type: "simple-fill",  
                color: "#2c7bb6"
              },
              label: "> 10% Loss"
            });
            gqchangerenderer.addClassBreakInfo({
              minValue: -10,
              maxValue: 0,
              symbol: {
                type: "simple-fill",  
                color: "#abd9e9"
              },
              label: "0% to 10% Loss"
            });    
            gqchangerenderer.addClassBreakInfo({
              minValue: 0,
              maxValue: 10,
              symbol: {
                type: "simple-fill",  
                color: "#ffffbf"
              },
              label: "0% to 10% Gain"
            });  
            gqchangerenderer.addClassBreakInfo({
              minValue: 10,
              maxValue: 25,
              symbol: {
                type: "simple-fill",  
                color: "#fdae61"
              },
              label: "10% to 25% Gain"
            });
            gqchangerenderer.addClassBreakInfo({
              minValue: 25,
              maxValue: 1000,
              symbol: {
                type: "simple-fill",  
                color: "#d7191c"
              },
              label: "> 25% Gain"
            });

      // Popups  
      var popuprace = {
        title: "{NAMELSAD20}",
        content:[{
        type: "fields",
              fieldInfos: [
                {
                  fieldName: "TOTALPOP",
                  label: "Total Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "HISPANIC",
                  label: "Hispanic",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHWHITE",
                  label: "Non-Hispanic White",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHBLACK",
                  label: "Non-Hispanic Black",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHAMERI",
                  label: "Non-Hispanic American Indian",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHASIANPI",
                  label: "Non-Hispanic Asian/Pacific Islander",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "OTHERALONE",
                  label: "Other Race (Includes Hispanic)",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "MULTIALONE",
                  label: "Multiple Races (Includes Hispanic)",
                  format: {
                    digitSeparator: true
                  }
                }
              ]
        },{
          type: "media",
          mediaInfos: [
            {
              title: "<b>Population by Race</b>",
              type: "column-chart",
              caption: "",
              value: {
                fields: ["HISPANIC", "NHWHITE", "NHBLACK", "NHAMERI", "NHASIANPI", "OTHERALONE", "MULTIALONE"],
                normalizeField: null,
                tooltipField: ""
              }
            }]
        }],
        expressionInfos: [{
          name: "pop",
          expression: "Text($feature.TOTALPOP, '#,###')"
        },{
          name: "hisp",
          expression: "Text($feature.HISPANIC, '#,###')"
        },{
          name: "hisppct",
          expression: "Round((($feature.HISPANIC)/$feature.TOTALPOP)*100,2)"
        },{
          name: "white",
          expression: "Text($feature.NHWHITE, '#,###')"
        },{
          name: "whitepct",
          expression: "Round(($feature.NHWHITE/$feature.TOTALPOP)*100,2)"
        },{
          name: "black",
          expression: "Text($feature.NHBLACK, '#,###')"
        },{
          name: "blackpct",
          expression: "Round(($feature.NHBLACK/$feature.TOTALPOP)*100,2)"
        },{
          name: "ameri",
          expression: "Text($feature.NHAMERI, '#,###')"
        },{
          name: "ameripct",
          expression: "Round(($feature.NHAMERI/$feature.TOTALPOP)*100,2)"
        },{
          name: "asian",
          expression: "Text($feature.NHASIAN + $feature.NHPI, '#,###')"
        },{
          name: "asiannum",
          expression: "$feature.NHASIAN + $feature.NHPI"
        },{
          name: "asianpct",
          expression: "Round((($feature.NHASIAN + $feature.NHPI)/$feature.TOTALPOP)*100,2)"
        },{
          name: "other",
          expression: "Text($feature.OTHERALONE, '#,###')"
        },{
          name: "otherpct",
          expression: "Round(($feature.OTHERALONE/$feature.TOTALPOP)*100,2)"
        },{
          name: "multi",
          expression: "Text($feature.MULTIALONE, '#,###')"
        },{
          name: "multipct",
          expression: "Round(($feature.MULTIALONE/$feature.TOTALPOP)*100,2)"
        }]
      };

      var popuphouse = {
        title: "{NAMELSAD20}",
        content:[{
        type: "fields",
              fieldInfos: [
                {
                  fieldName: "HOUSEUNIT",
                  label: "Housing Units",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "OCCUPIED",
                  label: "Occupied Units",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "VACANT",
                  label: "Vacant Units",
                  format: {
                    digitSeparator: true
                  }
                }
              ]
        },{
            type: "media",
            mediaInfos: [
              {
                title: "<b>Occupancy Status</b>",
                type: "pie-chart",
                caption: "",
                value: {
                  fields: ["OCCUPIED", "VACANT"],
                  normalizeField: null,
                  tooltipField: ""
                }
              }]
          }],

        expressionInfos: [{
          name: "house",
          expression: "Text($feature.HOUSEUNIT, '#,###')"
        },{
          name: "occ",
          expression: "Text($feature.OCCUPIED, '#,###')"
        },{
          name: "vac",
          expression: "Text($feature.VACANT, '#,###')"
        },{
          name: "occpct",
          expression: "Round((($feature.OCCUPIED)/$feature.HOUSEUNIT)*100,2)"
        },{
          name: "vacpct",
          expression: "Round(($feature.VACANT/$feature.HOUSEUNIT)*100,2)"
        }]
      };

      var popupgq = {
        title: "{NAMELSAD20}",
        content:[{
        type: "fields",
              fieldInfos: [
                {
                  fieldName: "TOTALPOP",
                  label: "Total Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "GQPOP",
                  label: "Group Quarters Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "INSTITPOP",
                  label: "Institutionalized Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "CORRPOP",
                  label: "Correctional Facility Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "JUVPOP",
                  label: "Juvenile Facility Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NURSINGPOP",
                  label: "Nursing Home Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "OINSTITPOP",
                  label: "Other Institutionalized Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NONINSTPOP",
                  label: "Non-Institutionalized Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "COLLEGEPOP",
                  label: "College Housin Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "MILITPOP",
                  label: "Military Housing Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "ONINSTITPO",
                  label: "Other Non-Institutionalized Population",
                  format: {
                    digitSeparator: true
                  }
                }
              ]
      },{
            type: "media",
            mediaInfos: [
              {
                title: "<b>Group Quarters Population by Type</b>",
                type: "column-chart",
                caption: "",
                value: {
                  fields: ["INSTITPOP", "CORRPOP", "JUVPOP", "NURSINGPOP", "OINSTITPOP", "COLLEGEPOP", "MILITPOP", "ONINSTITPO"],
                  normalizeField: null,
                  tooltipField: ""
                }
              }]
          }],
        expressionInfos: [{
          name: "pop",
          expression: "Text($feature.TOTALPOP, '#,###')"
        },{
          name: "gq",
          expression: "Text($feature.GQPOP, '#,###')"
        },{
          name: "gqpct",
          expression: "Round((($feature.GQPOP)/$feature.TOTALPOP)*100,2)"
        },{
          name: "inst",
          expression: "Text($feature.INSTITPOP, '#,###')"
        },{
          name: "instpct",
          expression: "Round((($feature.INSTITPOP)/$feature.TOTALPOP)*100,2)"
        },{
          name: "corr",
          expression: "Text($feature.CORRPOP, '#,###')"
        },{
          name: "corrpct",
          expression: "Round(($feature.CORRPOP/$feature.TOTALPOP)*100,2)"
        },{
          name: "juv",
          expression: "Text($feature.JUVPOP, '#,###')"
        },{
          name: "juvpct",
          expression: "Round(($feature.JUVPOP/$feature.TOTALPOP)*100,2)"
        },{
          name: "nurse",
          expression: "Text($feature.NURSINGPOP, '#,###')"
        },{
          name: "nursepct",
          expression: "Round(($feature.NURSINGPOP/$feature.TOTALPOP)*100,2)"
        },{
          name: "oinst",
          expression: "Text($feature.OINSTITPOP, '#,###')"
        },{
          name: "oinstpct",
          expression: "Round((($feature.OINSTITPOP)/$feature.TOTALPOP)*100,2)"
        },{
          name: "ninst",
          expression: "Text($feature.NONINSTPOP, '#,###')"
        },{
          name: "ninstpct",
          expression: "Round(($feature.NONINSTPOP/$feature.TOTALPOP)*100,2)"
        },{
          name: "coll",
          expression: "Text($feature.COLLEGEPOP, '#,###')"
        },{
          name: "collpct",
          expression: "Round(($feature.COLLEGEPOP/$feature.TOTALPOP)*100,2)"
        },{
          name: "mil",
          expression: "Text($feature.MILITPOP, '#,###')"
        },{
          name: "milpct",
          expression: "Round(($feature.MILITPOP/$feature.TOTALPOP)*100,2)"
        },{
          name: "oninst",
          expression: "Text($feature.ONINSTITPO, '#,###')"
        },{
          name: "oninstpct",
          expression: "Round(($feature.ONINSTITPO/$feature.TOTALPOP)*100,2)"
        }]
      };

      var popupchange = {
        title: "{NAMELSAD20}",
        content:[{
        type: "fields",
              fieldInfos: [
                {
                  fieldName: "TOTALPOP",
                  label: "2020 Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "POP10",
                  label: "2010 Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/popchange",
                  label: "Population Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "HOUSEUNIT",
                  label: "2020 Housing Units",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "HU10",
                  label: "2010 Housing Units",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/huchange",
                  label: "Housing Unit Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "HISPANIC",
                  label: "2020 Hispanic",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "HISP10",
                  label: "2010 Hispanic",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/hispchange",
                  label: "Hispanic Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHWHITE",
                  label: "2020 Non-Hispanic White",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHW10",
                  label: "2010 Non-Hispanic White",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/whitechange",
                  label: "Non-Hispanic White Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHBLACK",
                  label: "2020 Non-Hispanic Black",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHB10",
                  label: "2010 Non-Hispanic Black",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/blackchange",
                  label: "Non-Hispanic Black Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHAMERI",
                  label: "2020 Non-Hispanic American Indian",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHAMER10",
                  label: "2010 Non-Hispanic American Indian",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/amerchange",
                  label: "Non-Hispanic American Indian Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHASIANPI",
                  label: "2020 Non-Hispanic Asian/Pacific Islander",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "NHASPI10",
                  label: "2010 Non-Hispanic Asian/Pacific Islander",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/asianchange",
                  label: "Non-Hispanic Asian/Pacific Islander Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "UNDER18",
                  label: "2020 Under 18 Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "U1810",
                  label: "2010 Under 18 Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/u18change",
                  label: "Under 18 Population Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "POP18",
                  label: "2020 18 and Older Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "O1810",
                  label: "2010 18 and Older Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/o18change",
                  label: "18 and Older Population Change",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "GQPOP",
                  label: "2020 Group Quarters Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "GQPOP10",
                  label: "2010 Group Quarters Population",
                  format: {
                    digitSeparator: true
                  }
                },
                {
                  fieldName: "expression/gqchange",
                  label: "Group Quarters Population Change",
                  format: {
                    digitSeparator: true
                  }
                }
              ]
        }],

        expressionInfos: [{
          name: "popchange",
          title: "Population Change",
          expression: "Round((($feature.TOTALPOP-$feature.POP10)/$feature.POP10)*100,2) + '%'"
        },{
          name: "huchange",
          title: "Housing Unit Change",
          expression: "Round((($feature.HOUSEUNIT-$feature.HU10)/$feature.HU10)*100,2) + '%'"
        },{
          name: "hispchange",
          title: "Hispanic Change",
          expression: "Round((($feature.HISPANIC-$feature.HISP10)/$feature.HISP10)*100,2) + '%'"
        },{
          name: "whitechange",
          title: "Non-Hispanic White Change",
          expression: "Round((($feature.NHWHITE-$feature.NHW10)/$feature.NHW10)*100,2) + '%'"
        },{
          name: "blackchange",
          title: "Non-Hispanic Black Change",
          expression: "Round((($feature.NHBLACK-$feature.NHB10)/$feature.NHB10)*100,2) + '%'"
        },{
          name: "amerchange",
          title: "Non-Hispanic American Indian Change",
          expression: "Round((($feature.NHAMERI-$feature.NHAMER10)/$feature.NHAMER10)*100,2) + '%'"
        },{
          name: "asianchange",
          title: "Non-Hispanic Asian/Pacific Islander Change",
          expression: "Round((($feature.NHASIANPI-$feature.NHASPI10)/$feature.NHASPI10)*100,2) + '%'"
        },{
          name: "u18change",
          title: "Under 18 Change",
          expression: "Round((($feature.UNDER18-$feature.U1810)/$feature.U1810)*100,2) + '%'"
        },{
          name: "o18change",
          title: "18 and Older Change",
          expression: "Round((($feature.POP18-$feature.O1810)/$feature.O1810)*100,2) + '%'"
        },{
          name: "gqchange",
          title: "Group Quarters Population Change",
          expression: "Round((($feature.GQPOP-$feature.GQPOP10)/$feature.GQPOP10)*100,2) + '%'"
        }]
      };

      //console.log(geoLabel);
      switch (geoLabel){
        case "County":
          countyLayer.visible = true;
          placeLayer.visible = false;
          tractLayer.visible = false;
          bgLayer.visible = false;
          fLayer = countyLayer;
          break;
        case "Place":
          countyLayer.visible = false;
          placeLayer.visible = true;
          tractLayer.visible = false;
          bgLayer.visible = false;
          fLayer = placeLayer;
          break;
        case "Tract":
          countyLayer.visible = false;
          placeLayer.visible = false;
          tractLayer.visible = true;
          bgLayer.visible = false;
          fLayer = tractLayer;
          break;
        case "Block Group":
          countyLayer.visible = false;
          placeLayer.visible = false;
          tractLayer.visible = false;
          bgLayer.visible = true;
          fLayer = bgLayer;
          break;
      }

      switch (catLabel){
        case "Age":
          countyLayer.popupTemplate = popupage;
          placeLayer.popupTemplate = popupage;
          tractLayer.popupTemplate = popupage;
          bgLayer.popupTemplate = popupage;
          break;
        case "Race":
          countyLayer.popupTemplate = popuprace;
          placeLayer.popupTemplate = popuprace;
          tractLayer.popupTemplate = popuprace;
          bgLayer.popupTemplate = popuprace;
          break;
        case "Housing":
          countyLayer.popupTemplate = popuphouse;
          placeLayer.popupTemplate = popuphouse;
          tractLayer.popupTemplate = popuphouse;
          bgLayer.popupTemplate = popuphouse;
          break;
        case "GQ":
          countyLayer.popupTemplate = popupgq;
          placeLayer.popupTemplate = popupgq;
          tractLayer.popupTemplate = popupgq;
          bgLayer.popupTemplate = popupgq;
          break;
        case "Change":
          countyLayer.popupTemplate = popupchange;
          countyLayer.visible = true;
          placeLayer.visible = false;
          tractLayer.visible = false;
          bgLayer.visible = false;
          fLayer = countyLayer;
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
        case "PREV":
          countyLayer.renderer = prevrenderer;
          placeLayer.renderer = prevrenderer;
          tractLayer.renderer = prevrenderer;
          bgLayer.renderer = prevrenderer;
          break;
        case "2ND":
          countyLayer.renderer = secondrenderer;
          placeLayer.renderer = secondrenderer;
          tractLayer.renderer = secondrenderer;
          bgLayer.renderer = secondrenderer;
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
          countyLayer.renderer = gqrenderer;
          placeLayer.renderer = gqrenderer;
          tractLayer.renderer = gqrenderer;
          bgLayer.renderer = gqrenderer;
          break;
        case "POP10":
          countyLayer.renderer = popchangerenderer;
          break;
        case "U1810":
          countyLayer.renderer = u18changerenderer;
          break;
        case "O1810":
          countyLayer.renderer = o18changerenderer;
          break;
        case "HISP10":
          countyLayer.renderer = hispchangerenderer;
          break;
        case "NHW10":
          countyLayer.renderer = whitechangerenderer;
          break;
        case "NHB10":
          countyLayer.renderer = blackchangerenderer;
          break;
        case "NHAMER10":
          countyLayer.renderer = amerchangerenderer;
          break;
        case "NHASPI10":
          countyLayer.renderer = asianchangerenderer;
          break;
        case "HU10":
          countyLayer.renderer = huchangerenderer;
          break;
        case "GQPOP10":
          countyLayer.renderer = gqchangerenderer;
          break;
      }
    }

    

  }
);
