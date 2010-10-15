#!/usr/bin/env python
from pymongo import *
import sys

db = Connection().remoteleecher
for file in db.remotesearch.find({'files':{'$regex':sys.argv[1]}}):
	print file['rootFolder']
