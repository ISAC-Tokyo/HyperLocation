#! /usr/bin/env ruby
# author: takano32 <takano32 at gmail.com>
#

require 'socket'

data = ARGF.read
lines = []
data.each_line do |line|
  lines << line
end

rtkrcv_server = TCPServer.open(52001)
addr = rtkrcv_server.addr
addr.shift
puts 'server is on %s' % [addr.join(':')]

loop do
  Thread.start(rtkrcv_server.accept) do |s|
    puts '%s is accepted' % [s] if $DEBUG
    loop do
      lines.each do |line|
        s.write(line)
        sleep 1
      end
    end
    puts '%s is gone' % [s] if $DEBUG
    s.close
  end
end

