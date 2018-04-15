// Your functions
//
//

var layers ;

var currentBusStopLayers ;
var basicBusStopLayers ;
var filteredBusStopLayers ;

// onCreate : This function is called when page began.
function onCreate() {
    
    L.easyButton('fa-home', function(btn, map){
        var latlng = [35.737841, 139.65391];
        map.setView(latlng, 15);

        saveMap() ;
    }).addTo(map);

    L.easyButton('fa-undo', function(btn, map){
        onSearchReset();
    }).addTo(map);

    var bordersFilePathArray = new Array() ;

    bordersFilePathArray.push('area_data/borders/area01.geojson') ;
    bordersFilePathArray.push('area_data/borders/area02.geojson') ;
    
    for (var i=0; i<bordersFilePathArray.length; i++) {
        $.getJSON(bordersFilePathArray[i], function(data) {
            createAreaLayer(data).addTo(map);
        });
    }

    layers = new Array();
 
    // bicycle data.
    $.getJSON('./area_data/public_transport/bicycle/bicycle_parking.geojson', function(data) {
        layers.push(createBicycleParkingLayer(data)) ;
    });

    // car data.
    $.getJSON('./area_data/public_transport/car/car_parking.geojson', function(data) {
        layers.push(createCarParkingLayer(data)) ;
    });

    // train data.
    $.getJSON('./area_data/public_transport/train/train_station.geojson', function(data) {
        layers.push(createTrainStationLayer(data)) ;
    });

    $.getJSON('./area_data/public_transport/train/train_line.geojson', function(data) {
        layers.push(createTrainLineLayer(data));
    });

    basicBusStopLayers = new Array();

    // bus data.
    $.getJSON('./area_data/public_transport/bus/bus_stop01.geojson', function(data) {
        basicBusStopLayers.push(createBusStopLayer(data, null) ) ;
    });
    
    $.getJSON('./area_data/public_transport/bus/bus_stop02.geojson', function(data) {
        basicBusStopLayers.push(createBusStopLayer(data, null)) ;
    });

    $.getJSON('./area_data/public_transport/bus/bus_root01.geojson', function(data) {    
        basicBusStopLayers.push(createBusRootLayer(data, null)) ;
    });
    
    $.getJSON('./area_data/public_transport/bus/bus_root02.geojson', function(data) {
        basicBusStopLayers.push(createBusRootLayer(data, null)) ;
        showLayers(map._zoom)
    });

    addInfoLayer();
    
    // datas
    var layerGroups = Array();
    layerGroupsTotalCount = 0 ;
    layerGroupsCount = 0 ;

    $.getJSON('./data/datas.json', function(data) { 
        var entries = data.entries ;

        layerGroupsTotalCount = entries.length ;

        for (var i=0; i<entries.length; i++) {
            var entry = entries[i] ;
            addEntry(entry, layerGroups) ;
        }
    }) ;

    currentBusStopLayers = basicBusStopLayers ;

    map.on('zoomend', function(e) {
        showLayers(e.target._zoom) ;
    }) ;

    map.on('moveend', function(e) {
        saveMap() ;
    }) ;
}

var layerGroupsTotalCount = 0 ;
var layerGroupsCount = 0 ;

function addEntry(entry, layerGroups) {
    $.getJSON(entry.url, function(data) { 
        layerGroupsCount++ ;

        var layer = createDataLayer(data, entry.iconUrl) ;
        var caption = "<span class=\"label\"><img src=\"" + entry.iconUrl + "\" width=\"30\"><span class=\"text\">" + entry.name + "</span></span>" ;

        layerGroups[caption] = L.layerGroup([layer]).addTo(map);
        //layer.addTo(map) ;

        if (layerGroupsCount == layerGroupsTotalCount) {
            var control = L.control.layers(null, layerGroups, {collapsed: true, position: 'topleft'}) ;
            control.addTo(map);
        }
    }) ;
}

