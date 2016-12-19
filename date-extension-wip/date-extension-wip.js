define( [ "qlik",
    "text!./appGen.html",
	"qvangular",
	"jquery",
	"client.models/rpc-session",
	'./properties'
],
function ( qlik,appGenHtml, qvangular, $, RPCSession,props ) {

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
		definition: props,
		
		controller: function($scope){
		  var vHandleArray = {};
		  $scope.dateLabel = 'Date';
		  $scope.numberLabel = 'Offset';
		
           var session,handle,appId;
		 
          session = $scope.backendApi.model.session;
		  handle = session.currentApp.handle;
		  appId = session.currentApp.id;
		  
		  
	
		 //**********DATE FUNCTIONS********************//
		  $scope.formatDate=function (date) {
			var d = new Date(date || Date.now()),
				month = '' + (d.getMonth() + 1),
				day = '' + d.getDate(),
				year = d.getFullYear();

			if (month.length < 2) month = '0' + month;
			if (day.length < 2) day = '0' + day;

			return [ year,month, day].join('-');
		 }
		 
		$scope.mmddyyyy=function(date) {
			var d = new Date(date || Date.now()),
				month = '' + (d.getMonth() + 1),
				day = '' + d.getDate(),
				year = d.getFullYear();

			if (month.length < 2) month = '0' + month;
			if (day.length < 2) day = '0' + day;

			return [ month, day,year].join('-');
		}
		
		
		 $scope.toISOFormatDate=function(date){
		 	var tempdate = new Date(date);
			return tempdate.toISOString().split('T')[0];
		 }
		 
		  
		  $scope.DateIsOutofRange=function(date,fieldName){
		  	
			if(fieldName=="vIndexStartDate" )	{
				var startdate=$scope.IndexRangeStartDate;
				var endDate=$scope.IndexRangeEndDate;
			}
			else if (fieldName=="vIndexEndDate"){
				var startdate=$scope.formatDate($scope.mIndexStart);
				if($scope.enableEndDate){
				
					var endDate=$scope.IndexRangeEndDate;
				}
				else{
					
					var endDate=$scope.DefaultIndexEndDate;
				}
				
			}
			else if(fieldName=="vConditionStartDate"){
			  var startdate=$scope.ConditionRangeStartDate;
			  var endDate=$scope.ConditionRangeEndDate;
			}
			else if(fieldName=="vConditionEndDate"){
				if($scope.mConditionEndOption=="Date"){
					var startdate=$scope.formatDate($scope.mConditionStart);
			    	var endDate=$scope.ConditionRangeEndDate;
				}else{
					var startdate=$scope.ConditionRangeStartDate;
			    	var endDate=$scope.ConditionRangeEndDate;				
				}
			  
			}
			else{return;}
			
			
			console.log(date+ " :" +startdate+ " : "+ endDate);
			date=new Date(date);
			startdate=new Date(startdate);
			endDate=new Date(endDate);
			if(date > startdate && date<endDate){
				  return false;
			}
			return true;
		  }
		  
		  
		 //QLIK METHODS 
		  
		  
		 //********CREATE VARIABLE********
		 $scope.createVariable = function(vName,callbackFn,vValue="123"){
   	       session.rpc({handle: handle, method: "CreateVariableEx", 
		   params:[
		          {
                  "qInfo": {
                  "qId": "",
                  "qType": "Variable"
                   },
                  "qName":vName,
                  "qComment": "My first variable",
                  "qDefinition": vValue
                  }]})
				.then(function(response){
		              callbackFn.call(null,response.result.qReturn.qHandle);
		        });
		  }
		  
		 //********GET HANDLE********
		 
		 
		 
		 $scope.getHandle = function(vName,callbackFn,vValue)
		  {
		   if(!(vHandleArray[vName]))
		   {  
		      session.rpc({handle: handle, method: "GetVariableByName", params:[vName]}).then(function(response){
		         //callbackFn.call(null,response.result.qReturn.qHandle);
			    if(response.result.qReturn.qHandle)
				{ vHandleArray[vName]=response.result.qReturn.qHandle;
				  callbackFn.call(null,response.result.qReturn.qHandle);
				}
				else
				{
				 console.log('creating variable '+vName);
				 $scope.createVariable(vName,function(reply1){
				 vHandleArray[vName]=reply1;
				 callbackFn.call(null,reply1);				 
				 },vValue);
				}
		       });	
		   }
		   else
		   { 
		     callbackFn.call(null,vHandleArray[vName]);
		   }
		  	  
		  }
		  
         //********GET VALUES********		  		  		  
		  $scope.getValues = function(vHandle,callbackFn){
	         session.rpc({handle: vHandle, method: "GetLayout", params:[]}).then(function(reply2){
		     callbackFn.call(null,reply2.result.qLayout.qText);			 
			 });
		  }
		  

			$scope.getKeyByValue=function(object, value) {
			  return Object.keys(object).find(key => object[key] === value);
			}
		  
		  $scope.getVariableByHandle=function(handle){
		  
		 	 var variable=$scope.getKeyByValue(vHandleArray,handle);
			 return variable;
		  }
		  
		 //********SET VALUES********
		  $scope.setValues = function(vHandle,varValue,callbackFn)
		  {
		 	 //console.log("setting value "+varValue+"of variable "+$scope.getVariableByHandle(vHandle));
		  	
			session.rpc({handle: vHandle, method: "ApplyPatches", params:
			[
			[
			{
			 "qOp": "replace",
			 "qPath": "/qDefinition",
			 "qValue": "\""+varValue+"\""
			}
			]
			]
			}).then(function(reply1){
			//console.log(reply1.result);
				   callbackFn.call(null,reply1.result);	
				   
			   });

		  }
		  
		  //*********EVALUATE EXPRESSION********************//
		  $scope.evaluateExpression=function(expression,callbackFn){
			
			 session.rpc({handle: handle, method: "EvaluateEx",params:
			 {
				"qExpression": expression
			 }
			 }).then(function(response){
			 	console.log('expression==>value'+expression+'==>'+response.result.qValue.qText);
				   callbackFn.call(null,response.result.qValue.qText);	
     		   },function(error){
			  	 console.error("error occured:"+JSON.stringify(error));
				 //if error, then can try again..
			   });
		  }
		  
		  
		  
		  //********INITIALIZE********
		  $scope.InitializewithVariable = function(vSName,vTName,callbackFn){
		    $scope.getHandle(vSName,function(sourceHandle){
		    $scope.getHandle(vTName,function(targetHandle){
            $scope.getValues(sourceHandle,function(sourceValue){
			console.log("source val"+sourceValue);
  		    $scope.setValues(targetHandle,sourceValue,function(targetValue){
				   callbackFn.call(null,sourceValue);
			   });
			  });
		    });
		    });
		   }
		   
		   
		 $scope.Initialize = function(vSName,vValue,callbackFn){
		    $scope.getHandle(vSName,function(handle){
			   $scope.getValues(handle,function(value){
					 callbackFn.call(null,value);
				});
		    },vValue);
		   }
		   
		   
		
		 
		 $scope.updateDateValue=function(dateValue,variable,callbackFn){
		 
		
		//if(variable=="vStartDate" || variable=="vEndDate"){return;}
			console.log("updating : "+variable+" value: "+$scope.formatDate($scope.dateCalc(dateValue)));
		    $scope.getHandle(variable,function(handle){
				$scope.setValues(handle,$scope.formatDate($scope.dateCalc(dateValue)),function(value){
				if(callbackFn){
					callbackFn.call(null,value);
				}
				});

		   });
		 }
		 
		 
		 $scope.ondateChange=function(fieldName,val){
		return;
		 	if(fieldName=="vIndexStartDate"){ $scope.IndexStartChange(val);}
		   else if(fieldName=="vIndexEndDate"){ $scope.IndexEndChange(val);}
		   else if(fieldName=="vConditionStartDate"){  $scope.CondStartChange(val);}
		   else if (fieldName=="vConditionEndDate"){ $scope.CondEndChange(val);}
		   else {return;}
		 
		 
		 }
		 
		
		
		 $scope.$watch('mIndexStart',function(newValue, oldValue){
		 //console.log('newValue, oldValue',newValue, oldValue);
		 
		 if(oldValue===newValue){return;}
		 
		 //check if date is valid
			if(!$scope.isDate($scope.mIndexStart)){
			
				$scope.indexReset=true;
				//if not reset to old value
				$scope.mIndexStart=oldValue || new Date();
				
				return;
			}
			
			//if reset, dont do further op, just return.
			if($scope.indexReset){
				$scope.indexReset=false;
				return;
			}
		 
		 	if($scope.vIndexStartDate){
			
					
			  $scope.updateDateValue($scope.mIndexStart,$scope.vIndexStartDate,function(value){
				
				$scope.mConditionStart=$scope.mIndexStart;
				
				if($scope.stopPropagation){
				
					$scope.stopPropagation=false;
					
				}else
				{
					$scope.evalEndDate();
				}
				
					
					$scope.IndexEndDateMin=$scope.formatDate($scope.mConditionStart);
				});
			 	
			 }
			
		 
		 });
		
		 
		 $scope.$watch('mIndexEnd',function(newValue, oldValue){
			if(oldValue===newValue){return;}
		 
		  	if(!$scope.isDate($scope.mIndexEnd)){
			  $scope.indexEndReset=true;
			  $scope.mIndexEnd=oldValue || new Date();
			  return;
		  	}
		  	if($scope.indexEndReset){
				$scope.indexEndReset=false;
				return;
			}
		 
		 	if($scope.vIndexEndDate){
				  $scope.updateDateValue($scope.mIndexEnd,$scope.vIndexEndDate,function(){
				$scope.mConditionEnd=$scope.mIndexEnd;
				});
				
			 }
		 });
		 
		 
		 
		  
		 $scope.$watch('mConditionStart',function(newValue, oldValue){
			if(oldValue===newValue){return;}
		 
		  	if(!$scope.isDate($scope.mConditionStart)){
				$scope.condStartReset=true;
		  		$scope.mConditionStart=oldValue || new Date();
			  	return;
		  	}
		  	if($scope.condStartReset){
				$scope.condStartReset=false;
				return;
			}

			if($scope.vConditionStartDate){
			  $scope.updateDateValue($scope.mConditionStart,$scope.vConditionStartDate);

				//check if condition start date is greater than condition end date, if yes, update
				if(new Date($scope.mConditionStart)>new Date($scope.mConditionEnd)){
					$scope.mConditionEnd=$scope.mConditionStart;
				}
				$scope.ConditionEndDateMin=$scope.formatDate($scope.mConditionStart);
			}
		 
		 });
		   
		 $scope.$watch('mConditionEnd',function(newValue, oldValue){
			if(oldValue===newValue){return;}
		  	if(!$scope.isDate($scope.mConditionEnd)){
				$scope.condEndReset=true;
				$scope.mConditionEnd=oldValue || new Date();
			  	return;
		  	}
		  	if($scope.condEndReset){
				$scope.condEndReset=false;
				return;
			}
		  
			if($scope.vConditionEndDate){
			  $scope.updateDateValue($scope.mConditionEnd,$scope.vConditionEndDate);
			 }
		 
		 });
		
		
		
		
		 
		 $scope.evalEndDate =function(){
		  
		    if($scope.enableEndDate){
			
				//if index start date is greater than index enddate
				if(new Date($scope.mIndexStart) > new Date($scope.mIndexEnd)){

				  $scope.mIndexEnd=$scope.mIndexStart;
				//  $scope.CondEndChange();

				}

				  return $scope.mIndexStart;
			 }
			 else
			 {
				$scope.evaluateExpression($scope.EndDateFormula,function(value){

				var endDate=value;
				console.log('evalauted endDate->'+endDate);

				  if($scope.DateIsOutofRange(endDate,"vIndexEndDate")){
					//set Date variable
						 console.log("END DATE OUT OF RANGE.");
						$scope.mConditionEnd= $scope.mIndexEnd= $scope.IndexRangeEndDate;
						// $scope.CondEndChange();
						
						 return    $scope.mIndexEnd;
				  }
				  else
				  {
					//console.log('endDate :'+$scope.formatDate(endDate));
					  $scope.mIndexEnd= new Date(endDate);
					  $scope.mConditionEnd=$scope.mIndexEnd;
					//  $scope.CondEndChange();
					  return endDate;
				  }
						  

				});
				
			 }
		  	
		 };

		 
		 
		 $scope.onChangeSelect = function(varVal,option){
		
		 
		   if(option=="Start"){
			   	optionvariable=$scope.vConditionStartOption;
		   }
		   else 
		   {
			   optionvariable=$scope.vConditionEndOption;
		   
		   }
		   //console.log('optionvariable,varVal,'+optionvariable+","+varVal);
 
			 $scope.getHandle(optionvariable,function(handle){
			   $scope.setValues(handle,varVal,function(value){
				});
			 });
		 }	
	
		 
		 $scope.setValue = function(value,fieldName)
		 {
		   var variable="";
		   if(fieldName=="vConditionStartOffset"){variable=$scope.vConditionStartOffset;}
		   else if (fieldName=="vConditionEndOffset"){variable=$scope.vConditionEndOffset;}
		   else{return;}

			  $scope.getHandle(variable,function(handle){
			   $scope.setValues(handle,value,function(value){
				});
			 });
		   
		 
		 }
	
		 
	 
	     $scope.dateCalc = function(reply1)
		 {
		
		 	var t2 = new Date(reply1);
		    //  console.log(reply1);
	  			  var t4 = t2.setHours(t2.getHours()+Math.abs(parseInt(t2.getTimezoneOffset()/60)));
			   t4 = new Date(t4);
			   t4 = t4.setMinutes(t2.getMinutes()+Math.abs((t2.getTimezoneOffset()%60)));
			   t4 = new Date(t4);
			   //console.log(t4);
			  var tempD1 = new Date(
			                       t4.getUTCFullYear(),
								   t4.getUTCMonth(),
								   t4.getUTCDate());
								   return tempD1;
		 }
		 
		 $scope.stopPropagation=false;
		 
		 $scope.onDatabaseSelectionChange=function(){
		 
		
		 	
			var selectedDB="=Only([Database])";
	
			$scope.evaluateExpression(selectedDB,function(db){
			
			//check if db has changed.
				if(db!== $scope.oldDBSelection){
				
				  console.log("db selection changed! updating dates");	
				
				 
				  $scope.updateDates();
				
					
				  $scope.oldDBSelection=db;
				}
			});
			
			
			
			
		
		 }
		 
		 $scope.updateDates=function(){
		 
		 	var formula_minDate,formula_maxDate,formula_startDate,formula_endDate;
			
		   formula_minDate=$scope.IndexRangeStartDate;
		   formula_maxDate=$scope.IndexRangeEndDate;
		   formula_startDate=$scope.DefaultIndexStartDate;
		   formula_endDate=$scope.DefaultIndexEndDate;
		   
		    console.log("minDate:"+formula_minDate);
			console.log("maxDate:"+formula_maxDate);
			console.log("startDate:"+formula_startDate);
			console.log("endDate:"+formula_endDate);
		   
		   
		   $scope.IndexRangeStartDate=$scope.formatDate($scope.dateCalc(formula_minDate));
		   $scope.IndexRangeEndDate=$scope.formatDate($scope.dateCalc(formula_maxDate));
		   $scope.ConditionRangeStartDate=$scope.formatDate($scope.dateCalc(formula_minDate));
		   
		    if($scope.enableEndDate){
			   $scope.ConditionRangeEndDate=$scope.formatDate($scope.dateCalc(formula_maxDate));
			}else{
				$scope.ConditionRangeEndDate=$scope.formatDate($scope.dateCalc(formula_endDate));
			}


		   //stop change in index start date to change index end date
		   $scope.stopPropagation=true;
		   $scope.mIndexStart=$scope.dateCalc(formula_startDate);
		   $scope.mIndexEnd=$scope.dateCalc(formula_endDate);
		 
		 }
		 
		 $scope.InitializeVariables=function(callbackFn){
		 
			 console.log("initilaizing...");
			 
			 
		/*
			  $scope.Initialize($scope.vIndexStartDate ,$scope.DefaultIndexStartDate,function(StartDate)
			 {
				
				$scope.mIndexStart=$scope.dateCalc($scope.DefaultIndexStartDate);//$scope.dateCalc(StartDate);.
				$scope.oldIndexStartDate=$scope.mIndexStart;
			
				
			 });
			 $scope.Initialize($scope.vIndexEndDate ,$scope.DefaultIndexEndDate,function(EndDate)
			 {
			
				$scope.mIndexEnd=$scope.dateCalc($scope.DefaultIndexEndDate);//$scope.dateCalc(EndDate);
				$scope.oldIndexEndDate= $scope.mIndexEnd;
				
			 });

			 $scope.Initialize($scope.vConditionStartDate,$scope.DefaultConditionStartDate,function(StartDate)
			 {
				
				$scope.mConditionStart=$scope.dateCalc($scope.DefaultConditionStartDate);//$scope.dateCalc(StartDate);.
				$scope.oldCondStartDate=$scope.mConditionStart;
			
				
			 });
			 $scope.Initialize($scope.vConditionEndDate,$scope.DefaultConditionEndDate,function(EndDate)
			 {
			 //console.log('init DefaultConditionEndDate:'+$scope.DefaultConditionEndDate);
			 
				$scope.mConditionEnd=$scope.dateCalc($scope.DefaultConditionEndDate);//$scope.dateCalc(EndDate);
				$scope.oldCondEndDate= $scope.mConditionEnd;
				
			 });*/
			
			 $scope.updateDates();
			 
			 
			 
			 $scope.Initialize($scope.vConditionStartOffset,$scope.DefaultConditionStartOffset,function(Offset){
			 
			 	$scope.mStartOffset=parseInt(Offset);

			 });
			 $scope.Initialize($scope.vConditionEndOffset,$scope.DefaultConditionEndOffset,function(Offset){
			
				$scope.mEndOffset=parseInt(Offset);

			 });
			 $scope.Initialize($scope.vConditionStartOption,$scope.DefaultConditionStartOption,function(Option){
			 
			 	$scope.mConditionStartOption=Option;

			 });
			 $scope.Initialize($scope.vConditionEndOption,$scope.DefaultConditionEndOption,function(Option){

				$scope.mConditionEndOption=Option;
				
			});
			
			$scope.dateLabel = "Date";
			$scope.numberLabel = "Offset";
			
			
			
			 
			$scope.IndexEndDateMin=$scope.IndexRangeStartDate;
			$scope.ConditionEndDateMin=$scope.ConditionRangeStartDate;
			 
		
		
			if(($scope.isDate($scope.DefaultConditionStartDate) ) && ($scope.isDate($scope.DefaultConditionEndDate))){
				$scope.Initialized=true;
			}
		 }
		 
		 $scope.isDate = function(date) {
    			return ( (new Date(date) !== "Invalid Date" && !isNaN(new Date(date)) ));
		  }
		  
		  $scope.initializeLayoutProperties=function(layout){
		  
			$scope.enableEndDate=layout.advanced.enableEndDate;
			$scope.IndexDateLabel=layout.advanced.IndexDateLabel;
			$scope.ConditionDateLabel=layout.advanced.ConditionDateLabel;
			$scope.EndDateFormula=layout.advanced.EndDateFormula;
			
			$scope.IndexRangeStartDate=$scope.formatDate(layout.advanced.IndexRangeStartDate );
			$scope.IndexRangeEndDate=$scope.formatDate(layout.advanced.IndexRangeEndDate );
			$scope.ConditionRangeStartDate=$scope.formatDate(layout.advanced.ConditionRangeStartDate );
			$scope.ConditionRangeEndDate=$scope.formatDate(layout.advanced.ConditionRangeEndDate );
			
			
			$scope.DefaultIndexStartDate=$scope.formatDate(layout.advanced.DefaultConditionStartDate );
			$scope.DefaultIndexEndDate=$scope.formatDate(layout.advanced.DefaultConditionEndDate );
			$scope.DefaultConditionStartDate=$scope.formatDate(layout.advanced.DefaultConditionStartDate );
			$scope.DefaultConditionEndDate=$scope.formatDate(layout.advanced.DefaultConditionEndDate );
			
			$scope.DefaultConditionStartOffset=layout.advanced.DefaultConditionStartOffset ;
			$scope.DefaultConditionEndOffset=layout.advanced.DefaultConditionEndOffset ;
			$scope.DefaultConditionStartOption=layout.advanced.DefaultConditionStartOption || "Date";
			$scope.DefaultConditionEndOption=layout.advanced.DefaultConditionEndOption || "Date";
			
			$scope.OffsetUnit=layout.advanced.OffsetUnit || "Day(s)";
			
			$scope.vIndexStartDate=layout.advanced.vIndexStartDate;
			$scope.vIndexEndDate=layout.advanced.vIndexEndDate;
			$scope.vConditionStartDate=layout.advanced.vConditionStartDate;
			$scope.vConditionEndDate=layout.advanced.vConditionEndDate;
			$scope.vConditionStartOffset=layout.advanced.vConditionStartOffset;
			$scope.vConditionEndOffset=layout.advanced.vConditionEndOffset;
			$scope.vConditionStartOption=layout.advanced.vConditionStartOption;
			$scope.vConditionEndOption=layout.advanced.vConditionEndOption;
		
		}
		 
		},
		
		initilize: function(){
			console.log("initilize called");
		},
		
		
		
		
		
		paint: function ($element,layout) {
		
			this.$scope.initializeLayoutProperties(layout);
		
			
			if(!this.$scope.Initialized){
			
				this.$scope.InitializeVariables();
		
			}
			else{
			
			    this.$scope.onDatabaseSelectionChange();
			}
			
			
			var $compile = qvangular.getService("$compile");
            var comp = $compile(appGenHtml)(this.$scope);
            $element.html(comp);
		}
	};

	});

