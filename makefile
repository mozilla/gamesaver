MONGODIR=~/mongodb/bin

all:
	./runserver.sh
stop:
	killall mongod node
db:	
	$(MONGODIR)/mongod
host:
	node server/main.js
testHost:
	node server/main.js test jasilver1@learn.senecac.on.ca
tests:
	vows