// Show layers. Depend on zoom rate.
function showLayers(zoom) {
    if (zoom > 14) {
        for (var i=0; i<layers.length; i++) {
            layers[i].addTo(map) ;
        }
        
        if (currentBusStopLayers == basicBusStopLayers) {
            for (var i=0; i<currentBusStopLayers.length; i++) {
                currentBusStopLayers[i].addTo(map) ;
            }
        }
        
    } else {
        for (var i=0; i<layers.length; i++) {
            layers[i].remove(map) ;
        }
        if (currentBusStopLayers == basicBusStopLayers) {
            for (var i=0; i<currentBusStopLayers.length; i++) {
                currentBusStopLayers[i].remove(map) ;
            }
        }
    }
}

// Info layer
function addInfoLayer() {
    info = L.control();
	
	info.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};
	
	info.update = function (popupContents) {
		if (popupContents != null) {
			this._div.innerHTML = popupContents ;
			$(".info").css("display", "inline") ;
		}
	};

	info.addTo(map);

	$(".info").css("display", "none") ;
}

// This function is for create data layer.
function createDataLayer(data, iconUrl) {
    var markerIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });

    return L.geoJson(data, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.marker(latlng, {icon: markerIcon});
        },
        onEachFeature: function(feature, layer) {
            var popupContents = createDataContent(feature, iconUrl) ;

            layer.bindPopup(popupContents);
 
            layer.on({
                mouseover: function(e){
                    info.update(popupContents);
                },
                mouseout: function(e){
                    
                },
                click: function(e){
                    
                }
            });
        }
    }) ;
}

// onMapClick : This function is called when map was clicked.
function onMapClick(e) {
    //popup.setLatLng(e.latlng).setContent("You clicked the map at " + e.latlng.toString()).openOn(map);
    $(".info").css("display", "none") ;
}

function createDataContent(feature, iconUrl) {
    var popupContents = '';
 
    if (feature && feature.properties) {   
        popupContents = "<img src=\"" + iconUrl + "\"  width=\"30\"/>";  
        popupContents += "<h2>" + feature.properties.投票所名称 + "</h2>";
        popupContents += "<table>"
        
        if (feature.properties.選挙区 != "") {
            popupContents += "<tr><td>選挙区　</td><td>" + feature.properties.選挙区 + "</td></tr>" ;
        }

        if (feature.properties.投票区 != "") {
            popupContents += "<tr><td>投票区　</td><td>" + feature.properties.投票区 + "</td></tr>" ;
        }
        
        if (feature.properties.投票所所在地 != "") {
            popupContents += "<tr><td>所在地　</td><td>" + feature.properties.投票所所在地 + "</td></tr>" ;
        }
        
        if (feature.properties.投票区区域 != "") {
            popupContents += "<tr><td>区域　</td><td>" + feature.properties.投票区区域 + "</td></tr>" ;
        }
        
        popupContents += "</table>" ;
    }

    return popupContents ;
}

function createAreaLayer(data) {
    return L.geoJson(data, {
        style : function(feature) {
            if (feature.properties.N03_003 == "練馬区") {
                return {
                    fillColor: 'cyan',
                    weight: 2,
                    opacity: 1,
                    color: 'black',  //Outline color
                    fillOpacity: 0.1
                };
            } else {
                return {
                    fillColor: 'gray',
                    weight: 2,
                    opacity: 1,
                    color: 'black',  //Outline color
                    fillOpacity: 0.1
                };
            }
        }
    }) ;
}

function createBicycleParkingLayer(data) {
    var bicycleIcon = L.icon({
        iconUrl: 'area_data/public_transport/bicycle/bicycle_icon.png',
        iconSize: [30, 30],
        popupAnchor: [0, -10],
    });

    return L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon : bicycleIcon}) ;
        },
        onEachFeature: function(feature, layer) {
            
            var iconFilePath = 'area_data/public_transport/bicycle/bicycle_icon.png' ;
            var popupContents = "<img src=\"" + iconFilePath + "\"  width=\"30\"/>";
            
            popupContents += "<h2>" + feature.properties.施設名 + "</h2>";

            popupContents += "<table>"
        
            popupContents += "<tr><td>住所　</td><td>" + feature.properties.所在地 + "</td></tr>" ;
            popupContents += "<tr><td>自転車適正収容台数　</td><td>" + feature.properties.自転車適正収容台数 + "</td></tr>" ;
            popupContents += "<tr><td>原付適正収容台数　</td><td>" + feature.properties.原付適正収容台数 + "</td></tr>" ;
            
            popupContents += "</table>" ;

            layer.bindPopup(popupContents);

            layer.on({
        		mouseover: function(e){
					info.update(popupContents);
				},
        		mouseout: function(e){
					
				},
        		click: function(e){

				}
    		});
        }
    })
}

