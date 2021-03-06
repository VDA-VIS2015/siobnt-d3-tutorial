
// D3 code for the bar chart

// Step 2: set up plot size and margins
var chartWidth = 960,
    chartHeight = 600;
 
var margin = {top: 20, right: 40, bottom: 30, left: 40},
    width = chartWidth - margin.left - margin.right,
    height = chartHeight - margin.top - margin.bottom;
 
var svg = d3.select("#barchart")
    .attr("width", chartWidth)
    .attr("height", chartHeight);
 
var chart = svg.append("g")
   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Step 3: load data file
// This is asynchronous so we should wait until we get data 
// before making the chart
d3.csv("f1.csv", function(error, data) {
  // Convert strings to numbers
  data.forEach(function(d) {
    d.year = +d.year;
    d.points = +d.points;
  });

  // Compute the extents of the data
  var minPoints = 0,
      maxPoints = d3.max(data, function(d) {return d.points;}),
      minYear = d3.min(data, function(d) {return d.year;}),
      maxYear = d3.max(data, function(d) {return d.year;}),
      teams = d3.set(data.map(function(d) {return d.constructor;})).values(),
      years = d3.range(minYear, maxYear+1);

  // Step 4: add scales
  var mainX = d3.scale.ordinal() // The between-group axis
      .rangeRoundBands([0, width], 0.25)
      .domain(years);
  var subX = d3.scale.ordinal() // The within-group axis
      .rangeRoundBands([0, mainX.rangeBand()], 0.1)
      .domain(teams);
  var y = d3.scale.linear()
      .range([height, 0]) // y is backwards because 0 is the top left corner
      .domain([minPoints, maxPoints]);

  // Step 7: color bars
  var teamColors = d3.scale.category10()
      .domain(teams);
  var yearColors = d3.scale.category10()
      .domain(years);

  // Step 5: set up the axes
  var xAxis = d3.svg.axis()
      .scale(mainX)
      .orient("bottom");
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");
  
  chart.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis);
  chart.append("g")
       .attr("class", "y axis")
       .call(yAxis);

  // Step 6: add the bars
  chart.selectAll(".group")
       .data(data)
     .enter().append("g")
       .attr("class", "group")
       .attr("transform", function(d) {
         return "translate("+mainX(d.year)+",0)";
       }).append("rect")
         .attr("width", subX.rangeBand())
         .attr("x", function(d) {return subX(d.constructor);})
         .attr("y", function(d) {return y(d.points);})
         .attr("height", function(d) {return height - y(d.points);})
         .style("fill", function(d) {return teamColors(d.constructor);});

  // Step 8: add the legend for the colors
  computeLegend(teams, teamColors);

  function computeLegend(groups, colors) {
    legend = svg.selectAll(".legend");
    var dataLegend = legend.data(groups, function(d) {return d;});
    dataLegend.enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
          return "translate(0," + i * 20 + ")";
        });
    dataLegend.exit().remove();
    dataLegend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", colors);
    dataLegend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .text(function(d) {return d;});
  }

  // Step 9: add interactivity
  d3.selectAll("input").on("change", function() {
    if(this.value === "year") {
      changeLayout(teams, years, yearColors, "constructor", "year");
      computeLegend(years, yearColors);
    } else {
      changeLayout(years, teams, teamColors, "year", "constructor");
      computeLegend(teams, teamColors);
    }
  });

  function changeLayout(main, sub, colors, mainKey, subKey) {
    mainX.domain(main);
    subX.domain(sub)
        .rangeRoundBands([0, mainX.rangeBand()], 0.1);
    chart.selectAll(".x.axis").call(xAxis);
    chart.selectAll(".group")
         .data(data)
         .transition().delay(100)
         .attr("transform", function(d) {
           return "translate("+mainX(d[mainKey])+",0)";
         }).selectAll("rect")
           .attr("width", subX.rangeBand())
           .attr("x", function(d) {return subX(d[subKey]);})
           .style("fill", function(d) {return colors(d[subKey]);});
  }

});
