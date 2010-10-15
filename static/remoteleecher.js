function buildWindow() {
	var loggedInUserName = '',
	baseLocation = '',
	authToken = '',
	finalSetup = function(){
		baseLocation = window.location;
		Ext.Ajax.request({
			url: baseLocation +'/serverFolders',
			method : 'POST',
			params : {username:loggedInUserName,autht:authToken},
			success: function(response){
				var data=Ext.decode(response.responseText);
				
				login.close();
				win.show();
				
				Ext.Ajax.request({
					url: baseLocation +'/getUsersQueue',
					method : 'POST',
					params : {username:loggedInUserName,autht:authToken},
					success: function(subresponse){
						queueData = Ext.decode(subresponse.responseText);
						uploadsStore.load(queueData,'request');
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
		dataUrl		: 'rl/data/',
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
					url: baseLocation +'/calcFolderSize',
					method : 'POST',
					params: { folders:Ext.encode(paramData),username:loggedInUserName},
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
		]
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
	
	var remoteTree = new Ext.tree.TreePanel({
		useArrows	: true,
		autoScroll	: true,
		enableDrop	: true,
		border		: false,
		animate		: true,
		anchor		: '100% 95%',
		border		: false,
		dataUrl		: 'rl/data/',
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
							url: baseLocation +'copyFolders',
							method : 'POST',
							params: { folders:Ext.encode(paramData),username:loggedInUserName,autht:authToken},
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

	var requestStore = new Ext.data.JsonStore({
		root: 'request',
		writer:writer,
		fields: [
			'name', 'datefilled','filled'
		]
	});
	
	var requestsListView = new Ext.list.ListView({
		store: requestStore,
		//multiSelect: true,
		emptyText: 'No requests to display',
		reserveScrollOffset: true,
		columns: [{
			header: 'Name',
			width: .5,
			dataIndex: 'name'
		},{
			header: 'Date Filled',
			dataIndex: 'datefilled'
		},{
			header: 'Filled',
			dataIndex: 'filled'
		}]
	});

	var requestsForm = new Ext.FormPanel({
		labelWidth	: 120,
		url			: baseLocation+'/newRequest/',
		formBind	: true,
		title		: 'Request',
		bodyStyle	: 'padding:5px 5px 0',
		defaults	: {width: 150},
		defaultType	: 'textfield',
		items		: [{
			fieldLabel	: 'Name Of Request',
			name		: 'requestname',
			allowBlank	: false
		}],
		bbar : [new Ext.Button({
			text		: 'Submit Request',
			listeners	: {
				click	: function(){					
					var defaultData = {
						fullname: 'name',
						first: 'filled'
					};
					var recId = 100; // provide unique id for the record
					var r = new requestStore.recordType(defaultData, ++recId); // create new record
					requestStore.insert(0, r);
					requestStore.save();
					requestStore.load();
				}
			}
		})]
	});
	
	var requestsWindow = new Ext.Window({
		id		: 'requestsWindow',
		title	: 'Requests',
		closable: true,
		width	: 400,
		height	: 500,
		
		layoutConfig: {
			align : 'stretch',
			pack  : 'start',
		},
		items	: [ requestsForm, requestsListView ]
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
						
						requestsWindow.show();
					}
				}
		})]
	});
	
	var simpleLogin = new Ext.FormPanel({
		labelWidth	: 75,
		url			: baseLocation+'/login/',
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
			name		: 'pass'
		}],
		buttons: [{
			text		: 'Login',
			listeners	: {
				click	: function(){
					baseLocation = window.location;
					var username = simpleLogin.getForm().findField('username').getValue(),
						password = hex_md5(simpleLogin.getForm().findField('pass').getValue());
						
					Ext.Ajax.request({
						url: baseLocation +'/auth',
						method : 'POST',
						params : { username : username, password : password},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								loggedInUserName = username;
								authToken = data.autht;
								finalSetup();
							}else{
								Ext.Msg.alert('Warning','Invalid Username or Password');
							}
							
						}   
					});
				}
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
	
	login.show();
}