function createCarParkingLayer(data) {
    var bicycleIcon = L.icon({
        iconUrl: 'area_data/public_transport/car/car_icon.png',
        iconSize: [30, 30],
        popupAnchor: [0, -10],
    });

    return L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {icon : bicycleIcon}) ;
        },
        onEachFeature: function(feature, layer) {
            
            var iconFilePath = 'area_data/public_transport/car/car_icon.png' ;
            var popupContents = "<img src=\"" + iconFilePath + "\"  width=\"30\"/>";
            
            popupContents += "<h2>" + feature.properties.施設名 + "</h2>";

            popupContents += "<table>"
        
            popupContents += "<tr><td>電話　</td><td>" + feature.properties.電話番号 + "</td></tr>" ;
            popupContents += "<tr><td>住所　</td><td>" + feature.properties.所在地 + "</td></tr>" ;
            popupContents += "<tr><td>自動車適正収容台数　</td><td>" + feature.properties.自動車適正収容台数 + "</td></tr>" ;
            popupContents += "<tr><td>自動二輪車適正収容台数　</td><td>" + feature.properties.自動二輪車適正収容台数 + "</td></tr>" ;
            
            popupContents += "</table>" ;

            layer.bindPopup(popupContents);

            layer.on({
        		mouseover: function(e){
					info.update(popupContents);
				},
        		mouseout: function(e){
					
				},
        		click: function(e){

				}
    		});
        }
    })
}

var currentBusStopFeature ;

function createBusStopLayer(data, filterFunc) {
    var busIcon = L.icon({
        iconUrl: 'area_data/public_transport/bus/bus_icon.png',
        iconSize: [20, 20],
        popupAnchor: [0, -10],
    });

    var filteredBusIcon = L.icon({
        iconUrl: 'area_data/public_transport/bus/filtered_bus_icon.png',
        iconSize: [20, 20],
        popupAnchor: [0, -10],
    }) ;

    var currentBusIcon = L.icon({
        iconUrl: 'area_data/public_transport/bus/filtered_bus_icon.png',
        iconSize: [40, 40],
        popupAnchor: [0, -20],
    }) ;

    return L.geoJson(data, {
        filter: function(feature) {
            if (filterFunc != null) {
                return filterFunc(feature)
            } else {
                return true ;
            }
        },
        pointToLayer: function(feature, latlng) {
            if (filterFunc != null) {
                if (currentBusStopFeature.properties.P11_001 == feature.properties.P11_001) {
                    return L.marker(latlng, {icon : currentBusIcon}) ;
                } else {
                    return L.marker(latlng, {icon : filteredBusIcon}) ;
                }
            } else {
                return L.marker(latlng, {icon : busIcon}) ;
            }
        },
        onEachFeature: function(feature, layer) {

            var currentBusLineArray ;

            if (currentBusStopFeature != null) {
                currentBusLineArray = Array();

                var currentCompanies = currentBusStopFeature.properties.P11_003_1.split(",");
                var currentIdentifies = currentBusStopFeature.properties.P11_004_1.split(",");
                
    
                for (var i=0; i<currentCompanies.length; i++) {
                    var key = currentCompanies[i] + currentIdentifies[i] ;
                    currentBusLineArray.push(key) ;
                }
            }
            
            var iconFilePath = 'area_data/public_transport/bus/bus_icon.png' ;
            var popupContents = "<img src=\"" + iconFilePath + "\"  width=\"30\"/>";
            
            popupContents += "<h2>" + feature.properties.P11_001 + "</h2>";

            var companies = feature.properties.P11_003_1.split(",");
            var identifies = feature.properties.P11_004_1.split(",");

            popupContents += "<table>" ;

            for (var i=0; i<companies.length; i++) {
                var key = companies[i] + identifies[i] ;

                if (currentBusLineArray != null && currentBusLineArray.find(function(element) {
                    return (element == key);
                }) != null) {
                    popupContents += "<tr class=\"current\"><td>" + companies[i] + "</td><td>" + identifies[i] + "</td><tr>" ;
                } else {
                    popupContents += "<tr><td>" + companies[i] + "</td><td>" + identifies[i] + "</td><tr>" ;
                }
            }

            popupContents += "</table><br />" ;

            popupContents += "<button id=\"search_root\" onclick=\"onSearchRoot()\">検索</button>" ;
            popupContents += "<button id=\"search_reset\" onclick=\"onSearchReset()\">リセット</button>" ;

            layer.bindPopup(popupContents);

            layer.on({
        		mouseover: function(e){
                    currentBusStopFeature = feature ;
					info.update(popupContents);
				},
        		mouseout: function(e){
					
				},
        		click: function(e){
					currentBusStopFeature = feature ;
				}
    		});
        }
    })
}

