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
        locationStream.onNext({
            lat: parseFloat(ret["latitude(deg)"]),
            lon: parseFloat(ret["longitude(deg)"]),
            height: parseFloat(ret["height(m)"])
        });
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
        $('#result').text(JSON.stringify(data));
    }
});

function roundFloat(val, dig) {
    return Math.round(val * Math.pow(10, dig), dig)/Math.pow(10, dig)
}

Array.prototype.sum = function(){
    return this.reduce(function(a, b) {return a + b});
}
