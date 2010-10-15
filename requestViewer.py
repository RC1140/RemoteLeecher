#!/usr/bin/env python
from pymongo import *

connection = Connection()
db = connection.remoteleecher
writer = open('copyrequest.txt','a')
lastRequest = ''
for request in db.copyrequests.find():
	lastRequest = request['userRequest']
	print request['username'] + ' : ' + request['userRequest']

writer.write(lastRequest)
writer.flush()
writer.close()