function createBusRootLayer(data, filterFunc) {
    return L.geoJson(data, {
        filter: function(feature) {
            if (filterFunc != null) {
                return filterFunc(feature)
            } else {
                return true ;
            }
        },
        style: function(feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'green',  //Outline color
            };
        }
    }) ;
}

function createTrainStationLayer(data) {
    var markers = new Array() ;

    var layer = L.geoJson(data, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.marker(latlng) ;
        },
        onEachFeature: function(feature, layer) {
            var latlng = [
                (feature.geometry.coordinates[0][0][1] + feature.geometry.coordinates[0][1][1])/2,
                (feature.geometry.coordinates[0][0][0] + feature.geometry.coordinates[0][1][0])/2
            ] ;

            var iconFilePath = "" ;

            if (feature.properties.N02_004 == "西武鉄道" && 
            (feature.properties.N02_003 == "池袋線" || feature.properties.N02_003 == "豊島線" || feature.properties.N02_003 == "西武有楽町線")) {
                iconFilePath = 'area_data/public_transport/train/train_icon_seibuikebukuro.png' ;
            } else if (feature.properties.N02_004 == "西武鉄道" && feature.properties.N02_003 == "新宿線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_seibushinjuku.png' ;
            } else if (feature.properties.N02_004 == "東京地下鉄" && feature.properties.N02_003 == "8号線有楽町線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_yurakucho.png' ;
            } else if (feature.properties.N02_004 == "東京都" && feature.properties.N02_003 == "12号線大江戸線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_ooedo.png' ;
            } else if (feature.properties.N02_004 == "東武鉄道" && feature.properties.N02_003 == "東上本線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_tobutojo.png' ;
            } else if (feature.properties.N02_004 == "東日本旅客鉄道" && feature.properties.N02_003 == "中央線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_jr_chuo.png' ;
            } else if (feature.properties.N02_004 == "東京地下鉄" && 
            (feature.properties.N02_003 == "4号線丸ノ内線" || feature.properties.N02_003 == "4号線丸ノ内線分岐線")) {
                iconFilePath = 'area_data/public_transport/train/train_icon_marunouchi.png' ;
            } else if (feature.properties.N02_004 == "京王電鉄" && feature.properties.N02_003 == "井の頭線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_inogashira.png' ;
            } else if (feature.properties.N02_004 == "東京地下鉄" && feature.properties.N02_003 == "5号線東西線") {
                iconFilePath = 'area_data/public_transport/train/train_icon_tozai.png' ;
            } else {
                iconFilePath = 'area_data/public_transport/train/train_icon.png' ;
            }
            
            var trainIcon = L.icon({
                iconUrl: iconFilePath,
                iconSize: [30, 30],
                popupAnchor: [0, -15],
            });

            var marker = L.marker(latlng, {icon : trainIcon}) ;

            var popupContents = "<img src=\"" + iconFilePath + "\"  width=\"30\"/>";

            popupContents += "<h2>" + feature.properties.N02_005 + "</h2>";

            popupContents += "<table>" ;
            popupContents += "<tr><td>" + feature.properties.N02_004 + "</td><td>" + feature.properties.N02_003 + "</td><tr>" ;
            popupContents += "</table>" ;

            marker.bindPopup(popupContents);

            marker.on({
        		mouseover: function(e){
					info.update(popupContents);
				},
        		mouseout: function(e){
					
				},
        		click: function(e){
					
				}
            });
            
            markers.push(marker) ;
        }
    });

    for (var i=0; i<markers.length; i++) {
        layer.addLayer(markers[i]) ;
    }

    return layer ;
}

