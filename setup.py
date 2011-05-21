#!/usr/bin/python
import os
import sys
import hashlib
from pymongo import *

#Also make sure that mongodb is install , havent found a way to make this platform agnostic
os.system('apt-get install mongodb')

#Collect the various user details for storage in the settings collection
print "Please enter a user name (This will be used to login to Remote Leecher)"
username = raw_input("Username : ")
print "Please enter a password"
password = raw_input("Password : ")
print "Please enter a email address"
emailAddress = raw_input("Email Address : ")
print "Please enter a inital folder to share"
folderPath = raw_input("Directory path e.g. (/downloads/): ")

#Create the first system user
db = Connection().remoteleecher
db.settings.insert({'indexLocations':[folderPath]})

m = hashlib.md5()
m.update(password)

user = {'username':username,'password':m.hexdigest(),'email':emailAddress}
db.users.insert(user)

#for setting in db.settings.find():
#	setting['indexLocations'].append('/media/DownloadWing')
fileWriter = open('remoteLeecher.wsgi','w')
fileWriter.write("\
import RemoteLeecher.remoteLeecherServer\n\
application = RemoteLeecher.remoteLeecherServer.app")
fileWriter.close()
print "A WSGI file has been created in the local directory , copy this to your web folder and use it to setup remoteleecher with apache"

echo "Paste the following into your apache file , assuming your web folder matches /var/www/rl/"

echo "WSGIScriptAlias /remoteLeecher /var/www/rl/remoteLeecher.wsgi
<Directory /var/www/rl>
WSGIApplicationGroup %{GLOBAL}
Allow from all
</Directory>"


