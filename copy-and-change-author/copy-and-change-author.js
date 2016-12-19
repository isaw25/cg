define( [ "qlik",
  "text!./copy.html",
  "qvangular"
],
function ( qlik,html,qvangular) {

	return {
		support : {
			snapshot: true,
			export: true,
			exportData : false
		},
		definition:{
			type: "items",
			component: "accordion",
			items: {}
		},
		controller:function($scope){
		  session = $scope.backendApi.model.session;
		  handle = session.currentApp.handle;
		  appId = session.currentApp.id;
		  
		  $scope.users =[{id:"na/rnagara7"},{id:"user2"}];//example
		  //load users from qrs
		  
		  $scope.apps=[];
		  
		 $scope.loadApps=function(){
		 if($scope.apps.length>0){return;}
		 
		   session.rpc({handle: -1, method: "GetDocList", params: {}}).
			  then(function(response){
			  console.log("loading apps...");
			  	var doclist=response.result.qDocList;
				var Apps=doclist.map(function(doc){
				var app={};
					app["name"]=doc.qDocName;
					app["id"]=doc.qDocId;
					return app;
				});
			 $scope.apps=Apps;
			 
			  });
		 
		 }
		
		},
		paint: function ($element,layout) {
		
		 	this.$scope.loadApps();
			var $compile = qvangular.getService("$compile");
            var comp = $compile(html)(this.$scope);
            $element.html(comp);
		}
	};

} );

