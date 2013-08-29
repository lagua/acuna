define(["dojo/_base/lang", "dojo/_base/array", "dojo/selector/_loader!default", "dijit/registry", "dijit/_WidgetBase"],
	function(lang, array, defaultEngine, registry, _WidgetBase){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	var query = function(stack,args,context) {
		var x = stack.pop();
		x = x && x.nodeName && x.nodeName.toLowerCase()=="body" ? x : document.body;
		var q = args.shift();
		var nodelist = defaultEngine(q,x);
		stack.push(nodelist);
		return stack;
	};
	
	acuna.query = query;
	
	return query;
	
});
