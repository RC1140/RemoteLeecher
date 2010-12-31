remoteleecher.requestManager = function () {
	var requestStore = new Ext.data.JsonStore({
		root: 'customrequests',
		fields: [
			'requestName', 'datefilled','filled'
		],
		id : 'requestName'
	}),
	
	// Request Manager
	requestsListView = new Ext.list.ListView({
		store: requestStore,
		//multiSelect: true,
		emptyText: 'No requests to display',
		reserveScrollOffset: true,
		columns: [{
			header: 'Name',
			width: .5,
			dataIndex: 'requestName'
		},{
			header: 'Date Filled',
			dataIndex: 'datefilled'
		},{
			header: 'Filled',
			dataIndex: 'filled'
		}]
	}),
	
	requestsForm = new Ext.FormPanel({
		labelWidth	: 120,
		url		: remoteleecher.baseLocation+'/CustomRequest/',
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
					var requestName = requestsForm.getForm().findField('requestname').getValue();
					Ext.Ajax.request({
						url: remoteleecher.baseLocation +'/submitCustomRequest',
						method : 'POST',
						params : { username : cp.get('username'),autht:cp.get('authT'),requestName:requestName},
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

	requestsWindow = new Ext.Window({
		id	: 'requestsWindow',
		title	: 'Requests',
		closeAction :'hide',
		closable: true,
		width	: 400,
		height	: 500,
		
		layoutConfig: {
			align : 'stretch',
			pack  : 'start',
		},
		items	: [ requestsForm, requestsListView ]
	});

	return {
		requestsWindow	: requestsWindow,
		requestStore	: requestStore
	}
}();
