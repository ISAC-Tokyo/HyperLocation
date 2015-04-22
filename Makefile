
setup:
	git submodule init
	git submodule update

rtklib: setup
	cd RTKLIB/app; sh makeall.sh
	chmod 775 ./RTKLIB/app/rtkrcv/gcc/rtkstart.sh
	chmod 775 ./RTKLIB/app/rtkrcv/gcc/rtkshut.sh

debug:
	# rtkrcvの起動: Mode Single
	# 単体で測位できるかのテスト用
	sudo ./RTKLIB/app/rtkrcv/gcc/rtkrcv -s -o ./config/rtkrcv_single.conf

start_server:
	# rtkrcvの起動: Mode Kinematic
	sudo ./RTKLIB/app/rtkrcv/gcc/rtkrcv -s -o ./config/rtkrcv_rtk.conf
