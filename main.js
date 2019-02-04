var map;
var info ;

function main() {
	var c = $.cookie() ;

	var lat = $.cookie('touhyoujyo_lat');
	var lng = $.cookie('touhyoujyo_lng');
	var zoom = $.cookie('touhyoujyo_zoom');
	
	var latlng = [35.548755,135.908418];

	if (lat != null && lng != null) {
		latlng = [lat, lng];
	}

	map = L.map('map', {zoomControl: true}).setView(latlng, zoom != null ? zoom : 15);
	
	var mapLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>';
	
	L.tileLayer(
		'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
		{
			attribution: 'Map data &copy; ' + mapLink,
			maxZoom: 18
		}
	).addTo(map);
	
	onCreate() ;
		
	map.on('click', onMapClick);
	
	/*
	map.locate({setView: true, maxZoom: 16});
	
	map.on('locationfound', function(e) {
		var radius = e.accuracy / 2;
	
		L.marker(e.latlng).addTo(map)
			.bindPopup("You are within " + radius + " meters from this point").openPopup();
	
		L.circle(e.latlng, radius).addTo(map);
	});
	
	map.on('locationerror', function(e) {
	
	});
	*/
}

function saveMap() {
    var c = map.getCenter() ;
        var z = map.getZoom() ;
        $.cookie('touhyoujyo_lat', c.lat, { expires: 7, path: '/' });
        $.cookie('touhyoujyo_lng', c.lng, { expires: 7, path: '/' });
        $.cookie('touhyoujyo_zoom', z, { expires: 7, path: '/' });
}
