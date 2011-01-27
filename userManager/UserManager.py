#!/usr/bin/env python

from pymongo import *
import hashlib,json
from RemoteLeecher.authUtil import *

def createUser(username,password):
	db = Connection().remoteleecher
	hashedPass = hashlib.md5()
	hashedPass.update(password)

	user = {'username':username,'password':hashedPass.hexdigest()}
	db.users.insert(user)
	return 'New User Created'

def getUsers():
	if validateAuthToken(request.form['username'],request.form['autht']) :
		db = Connection().remoteleecher
		output = '{success:true,users: [ '
		
		for user in db.users.find():
			output += '{ _id :' + json.dumps(user['_id']) + \
					',username:'+ json.dumps(user['username']) +\
					',email:'+ json.dumps(user['email']) +\
				  '},'
			
		output += '] }'
		return output
	else:
		return 'Screw You'

