define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";
	
	var filter = lang.getObject("acuna.filter", true);
	
	var lt = function(item,args,context) {
		return item[args[0]] < args[1];
	};
	
	filter.lt = lt;
	
	return lt;
	
});