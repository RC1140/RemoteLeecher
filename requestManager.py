from pymongo import *
from authUtil import validateAuthToken

def customRequestManager():
	if validateAuthToken(request.form['username'],request.form['autht']) :
		db = Connection().remoteleecher
		requestName = request.form['requestName'].__str__()
		doc = {'userRequest':requestName,'username':request.form['username'],'requestDate':datetime.datetime.today().__str__()}
		db.customrequests.insert(doc)

		return getCustomRequests()
	else:
		return '{success:false,msg:"screw you"}'
	

def getCustomRequests():
	if validateAuthToken(request.form['username'],request.form['autht']) :
		db = Connection().remoteleecher
		output = '{success:true,customrequests: [ '
		
		for userRequest in db.customrequests.find({'username':request.form['username']}):
			output += '{ requestName : \'' + userRequest['userRequest'] + '\'},'
			
		output += '] }'
		return output
	else:
		return 'Screw You'
	
