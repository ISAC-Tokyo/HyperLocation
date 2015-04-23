require 'sinatra'
require 'socket'

columns = %w!
  GPST1 GPST2 latitude(deg) longitude(deg) height(m) Q ns
  sdn(m) sde(m) sdu(m) sdne(m) sdeu(m) sdun(m) age(s) ratio
!
mutex = Mutex.new
data = ''
Thread.start do |thread|
  TCPSocket.open('hl.no32.tk', 52001) do |s|
    while line = s.gets
      mutex.synchronize do
        data = line.chomp
      end
    end
  end
end

get '/' do
  mutex.synchronize do
    return data
  end
end

