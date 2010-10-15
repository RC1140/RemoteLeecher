#!/usr/bin/env python

from pymongo import *
import hashlib
import sys

#Ensure that enough params have been supplied
if len(sys.argv) >= 3:
	#Setup db and add to the db
	db = Connection().remoteleecher
	m = hashlib.md5()
	m.update(sys.argv[2])

	user = {'username':sys.argv[1],'password':m.hexdigest()}
	db.users.insert(user)
	print 'New User Created'
else:
	print 'Not enough params supplied , Format : Username password'

