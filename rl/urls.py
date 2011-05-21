from django.conf.urls.defaults import *
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'remoteleecher.views.browse',name='homePage'),
    url(r'^data/$', 'remoteleecher.views.extData',name='dataLoader'),
    url(r'^serverFolders/$', 'remoteleecher.views.serverFolders',name='serverFolders'),
    url(r'^driveStatus/$', 'remoteleecher.views.driveStatus',name='driveStatus'),
    url(r'^copyFolders/$', 'remoteleecher.views.copyFolders',name='copyFolders'),
    url(r'^calcFolderSize/$', 'remoteleecher.views.calcFolderSize',name='calcFolderSize'),
    url(r'^getUsersQueue/$', 'remoteleecher.views.getUsersQueue',name='getUsersQueue'),
    url(r'^submitCustomRequest/$', 'remoteleecher.views.customRequestManager',name='customRequestManager'),
    url(r'^getCustomRequest/$', 'remoteleecher.views.getCustomRequest',name='getCustomRequest'),
    url(r'^getIndexLocations/$', 'remoteleecher.views.getIndexLocations',name='getIndexLocations'),
    url(r'^saveIndexLocation/$', 'remoteleecher.views.saveIndexLocation',name='saveIndexLocation'),

    (r'^admin/', include(admin.site.urls)),
)
