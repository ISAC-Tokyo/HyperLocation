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
            lat: ret["latitude(deg)"],
            lon: ret["longitude(deg)"],
            height: ret["height(m)"]
        });
        updateStatus(null, 'Data received', JSON.stringify(ret));
    }, function(e) {
        updateStatus(true, e.statusText, '');
    });

    locationStream.subscribe(function(data) {
        $('#lat').text(data.lat);
        $('#lon').text(data.lon);
        $('#height').text(data.height);
    });


    function updateStatus(error, status, data) {
        if (error) {
            $('#status').removeClass('ok').addClass('error');
        } else {
            $('#status').removeClass('error').addClass('ok');
        }
        $('#status').text(status);
        $('#result').text(data);
    }
});
