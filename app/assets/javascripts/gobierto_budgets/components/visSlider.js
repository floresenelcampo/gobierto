'use strict';

var VisSlider = Class.extend({
  init: function(divId, data) {
    this.container = divId;
    this.data = data;
    
    var currentYear = d3.select('body').attr('data-year');
    var slideYear = currentYear;
    var years = _.uniq(this.data.map(function(d) { return d.year; })).filter(function(d) { return d <= currentYear; });
    var parseYear = d3.timeParse('%Y');
    var formatYear = d3.timeFormat('%Y');
    
    var bisectDate = d3.bisector(function(d) { return d; }).left
    
    var margin = {right: 20, left: 10},
      width = parseInt(d3.select(this.container).style('width')) - margin.left - margin.right,
      height = 50;
    
    var svg = d3.select(this.container).append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + 0 + ')');
    
    // scalePoint derives from the ordinal scale, but allows a continuous range
    var x = d3.scalePoint()
      .domain(years)
      .range([0, width]);
    
    // Invert ordinal scale, from: https://gist.github.com/shimizu/808e0f5cadb6a63f28bb00082dc8fe3f
    x.invert = (function(){
      var domain = x.domain()
      var range = x.range()
      var scale = d3.scaleQuantize().domain(range).range(domain)
      
      return function(x){
        return scale(x)
      }
    })()
    
    var slider = svg.append("g")
      .attr("class", "slider")
      .attr("transform", "translate(" + margin.left + "," + height / 2 + ")");
    
    slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
      .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
          dragged(x.invert(d3.mouse(this)[0]))
        })
        // .on('end', function() {
        //   var year = x.invert(d3.mouse(this)[0]);
        //   $(document).trigger('visSlider:yearChanged', year);
        // })
      )
      
    //   
    // slider.insert("g", ".track-overlay")
    //   .attr("class", "year-circles")
    //   .attr("transform", "translate(0," + 0 + ")")
    //   .selectAll("circle")
    //   .data(years)
    //   .enter()
    //   .append("circle")
    //   .attr('cx', function(d) { return x(d)})
    
    slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
      .selectAll("text")
      .data(years)
      .enter()
      .append("text")
      .attr("x", function(d) { return x(d) })
      .attr("text-anchor", "middle")
      .text(function(d) { return d });
    
    var handle = slider.append('circle')
      .attr("class", "handle")
      .attr('cx', x(currentYear))
      .attr("r", 9)
      .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
          dragged(x.invert(d3.mouse(this)[0]))
        })
        .on('end', function() {
          var year = x.invert(d3.mouse(this)[0]);
          $(document).trigger('visSlider:yearChanged', year);
        })
      );

    
    function dragged(year) {
      handle.attr("cx", x(year));
    }
    
    
  },
});