function createTrainLineLayer(data) {
    return L.geoJson(data, {
        style: function(feature) {
            return {
                weight: 2,
                opacity: 1,
                color: 'green',  //Outline color
            };
        }
    }) ;
}

function onSearchRoot(e) {

    for (var i=0; i<currentBusStopLayers.length; i++) {
        currentBusStopLayers[i].remove(map) ;
    }

    filteredBusStopLayers = new Array();

    currentBusStopLayers = filteredBusStopLayers ;

    var onBusStopFilter = function(feature) {
        
        var currentCompanies = currentBusStopFeature.properties.P11_003_1.split(",");
        var currentIdentifies = currentBusStopFeature.properties.P11_004_1.split(",");
        var array = Array()

        for (var i=0; i<currentCompanies.length; i++) {
            var key = currentCompanies[i] + currentIdentifies[i] ;
            array.push(key) ;
        }

        var companies = feature.properties.P11_003_1.split(",");
        var identifies = feature.properties.P11_004_1.split(",");

        for (var i=0; i<companies.length; i++) {
            var key = companies[i] + identifies[i] ;

            if (array.find(function(element) {
                return (element == key);
            }) != null) {
                return true ;
            }
        }

        return false ;
    } ;

    var onBusRootFilter = function(feature) {
        if (currentBusStopFeature == null) {
            return true ;
        }

        var currentCompanies = currentBusStopFeature.properties.P11_003_1.split(",");
        var currentIdentifies = currentBusStopFeature.properties.P11_004_1.split(",");
        var array = Array()

        for (var i=0; i<currentCompanies.length; i++) {
            var key = currentCompanies[i] + currentIdentifies[i] ;
            array.push(key) ;
        }

        var key = feature.properties.N07_002 + feature.properties.N07_003 ;

        if (array.find(function(element) {
            return (element == key);
        }) != null) {
            return true ;
        } else {
            return false ;
        }
    } ;

    $.getJSON('./area_data/public_transport/bus/bus_stop01.geojson', function(data) {
        var layer = createBusStopLayer(data, onBusStopFilter);

        filteredBusStopLayers.push(layer) ;
        layer.addTo(map) ;
    });
    
    $.getJSON('./area_data/public_transport/bus/bus_stop02.geojson', function(data) {
        var layer = createBusStopLayer(data, onBusStopFilter) ;

        filteredBusStopLayers.push(layer) ;
        layer.addTo(map) ;
    });

    $.getJSON('./area_data/public_transport/bus/bus_root01.geojson', function(data) {    
        var layer = createBusRootLayer(data, onBusRootFilter) ;

        filteredBusStopLayers.push(layer) ;
        layer.addTo(map) ;
    });
    
    $.getJSON('./area_data/public_transport/bus/bus_root02.geojson', function(data) {
        var layer = createBusRootLayer(data, onBusRootFilter) ;

        filteredBusStopLayers.push(layer) ;
        layer.addTo(map) ;
    });
}

function onSearchReset() {
    if (filteredBusStopLayers == null) {
        alert('このボタンはバス停の検索をリセットします。\n路線検索をしたいバス停をクリックして検索してください。') ;
        return ;
    }

    for (var i=0; i<filteredBusStopLayers.length; i++) {
        filteredBusStopLayers[i].remove(map) ;
    }

    currentBusStopLayers = basicBusStopLayers ;

    if (map._zoom > 14) {
        for (var i=0; i<currentBusStopLayers.length; i++) {
            currentBusStopLayers[i].addTo(map) ;
        }
    }

    currentBusStopFeature = null ;
    filteredBusStopLayers = null ;
}