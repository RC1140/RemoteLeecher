#!/usr/bin/env python

import json 
import sys
import distutils 
from pymongo import *
from distutils import dir_util

"""Get the last request that has been sent through the system , need to add 
some expansion here so non latest copies can be performed
"""
connection = Connection()
db = connection.remoteleecher
lastRequest = ''
for request in db.copyrequests.find():
	lastRequest = request['userRequest']

#Convert to a object form json
filesToCopy = json.loads(lastRequest)
copyDestination = sys.argv[1]
#print copyDestination
finalLocations = []
rootLocations = (db.settings.find({})[0]['indexLocations'])
	
"""Loop through each of the folders the users requested for copy and remove 
the root folder location so that they can be coppied to the same folder on 
the dst drive
"""
for file in filesToCopy:
	for rootLocation in rootLocations:
		if file.find(rootLocation) >= 0:
			destinationLocation = file[file.find(rootLocation)+len(rootLocation):]
			finalLocation = copyDestination + destinationLocation
			finalLocations.append(finalLocation.replace('//','/'))

"""Finally do a tree copy for each of the folders selected , if the user 
selected a file , sorry for them
"""
count = 0
for sourceFile in filesToCopy:
	src = sourceFile.replace('//','/')
	dst = finalLocations[count]
	print 'SRC ' + src  
	print 'DST ' + dst
	#try:
	distutils.dir_util.copy_tree(src,dst)
	#except Exception:
	#	print 'Could Not Copy'
	print 'Copy Complete'
	count += 1
