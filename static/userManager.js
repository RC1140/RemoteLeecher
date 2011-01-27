remoteleecher.userManager = function () {
	var userStore = new Ext.data.JsonStore({
		root: 'users',
		fields: [
			'_id','username', 'email'
		],
		id : '_id'
	}),
	
	// User Manager
	userListView = new Ext.list.ListView({
		store: userStore,
		//multiSelect: true,
		emptyText: 'No users to display',
		reserveScrollOffset: true,
		columns: [{
			header: 'Username ',
			dataIndex: 'username'
		},{
			header: 'Email',
			dataIndex: 'email'
		}]
	}),
	
	userForm = new Ext.FormPanel({
		labelWidth	: 120,
		formBind	: true,
		title		: 'User',
		bodyStyle	: 'padding:5px 5px 0',
		defaults	: {width: 150},
		defaultType	: 'textfield',
		items		: [{
			fieldLabel	: 'Username',
			name		: 'username',
			allowBlank	: false
		},{
			fieldLabel	: 'Email',
			name		: 'email',
			allowBlank	: false
		}],
		bbar : [new Ext.Button({
			text		: 'Create User',
			listeners	: {
				click	: function(){					
					var userName = requestsForm.getForm().findField('username').getValue(),
					userEmailAddress = requestsForm.getForm().findField('email').getValue();
					Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/createUser',
						method : 'POST',
						params : { 	
								username 	: cp.get('username'),
								autht		: cp.get('authT'),
								userName	: userName,
								emailAddress	: emailAddress
						},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								requestStore.loadData(data);
								Ext.Msg.alert('Warning','Yay data saved');
							}else{
								Ext.Msg.alert('Warning','O No something failed');
							}
							
						}   
					});
				}
			}
		})]
	}), 

	userWindow = new Ext.Window({
		id		: 'userWindow',
		title		: 'Users',
		closeAction 	: 'hide',
		closable	: true,
		width		: 400,
		height		: 500,
		layoutConfig: {
			align : 'stretch',
			pack  : 'start',
		},
		items		: [ userForm, userListView ],
		listeners 	: {
			beforeshow : function(comp){
				Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/getUsers',
						method : 'POST',
						params : { username : cp.get('username'),autht:cp.get('authT')},
						success: function(response){
							var data=Ext.decode(response.responseText);
							if(data.success == true){
								userStore.loadData(data);
							}
						}   
					});
			}	
		}
	});

	return {
		userWindow	: userWindow,
		userStore	: userStore
	}
}();
