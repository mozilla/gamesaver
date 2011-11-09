MONGODIR=~/mongodb/bin

all:
	./runserver
tests:
	./runtests
stop:
	killall mongod node
db:	
	$(MONGODIR)/mongod
host:
	node server/main.js
testHost:
	TEST=true node server/main.js