var data;

function meanAdd(field){
	return function(p, v) {
		console.log(field);
		console.log(p.mean);
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
              { "data": "street" },
              { "data": "floor_space", "sClass": "numeric" },
              { "data": "price", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "buy_price_sq", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "avg_anual_rental_price_sq", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "avg_montly_rental_price_sq", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              { "data": "household_income", render: $.fn.dataTable.render.number( ',', '.', 0, '€' ), "sClass": "numeric" },
              //built_in_kitchen
              { "data":  function ( data, type, full, meta ) {
                  if (type == "display") {
                      return data.built_in_kitchen == 1 ?
                          "<span class=\"glyphicon glyphicon-ok\"></span>" :
                          "<span class=\"glyphicon glyphicon-remove\"></span>";
                  } else {
                      return data.built_in_kitchen;
                  }
              }, "sClass": "boolean"},
              //balcony
              { "data": function ( data, type, full, meta ) {
                  if (type == "display") {
                      return data.balcony == 1 ?
                          "<span class=\"glyphicon glyphicon-ok\"></span>" :
                          "<span class=\"glyphicon glyphicon-remove\"></span>";
                  } else {
                      return data.balcony;
                  }
              }, "sClass": "boolean"},
              { "data": "postcode" },
              { "data": "district_name" },
              { "data": "quarter" }
          ]
      });

	var
		color_palette = ['#cc4125', '#ff6513', '#ff891b', '#f6b26b', '#38761d', '#6aa84f', '#93c47d', '#b6d7a8', '#584c7f', '#19077c', '#3a0dcc', '#5f74ff'],
		chart_margins = {top: 5, right: 20, bottom: 30, left: 5},
		chart_margins_bar = {top: 10, right: 20, bottom: 30, left: 30},
		//berlinChart = dc.geoChoroplethChart("#s1"),
		chart1 = dc.rowChart("#s1"),
		chart2 = dc.rowChart("#s2"),
		chart3 = dc.rowChart("#s3"),
		chart4 = dc.rowChart("#s4"),
		chart5 = dc.barChart("#s5"),

		summary1 = dc.numberDisplay("#n1");
		//summary2 = dc.numberDisplay("#n2"),
		//summary3 = dc.numberDisplay("#n3"),
		//summary4 = dc.numberDisplay("#n4");

	var data = crossfilter(data);

	// crossfilter dimensions	
	var
		dimDistrict = data.dimension(function(d){
			return d.compiled_district_name;
		}),
		dimFloorArea = data.dimension(function(d){
			if (d.floor_space < 50){
				return " 0-49";
			}
			else if (d.floor_space < 80) {
				return " 50-79";
			}
			else if (d.floor_space < 100) {
				return " 80-99";
			}
			else if (d.floor_space < 150) {
				return "100-150";
			}
			else {
				return "> 150";
			} 
		}),
		dimRooms = data.dimension(function(d){
			return d.number_of_rooms;
		}),
		dimQuarter = data.dimension(function(d){
			return d.quarter;
		}),
		dimWishlist = data.dimension(function(d){
			return d.added_to_wishlist;		
		});


	// crossfilter groups
	var
		groupDistrictPropertyCount = dimDistrict.group().reduceCount(),
		groupDistrictPriceSq       = dimDistrict.group().reduce(
			meanAdd("buy_price_sq"), meanRemove("buy_price_sq"), meanInitial
		),
		groupDistrictBrokerIndex = dimDistrict.group().reduce(
			ratioAdd("buy_price_sq", "avg_anual_rental_price_sq"), ratioRemove("buy_price_sq", "avg_anual_rental_price_sq"), ratioInitial
		),
		groupDistrictAffordabilityIndex = dimDistrict.group().reduce(
			ratioAdd("avg_montly_rental_price", "household_income"), ratioRemove("avg_montly_rental_price", "household_income"), ratioInitial
		),
		groupDistrictPriceChange = dimDistrict.group().reduce(
			meanAdd("avg_montly_rental_price_percentual_change"), meanRemove("avg_montly_rental_price_percentual_change"), meanInitial
		),

		groupFloorAreaWishlist = dimFloorArea.group().reduceSum(function(d){
			return d.added_to_wishlist;		
		}),   

		groupQuarterPropertyCount  = dimQuarter.group().reduceCount();
		groupQuarterPriceSq    = dimQuarter.group().reduce(
			meanAdd("buy_price_sq"), meanRemove("buy_price_sq"), meanInitial
		),
		groupWishlistContacted = dimWishlist.group().reduceSum(function(d){
			return d.contacted_realtor;	
		});



	//d3.json("/js/us-states.json", function (error, berlinJson) {
		// listings per district
		chart1
        		.height(300)
			.margins(chart_margins)
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
       			.xAxis().ticks(4);
		
		// broker index per district
		chart2
        		.height(300)
			.margins(chart_margins)
			.dimension(dimDistrict)
        		.group(groupDistrictBrokerIndex)
			.valueAccessor(function(d){
				return d.value.ratio;			
			})
			.ordering(function(d){
				return -d.value.ratio;		
			})
        		.ordinalColors(color_palette)
        		.label(function (d) {
            			return d.key;
       			 })
        		.title(function (d) {
           			return d.value.ratio;
        		})
        		.elasticX(true)
       			.xAxis().ticks(4);

		// affordability index per district
		chart3
        		.height(300)
			.margins(chart_margins)
			.dimension(dimDistrict)
        		.group(groupDistrictAffordabilityIndex)
			.valueAccessor(function(d){
				return d.value.ratio;			
			})
			.ordering(function(d){
				return -d.value.ratio;		
			})
        		.ordinalColors(color_palette)
        		.label(function (d) {
            			return d.key;
       			 })
        		.title(function (d) {
           			return d.value.ratio;
        		})
        		.elasticX(true)
       			.xAxis().ticks(4);

		// affordability index per district
		chart4
        		.height(300)
			.margins(chart_margins)
			.dimension(dimDistrict)
        		.group(groupDistrictPriceChange)
			.valueAccessor(function(d){
				return d.value.mean;			
			})
			.ordering(function(d){
				return -d.value.mean;		
			})
        		.ordinalColors(color_palette)
        		.label(function (d) {
            			return d.key;
       			 })
        		.title(function (d) {
           			return d.value.mean;
        		})
        		.elasticX(true)
       			.xAxis().ticks(4);

		// wishlisted per floor area
		chart5
        		.height(300)
			.margins(chart_margins_bar)
			.dimension(dimFloorArea)
        		.group(groupFloorAreaWishlist)
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
       			.x(d3.scale.ordinal())
			.xUnits(dc.units.ordinal);

		// contacted realtor vs wishlisted
	//	chart5
       // 		.height(300)
	//		.margins(chart_margins_bar)
//			.dimension(dimWishlist)
       // 		.group(groupWishlistContacted)
       // 		.ordinalColors(color_palette)
       // 		.title(function (d) {
        //   			return d.value;
       // 		})
       // 		.elasticY(true)
       //			.x(d3.scale.linear());

		// summary - total wishlisted
		summary1
			.formatNumber(d3.format(".2s"))
			//.valueAccessor(function(d){
			//	return d.value.ratio;			
			//});
			.group(groupFloorAreaWishlist);
	//});
	dc.renderAll();
});
