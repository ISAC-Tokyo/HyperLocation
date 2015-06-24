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
            var gpst = row[0] + ' ' + row[1]
            var lat = parseFloat(row[2])
            var lon = parseFloat(row[3])
            var height = parseFloat(row[4])
            return({
                gpst: gpst,
                lat: lat,
                lon: lon,
                height: height
            });
        });

        timer = setInterval(function() {
            var d = data.shift();
            if (d) {
                locationStream.onNext(d);
            } else {
                clearInterval(timer);
            }
        }, 1000);
    }, function(e) {
        clearInterval(timer);
        updateStatus(true, e.statusText, '');
    });

    locationStream.subscribe(function(val) {
        updateStatus(false, 'OK', val);
        map.update(val.lat, val.lon)
        expandedMap.add([val.lat, val.lon]);
        expandedMap.update();
    });

    locationStream.bufferWithCount(2, 1).subscribe(function(n) {
        var count = n.length;
        var current = n[0];
        var previous = n[1];

        var drift = {
            y: Math.abs(n[count - 1].lat - n[count - 2].lat),
            x: Math.abs(n[count - 1].lon - n[count - 2].lon)
        }

        var rx = 40076500; // m
        var ry = 40008600; // m

        // Y lat
        var y = ry/360 * drift.y;
        // X 
        var x = rx * Math.cos(current.lat * Math.PI/180)/360 * drift.x;
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
            $('#time').text(data.gpst.substr(0, 19));
        }
        $('#status').text(status);
    }

    var map = new LocationMap();
    var expandedMap = new ExpandedMap();
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

function ExpandedMap() {
    this.initialize()
}

ExpandedMap.prototype.initialize = function() {
    this.centerLat = 35.661359253
    this.centerLon = 139.678142785
    this.mapWidth = 40; // mm
    this.mapHeight = 40; // mm
    this.dataArray = []
    this.dataSize = 50;

    this.canvasWidth = 310; // px
    this.canvasHeight = 310; // px
    var canvasEl = document.getElementById('expanded_map');
    var pixelRatio = window.devicePixelRatio || 1;

    canvasEl.setAttribute('height', this.canvasHeight * pixelRatio);
    canvasEl.setAttribute('width', this.canvasWidth * pixelRatio);

    this.canvasContext = canvasEl.getContext('2d');
    this.canvasContext.scale(pixelRatio, pixelRatio);
    this.canvasContext.globalCompositeOperation = 'source-over';
    this.canvasContext.globalAlpha = 1;
}

ExpandedMap.prototype.add = function(latlon_arr) {
    this.dataArray.push(latlon_arr);
    if (this.dataArray.length > this.dataSize) {
        this.dataArray.shift();
    }
}

ExpandedMap.prototype.project = function(lat, lon) {
    var pos = projectMercator(lat, lon, this.centerLat, this.centerLon)
    var relative_x = pos[0] * this.canvasWidth / this.mapWidth;
    var relative_y = pos[1] * this.canvasHeight / this.mapHeight;
    var x = relative_x + this.canvasWidth/2;
    var y = relative_y + this.canvasHeight/2;
    return [x, y];
}

ExpandedMap.prototype.update = function() {
    var c = this.canvasContext;
    c.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.drawSupports();
    this.drawPaths();
}

ExpandedMap.prototype.drawSupports = function() {
    var c = this.canvasContext,
        h = this.canvasHeight,
        w = this.canvasWidth;
    c.lineCap = 'round';
    c.lineJoin = 'round';

    c.strokeStyle = 'rgba(180, 180, 180, 1)';
    c.beginPath();
    c.lineWidth = 1;
    c.moveTo(w/2, h/2);
    c.lineTo(w*2.8/5, h*3.5/5);
    c.stroke();
    c.font = '10px sans-serif';
    c.fillText(this.centerLat+','+this.centerLon, w*2.7/5, h*3.7/5);

    c.strokeStyle = 'rgba(120, 120, 120, 1)';
    c.beginPath();
    c.lineWidth = 1;
    c.moveTo(w/2, 0);
    c.lineTo(w/2, h);
    c.stroke();

    c.moveTo(0, h/2);
    c.lineTo(w, h/2);
    c.stroke();

    c.moveTo(20, h-25);
    c.lineTo(20+w/4, h-25);
    c.stroke();
    c.font = '12px sans-serif';
    c.fillText(this.mapWidth/4 + 'mm', 23, h - 10);

    c.moveTo(20, h-30);
    c.lineTo(20, h-20);
    c.stroke();
    c.moveTo(20+w/4, h-30);
    c.lineTo(20+w/4, h-20);
    c.stroke();

    for (var i=0; i<=4; i++) {
        c.moveTo(i*0.25*w, h/2 - 5);
        c.lineTo(i*0.25*w, h/2 + 5);
        c.stroke();
    }
    for (var i=0; i<=4; i++) {
        c.moveTo(w/2 - 5, i*0.25*h);
        c.lineTo(w/2 + 5, i*0.25*h);
        c.stroke();
    }

}

ExpandedMap.prototype.drawPaths = function() {
    var c = this.canvasContext;
    c.beginPath();
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.strokeStyle = 'rgba(255, 0, 0, 1)';
    c.lineWidth = 2;

    this.dataArray.forEach(function(pos, index) {
        var xy = this.project(pos[0], pos[1]);
        if (index == 0) {
            c.moveTo(xy[0], xy[1]);
        } else {
            c.lineTo(xy[0], xy[1]);
        }
    }, this);
    c.stroke()
}


function arctanh(x) {
    return 0.5 * Math.log((1 + x)/(1 - x))
}

function radian(digree) {
    return digree * Math.PI / 180;
}

/**
 * メルカトル図法で平面に投影する
 */
function projectMercator(lat, lon, center_lat, center_lon) {
    if (center_lat == undefined) {
        center_lat = 0;
    }
    if (center_lon == undefined) {
        center_lon = 0;
    }
    var earth_r = 6371 * 1000 * 1000// mm
    var x = earth_r * (radian(center_lon) - radian(lon));
    var center_y = arctanh(Math.sin(radian(center_lat)))
    var y = earth_r * (center_y - arctanh(Math.sin(radian(lat))))
    return [x, y]
}
