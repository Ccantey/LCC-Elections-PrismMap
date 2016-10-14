var activeTab = {
  selection:"USPRS",
  geography:"cty",
  name:"COUNTYNAME"
};
var zoomThreshold = 8;

// var layersArray = ['2012results-cty','2012results-vtd','2012results-sen','2012results-hse','2012results-cng','2012results-cty-hover','2012results-vtd-hover','2012results-sen-hover','2012results-hse-hover','2012results-cng-hover']
var layersArray = []; // at 0.22.0 you can no longer have undefined layers in array - must push them dynamically
var geocoder = null;

var today = new Date();

var popLegendEl = document.getElementById('pop-legend');
var pctLegendEl = document.getElementById('pct-legend');

function initialize(){
	$("#map").height('800px');
	southWest = new mapboxgl.LngLat( -104.7140625, 41.86956);
    northEast = new mapboxgl.LngLat( -84.202832, 50.1487464);
    bounds = new mapboxgl.LngLatBounds(southWest,northEast);

    // mapboxgl.accessToken = 'Your Mapbox access token';
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g';

	map = new mapboxgl.Map({
		container: 'map', // container id
		// style: 'mapbox://styles/mapbox/dark-v9',
		style: 'mapbox://styles/ccantey/ciqxtkg700003bqnleojbxy8t',
		center: [-93.6678,46.50],
		maxBounds:bounds,		
		zoom: 6,
		minZoom: 6
	});

    var nav = new mapboxgl.NavigationControl({position: 'top-right'}); // position is optional
    map.addControl(nav);

    // geocoder = new google.maps.Geocoder; //ccantey.dgxr9hbq
    geocoder = new mapboxgl.Geocoder();

    map.on('load', function () {
    	// add vector source:
	    map.addSource('electionResults', {
	        type: 'vector',
	        url: 'mapbox://ccantey.2vclm9ik'
	    });     

        var layers = [
            //name, minzoom, maxzoom, filter, paint fill-color, stops, paint fill-opacity, stops
	        [
		        'cty',                               //layers[0] = id
		        3,                                   //layers[1] = minzoom
		        zoomThreshold,                       //layers[2] = maxzoom
		        ['==', 'UNIT', 'cty'],               //layers[3] = filter
		        activeTab.selection+'WIN',           //layers[4] = fill-color property -- geojson.winner (add this property to geojson)
		        [['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']],  //layers[5] = fill-color stops -- ['dfl':blue, 'r':red,'i':yellow]
		        activeTab.selection+'TOTAL',         //layers[6] = fill-opacity property
		        [                                    //layers[7] = fill-opacity stops (based on MN population)
		            [0, 0.25],
		            [17000, 0.45],
		            [53000, 0.6],
		            [140000, 0.7],
		            [280000, 0.8],
		            [700000, .99]
		        ],                                     
		        'hsl(55, 11%, 96%)'                  //layers[8] = outline color
	        ], 

   	        ['vtd', zoomThreshold, 20, ['==', 'UNIT', 'vtd'], activeTab.selection+'WIN', [['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']], activeTab.selection+'PCT', [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]], '#b8bbbf'],
   	        ['vtd-hover', zoomThreshold, 20, ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD", ""]], 'USPRSTOTAL', [[6000, 'orange']], activeTab.selection+'PCT', [[6000, .5]], 'white'],
            ['cty-hover', 3, zoomThreshold, ['all', ['==', 'UNIT', 'cty'], ["==", "COUNTYNAME", ""]], 'USPRSTOTAL', [[6000, 'orange']], activeTab.selection+'TOTAL', [[6000, .5]], 'white']
	    ];      

        layers.forEach(addLayer);
	});//end map on load
} //end initialize

