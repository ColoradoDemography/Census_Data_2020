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

    //default popup
    var popupage = {
      title: "{NAMELSAD20}",
      content:
        "<b>Total Population:</b>  {expression/pop}<br><br>"+
        "<b>Under 18 Population:</b>  {expression/under18}<br>"+
        "<b>Percent Under 18:</b>  {expression/under18pct}%<br><br>"+
        "<b>18 and Older Population:</b>  {expression/over18}<br>"+
        "<b>Percent 18 and Older:</b>  {expression/over18pct}%",
      expressionInfos: [{
        name: "under18",
        expression: "Text($feature.TOTALPOP-$feature.POP18, '#,###')"
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
      }]
    };

    var countyOutline = new FeatureLayer({
      title: "County Outline",
      url: "https://services.arcgis.com/IamIM3RJ5xHykalK/arcgis/rest/services/Census_County_Data_2020/FeatureServer/0",
      popupEnabled: false,
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

    let grayBasemap = Basemap.fromId("gray-vector");
    const map = new WebMap({
      basemap: grayBasemap,
      layers: [countyLayer, placeLayer, tractLayer, bgLayer, countyOutline]
    });

    const view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-105.397803, 39.168709], // longitude, latitude
      zoom: 6,
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
      // Popups  
      var popuprace = {
        title: "{NAMELSAD20}",
        content:
          "<b>Total Population:</b>  {expression/pop}<br><br>"+
          "<b>Hispanic Population:</b>  {expression/hisp}<br>"+
          "<b>Percent Hispanic</b>  {expression/hisppct}%<br><br>"+
          "<b>Non-Hispanic White Population:</b>  {expression/white}<br>"+
          "<b>Percent Non-Hispanic White:</b>  {expression/whitepct}%<br><br>"+
          "<b>Non-Hispanic Black Population:</b>  {expression/black}<br>"+
          "<b>Percent Non-Hispanic Black:</b>  {expression/blackpct}%<br><br>"+
          "<b>Non-Hispanic American Indian Population:</b>  {expression/ameri}<br>"+
          "<b>Percent Non-Hispanic American Indian:</b>  {expression/ameripct}%<br><br>"+
          "<b>Non-Hispanic Asian/Pacific Islander Population:</b>  {expression/asian}<br>"+
          "<b>Percent Non-Hispanic Asian/Pacific Islander:</b>  {expression/asianpct}%<br><br>"+
          "<b>Other Race:</b>  {expression/other}<br>"+
          "<b>Percent Other Race:</b>  {expression/otherpct}%<br><br>"+
          "<b>Non-Hispanic Multiple Races:</b>  {expression/multi}<br>"+
          "<b>Percent Non-Hispanic Multiple Races:</b>  {expression/multipct}%<br><br>",
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
        content:
          "<b>Total Housing Units:</b>  {expression/house}<br><br>"+
          "<b>Occupied:</b>  {expression/occ}<br>"+
          "<b>Percent Occupied:</b>  {expression/occpct}%<br><br>"+
          "<b>Vacant:</b>  {expression/vac}<br>"+
          "<b>Percent Vacant:</b>  {expression/vacpct}%",
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
        content:
          "<b>Total Population:</b>  {expression/pop}<br>"+
          "<b>Group Quarters Population:</b>  {expression/gq}<br>"+
          "<b>Percent of Total Population:</b>  {expression/gqpct}%<br><br>"+
          "<b>Instituionalized Population:</b>  {expression/inst}<br>"+
          "<b>Percent of Total Population:</b>  {expression/instpct}%<br><br>"+
          "<b>Correctional Facility Population:</b>  {expression/corr}<br>"+
          "<b>Percent of Total Population:</b>  {expression/corrpct}%<br><br>"+
          "<b>Juvenile Detention Population:</b>  {expression/juv}<br>"+
          "<b>Percent of Total Population:</b>  {expression/juvpct}%<br><br>"+
          "<b>Nursing Home Population:</b>  {expression/nurse}<br>"+
          "<b>Percent of Total Population:</b>  {expression/nursepct}%<br><br>"+
          "<b>Other Instituionalized Population:</b>  {expression/oinst}<br>"+
          "<b>Percent of Total Population:</b>  {expression/oinstpct}%<br><br>"+
          "<b>Non-Institutionalized Population:</b>  {expression/ninst}<br>"+
          "<b>Percent of Total Population:</b>  {expression/ninstpct}%<br><br>"+
          "<b>College Housing Population:</b>  {expression/coll}<br>"+
          "<b>Percent of Total Population:</b>  {expression/collpct}%<br><br>"+
          "<b>Military Housing Population:</b>  {expression/mil}<br>"+
          "<b>Percent of Total Population:</b>  {expression/milpct}%<br><br>"+
          "<b>Other Non-Institutionalized Population:</b>  {expression/oninst}<br>"+
          "<b>Percent of Total Population:</b>  {expression/oninstpct}%<br><br>",
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