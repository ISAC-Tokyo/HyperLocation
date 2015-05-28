'use strict';

$(function() {
    'use strict';

    var timer;
    var locationStream = new Rx.Subject();

    function dataLocation() {
        return $('#location_server').val();
    }

    var buttonStream = Rx.Observable.fromEvent($('#change_btn'), 'click').map(dataLocation);
    var initialEvent = new Rx.Subject()
    var initialStream = initialEvent.map(dataLocation);
    var locationStream = new Rx.Subject();

    var responseStream = Rx.Observable.merge(buttonStream, initialStream)
    .filter(function(url) { return url.length > 0 })
    .throttle(500)
    .flatMap(function(url) {
        var promise = $.ajax(url);
        return Rx.Observable.fromPromise(promise);
    });

    responseStream.subscribe(function(ret) {
        clearInterval(timer);

        var lines = ret.split('\n');
        // Drop headers
        lines.shift();
        lines.shift();
        var data = lines.map(function(line) {
            var row = line.split(' ').filter(function(val){return val.length > 0});
            var lat = parseFloat(row[2])
            var lon = parseFloat(row[3])
            var height = parseFloat(row[4])
            return({
                lat: lat,
                lon: lon,
                height: height
            });
        });

        timer = setInterval(function() {
            var d = data.shift();
            console.log(d);
            if (d) { locationStream.onNext(d); }
        }, 1000);
    }, function(e) {
        clearInterval(timer);
        updateStatus(true, e.statusText, '');
    });

    locationStream.subscribe(function(val) {
        updateStatus(false, 'OK', val);
        map.update(val.lat, val.lon)
    });


    locationStream.bufferWithCount(4, 1).map(function(n) {
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
            $('#lat').text(data.lat);
            $('#lon').text(data.lon);
            $('#height').text(data.height);
        }
        $('#status').text(status);
        $('#time').text(new Date().toLocaleTimeString());
        $('#result').text(JSON.stringify(data));
    }

    var map = new LocationMap();
    initialEvent.onNext();
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

LocationMap.prototype.update = function(lat, lon) {
    var pos = new google.maps.LatLng(lat, lon);
    this.updateMarker(pos);
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

