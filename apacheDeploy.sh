#!/bin/bash
echo "This script requires admin access to continue"
#This copies the current folder to the python lib folder so that it can be imported niceley :)
if [ -d '/usr/lib/python2.6/RemoteLeecher/' ];
then cp -r ./ /usr/lib/python2.6/RemoteLeecher/
else mkdir /usr/lib/python2.6/RemoteLeecher/ && cp -r ./ /usr/lib/python2.6/RemoteLeecher/
fi

/etc/init.d/apache2 reload
