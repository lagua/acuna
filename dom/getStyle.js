define([
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style"
],
	function(lang, array, domStyle){
	
	"use strict";

	var dom = lang.getObject("acuna.dom", true);
	
	dom.getStyle = function(stack,args,context){
		var x = stack.pop();
		var s = args.shift();
		var r = domStyle.get(x.domNode,s);
		r = r.indexOf("px") ? parseInt(r,10) : r;
		stack.push(r);
		stack = stack.concat(args);
		return stack;
	}
	
	return dom.getStyle;
});