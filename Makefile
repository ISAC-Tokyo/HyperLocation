
setup:
	git submodule init
	git submodule update

rtklib: setup
	cd RTKLIB/app; sh makeall.sh
	chmod 775 ./RTKLIB/app/rtkrcv/gcc/rtkstart.sh
	chmod 775 ./RTKLIB/app/rtkrcv/gcc/rtkshut.sh

rtkrcv_single:
	sudo ./RTKLIB/app/rtkrcv/gcc/rtkrcv -s -o ./config/rtkrcv_single.conf

rtkrcv_rtk:
	sudo ./RTKLIB/app/rtkrcv/gcc/rtkrcv -o ./config/rtkrcv_rtk.conf
