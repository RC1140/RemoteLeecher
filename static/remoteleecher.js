remoteleecher.buildWindow = function buildWindow() {
	var cp = new Ext.state.CookieProvider({
	   expires: new Date(new Date().getTime()+(1000*60*60*24*30)) //30 days
	});
	Ext.state.Manager.setProvider(cp);

	//This is the full URL to the application required when making ajax calls
	remoteleecher.baseLocation = '',
	//This determins the 'sub folder' that the app might be in dynamically e.g. rl/ or just /
	baseDataPath = window.location.toString().substring(("http://" + window.location.toString().split("//")[1].split("/")[0] + "/").length) + "/"
	//So it turns out this needs to be blanked out on certain servers , depending wether this works on your server or not , comment the line out
	//baseDataPath = '';
	finalSetup = function(){
		remoteleecher.baseLocation = window.location;
		Ext.Ajax.request({
			url: remoteleecher.baseLocation +'/serverFolders',
			method : 'POST',
			params : {username:cp.get('username'),autht:cp.get('authT')},
			success: function(response){
				var data=Ext.decode(response.responseText);
				

				var viewport = new Ext.Viewport({
					layout:'border',
					items:[
					     menuPanel,downloadPanel,diskPanel,queuePanel
					 ]
				});

				login.close();
				viewport.show();
				
				Ext.Ajax.request({
					url: remoteleecher.baseLocation +'/getUsersQueue',
					method : 'POST',
					params : {username:cp.get('username'),autht:cp.get('authT')},
					success: function(subresponse){
						queueData = Ext.decode(subresponse.responseText);
						uploadsStore.loadData(queueData);
					}   
				});
				
				Ext.each(data,function(drive){
					var driveNode = new Ext.tree.AsyncTreeNode({
						text: drive, 
						expandable:true,
						draggable:false, 
						id:drive
					});
					downloadsTree.getRootNode().appendChild(driveNode);
				});
				
			}   
		});
	};
	
	var downloadsTree = new Ext.tree.TreePanel({
		useArrows	: true,
		autoScroll	: true,
		enableDrag	: true,
		border		: false,
		animate		: true,
		border		: false,
		dropConfig: {appendOnly:true},
		dataUrl		: baseDataPath+'data/',
		root		: {
			text		: 'Completed Downloads',
			expanded	:true,
			draggable	:false, 
			id			: 'rootNode'
		},
		listeners	: {
			'enddrag'	: function(panel,node,event){
				var paramData = [];
				Ext.each(remoteTree.root.childNodes,function(item){
					paramData.push(item.id);
				});
				Ext.Ajax.request({
					url: remoteleecher.baseLocation +'/calcFolderSize',
					method : 'POST',
					params: { folders:Ext.encode(paramData),username:cp.get('username')},
					success: function(response){
						diskPanel.activeTab.getBottomToolbar().items.items[4].setText('Total Size for selected folders : '+response.responseText);
					}   
				});
			}
		}		
	});
	
	new Ext.tree.TreeSorter(downloadsTree, {folderSort:true});
	
	var downloadPanel = new Ext.Panel({
		title: 'Downloads',
		autoScroll: true,
		region: 'west',
		split: true,
		width: 200,
		collapsible: true,
		margins:'3 0 3 3',
		cmargins:'3 3 3 3',
		items : [downloadsTree]
	});
	
	var uploadsStore = new Ext.data.JsonStore({
		root: 'request',
		fields: [
			'name'
		],
		id	:'id'
	});
	
	var queuePanel = new Ext.Panel({
		title		: 'Downloads In Queue',
		autoScroll	: true,
		region		: 'east',
		split		: true,
		width		: 200,
		collapsible	: true,
		collapsed	: true,
		items 		: [new Ext.list.ListView({
			store: uploadsStore,
			//multiSelect: true,
			emptyText: 'No requests to display',
			reserveScrollOffset: true,
			columns: [{
				header: 'Queue Item',
				width: .5,
				dataIndex: 'name'
			}]
		})]
	});

	var mainMenu = new Ext.menu.Menu({
		id: 'mainMenu',
		items: [
		    {
			text	: 'Request Manager',
			listeners : {
				'click' : function(base,evt){
					Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/getCustomRequest',
						method : 'POST',
						params : { username : cp.get('username'),autht:cp.get('authT')},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								remoteleecher.requestManager.requestStore.loadData(data);
							}
							remoteleecher.requestManager.requestsWindow.show()	
							//requestsWindow.show();
						}   
					});
				}
			}
		    },{
			text: 'Logout',
			listeners : {
				'click' : function(base,evt){
					//Clear the user creds and reload the web page
					cp.clear('authT');
					cp.clear('username');
					window.location = window.location;
				}
			}
		    }
		]
	    });

	var adminMenu = new Ext.menu.Menu({
		id: 'mainMenu',
		items: [
		    {
			text: 'Index Manager',
			listeners : {
				'click' : function(base,evt){
					
					Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/getIndexLocations',
						method : 'POST',
						params : { username : cp.get('username'),autht:cp.get('authT')},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								indexManagerStore.loadData(data);
							}
							
							indexManagerWindow.show();
						}   
					});

				}
			}
		    }
		]
	    });

	var menuPanel = new Ext.Panel({
		autoScroll	: true,
		region		: 'north',
		height		: 33,
		items 		: [new Ext.Toolbar({
			items : [
				{
					text  	: 'File',
					iconcls	: 'bmenu',
					menu	: mainMenu
				},{
					text  	: 'Admin',
					iconcls	: 'bmenu',
					menu	: adminMenu
				} 
			]}
		)]
	});
	

	var remoteTree = new Ext.tree.TreePanel({
		useArrows	: true,
		autoScroll	: true,
		enableDrop	: true,
		border		: false,
		animate		: true,
		anchor		: '100% 95%',
		border		: false,
		dataUrl		: baseDataPath+'data/',
		dropConfig: {appendOnly:true}
	});


	var root2 = new Ext.tree.AsyncTreeNode({
		text: 'Remote Drive', 
		expanded:true, 
		draggable:false, 
		id:'ux'
	});
	remoteTree.setRootNode(root2);
	
	//var totalSize = Ext.form.TextArea();
	
	var diskPanel = new Ext.TabPanel({
		title: 'Remote',
		margins:'3 3 3 0', 
		activeTab: 0,
		defaults:{autoScroll:true},
		region: 'center',
		items : [{
			title	: 'Remote Drive',
			layout	:'anchor',
			items 	: [remoteTree],
			bbar	: [ new Ext.Button({
				text	:'Copy Files In Tree Above',
				anchor	:'bottom',
				listeners	: {
					click	: function(){
						var paramData = [];
						Ext.each(remoteTree.root.childNodes,function(item){
							paramData.push(item.id);
						});
						
						Ext.Ajax.request({
							url: remoteleecher.baseLocation +'copyFolders',
							method : 'POST',
							params: { folders:Ext.encode(paramData),username:cp.get('username'),autht:cp.get('authT')},
							success: function(response){
								Ext.Msg.alert('Note','This does not actually start the transfer a message has been sent to a admin to process the copy');
							}   
						});
					}
				}
			}),' ','-',' ',new Ext.Toolbar.TextItem({text:'Nothing To See Here'})]
		}]
	});

	var writer = new Ext.data.JsonWriter({
		encode: false   // <--- false causes data to be printed to jsonData config-property of Ext.Ajax#reqeust
	});

	var userManagerStore = new Ext.data.JsonStore({
		root: 'users',
		fields: [
			'username','access'
		],
		id : 'username'
	});
	
	var userManagerListView = new Ext.list.ListView({
		store: userManagerStore,
		//multiSelect: true,
		emptyText: 'No Users found',
		reserveScrollOffset: true,
		columns: [{
			header: 'Username',
			width: .5,
			dataIndex: 'username'
		}]
	});

	var userManagerForm = new Ext.FormPanel({
		labelWidth	: 120,
		formBind	: true,
		title		: 'Users',
		bodyStyle	: 'padding:5px 5px 0',
		defaults	: {width: 150},
		defaultType	: 'textfield',
		items		: [{
			fieldLabel	: 'Users Name',
			name		: 'username',
			allowBlank	: false
		},{
			fieldLabel	: 'Email Address',
			name		: 'emailaddress',
			allowBlank	: false
		},{
			fieldLabel	: 'Password',
			name		: 'password',
			allowBlank	: false
		}],
		bbar : [new Ext.Button({
			text		: 'Add User',
			listeners	: {
				click	: function(){					
					var location = indexManagerForm.getForm().findField('indexlocation').getValue();
					Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/saveIndexLocation',
						method : 'POST',
						params : { username : cp.get('username'),autht:cp.get('authT'),location:location},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								indexManagerStore.loadData(data);
								indexManagerForm.getForm().findField('indexlocation').setValue('');
							}else{
								Ext.Msg.alert('Warning','O No something failed');
							}
						}   
					});
				}
			}
		})]
	});
	
	/*var userManagerWindow = new Ext.Window({
		id	: 'userManagerWindow',
		title	: 'User Manager',
		closable: true,
		width	: 400,
		height	: 500,
		
		layoutConfig: {
			align : 'stretch',
			pack  : 'start',
		},
		items	: [ indexManagerForm, indexManagerListView ]
	});*/


	//Index Manager 
	var indexManagerStore = new Ext.data.JsonStore({
		root: 'indexlocations',
		fields: [
			'location'
		],
		id : 'location'
	});
	
	var indexManagerListView = new Ext.list.ListView({
		store: indexManagerStore,
		//multiSelect: true,
		emptyText: 'No locations setup',
		reserveScrollOffset: true,
		columns: [{
			header: 'Location',
			width: .5,
			dataIndex: 'location'
		}]
	});

	var indexManagerForm = new Ext.FormPanel({
		labelWidth	: 120,
		url		: remoteleecher.baseLocation+'/CustomRequest/',
		formBind	: true,
		title		: 'Request',
		bodyStyle	: 'padding:5px 5px 0',
		defaults	: {width: 150},
		defaultType	: 'textfield',
		items		: [{
			fieldLabel	: 'Index Location (Full Folder Path)',
			name		: 'indexlocation',
			ref		: '../indexlocation',
			allowBlank	: false
		}],
		bbar : [new Ext.Button({
			text		: 'Add Location',
			listeners	: {
				click	: function(){					
					var location = indexManagerForm.getForm().findField('indexlocation').getValue();
					Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/saveIndexLocation',
						method : 'POST',
						params : { username : cp.get('username'),autht:cp.get('authT'),location:location},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								indexManagerStore.loadData(data);
								indexManagerForm.getForm().findField('indexlocation').setValue('');
							}else{
								Ext.Msg.alert('Warning','O No something failed');
							}
						}   
					});
				}
			}
		})]
	});
	
	var indexManagerWindow = new Ext.Window({
		id	: 'indexManagerWindow',
		title	: 'Indexable Locations',
		closable: true,
		closeAction :'hide',
		width	: 400,
		height	: 500,
		
		layoutConfig: {
			align : 'stretch',
			pack  : 'start',
		},
		items	: [ indexManagerForm, indexManagerListView ]
	});

	
	var win = new Ext.Window({
		id	: 'myWindow',
		title	: 'Remote Leecher',
		plain	: true,
		closable: false,
		width	: 900,
		height	: 550,
		layout	: 'border',
		items	: [ downloadPanel,diskPanel,queuePanel],
		tbar	: [new Ext.Button({
				text		: 'Requests',
				listeners	: {
					click	: function(){
						//Only show the window after the request is done , might be nice to add a mask here
						Ext.Ajax.request({
							url: remoteleecher.baseLocation +'/getCustomRequest',
							method : 'POST',
							params : { username : cp.get('username'),autht:cp.get('authT')},
							success: function(response){
								var data=Ext.decode(response.responseText);
								if(data.success == true){
									requestStore.loadData(data);
								}
								
								requestsWindow.show();
							}   
						});
					}
				}
		})]
	});

	var performLogin = function(){
		remoteleecher.baseLocation = window.location;
		var username = simpleLogin.getForm().findField('username').getValue(),
			password = hex_md5(simpleLogin.getForm().findField('pass').getValue());
			
		Ext.Ajax.request({
			url: remoteleecher.baseLocation +'/auth',
			method : 'POST',
			params : { username : username, password : password},
			success: function(response){
				var data=Ext.decode(response.responseText);
				if(data.success == true){
					cp.set('authT',data.autht);
					cp.set('username',username);
					finalSetup();
				}else{
					Ext.Msg.alert('Warning','Invalid Username or Password');
				}
				
			}   
		});
	};
	
	var simpleLogin = new Ext.FormPanel({
		labelWidth	: 75,
		url		: remoteleecher.baseLocation+'/login/',
		formBind	: true,
		title		: 'Login',
		bodyStyle	: 'padding:5px 5px 0',
		width		: 350,
		defaults	: {width: 230},
		defaultType	: 'textfield',
		items		: [{
			fieldLabel	: 'User Name',
			name		: 'username',
			allowBlank	: false
		},{
			fieldLabel	: 'Password',
			inputType	: 'password',
			name		: 'pass',
			listeners	: {
				specialkey: function(field, e){
				    if (e.getKey() == e.ENTER) {
					performLogin();					
				    }
				}
		        }
		}],
		buttons: [{
			text		: 'Login',
			listeners	: {
				click	: performLogin
			}
		}]
	});

	
	var login = new Ext.Window({
		id		: 'myWindow',
		closable	: false,
		title		: 'Remote Leecher',
		plain		: true,
		items		: simpleLogin
	});

	if(cp.get('authT') && !Ext.isEmpty(cp.get('autT'))){
		finalSetup();
	}else{
		login.show();
	}	
}
