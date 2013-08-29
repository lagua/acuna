define([
	"dojo/_base/lang",
	"acuna/kernel/concat",
	"dojo/dom"
],
	function(lang, concat, ddom){
	
	"use strict";

	var dom = lang.getObject("acuna.dom", true);
	
	dom.byId = function(stack,args,context){
		var x = args.shift();
		stack.push(ddom.byId(x,ddom.byId("body").contentDocument));
		return stack;
	}
	
	return dom.byId;
});