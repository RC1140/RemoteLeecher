import os,json,sys
import smtplib
import hashlib
import random
import datetime
from pymongo import *

from django.utils.html import escape
from django.core.paginator import Paginator, InvalidPage, EmptyPage
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse
from django.shortcuts import render_to_response,redirect
from django.template import RequestContext,Template,Context 
from django.forms.models import modelformset_factory
from django.forms.formsets import formset_factory
from django.core import serializers
from django.core.urlresolvers import reverse
from django.db.models import Q,Count,Min,Max
from django.core.mail import send_mail

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

def browse(request):
    jsCore = ( url_for('static',filename='adapter/ext/ext-base.js'),\
            url_for('static',filename='ext-all.js') , \
            url_for('static',filename='md5.js') )
    jsUser = ( url_for('static',filename='app/requestManager.js') , \
            url_for('static',filename='app/remoteleecher.js') )
    cssCore = ( url_for('static',filename='resources/css/ext-all.css'))

    return render_to_response('browse.html',{'jsCore'=jsCore,'cssCore'=cssCore,'jsUser'=jsUser})

def extData(request):
    if request.form['node'] == 'rootNode':
        return ''	

    returnData = '['
    baseFolder = request.form['node']
    for render_templateitem in os.listdir(baseFolder):
        leaf = os.path.isdir(baseFolder + '/' + item)
        leaf =(not leaf)
        returnData +='{ id:\''+ baseFolder + '/' + item\
                +'\',text:\''+item
        if leaf:
            returnData += '\',leaf:\''+leaf.__str__()
        returnData += '\'},'

    returnData += ']'
    return returnData

def serverFolders(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :
        db = Connection().remoteleecher
        return json.dumps(db.settings.find({})[0]['indexLocations'])
    else:
        return 'Screw You'

def driveStatus(request):
    return '{"status" : "' + os.path.ismount('/media/Leecher/').__str__()+'" }'

def copyFolders(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :	
        if request.method == 'POST':
            doc = {'userRequest':request.form['folders'],'username':request.form['username'],'requestDate':datetime.datetime.today().__str__()}
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

def calcFolderSize(request):
    if request.method == 'POST':
        myFolder = request.form['folders'].__str__()
        calcFolder = json.loads(myFolder)
        totalSize = 0
        for dir in calcFolder:
            totalSize += calculateFolderSize(dir)

        return "%0.1f MB" % totalSize

def getUsersQueue(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :
        db = Connection().remoteleecher
        output = '{request: [ '

        for userRequest in db.copyrequests.find({'username':request.form['username']}):
            output += '{ name : \'' + userRequest['username'] + '\'},'

        output += '] }'
        return output
    else:
        return 'Screw You'

def customRequestManager(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :
        db = Connection().remoteleecher
        requestName = request.form['requestName'].__str__()
        doc = {'userRequest':requestName,'username':request.form['username'],'requestDate':datetime.datetime.today().__str__()}
        db.customrequests.insert(doc)

        return getCustomRequests()
    else:
        return '{success:false,msg:"screw you"}'


def getCustomRequests(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :
        db = Connection().remoteleecher
        output = '{success:true,customrequests: [ '

        for userRequest in db.customrequests.find({'username':request.form['username']}):
            output += '{ requestName : \'' + userRequest['userRequest'] + '\'},'

        output += '] }'
        return output
    else:
        return 'Screw You'

def getIndexLocations(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :
        db = Connection().remoteleecher
        output = '{success:true,indexlocations : [ '

        for location in db.settings.find({})[0]['indexLocations']:
            output += '{ location : \'' + location + '\'},'

        output += '] }'
        return output
    else:
        return 'Screw You'

def saveIndexLocation(request):
    if validateAuthToken(request.form['username'],request.form['autht']) :
        db = Connection().remoteleecher

        settings = db.settings.find({})[0]	
        settings['indexLocations'].append(request.form['location'])
        db.settings.save(settings)
        return getIndexLocations() 
    else:
        return 'Screw You'

