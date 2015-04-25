$(function() {

    $('#change_btn').on(function() {
        request();
    });

    request();
    setInterval(function() {
        request();
    }, 1000);

});

function request() {
    var api = $('#location_server').val()

    $.ajax({
        type: 'GET',
        url: api,
        timeout: '5000'
    }).done(function(ret) {
        console.log(ret);
        $('#result').text(JSON.stringify(ret));
    }).error(function(e) {
        console.log('error');
        console.error(e);
        if (e.statusText) {
          $('#result').text(e.statusText);
        } else {
          $('#result').text('Error');
        }
    }).always(function(e) {
        console.log('always');
    });
}
