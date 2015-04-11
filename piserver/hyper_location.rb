require 'sinatra/base'
require 'sinatra-websocket'
require 'tilt/erb'
require 'socket'

HL_SRV_HOST = '127.0.0.1'
HL_SRV_PORT = 9292
RTK_SRV_HOST = '127.0.0.1'
#RTK_SRV_HOST = '192.168.158.201'
RTK_SRV_PORT = 52001
RTK_SRV_REFRESH = 1 # second

class HyperLocation < Sinatra::Base
  set :server, 'thin'
  set :sockets, []

  get '/' do
    if !request.websocket?
      erb :index
    end
  end

  get '/reading' do
    if request.websocket?
      request.websocket do |ws|
        ws.onopen do
          ws.send("Connection opened")
          settings.sockets << ws
        end
        ws.onclose do
          warn("Connection closed")
          settings.sockets.delete(ws)
        end
      end
    end
  end

  Thread.new {
    loop do
      rtksrv ||= TCPSocket.new RTK_SRV_HOST, RTK_SRV_PORT
      puts 'reading'
      sleep RTK_SRV_REFRESH
      if reading = rtksrv.gets
        puts "Got a reading: #{reading}"
        settings.sockets.each {|s| s.send(reading) }
      end
    end
  }

  template :index do
<<HTML
<html>
  <head>
    <title>Hyper Location</title>
  </head>
  <body>
    <div id="position"></div>
  </body>
  <script type="text/javascript">
    window.onload = function() {
      (function(){
        var show = function(el) {
          return function(msg) {
                   el.innerHTML = msg + '<br />' + el.innerHTML;
                 }
        }(document.getElementById('position'));

        var ws = new WebSocket('ws://#{HL_SRV_HOST}:#{HL_SRV_PORT}/reading');
        ws.onopen    = function()  { show('websocket opened'); };
        ws.onclose   = function()  { show('websocket closed'); };
        ws.onmessage = function(m) { show(m.data); };
      })();
    };
  </script>
</html>
HTML
  end

end

__END__
@@ index
