#!/bin/bash
if [ -d 'static' ]; then 
	wget http://downloads.sencha.com/extjs/ext-3.3.0.zip
	unzip ext-3.3.0.zip
	cd ext-3.3.0
	mv ext-all.js ../static
	mv ext-all-debug.js ../static
	mv adapter ../static
	mv resources ../static
	rm -r ext-3.3.0
	rm ext-3.3.0.zip
else
	echo "A static folder is required , please create the directory before running this or ensure you are in the remote leecher folder"
fi

