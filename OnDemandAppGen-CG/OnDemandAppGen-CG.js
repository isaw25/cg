define( [
	"text!./appGen.html",
	"qvangular",
	"jquery",
	"client.models/rpc-session"
],
function ( appGenHtml, qvangular, $, RPCSession ) {

	return {
		initialProperties: {
			version: 1.0,
			qHyperCubeDef: {
				qDimensions: [],
				qMeasures: [],
				qInitialDataFetch: [{
					qWidth: 1,
					qHeight: 1
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				measures: {
					uses: "measures",
					min: 0,
					max: 1
				},
				appearance: {
						uses: "settings",
					},
				advanced:{
					label: "Advanced",
					type: "items",
					items:{
						autoOpen: {
							ref: "advanced.autoOpen",
              translation: "Auto Open App",
              type: "boolean",
							defaultValue: true
						},
						resetFilters: {
							ref: "advanced.resetFilters",
              translation: "Reset Filters",
              type: "boolean",
							defaultValue: false
						},
                      childName: {
							ref: "advanced.childName",
              translation: "Child Name",
              type: "string"
						},
                      delSheet: {
							ref: "advanced.delSheet",
              translation: "Custom Message 1",
              type: "string"
						},
                      cMessage: {
							ref: "advanced.cMessage",
              translation: "Custom Message 2",
              type: "string"
						}
					}
				}
			}
		},
		controller: function($scope){
			var session;
			var newAppSession;
			var handle;
			var newAppHandle;
			var newAppId;
            var uName;
            var PrevId;
            var delSheetId;
			var openSheetId;
            var sheetContent;
            var delSheetName;
            var lmk;
			var appName = "";
			$scope.expressionSet = false;
			$scope.limitSet = false;
			$scope.rowCount = null;
			$scope.view = "nocondition";
			$scope.progress = "";
			$scope.percent = "0%";
			$scope.lastError;
			$scope.errorCount;
			$scope.limit = 0;
			$scope.delimeter;
			$scope.inParentheses;
			$scope.quoteCharacter;
			$scope.whereOperator;
            $scope.delSheet;
			$scope.cMessage;
			$scope.newAppUrl;
			$scope.autoOpen;
			$scope.resetFilters;
      $scope.$parent.component.measureDefinition.items.limit = {
        type: "number",
        label: "Row Limit",
        ref: "qDef.limit",
        show: true
      };
			if(!session){
				session = $scope.backendApi.model.session;
				handle = session.currentApp.handle;
			}
			$scope.createApp = function(){
				$scope.view = "processing";
				$scope.errorCount = 0;
				session = $scope.backendApi.model.session;
				handle = session.currentApp.handle;
				var appId = session.currentApp.id;
				console.log('1');
				//get the app name
				//$scope.logProgress("Copying App");
                $scope.logProgress("Validating the Request"," (step 1 / 10)");
                session.rpc({handle: -1, method: "GetAuthenticatedUser", params:[]}).then(function(response){
									var tName = response.result.qReturn;
									uName = tName.substr(tName.lastIndexOf("=")+1,tName.length);
									});
                console.log('2');
				session.rpc({handle: handle, method: "GetAppLayout", params:[]}).then(function(response){
				if($scope.childName)
					{appName = $scope.childName;}
				else
				    {appName = response.result.qLayout.qTitle;}
					
                   console.log('3');
					//create the new App
                session.rpc({handle: -1, method: "GetDocList", params:[]}).then(function(response1){
					var i=0; 
                  do{
                   
                    if(response1.result.qDocList[i].qDocName == appName+"_"+uName)
                    { 
                      PrevId=response1.result.qDocList[i].qDocId;  
                      break;}
                  }while(response1.result.qDocList[++i]);			
                 
                   if(!(PrevId))
				   {
                    //childName
					console.log('4');
					session.rpc({handle: -1, method: "CreateApp", params: [appName+"_"+uName]}).then(function(response){
						if(response.result.qSuccess==true){
                          
                          newAppId = response.result.qAppId; 
                         console.log('5');
                          session.rpc({handle: -1, method: "CopyApp", params: [newAppId, appId,[]]}).then(function(response){
								//open the new app
								//setup a 2nd socket for working with the new app
								newAppSession = RPCSession.get(newAppId, {
									host: window.location.host,
									isSecure: window.location.protocol == "https:"
								});
                              
      
                              console.log('6');
								newAppSession.open(true);  
                              var d1 = new Date();
                             $scope.logProgress("Creating new app might take a while.."," (step 2 / 10)");
							 
                              setTimeout(function() {
                              $scope.testAppExists(newAppId,0,function(vFound){
							  console.log('7');
                           $scope.logProgress("App Created"," (step 3 / 10)");
                            if(vFound > 0)
                            {
                                var d = new Date();
          					newAppSession.rpc({handle: -1, method: "OpenDoc", params:[newAppId]}).then(function(response){
									newAppHandle = response.result.qReturn.qHandle;
									session.rpc({
										handle: handle,
										method: "CreateSessionObject",
										params: [{
											"qAppObjectListDef": {
												"qType": "sheet",
												"qData": {
													"title": "/qMetaDef/title",
													"description": "/qMetaDef/description",
													"thumbnail": "/thumbnail",
													"cells": "/cells",
													"rank": "/rank",
													"columns": "/columns",
													"rows": "/rows"
												}
											},
											"qInfo": {
												"qId": "SheetList",
												"qType": "SheetList"
											}
										}]
									}).then(function(response) {
									     console.log('8');
										session.rpc({
											handle: response.result.qReturn.qHandle,
											method: "GetLayout",
											params: []
										}).then(function(response) {
										    console.log('9');
											sheetContent = response.result.qLayout.qAppObjectList.qItems;
                                          $scope.logProgress("Copying App Objects"," (step 4 / 10)");                                   
											
											console.log('11');
												$scope.updateScript(function(){
	                                             console.log('BeforeReload');
                                                  $scope.reload();
												});
											/*$scope.copySheets(sheetContent, function(){
											   console.log('10');
												//all copying functions finished so now we copy and update the script
												$scope.logProgress("Reseting Filters"," (step 7 / 10)");
												if($scope.resetFilters)
												{
												 $scope.dummyReload(function(){ 
												  $scope.updateScript(function(){
	
                                                  $scope.reload();
												});	
												});
												}
											   else
										       {
											     console.log('11');
												$scope.updateScript(function(){
	                                             console.log('BeforeReload');
                                                  $scope.reload();
												});
											   }
											});*/
										});
									});
								});
                            }
                            else
                            {$scope.logProgress("App Not Found. Refresh page and try again");} 
							});
                             
                            },30000);
							
                          });
                          }
				}); 
				}
				else
			    {
					newAppSession = RPCSession.get(PrevId, {
									host: window.location.host,
									isSecure: window.location.protocol == "https:"
								});
                    newAppSession.open(true); 
					$scope.logProgress("App Created"," (step 3 / 10)");
					newAppSession.rpc({handle: -1, method: "OpenDoc", params:[PrevId]}).then(function(response){
									newAppHandle = response.result.qReturn.qHandle;
					newAppId = PrevId;
					
					session.rpc({
										handle: handle,
										method: "CreateSessionObject",
										params: [{
											"qAppObjectListDef": {
												"qType": "sheet",
												"qData": {
													"title": "/qMetaDef/title",
													"description": "/qMetaDef/description",
													"thumbnail": "/thumbnail",
													"cells": "/cells",
													"rank": "/rank",
													"columns": "/columns",
													"rows": "/rows"
												}
											},
											"qInfo": {
												"qId": "SheetList",
												"qType": "SheetList"
											}
										}]
									}).then(function(response) {
										session.rpc({
											handle: response.result.qReturn.qHandle,
											method: "GetLayout",
											params: []
										}).then(function(response) {
											sheetContent = response.result.qLayout.qAppObjectList.qItems;
					
										
					
					
					$scope.logProgress("Reseting Filters"," (step 7 / 10)");
					if($scope.resetFilters)
												{
												 $scope.dummyReload(function(){ 
												  $scope.updateScript(function(){
	
                                                  $scope.reload();
												});	
												});
												}
											   else
										       {
												$scope.updateScript(function(){
												 console.log('BeforeReload');
	
                                                  $scope.reload();
												});
											   }
				       });
						  });
					});
				}
				
				
                }); });
			};
			$scope.copySheets = function(sheets, callbackFn){
				var iter = 0;
				console.log(sheets.length);
				for (var i = 0; i < sheets.length; i++) {
                  
                  $scope.logProgress("Copying Sheets"," (step 5 / 10)");
				  callbackFn.call(null);
				/*	$scope.copySheet(sheets[i], function(){
						iter++;
						if(iter==sheets.length){
							callbackFn.call(null);
                        }
					});*/
                      }
			}
			$scope.copySheet = function(sheet, callbackFn){
			   	console.log("Inside CopySheet");
				newAppSession.rpc({handle: newAppHandle, method: "CreateObject", params: [{qInfo:sheet.qInfo}]}).then(function(newSheet){
					var newSheetHandle = newSheet.result.qReturn.qHandle;
					var sheetId = newSheet.result.qInfo.qId;
   					$scope.getObject(handle, sheetId, function(oldSheet){
						$scope.getProperties(oldSheet.result.qReturn.qHandle, function(oldSheetProps){
							var sheetProps = oldSheetProps.result.qProp;
							//copy the objects from the sheet
							$scope.copyObjects(sheetProps, newSheetHandle, function(){
								callbackFn.call(null);
							});
						});
					});
				});
			}
			$scope.copyObjects = function(sheet, parentHandle, callbackFn){
				var oIter = 0;
				for( var o in sheet.cells){
					console.log("Copying Objects");
                    $scope.logProgress("Copying Objects"," (step 6 / 10)");
					$scope.copyObject(sheet.cells[o], parentHandle, function(){
						oIter++; 
						if(oIter==sheet.cells.length){
							newAppSession.rpc({handle: parentHandle, method: "SetProperties", params:[sheet]}).then(function(response){
								callbackFn.call(null);
							});
						}
					});
				}
			}
			$scope.copyObject = function(object, parentHandle, callbackFn){
              console.log("Inside CopyObj");
				newAppSession.rpc({handle: parentHandle, method: "CreateChild", params:[{qInfo:{qId: object.name, qType: object.type}}]}).then(function(newObject){
					var newObjHandle = newObject.result.qReturn.qHandle;
					var objId = newObject.result.qInfo.qId;
					$scope.getObject(handle, objId, function(oldObject){
						$scope.getProperties(oldObject.result.qReturn.qHandle, function(oldObjectProps){
							var objProps = oldObjectProps.result.qProp;
							$scope.getLayout(oldObject.result.qReturn.qHandle, function(oldObjectLayout){
								var objLayout = oldObjectLayout.result.qLayout;
								var childList = []
								if(objLayout.qChildList){
									childList = objLayout.qChildList.qItems || [];
									objProps.qChildListDef = {qItems: objLayout.qChildList.qItems || []};
								}
								$scope.copyChildren(childList, newObjHandle, function(){
									newAppSession.rpc({handle: newObjHandle, method: "SetProperties", params:[objProps]}).then(function(response){
										callbackFn.call(null);
									});
								})
							});
						});
					});
				});
			}
			$scope.copyChildren = function(children, parentHandle, callbackFn){
			    console.log("Inside CopyChild");
				var cIter = 0;
				if(children.length > 0){
					for(c in children){
						$scope.copyChild(children[c], parentHandle, function(){
							cIter++;
							if(cIter == children.length){
								callbackFn.call(null);
							}
						});
					}
				}
				else{
					callbackFn.call(null);
				}
			}
			$scope.copyChild = function(child, parentHandle, callbackFn){
				newAppSession.rpc({handle: parentHandle, method: "CreateChild", params:[{qInfo:{qId: child.qInfo.qId, qType: child.qInfo.qType}}]}).then(function(newChild){
					var childId = newChild.result.qInfo.qId;
					var newChildHandle = newChild.result.qReturn.qHandle;
					$scope.getObject(handle, childId, function(oldChild){
						$scope.getProperties(oldChild.result.qReturn.qHandle, function(oldChildProps){
							var childProps = oldChildProps.result.qProp;
							newAppSession.rpc({handle: newChildHandle, method: "SetProperties", params:[childProps]}).then(function(response){
								callbackFn.call(null);
							});
						});
					});
				});
			}
			$scope.updateScript = function(callbackFn){
				     $scope.logProgress("Updating Script"," (step  8/ 10)");
                      var vStringData = {}; var vTest = {}; var script3 = ""; 
					session.rpc({handle: newAppHandle, method: "GetScript", params:[]}).then(function(scriptData){
						var script = scriptData.result.qScript; 
		
                       var script2 = script.match(/<\/OnDemandApp_Script>[\w\W]*/gim);
                     
					  if(script2)
					  {
                         script2 = script2[0].substr(21)
                                      	
						 var scriptLoop = script.match(/<OnDemandApp_Script>[\w\W]*?(?=<\/OnDemandApp_Script>)/gim);
                      
                       if(scriptLoop)
                       {						   
                        var script1 = scriptLoop[0].substr(20);
						
                        //Delete the Filter sheet	   
						var delSheetScript = script1.match(/<OnDemandApp_SheetToBeDeleted>[\w\W]*?(?=<\/OnDemandApp_SheetToBeDeleted>)/gim);
						if(!(PrevId))
                        {
						if(delSheetScript)
					    {
    						for(z=0;z<sheetContent.length;z++)
						{ 
						  if(sheetContent[z].qData.title == delSheetScript[0].substr(30))
						  {
							delSheetId = sheetContent[z].qInfo.qId; 
						  }
						 }
						}
						else
						{
						$scope.logError("Keyword \"<OnDemandApp_SheetToBeDeleted>\" not found in the script");
						}
                        }
						if(delSheetScript)
						{
						script1 = script1.replace("//"+delSheetScript[0]+"</OnDemandApp_SheetToBeDeleted>","");
						}
                        
						var openSheetScript = script1.match(/<OnDemandApp_SheetToBeOpened>[\w\W]*?(?=<\/OnDemandApp_SheetToBeOpened>)/gim);
						if(openSheetScript && sheetContent)
					    {
                
						for(z=0;z<sheetContent.length;z++)
						{ 
						  if(sheetContent[z].qData.title == openSheetScript[0].substr(29))
						  {
							openSheetId = sheetContent[z].qInfo.qId; 
						  }
						 }
						}
					
						
                         session.rpc({handle: handle, method: "GetFieldDescription", params:["_VariableName"]}).then(function(response3){
						 var cf2Count = response3.result.qReturn.qTotalCount; 
                         console.log(response3);

					     session.rpc({handle: handle, method: "GetTableData", params:[0,cf2Count,false,"ActiveVariableTable"]}).then(function(response2){
						    var cf2Data = response2.result;
                           console.log(response2);
						
 							var Query = script1.match(/<OnDemandApp_Variable>[\w\W]*?(?=<\/OnDemandApp_Variable>)/gim);
                            if(Query)
							{
                              $scope.getVariableData(vStringData,0,0,cf2Data,cf2Count,function(actualResponse){
                                
                                console.log(actualResponse);
                   						
								for(y=0;y<Query.length;y++)
								{   var oldStatement = Query[y]+"<\/OnDemandApp_Variable>"; 
							        var tempName = Query[y];
                                    tempName = tempName.substr(22);
                                    var vRData = actualResponse[tempName];
                                if(vRData)
                                {									
				
                                  var vData = "";
								 if(vRData.match(/\b|||||\b/i))   
								 {
									vRData = vRData.split("|||||")
                                   
                                    for(x in vRData)
                                    { 
                                      oper = "";
                                                  
                                      if(isNaN(vRData[x]))
                                      {
                                      if(x == 0){ oper="\'"; }else{ oper=",\'"; }
                                      
                                      vRData[x] = vRData[x].replace("'","''");
                                      
                                      vData = vData + oper+vRData[x]+"\'";
                                      }
                                      else
                                      {
                                      if(x > 0){ oper=","; }
                                      
                                      vData = vData + oper+vRData[x];
                                        
                                      }
                                     
                                    }
                                 }
                                 else
                                 {
									vData = vRData; 
								 }									 
       							script1 = script1.replace(oldStatement, vData);	
								}
								else{$scope.logError(tempName+" doesn't have value");}
								}
								
								for(t=0;t<cf2Count;t++)
								{
									if(cf2Data.qData[t].qValue[2].qText == 'Y')
									{    var tempName = cf2Data.qData[t].qValue[0].qText;
								   
										 var vRData = actualResponse[tempName];
				
								       var vData = "";
									if(vRData)
									{
									
									//vData = vRData.replace("'","||");
									vData = vRData.split("'").join("||");
									
									}
									else
									{
									vData = "''";
									}
									script3 = script3 + "\nSET "+tempName+" = "+vData+";";
										
									}
									
								}
									
                                if(script2)
                                {  
                                script = script1+script3+"\nExit Script;\n"+script2;
                                }
                                else
                                {
                                 script = script1+script3; 
                                }
           

							newAppSession.rpc({handle: newAppHandle, method: "SetScript", params: [script]}).then(function(response){
								callbackFn.call(null);
                            });
              
                        });
							}
					}, function(error){
					$scope.logError("Problem in getting data from table \"ActiveVariableTable\"");
				});
					}, function(error){
					$scope.logError("Column \"_VariableName\" is not found");
				});
					
			   }
			   else{$scope.logError("Keyword \"<OnDemandApp_Script>\" not found in the script");}
			   }
			   else {$scope.logError("Keyword \"</OnDemandApp_Script>\" not found in the script");}
			   });
			}
            
						
            
            
            $scope.testAppExists = function(vStringData,vItr,callbackFn){
               var vFound = 0;
              session.rpc({handle: -1, method: "GetDocList", params:[]}).then(function(response1){
					var i=0; 
                $scope.logProgress("Checking Child Attempt: "+(vItr+1) );
                  do{

                    if(response1.result.qDocList[i].qDocId == vStringData)
                    { vFound++;
                      break;
                    }
                  
                   }while(response1.result.qDocList[++i]);
                
                   if(vFound > 0)
                   {
                     callbackFn.call(null,vFound);
                   //  $scope.logProgress("App Found");
                   }
                   else
                   {
                     $scope.testAppExists(vStringData,(vItr+1),function(vFound1){
                       
                       
                       callbackFn.call(null,vFound1);
                     });
                   }
              });
              
            }
            
  $scope.getVariableData = function(vStringData,vItr,vChk,cf2Data,cf2Count,callbackFn)
  {
 	while((vItr<cf2Count) && (cf2Data.qData[vItr].qValue[0].qText in vStringData) )
    {
		vItr++;
		break; 
	}	

	if((vItr<cf2Count) && !(cf2Data.qData[vItr].qValue[0].qText in vStringData) )
          {  
              var temp = cf2Data.qData[vItr].qValue[0].qText;
                //temp = temp.substr(18);
              console.log(temp);
             session.rpc({handle: handle, method: "GetVariable", params:[temp]}).then(function(response4)
                  {
			 var v1Hand = response4.result.qReturn.qHandle;
                    console.log(response4);
			 session.rpc({handle: v1Hand, method: "GetContent", params:[]}).then(function(response5)
                         {
			               var tData = response5.result.qContent.qString; 
							console.log(tData);
							vStringData[temp] = tData;
							
							$scope.getVariableData(vStringData,vItr+1,vChk+1,cf2Data,cf2Count,function(vardataOut)
                             {
                               
			                   callbackFn.call(null,vardataOut);
							
							});
						});
					
					},function(error){
               $scope.logError("Error while getting variable data: "+temp);
				}); 

            }
			
	if(vItr>=cf2Count)
	{callbackFn.call(null,vStringData);}
			
    }
            
			$scope.getSelections = function(callbackFn){
				$scope.getObject(handle, "CurrentSelection", function(selectionsObject){
					$scope.getLayout(selectionsObject.result.qReturn.qHandle, function(selectionsLayout){
						callbackFn.call(null, selectionsLayout.result.qLayout);
					});
				});
			}
			$scope.getFieldValues = function(fieldDef, callbackFn){
				$scope.createSessionObject(fieldDef, function(createObjectResponse){
					//use the handle of the new object to get the Values
					$scope.getLayout(createObjectResponse.result.qReturn.qHandle, function(objectLayout){
						callbackFn.call(null, objectLayout);
					});
				});
			}
			
			$scope.dummyReload = function(callbackFn){
				
				var script = "SET ThousandSep=',';"
			   newAppSession.rpc({handle: newAppHandle, method: "SetScript", params: [script]}).then(function(response){
				             console.log("SetScript Success");
					newAppSession.rpc({handle: newAppHandle, method: "DoReload", params: []}).then(function(reloadStart){
						      console.log("Reload Done");
					          callbackFn.call(null);
							  });						
                            });
				}
			
			$scope.reload = function(){
				$scope.logProgress("Reloading App"," (step 9 / 10)");
				newAppSession.rpc({handle: newAppHandle, method: "DoReload", params: []}).then(function(reloadStart){
					if(reloadStart.error){
						$scope.view = "error";
						$scope.lastError = "Could not start reload";
					}
					else{
						newAppSession.rpc({handle: -1, method: "GetProgress", params: [0]}).then(function(reloadProgress){
							if(reloadProgress.result.qProgressData.qFinished==true){
								if(reloadProgress.result.qProgressData.qPersistentProgressMessages){
									for (var i = 0; i < reloadProgress.result.qProgressData.qPersistentProgressMessages.length; i++) {
										switch(reloadProgress.result.qProgressData.qPersistentProgressMessages[i].qMessageCode){
											case 10:
											case 7:
												$scope.view = "error";
												$scope.lastError = "Reload - " + reloadProgress.result.qProgressData.qPersistentProgressMessages[i].qMessageParameters;
												return;
												break;
											default:
												break;
										}
									}
								}
								$scope.saveNewApp();
                              if(delSheetId)
				              {
 
                              newAppSession.rpc({handle: newAppHandle, method: "DestroyObject", params:[delSheetId]}).then(function(response){
  

					});
							  }
                              
							}
						});
					}
				});
			}
			$scope.saveNewApp = function(){
				$scope.logProgress("Saving"," (step 10 / 10)");
				newAppSession.rpc({handle: newAppHandle, method: "DoSave", params:[]}).then(function(response){
					$scope.view = "done";
					var url = "http";
					url += (session.options.isSecure==true?"s://":"://");
					url += session.options.host;
					url += (session.options.port!=null?":"+session.options.port:"");
					url += session.options.prefix;
					url += "sense/app/";
					url += newAppId;
					if(openSheetId)
					{
					 url +=	"/sheet/"+openSheetId+"/state/analysis";
					}
					
					$scope.newAppUrl = url;
					newAppSession.close();
                  //$scope.logProgress("100% Completed");
                  if($scope.autoOpen)
				  {
                  $scope.openNewApp();
				  }
				});
			}
			$scope.createSessionObject = function(objectDef, callbackFn){
				session.rpc({handle: handle, method: "CreateSessionObject", params: [objectDef]}).then(function(createObjectResponse){
					if(createObjectResponse.error){
						$scope.logError(createObjectResponse.error);
					}
					callbackFn.call(null, createObjectResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.clearAll = function(callbackFn){
				session.rpc({handle: handle, method: "ClearAll", params: []}).then(function(createObjectResponse){

					if(createObjectResponse.error){
						$scope.logError(createObjectResponse.error);
					}
					callbackFn.call(null, createObjectResponse);
				}, function(error){
					$scope.logError(error);$scope.logError(error);
				});
			}
			$scope.getListObjectData = function(listHandle, pageArray, callbackFn){
				session.rpc({handle: listHandle, method: "SelectListObjectValues", params: ["/qListObjectDef", pageArray]}).then(function(getDataResponse){
					if(getDataResponse.error){
						$scope.logError(getDataResponse.error);
					}
					callbackFn.call(null, getDataResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.selectListObjectValues = function(listHandle, enumArray, callbackFn){
				session.rpc({handle: listHandle, method: "SelectListObjectValues", params: ["/qListObjectDef", enumArray]}).then(function(selectValuesResponse){
					if(selectValuesResponse.error){
						$scope.logError(selectValuesResponse.error);
					}
					callbackFn.call(null, selectValuesResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.getObject = function(docHandle, id, callbackFn){
				session.rpc({handle: docHandle, method: "GetObject", params: [id]}).then(function(getObjectResponse){
					if(getObjectResponse.error){
						$scope.logError(getObjectResponse.error);
					}
					callbackFn.call(null, getObjectResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.getField = function(fieldName, callbackFn){
				session.rpc({handle: handle, method: "GetField", params: [fieldName]}).then(function(getFieldResponse){
					if(getFieldResponse.error){
						$scope.logError(getFieldResponse.error);
					}
					callbackFn.call(null, getFieldResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.getProperties = function(objHandle, callbackFn){
				session.rpc({handle: objHandle, method: "GetProperties", params: []}).then(function(getPropertiesResponse){
					if(getPropertiesResponse.error){
						$scope.logError(getPropertiesResponse.error);
					}
					callbackFn.call(null, getPropertiesResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.getLayout = function(objHandle, callbackFn){
				session.rpc({handle: objHandle, method: "GetLayout", params: []}).then(function(getLayoutResponse){
					if(getLayoutResponse.error){
						$scope.logError(getLayoutResponse.error);
					}
					callbackFn.call(null, getLayoutResponse);
				}, function(error){
					$scope.logError(error);
				});
			}
			$scope.openNewApp = function(){
				// $scope.clearAll();
				window.location = $scope.newAppUrl;
			}
			$scope.acknowledgeError = function(){
				$scope.view = "ready";
			}
			$scope.logProgress = function(text,text2){
				$scope.progress = text;
				$scope.percent = text2;
			}
			$scope.logError = function(text){
				$scope.errorCount++;
				$scope.view = "error";
				$scope.lastError = text;
				if($scope.errorCount==1){	//we only need to do this once
					newAppSession.close();
					session.rpc({handle: -1, method: "DeleteApp", params:[newAppId]}).then(function(response){

					});
				}
			}
    },
		//template: appGenHtml,
		paint: function ($element, layout) {
			//first we check to see if the row conditions have been met
            this.$scope.delSheet = layout.advanced.delSheet;
			this.$scope.autoOpen = layout.advanced.autoOpen;
			this.$scope.cMessage = layout.advanced.cMessage;
			this.$scope.resetFilters = layout.advanced.resetFilters;
            this.$scope.childName = layout.advanced.childName;
			if(layout.qHyperCube && layout.qHyperCube.qMeasureInfo.length > 0){
				this.$scope.expressionSet = true;
				if(layout.qHyperCube.qMeasureInfo[0].limit && layout.qHyperCube.qMeasureInfo[0].limit > 0){
					this.$scope.limitSet = true;
					this.$scope.limit = layout.qHyperCube.qMeasureInfo[0].limit;
				}
					
			}
			if(!this.$scope.expressionSet || !this.$scope.limitSet){
				this.$scope.view = "nocondition";
			}
			if(layout.qHyperCube.qDataPages[0]){
				if(layout.qHyperCube.qDataPages[0].qMatrix[0]){
					this.$scope.rowCount = layout.qHyperCube.qDataPages[0].qMatrix[0][0].qNum;
				}
			}
			if(this.$scope.rowCount && this.$scope.limit){
				if(this.$scope.rowCount > this.$scope.limit){
					this.$scope.view = "conditionnotmet";
				}
				else{
					this.$scope.view = "ready";
				}
			}
			var $compile = qvangular.getService("$compile");
			var comp = $compile(appGenHtml)(this.$scope);
			$element.html(comp);
		}
	};

} );
