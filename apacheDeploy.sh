#!/bin/bash
echo "This script requires admin access to continue"
#This copies the current folder to the python lib folder so that it can be imported niceley :)
cp -r RemoteLeecher/ /usr/lib/python2.6/
/etc/init.d/apache2 reload
