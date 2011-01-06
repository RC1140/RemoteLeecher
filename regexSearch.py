#!/usr/bin/env python
from pymongo import *
import sys

db = Connection().remoteleecher
print 'The Following items were found :'
for file in db.remotesearch.find({'files':{'$regex':sys.argv[1]}}):
	for item in file['files']:
		if item.find(sys.argv[1]) != -1:
			print file['rootFolder'] + item