function changeData(activetab){
	// console.log(activeTab.geography);
    // var visibility = map.getLayoutProperty(activetab+'-lines', 'visibility');
	switch (activeTab.geography) {
	    case "cty": 
	        var opacity = [ [0, 0.25],[16837, 0.45],[53080, 0.6],[142556, 0.7],[280000, 0.8],[700000, .99] ];
	        var opacityField = activeTab.selection+'TOTAL';
	        map.setLayoutProperty('cty-lines', 'visibility', 'visible');
	        map.setLayoutProperty('cty-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'block';
            pctLegendEl.style.display = 'none';
            $('#candidate-table').show();
            if (activeTab.selection == 'USPRS'){
            	$('.td-image').show();
            	$('#candidate1photo').attr('src',"img/barack.jpg");
            	$('#candidate1').html('Barack Obama (DFL)');
		        $('#candidate1votes').html('7,730,835');
		        $('#candidate1percent').html('52.7% ');

		        $('#candidate2photo').attr('src',"img/mitt.jpg");
            	$('#candidate2').html('Mitt Romney (R)');
		        $('#candidate2votes').html('6,601,125');
		        $('#candidate2percent').html('45.0% ');
		        $('#totalvotes').html('14,682,805');
            } 
            else {
            	$('#candidate1photo').attr('src',"");
            	$('#candidate1').html('Amy Klobuchar (DFL)');
		        $('#candidate1votes').html('9,272,975');
		        $('#candidate1percent').html('62.5% ');

		        $('#candidate2photo').attr('src',"");
            	$('#candidate2').html('Kurt Bills (R)');
		        $('#candidate2votes').html('4,339,870');
		        $('#candidate2percent').html('30.5% ');
		        $('#totalvotes').html('14,216,035');
            }
	        break;
	    case "cng": 
	        $('#candidate-table').hide();
	        var opacity = [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]];
	        var opacityField = activeTab.selection+'PCT';
	        map.setLayoutProperty('cng-lines', 'visibility', 'visible');
	        map.setLayoutProperty('cng-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'none';
            pctLegendEl.style.display = 'block';
	        break;
	    case "sen": 
	        $('#candidate-table').hide();
	        var opacity = [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]];
	        var opacityField = activeTab.selection+'PCT';
	        map.setLayoutProperty('sen-lines', 'visibility', 'visible');
	        map.setLayoutProperty('sen-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'none';
            pctLegendEl.style.display = 'block';
	        break;
	    case "hse":
	        $('#candidate-table').hide(); 
	        var opacity = [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]];
	        var opacityField = activeTab.selection+'PCT';
	        map.setLayoutProperty('hse-lines', 'visibility', 'visible');
	        map.setLayoutProperty('hse-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'none';
            pctLegendEl.style.display = 'block';
	        break;
	};

    map.setPaintProperty("2012results-vtd", 'fill-color', {"type":'categorical', 'property': activeTab.selection+'WIN', 'stops':[['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']]})    // selection = map.querySourceFeatures('2012results-cty-hover', {sourceLayer:'AllResults', filter: ['has','COUNTYNAME']})
	// showResults(activeTab, feature.properties);
	var layer = [
	    [activeTab.geography,          3, zoomThreshold, ['==', 'UNIT', activeTab.geography], activeTab.selection+'WIN', [['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']], opacityField, opacity, 'hsl(55, 11%, 96%)'],
        [activeTab.geography+'-hover', 3, zoomThreshold, ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, ""]], 'USPRSTOTAL', [[6000, 'orange']], opacityField, [[6000, .75]], 'white']
    ];

	layer.forEach(addLayer)
}

//remove layersArray element per 0.22.0
function spliceArray(a){
	var index = layersArray.indexOf(a);    // <-- Not supported in <IE9
	if (index !== -1) {
	    layersArray.splice(index, 1);
	}
}

function addLayer(layer) {
             
	         map.addLayer({
		        "id": "2012results-"+ layer[0],
		        "type": "fill",
		        "source": "electionResults",
		        "source-layer": "FinalTable-4ggmdu", //layer name in studio
		        "minzoom":layer[1],
		        'maxzoom': layer[2],
		        'filter': layer[3],
		        "layout": {},
		        "paint": {		        	
		            "fill-color": {
		            	"type":'categorical',
		            	"property": layer[4], //layers[4] = fill-color property -- geojson.winner (add this property to geojson)
		            	"stops": layer[5],    //layers[5] = fill-color stops -- ['dfl':blue, 'r':red,'i':yellow]
		            },
		            "fill-opacity": {
		            	"type":'interval',
		            	property: layer[6],
		            	stops: layer[7]
		            },
		            "fill-outline-color": layer[8]
		        }
	         }, 'waterway-label');
	         layersArray.push("2012results-"+ layer[0])
}; 

