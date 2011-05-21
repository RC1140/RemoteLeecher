from pymongo import *

def validateAuthToken(username,token):
	db = Connection().remoteleecher
	if db.users.find_one({'username':username,'autht':token}) != None:
		return True
	else:
		return False


