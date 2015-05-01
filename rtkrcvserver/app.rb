require 'sinatra'
require 'socket'

set :protection, :except => [:frame_options, :json_csrf]

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

require 'json'
get '/v1/json' do
  mutex.synchronize do
    kvs = columns.zip(data.split(/[^-0-9\/:\.]/).reject{ |v| v.empty? })
    json = kvs.inject({}) do |r, p|
      k, v = p
      r[k] = v
      r
    end.to_json
    response.headers['Access-Control-Allow-Origin'] = '*'
    content_type :json
    return json
  end
end
