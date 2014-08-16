var data;

function meanAdd(field){
	return function(p, v) {
		var				
			count = p.count + 1,
			sum   = p.sum + v[field],
			mean  = count ? sum / count : 0;
		return { count : count, sum : sum, mean : mean };
	};
};

function meanRemove(field){
	return function(p, v) {
		var				
			count = p.count - 1,
			sum   = p.sum - v[field],
			mean  = count ? sum / count : 0;
		return { count : count, sum : sum, mean : mean };
	};
};

function meanInitial() {
	return { count : 0, sum : 0, mean : 0 };
};

function ratioAdd(num, den){
	return function(p, v) {
		var				
			numerator   = p.numerator + v[num],
			denominator = p.denominator + v[den],
			ratio       = denominator ? numerator / denominator : 0;
		return { numerator : numerator, denominator : denominator, ratio : ratio };
	};
};

function ratioRemove(num, den){
	return function(p, v) {
		var				
			numerator   = p.numerator - v[num],
			denominator = p.denominator - v[den],
			ratio       = denominator ? numerator / denominator : 0;
		return { numerator : numerator, denominator : denominator, ratio : ratio };
	};
};

function ratioInitial() {
	return { numerator : 0, denominator : 0, ratio : 0 };
};

$.getJSON( "/search", function( resp ) {

	data = resp.results;
      $('#exposeTable').dataTable( {
          "data": data,
          "columns": [
            { "data": "id" },
            { "data": "city" },
            { "data": "floor_space", "sClass": "numeric" },
            { "data": "price", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
            { "data": "household_income", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
            { "data": "postcode" },
            { "data": "district_name" },
            { "data": "quarter" }
          ]
      } );

	var
		color_palette = ['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'],
		//berlinChart = dc.geoChoroplethChart("#s1"),
		chart1 = dc.rowChart("#s1"),
		chart2 = dc.rowChart("#s2"),
		chart3 = dc.bubbleChart("#s3"),
		chart4 = dc.bubbleChart("#s4"),
		chart5 = dc.bubbleChart("#s5"),
		chart6 = dc.bubbleChart("#s6"),
		chart7 = dc.bubbleChart("#s7"),
		chart8 = dc.bubbleChart("#s8");

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
		groupDistrictPriceSq       = dimDistrict.group().reduce(
			meanAdd("buy_price_sq"), meanRemove("buy_price_sq"), meanInitial
		),
		groupDistrictBrokerIndex   = dimDistrict.group().reduce(
			ratioAdd("buy_price_sq", "avg_anual_rental_price_sq"), ratioRemove("buy_price_sq", "avg_anual_rental_price_sq"), ratioInitial
		),

		groupQuarterPropertyCount  = dimQuarter.group().reduceCount();
		groupQuarterPriceSq    = dimQuarter.group().reduce(
			meanAdd("buy_price_sq"), meanRemove("buy_price_sq"), meanInitial
		),



	//d3.json("/js/us-states.json", function (error, berlinJson) {
		chart1
        		.height(600)
			.dimension(dimDistrict)
        		.group(groupDistrictPropertyCount)
			.ordering(function(d){
				return -d.value;		
			})
        		.ordinalColors(color_palette)
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
        		.height(600)
			.dimension(dimDistrict)
        		.group(groupDistrictBrokerIndex)
			.valueAccessor(function(d){
				return d.value.ratio;			
			})
			.ordering(function(d){
				return -d.value;		
			})
        		.ordinalColors(color_palette)
        		.label(function (d) {
            			return d.key;
       			 })
        		.title(function (d) {
           			return d.value;
        		})
        		.elasticX(true)
       			.xAxis().ticks(4);;
	//});
	dc.renderAll();
});
