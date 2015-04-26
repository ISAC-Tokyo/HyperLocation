'use strict';

$(function() {
    'use strict';

    var api = $('#location_server').val();
    var buttonStream = Rx.Observable.fromEvent($('#change_btn'), 'click').map(function(e) {
        api = $('#location_server').val();
        return true;
    });
    var timerStream = Rx.Observable.interval(1000);


    var responseStream = Rx.Observable.merge(buttonStream, timerStream)
    .map(function() { return api })
    .filter(function(url) { return url.length > 0 })
    .throttle(500)
    .flatMap(function(url) {
        var promise = $.ajax(api);
        return Rx.Observable.fromPromise(promise);
    });

    var locationStream = new Rx.Subject();
      responseStream.subscribe(function(ret) {
        var lat = parseFloat(ret["latitude(deg)"]);
        var lon = parseFloat(ret["longitude(deg)"]);
        var height = parseFloat(ret["height(m)"]);
        locationStream.onNext({
            lat: lat,
            lon: lon,
            height: height
        });
        map.update(lat, lon);
        updateStatus(null, 'Data received', ret);
    }, function(e) {
        updateStatus(true, e.statusText, '');
    });

    locationStream
    .bufferWithCount(4, 1)
    .map(function(n) {
        var count = n.length;
        var latMean = n.map(function(item){return item.lat}).sum()/count;
        var lonMean = n.map(function(item){return item.lon}).sum()/count;
        var latVariance = n.map(function(item){return Math.abs(latMean - item.lat)}).sum()/count;
        var lonVariance = n.map(function(item){return Math.abs(lonMean - item.lon)}).sum()/count;

        var drift = {
            y: Math.abs(n[count - 1].lat - n[count - 2].lat),
            x: Math.abs(n[count - 1].lon - n[count - 2].lon)
        }
        return {
            mean: {
                lat: latMean,
                lon: lonMean
            },
            variance: {
                lat: latVariance,
                lon: lonVariance
            },
            latest: n.pop(),
            drift: drift
        }
    })
    .subscribe(function(n) {

        $('#varlat').text(roundFloat(n.variance.lat, 10));
        $('#varlon').text(roundFloat(n.variance.lon, 10));


        var rx = 40076500; // m
        var ry = 40008600; // m

        // Y lat
        var y = ry/360 * n.drift.y;
        // X 
        var x = rx * Math.cos(n.mean.lat * Math.PI/180)/360 * n.drift.x;
        // Distance
        var drift = Math.sqrt(x*x + y*y)
        $('#drift').text(roundFloat(drift, 4));
    });

    function updateStatus(error, status, data) {
        if (error) {
            $('#status').removeClass('ok').addClass('error');
        } else {
            $('#status').removeClass('error').addClass('ok');
            $('#lat').text(data["latitude(deg)"]);
            $('#lon').text(data["longitude(deg)"]);
            $('#height').text(data["height(m)"]);
        }
        $('#status').text(status);
        $('#time').text(new Date().toLocaleTimeString());
        $('#result').text(JSON.stringify(data));
    }

    var map = new LocationMap();
});

function roundFloat(val, dig) {
    return Math.round(val * Math.pow(10, dig), dig)/Math.pow(10, dig)
}

Array.prototype.sum = function(){
    return this.reduce(function(a, b) {return a + b});
}


function LocationMap() {
    this.elementId = 'map_canvas';
    var mapOptions = {
        zoom: 19,
        center: new google.maps.LatLng(-34.397, 150.644),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    this.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    this.marker = null;
    this.driftPath = null;
    this.paths = [];
}

LocationMap.prototype.update = function(lat, lng) {
    var pos = new google.maps.LatLng(lat, lng);
    //this.updateMarker(pos);
    this.updatePath(pos);
    this.map.setCenter(pos);
}

LocationMap.prototype.updateMarker = function(pos) {
    if (!this.marker) {
        this.marker = new google.maps.Marker({
            position: pos,
            map: this.map,
            draggable:false,
            title: "Positioned"
        });
    }
    this.marker.setPosition(pos);
}

LocationMap.prototype.updatePath = function(pos) {
    if (this.paths.length > 20) {
        this.paths.shift();
    }
    this.paths.push(pos);

    if (!this.driftPath) {
        this.driftPath = new google.maps.Polyline({
            path: this.paths,
            strokeColor: "#3333FF",
            clickable: false,
            geodesic: true,
            map: this.map,
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
    }
    this.driftPath.setPath(this.paths);
}

