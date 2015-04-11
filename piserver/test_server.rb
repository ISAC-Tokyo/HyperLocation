require 'socket'

mock = TCPServer.new 52001

loop do
  client = mock.accept
  puts "Hohoho, a client..."
  client.puts "rand(1000): #{rand(1000)}"
  client.close
end