function showResults(activeTab, feature){
    // console.log(feature)
	var content = '';
	var header ='';
	var geography = '';
	var unit =''
	var data = {
		activeTab:activeTab.selection,
		geography:activeTab.geography
	};
	
	var winner = (feature) ? feature[activeTab.selection+'WIN'] : '';
    if (winner === 'TIE'){
        var percentage = feature[activeTab.selection+'DFL']*100/feature[activeTab.selection+'TOTAL'];
    } else {
    	var percentage = feature[activeTab.selection+winner]*100/feature[activeTab.selection+'TOTAL'];
    }
	
	// console.log(winner, feature[activeTab.selection+'WIN'])

 // //view feature properties for each selection
 //    var results = {};
	// for (var prop in feature){
	// 	var substring = prop.search(activeTab.selection);
	// 	if(substring !== -1 && typeof feature[prop] != 'string'){
 //            results[prop] = feature[prop];
	// 	}
	// }
	// console.log(results)

	if (feature.PCTNAME.length > 0){
		header += "<h5>Precinct Results</h5>";
		geography = "<th>Voting Precint: </th><td>"+feature.PCTNAME+"</td>";
		unit = "Precinct";
	} else{
			if (feature.CONGDIST.length > 0){		    
			    geography = "<th>Congressional District: </th><td>"+feature.CONGDIST+"</td>";
		}
		    if (feature.MNSENDIST.length > 0){	    	
			    geography = "<th>MN Senate District: </th><td>"+feature.MNSENDIST+"</td>";
		}
		    if (feature.MNLEGDIST.length > 0){	    	
			    geography = "<th>MN House District: </th><td>"+feature.MNLEGDIST+"</td>";
		}
		    if (feature.COUNTYNAME.length > 0){
		    	header += "<h5>County Results</h5>";
			   geography = "<th>County: </th><td>"+feature.COUNTYNAME+"</td>";
			   unit = "County";
		}
	}

	switch (activeTab.selection) {
    case "USPRS":
        $('.td-image').show();
        // $('#thirdwheel').show();
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>U.S. President: </th><td> At-large</td></tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";

        content += "<tr><th>Democratic-Farm-Labor: </th><td>"+feature[activeTab.selection+'DFL'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Republican: </th><td>"+feature[activeTab.selection+'R'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Libertarian: </th><td>"+feature[activeTab.selection+'LIB'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Green: </th><td>"+feature[activeTab.selection+'GP'].toLocaleString()+"</td></tr>";
        // content += "<tr><th>Write-In Votes: </th><td>"+results[activeTab.selection+'WI'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        break;
    case "USSEN":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>U.S. Senate: </th><td> At-large</td></tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
        content += "<tr><th>Democratic-Farm-Labor: </th><td>"+feature[activeTab.selection+'DFL'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Republican: </th><td>"+feature[activeTab.selection+'R'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Independence: </th><td>"+feature[activeTab.selection+'IP'].toLocaleString()+"</td></tr>";
        content += "<tr><th>MN Open Progressive: </th><td>"+feature[activeTab.selection+'MOP'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Grassroots: </th><td>"+feature[activeTab.selection+'GR'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Write-In: </th><td>"+feature[activeTab.selection+'WI'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";


        break;
    case "USREP":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        data['district'] = feature.CONGDIST;
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
        content += "<tr><th>Democratic-Farm-Labor: </th><td>"+feature[activeTab.selection+'DFL'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Republican: </th><td>"+feature[activeTab.selection+'R'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Independence: </th><td>"+feature[activeTab.selection+'IP'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Write-In Votes: </th><td>"+feature[activeTab.selection+'WI'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";

        break;
    case "MNSEN":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        data['district'] = feature.MNSENDIST;
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
        content += "<tr><th>Democratic-Farm-Labor: </th><td>"+feature[activeTab.selection+'DFL'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Republican: </th><td>"+feature[activeTab.selection+'R'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Independence: </th><td>"+feature[activeTab.selection+'IP'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Write-In: </th><td>"+feature[activeTab.selection+'WI'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        break;
    case "MNLEG":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        data['district'] = feature.MNLEGDIST;
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
        content += "<tr><th>Democratic-Farm-Labor: </th><td>"+feature[activeTab.selection+'DFL'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Republican: </th><td>"+feature[activeTab.selection+'R'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Independence: </th><td>"+feature[activeTab.selection+'IP'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Write-In: </th><td>"+feature[activeTab.selection+'WI'].toLocaleString()+"</td></tr>";
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        break;
    }
    $('#candidate-table').show();
    // console.log(data);
    $.ajax("php/winners.php", {
		data: data,
		success: function(result){			
			showWinners(result.totals[0], feature);
		}, 
		error: function(){
			console.log('error');
		}
	});
	document.getElementById('precinct-header').innerHTML = header;
    document.getElementById('precinct-results').innerHTML = content;
    $('#clear').show();

	// sort the results, which returns an array
	// var resultsArray = sortObjectProperties(results);
    // console.log(resultsArray)
 //    //display the results in the results div
	// for (var i=0; i < resultsArray.length; i++){
	// 	if (resultsArray[i][1] > 0){ 
	// 	  content += "<tr><th>"+resultsArray[i][0]+": </th><td> " + resultsArray[i][1].toLocaleString()+ "</td></tr>";
	// 	  document.getElementById('precinct-results').innerHTML = content;
	// 	}
	// }
}

function showWinners(totals, feature){
	// console.log(totals)
	var sortedWinners = sortObjectProperties(totals);
    // var presidentMap={'dfl':'Hillary Clinton','republican':'Donald Trump', 'libertarian':'Gary Johnson', 'green':'Jill Stein'}
	for (var i = 0; i<sortedWinners.length; i++){
		var percent = sortedWinners[i][1]*100/sortedWinners[0][1]
		// console.log(percent.toFixed(1))
		if (i>0 && i<4){
			var party = sortedWinners[i][0].toUpperCase();
			var candidate = activeTab.selection + '' + party +'CN'; //ex: USPRSDFLCN
			// console.log(feature[candidate])
			if (activeTab.selection == 'USPRS'){
				// $('#candidate'+i).removeClass();
				// $('#candidate'+i).addClass('winner-'+party)
                $('#candidate'+i).html(feature[candidate]+' ('+party+')');
		        $('#candidate'+i+'votes').html(sortedWinners[i][1].toLocaleString());
		        $('#candidate'+i+'percent').html(percent.toFixed(1)+'% ');
			} else {
				// $('#candidate'+i).removeClass();
				// $('#candidate'+i).addClass('winner-'+party)
				$('#candidate'+i).html(feature[candidate]+' ('+party+')');
		        $('#candidate'+i+'votes').html(sortedWinners[i][1].toLocaleString());
		        $('#candidate'+i+'percent').html(percent.toFixed(1)+'% ');
			}

	    } else{
	    	document.getElementById('totalvotes').innerHTML = sortedWinners[0][1].toLocaleString();
	    }
	}
}

function sortObjectProperties(obj){
    // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]
    // sort items by value
    sortable.sort(function(a, b)
    {
      return b[1]-a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function mapResults(feature){
	// console.log(feature.layer.id)
	switch (feature.layer.id) {
	    case "2012results-vtd":
	        map.setFilter("2012results-vtd", ['all', ['==', 'UNIT', 'vtd'], ["!=", "VTD",feature.properties.VTD]]);
            map.setFilter("2012results-vtd-hover", ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD",feature.properties.VTD]]);
	        break;
	    case "2012results-vtd-hover":
	        break;
	    default:
	        map.setFilter("2012results-"+activeTab.geography, ['all', ['==', 'UNIT', activeTab.geography], ["!=", activeTab.name, feature.properties[activeTab.name]]]);
            map.setFilter("2012results-"+activeTab.geography+"-hover", ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, feature.properties[activeTab.name]]]);
    }
}

//submit search text box - removed button for formatting space
function keypressInBox(e) {
    var code = (e.keyCode ? e.keyCode : e.which); //ternary operator-> condition ? expr1 : expr2 -> If condition is true, then expression should be evaluated else evaluate expression 2
    if (code == 13) { //Enter keycode                        
        e.preventDefault();
        geoCodeAddress(geocoder);
    };
}

function geoCodeAddress(geocoder) {
    var address = document.getElementById('address').value;

    // anatomy of Mapbox GL Geocoder
    // https://api.mapbox.com/geocoding/v5/mapbox.places/1414%20skyline%20rd%2C%20eagan.json?country=us&proximity=38.8977%2C%2077.0365&bbox=-104.7140625%2C%2041.86956%2C-84.202832%2C%2050.1487464&types=address%2Clocality%2Cplace&autocomplete=true&access_token=pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g 
    var geocoderURL  = 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places/';
        geocoderURL += address + '.json?access_token=' + mapboxgl.accessToken;

    //$.ajax vs mapbox.util.getJSON
    //mapboxgl.util.getJSON(geocoderURL, function(err, result) {/*do stuff with result*/ });

	$.ajax({
	  type: 'GET',
	  url: geocoderURL,
	  success: function(result) {
	  	    //mapbox-gl geocoder returns results in order from closest match to least closest, so grab [0]
	          var topResult = result.features[0];              
		      map.flyTo({
		      	center:topResult.geometry.coordinates,
		      	zoom:12,
		      	speed:1.75
		      });
		      addMarker(topResult.geometry);
	  },
	  error: function() {
	       alert('geocode fail'); //maybe pass to google
	  }
	});

	    return false;
	}

function addMarker(e){
   removeLayers('pushpin');

   map.on('zoomend', function(){
       //project latlong to screen pixels for qRF()
       var center = map.project([e.coordinates[0],e.coordinates[1]])      
       var features = map.queryRenderedFeatures(center,{ layers: ["2012results-vtd"] }); //queryRenderedFeatures returns an array
       var feature = (features.length) ? features[0] : '';
       showResults(activeTab, feature.properties);
       mapResults(feature);
   });

   	//add marker
	map.addSource("pointclick", {
  		"type": "geojson",
  		"data": {
    		"type": "Feature",
    		"geometry": {
      			"type": "Point",
      			"coordinates": e.coordinates
    		},
    		"properties": {
      			"title": "mouseclick",
      			"marker-symbol": "myMarker-Blue-Shadow"
    		}
  		}
	});

    map.addLayer({
        "id": "pointclick",
        type: 'symbol',
        source: 'pointclick',
        "layout": {
        	"icon-image": "{marker-symbol}",
        	"icon-size":1,
        	"icon-offset": [0, -13]
        },
        "paint": {}
    });
}

function removeLayers(c){

	switch (c){
		case'all':
		map.setFilter("2012results-vtd", ['all', ['==', 'UNIT', 'vtd'], ["!=", "VTD",'any']]);
        map.setFilter("2012results-vtd-hover", ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD",'all']]);
        // map.setFilter("2012results-cty", ['all', ['==', 'UNIT', 'cty'], ["!=", "cty",'any']]);
        // map.setFilter("2012results-cty-hover", ['all', ['==', 'UNIT', 'cty'], ["==", "cty",'all']]);

        map.setFilter("2012results-"+activeTab.geography, ['all', ['==', 'UNIT', activeTab.geography], ["!=", activeTab.name, 'all']]);
        map.setFilter("2012results-"+activeTab.geography+"-hover", ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, 'all']]);

        document.getElementById('precinct-header').innerHTML = "";
        document.getElementById('precinct-results').innerHTML = "";
        $('#clear').hide();

        if(activeTab.selection == 'USPRS' || activeTab.selection == 'USSEN'){
        	$('#candidate-table').show();
        } else{
        	$('#candidate-table').hide();
        }
		//remove old pushpin and previous selected district layers 
		if (typeof map.getSource('pointclick') !== "undefined" ){ 
			// console.log('remove previous marker');
			map.removeLayer('pointclick');		
			map.removeSource('pointclick');
		}		
		break;		
		case 'pushpin':
		//remove old pushpin and previous selected district layers 
		if (typeof map.getSource('pointclick') !== "undefined" ){ 
			// console.log('remove previous marker');
			map.removeLayer('pointclick');		
			map.removeSource('pointclick');
		}
		break;
	}    
}