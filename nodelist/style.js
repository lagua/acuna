define([
	"dojo/_base/lang",
	"dojo/_base/array",
	"dojo/dom-style"
],
	function(lang, array, domStyle){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	var arrayToObject = function(ar) {
		var o = {};
		array.forEach(ar,function(_){
			for(var k in _) {
				o[k] = _[k];
			}
		});
		return o;
	}
	
	acuna.style = function(stack,args,context){
		if(!args.length) return stack;
		var s = args.shift();
		var nodelist = stack.pop();
		array.forEach(nodelist,function(node){
			domStyle.set(node,s);
		});
		stack.push(nodelist);
		return stack;
	}
	
	return acuna.style;
});