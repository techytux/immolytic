var data;

$.getJSON( "/search", function( resp ) {

	data = resp.results;
      $('#exposeTable').dataTable( {
          "data": data,
          "columns": [
              { "data": "id" },
              { "data": "city" },
              { "data": "floor_space", "sClass": "numeric" },
              { "data": "price", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "buy_price_sq", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "avg_anual_rental_price_sq", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "avg_montly_rental_price_sq", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "household_income", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "postcode" },
              { "data": "district_name" },
              { "data": "quarter" }
          ]
      } );

	var
		//berlinChart = dc.geoChoroplethChart("#s1"),
		chart1 = dc.rowChart("#s1"),
		chart2 = dc.pieChart("#s2"),
		chart3 = dc.bubbleChart("#s3"),
		chart4 = dc.bubbleChart("#s4"),
		chart5 = dc.bubbleChart("#s5"),
		chart6 = dc.bubbleChart("#s6"),
		chart7 = dc.bubbleChart("#s7"),
		chart8 = dc.bubbleChart("#s8");

	console.log(dc.rowChart);


	var data = crossfilter(data);

	// crossfilter dimensions	
	var
		dimDistrict = data.dimension(function(d){
			return d.compiled_district_name;
		}),
		dimQuarter = data.dimension(function(d){
			return d.quarter;
		});

	// crossfilter groups
	var
		groupDistrictPropertyCount = dimDistrict.group().reduceCount(),
		groupQuarterPropertyCount  = dimQuarter.group().reduceCount();



	//d3.json("/js/us-states.json", function (error, berlinJson) {
		chart1
        		.height(300)
			.dimension(dimDistrict)
        		.group(groupDistrictPropertyCount)        		
        		.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        		.label(function (d) {
            			return d.key;
       			 })
        		.title(function (d) {
           			return d.value;
        		})
        		.elasticX(true)
       			.xAxis().ticks(4);

			//.height(300)
                	//.dimension(dimDistrict)
                	//.group(groupDistrictPropertyCount)
                	//.overlayGeoJson(berlinJson.features, "district", function(d) {
                        //	return d.properties.Name;
			//})
			//.x(d3.scale.ordinal())
			//.xUnits(dc.units.ordinal)
			//.title(function (d) {
			//    return d.value;
			//})
			//.xAxis().ticks(4)
			//.elasticX(true)
			//.render();
		chart2
			.height(300)
                	.dimension(dimQuarter)
                	.group(groupQuarterPropertyCount)
                	//.overlayGeoJson(berlinJson.features, "district", function(d) {
                        //	return d.properties.Name;
			//})
			//.x(d3.scale.ordinal())
			//.xUnits(dc.units.ordinal)
			.title(function (d) {
			    return d.value;
			});
			//.elasticX(true)
			//.xAxis().ticks(4)
	//});
	dc.renderAll();
});
