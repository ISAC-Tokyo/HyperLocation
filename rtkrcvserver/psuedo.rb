#! /usr/bin/env ruby
#
#

require 'socket'

ubx_data = DATA.read

rtkrcv_server = TCPServer.open(52001)
addr = rtkrcv_server.addr
addr.shift
puts 'server is on %s' % [addr.join(':')]

loop do
  Thread.start(rtkrcv_server.accept) do |s|
    puts '%s is accepted' % [s] if $DEBUG
    loop do
      s.write(ubx_data)
      sleep 1
    end
    puts '%s is gone' % [s] if $DEBUG
    s.close
  end
end


__END__
$GPRMC,184318.00,A,3541.97810,N,13946.48132,E,0.266,,110415,,,A*74
$GPVTG,,T,,M,0.266,N,0.492,K,A*2E
$GPGGA,184318.00,3541.97810,N,13946.48132,E,1,03,2.50,0.0,M,39.4,M,,*50
$GPGSA,A,2,17,06,07,,,,,,,,,,2.69,2.50,1.00*0F
$GPGSV,2,1,06,02,49,316,,06,72,068,27,07,16,111,33,09,,,31*45
$GPGSV,2,2,06,17,25,172,34,25,01,307,*7F
$GPGLL,3541.97810,N,13946.48132,E,184318.00,A,A*6F
$GPZDA,184318.00,11,04,2015,00,00*63
