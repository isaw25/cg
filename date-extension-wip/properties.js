define( [], function () {
	
	// *****************************************************************************
	// Dimensions & Measures
	// *****************************************************************************
	var dimensions = {
		uses: "dimensions",
		min: 0,
		max: 1
	};
	var measures = {
		uses: "measures",
		min: 0,
		max: 1
	};
	// *****************************************************************************
	// Appearance section
	// *****************************************************************************
	var appearanceSection = {
		uses: "settings"
	};
	
	var advanced={
	
					label: "Advanced",
					component: "expandable-items",
					type: "items",
					items:{
					Options : {
							type: "items",
							label : "Options",
							items : {
							 IndexRangeStartDate:{
							   ref: "advanced.IndexRangeStartDate",
							   label: "Index Range Start Date",
							   type: "string",
							   expression: "always",
							   
							   defaultValue:"vDefaultMinDate"
							  
							  } ,
							 IndexRangeEndDate:{
							   ref: "advanced.IndexRangeEndDate",
							   label: "Index Range End Date",
							   type: "string",
							   
							   expression: "always",
							   defaultValue:"vDefaultMaxDate"
							  } ,
							 ConditionRangeStartDate:{
							   ref: "advanced.ConditionRangeStartDate",
							   label: "Condition Range Start Date",
							   type: "string",
							   expression: "always",
							   
							   defaultValue:"vDefaultMinDate"
							  } ,
							 ConditionRangeEndDate:{
							   ref: "advanced.ConditionRangeEndDate",
							   label: "Condition Range End Date",
							   type: "string",
							   expression: "always",
							   
							   defaultValue:"vDefaultMaxDate"
							  } ,
							enableEndDate: {
							  ref: "advanced.enableEndDate",
							  label: "Enable End Date",
							  type: "boolean",
							  defaultValue: true
							  },
							 EndDateFormula: {
							  ref: "advanced.EndDateFormula",
							  label: "Index End Date",
							  type: "string",
							  //expression: "optional",
							   defaultValue:"vEndDate",
							   show: function (d) {
                                        return !(d.advanced.enableEndDate);
                                    }
							  },
						    IndexDateLabel: {
							  ref: "advanced.IndexDateLabel",
							  label: "Index Date Label",
							  type: "string",
							  defaultValue: "Index Dates"
							  },
							ConditionDateLabel: {
							   ref: "advanced.ConditionDateLabel",
							  label: "Condition Date Label",
							  type: "string",
							  defaultValue: "Condition Dates"
							  },
							
							  DefaultConditionStartDate:{
							   ref: "advanced.DefaultConditionStartDate",
							   label: "Default Start Date",
							   type: "string",
							   expression: "always",
							   defaultValue: "vDefaultStartDate"
							  },
							  DefaultConditionEndDate:{
							   ref: "advanced.DefaultConditionEndDate",
							   label: "Default End Date",
							   type: "string",
							   expression: "always",
							   defaultValue: "vDefaultEndDate"
							  },
							   DefaultConditionStartOffset:{
							   ref: "advanced.DefaultConditionStartOffset",
							   label: "Default Confidion Start Date Offset",
							   type: "string",
							   defaultValue:"0"
							  },
							  DefaultConditionEndOffset:{
							   ref: "advanced.DefaultConditionEndOffset",
							   label: "Default Condition End Date Offset",
							   type: "string",
							   defaultValue:"0"
							  } ,
							   OffsetUnit:{
							   ref: "advanced.OffsetUnit",
							   label: "Offset Unit",
							   type: "string",
							   defaultValue:"Day(s)"
							  } 
							 
						  }
					},
					
				VariableNames:{
				type: "items",
							label : "Variable Names",
							items : {
							  vIndexStartDate: {
							  ref: "advanced.vIndexStartDate",
							  label: "Index Start Date variable",
							  type: "string",
							  defaultValue: "vStartDate"
							  },
							  vIndexEndDate: {
							  ref: "advanced.vIndexEndDate",
							  label: "Index Start End variable",
							  type: "string",
							  defaultValue: "vEndDate"
							  },
							  vConditionStartDate: {
							  ref: "advanced.vConditionStartDate",
							  label: "Condition Start Date variable",
							  type: "string",
							  defaultValue: "vStartSelectedDate"
							  },
							  vConditionEndDate: {
							  ref: "advanced.vConditionEndDate",
							  label: "Condition End Date variable",
							  type: "string",
							  defaultValue: "vEndSelectedDate"
							  },
							   vConditionStartOffset: {
							  ref: "advanced.vConditionStartOffset",
							  label: "Condition Start Offset variable",
							  type: "string",
							  defaultValue: "vStartSelectedOffset"
							  },
							   vConditionEndOffset: {
							  ref: "advanced.vConditionEndOffset",
							  label: "Condition End Offset variable",
							  type: "string",
							  defaultValue: "vEndSelectedOffset"
							  },
							    vConditionStartOption: {
							  ref: "advanced.vConditionStartOption",
							  label: "Condition Start Option variable",
							  type: "string",
							  defaultValue: "vStartOffsetDateSelection"
							  },
							   vConditionEndOption: {
							  ref: "advanced.vConditionEndOption",
							  label: "Condition End Option variable",
							  type: "string",
							  defaultValue: "vEndOffsetDateSelection"
							  }
							  
							
							}
				
					}	
					
				}
	
	};
	// *****************************************************************************
	// Main properties panel definition
	// Only what is defined here is returned from properties.js
	// *****************************************************************************
	return {
		type: "items",
		component: "accordion",
		items: {
			appearance: appearanceSection,
			advanced: advanced
			
		}
	};
});



