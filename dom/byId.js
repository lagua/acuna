define([
	"dojo/_base/lang",
	"acuna/kernel/concat",
	"dojo/dom"
],
	function(lang, concat, ddom){
	
	"use strict";

	var dom = lang.getObject("acuna.dom", true);
	
	dom.byId = function(stack,args,context){
		stack = stack.concat(args.splice(0,1));
		stack.push(ddom.byId(stack.pop(),context.document));
		stack = stack.concat(args.splice(0,args.length));
		return stack;
	}
	
	return dom.byId;
});