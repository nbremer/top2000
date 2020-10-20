var isMobile = window.screen.width < 400 ? true : false;

if(isMobile) {
	d3.selectAll(".mobile").style("display", "inline-block");
	d3.selectAll(".desktop").style("display", "none");
	d3.selectAll(".outer-margin").style("margin-left", "10px").style("margin-right", "10px");
	d3.selectAll(".title").style("font-size", "2.7em");
	// d3.selectAll(".heart").style("font-size", "1.4em");
} else {

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Set up the SVG ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////
	var margin = {
	  top: 120,
	  right: 150,
	  bottom: 0,
	  left: -350
	};
	var widthOriginal = 2150 - 100 - 150;
	var width = 1700 - margin.left - margin.right;
	var height = 620 - margin.top - margin.bottom;
		
	//SVG container
	var svg = d3.select('#chart')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("class", "top-wrapper")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");	

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create the scales //////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	var yearScale = d3.scaleLinear()
		.domain([1939, 2016])
	    .range([0, widthOriginal]);
		
	var rScale = d3.scaleSqrt()
		.domain([1,10,25,50,100,250,500,1000,2000])
		.range([25,21,17,13,10,7,5,3,2]);
		
	var colorScale = d3.scaleLinear()
		.domain([1,6,12,18,25,32,40])
		.range(["#000000","#262626","#474747","#636363","#7D7D7D","#949494","#ABABAB"]);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Choose annotated songs //////////////////////////
	///////////////////////////////////////////////////////////////////////////
			
	var interestingSongs = [
		1989, //Oldest song - Billy Holiday
		363, //Highest song from 2016 - Can't Stop The Feeling | Justin Timberlake
		270, //Highest new song - Starman | David Bowie
		144, //Highest riser - When We Were Young | Adele
		232, //Pokemon song
	];

	//David Bowie songs
	var DB = [7,38,87,162,182,230,270,310,379,462,472,491,523,540,576,586,612,616,778,856,961,1144,1203,1632,1736,1875];

	//Prince songs
	var PR = [13,207,254,354,404,585,640,702,721,937,1268,1365,1378,1409,1658,1761,1771];

	var strokeWidthColored = 3,	//The Beatles, Prince and David Bowie
		strokeWidthRed = 4;		//Interesting Songs
		
	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Read in the data /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	d3.csv('data/top2000_2016_positions.csv', function (error, data) {

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Final data prep /////////////////////////////
		///////////////////////////////////////////////////////////////////////////
		
		if (error) throw error;
		
		data.forEach(function(d) {
			d.rank = +d.rank;
			d.releaseYear = +d.releaseYear;
			d.listHighestRank = +d.listHighestRank;
			d.x = +d.x;
			d.y = +d.y;
		});
		
		//Add a few more "circles" to the data that will make room for the decade numbers
		var decades = [1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];
		for(var i=0; i<decades.length; i++) {
			data.push({
				rank: 0,
				releaseYear: decades[i],
				type: "decade",
				x: yearScale(decades[i]),
				y: height/2
			});
		}//for i

		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Create the axis /////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + (height/2) + ")")
	      .call(d3.axisBottom(yearScale).ticks(10, ".0f"));
		  
		svg.selectAll(".axis text")
		  .attr("dy", "-0.25em");

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// Draw the circles /////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		//Wrapper for all songs
	  	var songWrapper = svg.append("g")
	      .attr("class", "song-wrapper");
		  
		//Create a group per song
		var song = songWrapper.selectAll(".song-group")
		  	.data(data)
		  	.enter().append("g")
		  	.attr("class", "song-group")
		  	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		  	.on("mouseover", function(d) { 
		  		//console.log(d.artist, d.title, d.releaseYear, d.rank, d.listHighestRank); 

		  		//Move the tooltip to the right location
		  		tooltipSong.text(d.title);
		      	tooltipArtist.text(d.artist + " | " + d.releaseYear);
		      	tooltipRank.text("Position in Top 2000: " + d.rank);
		      	if(d.listHighestRank > 0 && d.listType !== "tip") {
		      		tooltipTop40.text("Highest position in weekly Top 40: " + d.listHighestRank);
		      	} else {
		      		tooltipTop40.text("Never appeared in the Top 40");
		      	}//else
		      	//Find the largest title
		      	var maxSize = Math.max(document.getElementById("tooltipSong").getComputedTextLength(), 
		      		document.getElementById("tooltipArtist").getComputedTextLength(), 
		      		document.getElementById("tooltipRank").getComputedTextLength(),
		      		document.getElementById("tooltipTop40").getComputedTextLength());
		      	tooltipBackground
		      		.transition().duration(100)
		      		.attr("x", -0.5 * maxSize*1.2)
		      		.attr("width", maxSize*1.2)
		      	tooltipWrapper
		      		.transition().duration(200)
		        	.attr("transform", "translate(" + d.x + "," + (d.y + 40) + ")")
		        	.style("opacity", 1);
		  	})
		  	.on("mouseout", function(d) {
		  		//Hide the tooltip
				tooltipWrapper
					.transition().duration(200)
					.style("opacity", 0);
		  	});

		//The colored background for some songs (since I can't do an outside stroke)
		song
			.filter(function(d) { return d.artist === "The Beatles" || DB.indexOf(d.rank) > -1 || PR.indexOf(d.rank) > -1 || interestingSongs.indexOf(d.rank) > -1; })
			.append("circle")
			.attr("class", "song-background")
	      	.attr("r", function(d) { 
	      		if(d.artist === "The Beatles" || DB.indexOf(d.rank) > -1 || PR.indexOf(d.rank) > -1) {
					return rScale(d.rank) + strokeWidthColored;
				} else if(interestingSongs.indexOf(d.rank) > -1) {
					return rScale(d.rank) + strokeWidthRed;
				} else {
					return -1; //check for error
				}//else
	      	})
		  	.style("fill", function(d) {
			  	if(d.artist === "The Beatles") {
				  	return "#46a1ef";
			  	} else if (interestingSongs.indexOf(d.rank) > -1) {
				  	return "#CB272E";
			  	} else if (DB.indexOf(d.rank) > -1) {
				  	return "#f1aa11";
			  	} else if (PR.indexOf(d.rank) > -1) {
				  	return "#C287FF";
			  	} else {
				  	return "none";
			  	}//else
		  	});

		//The grey scaled circle of the song
		song.append("circle")
			.attr("class", "song")
	      	.attr("r", function(d) { return rScale(d.rank); })
		  	.style("fill", function(d) { 
			  	if(d.type === "decade") {
				  	return "none";
			  	} else if (d.listHighestRank === 0 || d.listType === "tip") {
				  	return "#e0e0e0";
			  	} else {
					return colorScale(d.listHighestRank);
				}//else 
		  	});

		//Colored piece of the "vinyl" part of the top 10
		song
		  .filter(function(d) { return d.rank > 0 && d.rank <= 10; })
		  .append("circle")
	      .attr("r", function(d) { return rScale(d.rank)*0.35; })
		  .style("fill", "#CB272E");
		//White center of the "vinyl" part of the top 10
		song
		  .filter(function(d) { return d.rank > 0 && d.rank <= 10; })
		  .append("circle")
	      .attr("r", function(d) { return rScale(d.rank)*0.065; })
		  .style("fill", "white");

		///////////////////////////////////////////////////////////////////////////
		////////////////////////////// Add Tooltip ////////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var tooltipWrapper = svg.append("g")
		  .attr("class", "tooltip-wrapper")
		  .attr("transform", "translate(" + 0 + "," + 0 + ")")
		  .style("opacity", 0);

		var tooltipBackground = tooltipWrapper.append("rect")
			.attr("class", "tooltip-background")
			.attr("x", 0)
			.attr("y", -28)
			.attr("width", 0)
			.attr("height", 100);

		var tooltipArtist = tooltipWrapper.append("text")
		  .attr("class", "tooltip-artist")
		  .attr("id", "tooltipArtist")
		  .attr("y", -4)
		  .text("");

		var tooltipSong = tooltipWrapper.append("text")
		  .attr("class", "tooltip-song")
		  .attr("id", "tooltipSong")
		  .attr("y", 17)
		  .text("");

		var tooltipRank = tooltipWrapper.append("text")
		  .attr("class", "tooltip-rank")
		  .attr("id", "tooltipRank")
		  .attr("y", 42)
		  .text("");
		var tooltipTop40 = tooltipWrapper.append("text")
		  .attr("class", "tooltip-rank")
		  .attr("id", "tooltipTop40")
		  .attr("y", 55)
		  .text("");

		///////////////////////////////////////////////////////////////////////////
		//////////////////////////// Add size legend //////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var sizeLegend = svg.append("g")
			.attr("class", "size-legend")
			.attr("transform", "translate(" + 415 + "," + -40 + ")");

		sizeLegend.append("text")
			.attr("class", "legend-title")
			.attr("x", -13)
			.attr("y", -40)
			.text("Position in Top 2000");

		var sizeDistance = [13,65,108,144,175,203,230,255,280];
		sizeLegend.selectAll(".song-size")
			.data(rScale.range())
			.enter().append("circle")
			.attr("class", "song-size")
			.attr("cx", function(d,i) { return sizeDistance[i]; })
			.attr("r", function(d) { return d; });

		//Add small red and white circle to the first
		sizeLegend.append("circle")
			.attr("cx", sizeDistance[0])
			.attr("r", rScale.range()[0] * 0.35)
			.style("fill", "#CB272E");
		sizeLegend.append("circle")
			.attr("cx", sizeDistance[0])
			.attr("r", rScale.range()[0] * 0.065)
			.style("fill", "white");

		//Add numbers below
		var sizeFont = [14,13,12,11,10,9,9,8,8];
		sizeLegend.selectAll(".song-legend-value")
			.data(rScale.domain())
			.enter().append("text")
			.attr("class", "song-legend-value")
			.attr("x", function(d,i) { return sizeDistance[i]; })
			.attr("y", 45)
			.style("font-size", function(d,i) { return sizeFont[i]; })
			.text(function(d) { return d; })


		///////////////////////////////////////////////////////////////////////////
		///////////////////////////// Add color legend ////////////////////////////
		///////////////////////////////////////////////////////////////////////////

		var colorLegend = svg.append("g")
			.attr("class", "color-legend")
			.attr("transform", "translate(" + 790 + "," + -40 + ")");

		colorLegend.append("text")
			.attr("class", "legend-title")
			.attr("x", -13)
			.attr("y", -40)
			.text("Highest position reached in weekly Top 40");

		colorLegend.selectAll(".song-color")
			.data(colorScale.range())
			.enter().append("circle")
			.attr("class", "song-color")
			.attr("cx", function(d,i) { return 2 * i * rScale(100)*1.2; })
			.attr("r", rScale(100))
			.style("fill", function(d) { return d; });	
		//Add extra circle for never reached top 40
		colorLegend.append("circle")
			.attr("class", "song-color")
			.attr("cx", function(d,i) { return 2 * 9 * rScale(100)*1.2; })
			.attr("r", rScale(100))
			.style("fill", "#e0e0e0");	

		//Add text below
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 0)
			.attr("y", 45)
			.style("font-size", sizeFont[0])
			.text("1");
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 2 * 6 * rScale(100)*1.2)
			.attr("y", 45)
			.style("font-size", sizeFont[0])
			.text("40");
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 2 * 9 * rScale(100)*1.2)
			.attr("y", 40)
			.style("font-size", sizeFont[4])
			.text("never reached");
		colorLegend.append("text")
			.attr("class", "song-legend-value")
			.attr("x", 2 * 9 * rScale(100)*1.2)
			.attr("y", 51)
			.style("font-size", sizeFont[4])
			.text("the top 40*");

	});//d3.csv

}//else