/*
		 $scope.updateDateVariable=function(dateValue,fieldName){
		 
		 return false;
		
			dateValue= $scope.formatDate(dateValue);
		    var variable="";
 		
			//check and set the variable name to udpate 
			if(fieldName=="vIndexStartDate"){ 
	   
			 variable=$scope.vIndexStartDate; 
			
			
			
			  //if end date is calculated by formaula, then calculate and update the value
			  if(!$scope.enableEndDate)
			  {
				  var endDate=$scope.calculateEndDate();
				  $scope.mIndexEnd=$scope.dateCalc(endDate);
				  $scope.updateDateValue(endDate,$scope.vIndexEndDate);
			  }
			  else 
			  {

				  $scope.mIndexEnd=$scope.dateCalc(dateValue);
				  $scope.IndexEndDateMin=$scope.formatDate(dateValue);
				  $scope.updateDateValue(dateValue,$scope.vIndexEndDate);
			  }
			  
			  
			   //update condition start date also .
			 $scope.mConditionStart=$scope.dateCalc(dateValue);
			 //$scope.updateDateValue(dateValue,$scope.vConditionStartDate);
			 
			
			 
		   }
		   else if(fieldName=="vIndexEndDate"){variable=$scope.vIndexEndDate;}
		   else if(fieldName=="vConditionStartDate"){
		   
		   		variable=$scope.vConditionStartDate;
		   		$scope.mConditionEnd=$scope.dateCalc(dateValue);
				$scope.ConditionEndDateMin=$scope.formatDate(dateValue);
				$scope.updateDateValue(dateValue,$scope.vConditionEndDate)
		   }
		   else if (fieldName=="vConditionEndDate"){variable=$scope.vConditionEndDate;}
		   else {return;}
		   
		   //update the value of variable.
		   $scope.updateDateValue(dateValue,variable);
		    
		 }
		 /* 
		
		 $scope.IndexStartChange=function(val){
		 console.log('$scope.mIndexStart:'+val);
		 	
			if(!$scope.isDate(val)){
				console.log('$scope.oldIndexStartDate :'+$scope.oldIndexStartDate );
				$scope.mIndexStart=$scope.oldIndexStartDate ;
				return;
			}
			$scope.oldIndexStartDate=val
			//update index start date
			$scope.updateDateValue(val,$scope.vIndexStartDate,function(value){
			
					//update index end date
					$scope.evalEndDate();
					$scope.IndexEndDateMin=$scope.formatDate($scope.mConditionStart);
					
					//update condition start date
					$scope.mConditionStart=val;
					$scope.CondStartChange();
					
				});
		 
		 }
		 $scope.IndexEndChange=function(val){
		 
		 if(!$scope.isDate(val)){
				$scope.mIndexEnd=$scope.oldIndexEndDate;
				return;
			}
		 	$scope.oldIndexEndDate=val;
		 	$scope.updateDateValue($scope.mIndexEnd,$scope.vIndexEndDate);
		 
		 }
		 $scope.CondStartChange=function(val){
		 
		 	if(!$scope.isDate(val)){
				$scope.mConditionStart=$scope.oldCondStartDate;
				return;
			}
		 	$scope.oldCondStartDate=val;
			//update condition start date value in qlik
		 	  $scope.updateDateValue($scope.mConditionStart,$scope.vConditionStartDate);
			  //if cond start is after end, then set the end to start value.
			  if(new Date($scope.mConditionStart)>new Date($scope.mConditionEnd)){
			  		//set the model
					$scope.mConditionEnd=$scope.mConditionStart;
					//update the condition end date value in qlik
					 $scope.CondEndChange();
				}
				//set min date value for cond end.
				$scope.ConditionEndDateMin=$scope.formatDate($scope.mConditionStart);
		 
		 }
		 $scope.CondEndChange=function(val){
		 
		   if(!$scope.isDate(val)){
				 $scope.mConditionEnd=$scope.oldCondEndDate;
				  return;
			  }
		 
		 	$scope.oldCondEndDate= val;
			 $scope.updateDateValue($scope.mConditionEnd,$scope.vConditionEndDate);
		 
		 }
		 
		 
		 //===============================================
		*/
		 