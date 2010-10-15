#!/usr/bin/env python
import os
import sys
from pymongo import *

if len(sys.argv) > 1:
	db = Connection().remoteleecher
	#'/downloads/complete/'
	for data in os.walk(sys.argv[1]):
		print 'Loading : ' + data[0]
		doc = {'rootFolder':data[0],'files':data[2]}
		db.remotesearch.insert(doc)

	print 'Load Complete , please do not load this folder \
		 again as you will get duplicate data'
else:
	print 'Please provide a dir to load'
