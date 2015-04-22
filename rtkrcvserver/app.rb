require 'sinatra'
require 'socket'

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
    data
  end
end

