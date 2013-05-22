define(["dojo/_base/lang", "dojo/on"],
	function(lang, on){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	acuna.on = function(stack,args,context) {
		var item = stack.pop();
		var evt = args.pop();
		var f = evt.pop();
		var type = evt.pop();
		if(!context._handles) context._handles = [];
		context.handles.push(item.on(type,lang.hitch(f));
		return [item];
	}
	
	return acuna.on;
	
});
