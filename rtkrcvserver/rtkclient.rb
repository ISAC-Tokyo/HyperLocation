#! /usr/bin/env ruby
# author: takano32 <takano32 at gmail.com>
#

require 'socket'

rtkrcv_client = TCPSocket.open('localhost', 52001) do |s|
  while line = s.gets
    puts line.chomp
  end
end

