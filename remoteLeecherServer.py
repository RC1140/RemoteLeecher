#!/usr/bin/python

from flask import Flask,request,session,url_for,render_template
import os,json,sys
import smtplib
import hashlib
import random
from pymongo import *

app = Flask(__name__)
app.debug = True
app.secret_key = 'kjashdfkjhsafd'

def validateAuthToken(username,token):
	db = Connection().remoteleecher
	if db.users.find_one({'username':username,'autht':token}) != None:
		return True
	else:
		return False

@app.route('/auth',methods=['POST'])
def authUser():
	m = hashlib.md5()
	m.update(random.random().__str__())	
	
	username = request.form['username']
	password = request.form['password']
	
	db = Connection().remoteleecher
	for user in db.users.find():
		if user['username'] == username:
			if user['password'] == password:
				existingUser = db.users.find_one({'username':username})
				autht = m.hexdigest()
				if existingUser != None:
					existingUser['autht'] = autht
					db.users.save(existingUser)
					
				return '{success:true,autht:\''+ autht + '\'}'
			else:
				return '{success:false}'
				
	return '{success:false}'
	

def calculateFolderSize(folder):
	folder_size = 0
	for (path, dirs, files) in os.walk(folder):
		for file in files:
			filename = os.path.join(path, file)
			folder_size += os.path.getsize(filename)

	return (folder_size/(1024*1024.0))

def outputJson(folderLocation):
        returnData = '{ \"userFiles\" : ['

        for data in os.walk(folderLocation):
                returnData += json.dumps(data)+','

        returnData = returnData[:-1]
        returnData += ']}'

        return returnData

@app.route('/')
def browse():
	jsCore = ( url_for('static',filename='ext-3.2.1/adapter/ext/ext-base.js'),\
		url_for('static',filename='ext-3.2.1/ext-all.js') , \
		url_for('static',filename='md5.js') , \
		url_for('static',filename='remoteleecher.js') )
	cssCore = ( url_for('static',filename='ext-3.2.1/resources/css/ext-all.css'))

	return render_template('browse.html',jsCore=jsCore,cssCore=cssCore)

@app.route('/data/',methods=['POST','GET'])
def extData():
	if request.form['node'] == 'rootNode':
		return ''	

        returnData = '['
	baseFolder = request.form['node']
	for item in os.listdir(baseFolder):
		leaf = os.path.isdir(baseFolder + '/' + item)
		leaf =(not leaf)
		returnData +='{ id:\''+ baseFolder + '/' + item\
			+'\',text:\''+item
		if leaf:
			returnData += '\',leaf:\''+leaf.__str__()
		returnData += '\'},'
        returnData += ']'
        return returnData

@app.route('/serverFolders',methods=['POST'])
def serverFolders():
		if validateAuthToken(request.form['username'],request.form['autht']) :
			return '[\'/downloads/complete/\',\'/media/TheLibrary/\',\'/media/DownloadWing/\']'
		else:
			return 'Screw You'

@app.route('/driveStatus')
def driveStatus():
        return '{"status" : "' + os.path.ismount('/media/Leecher/').__str__()+'" }'

@app.route('/copyFolders',methods=['POST'])
def copyFolders():
	if validateAuthToken(request.form['username'],request.form['autht']) :	
		if request.method == 'POST':
			doc = {'userRequest':request.form['folders'],'username':request.form['username']}
			connection = Connection()
			db = connection.remoteleecher
			copyRequests = db.copyrequests
			copyRequests.insert(doc)
			smtpsend = smtplib.SMTP('localhost')
			smtpsend.sendmail('<enter your maill address here>','<enter your maill address here>','New Copy request logged')
			return '{success:true,message:\'Uploaded Completed Successfully\'}'
	else: 
		return 'Screw You'
		
	return 'Some Test Data'

@app.route('/login',methods=['POST'])
def login():
        if request.method == 'POST':
		 loginName = request.form['username']
		 userNameChecker = open('users','r')	
		 username = userNameChecker.readline()
		 if username.startswith(loginName):
			return 'true'
		 else:
			username = userNameChecker.readline()
			while username != '':
				if username.startswith(loginName):
					return 'true'
				else:
					username = userNameChecker.readline()
		 	
			return 'false'

@app.route('/calcFolderSize',methods=['POST'])
def calcFolderSize():
        if request.method == 'POST':
			myFolder = request.form['folders'].__str__()
			calcFolder = json.loads(myFolder)
			totalSize = 0
			for dir in calcFolder:
				totalSize += calculateFolderSize(dir)
			
	return "%0.1f MB" % totalSize

@app.route('/getUsersQueue',methods=['POST'])
def getUsersQueue():
	if validateAuthToken(request.form['username'],request.form['autht']) :
		db = Connection().remoteleecher
		output = '{request: [ '
		
		for userRequest in db.copyrequests.find({'username':request.form['username']}):
			output += '{ name : \'' + userRequest['username'] + '\'},'
			
		output += '] }'
		return output
	else:
		return 'Screw You'
	
if __name__ == '__main__':
        app.run(host='0.0.0.0')
