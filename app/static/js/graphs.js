// charts

var
	berlinChart = dc.geoChoroplethChart("#s1"),
	berlinChart = dc.barChart("#s1"),
	chart2 = dc.bubbleChart("#s2"),
	chart3 = dc.bubbleChart("#s3"),
	chart4 = dc.bubbleChart("#s4"),
	chart5 = dc.bubbleChart("#s5"),
	chart6 = dc.bubbleChart("#s6"),
	chart7 = dc.bubbleChart("#s7"),
	chart8 = dc.bubbleChart("#s8"),
	chart9 = dc.bubbleChart("#s9");

d3.json("/js/data.json", function (error, json) {
	var data = crossfilter(json);

	var dimDistrict = data.dimension(function(d){
		return d.district;
	});
	var groupDistrictPropertyCount = dimDistrict.group().reduceCount();

	//d3.json("/js/us-states.json", function (error, berlinJson) {
		berlinChart
			//.width(990)
			.height(200)
                	.dimension(dimDistrict)
                	.group(groupDistrictPropertyCount)
                	//.overlayGeoJson(berlinJson.features, "district", function(d) {
                       // 	return d.properties.Name;
			//})
                    	.title(function (d) {
                        	return "Title";
                    	})
			.x(d3.scale.ordinal())
			.xUnits(dc.units.ordinal)
			.elasticX(true)
			.elasticY(true)
			.render();
	//});
	console.log(berlinChart.group().top(1));
});
