MONGODIR=~/mongodb/bin

db:	
	$(MONGODIR)/mongod
host:
	node server/main.js
