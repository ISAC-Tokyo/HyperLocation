
setup:
	git submodule init
	git submodule update

rtklib: setup
	cd RTKLIB/app; sh makeall.sh
