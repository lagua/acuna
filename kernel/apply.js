define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	lang.getObject("acuna.kernel", true);

	var toFunc = function(stack,args,context) {
		if(!args) return;
		if(typeof args[0]=="function") {
			return function(){
				args[0](stack,args[1],context);
			};
		} else {
			stack = [args[0]];
			for(var i=0;i<args.length;i++) {
				args[i] = args[i] instanceof Array ? toFunc(stack,args[i],context) : args[i];
			}
			return args;
		}
	}
	var apply = function(stack,args,context){
		array.forEach(stack,function(item){
			var args = toFunc(null,item[1],context);
			item[0].apply(null,args[0]);
		});
	}
	
	acuna.kernel.apply = apply;
	
	return apply;
	
});