define(["dojo/_base/lang", "dojo/dom-construct"],
	function(lang, domConstruct){
	
	"use strict";

	var markup = lang.getObject("acuna.markup", true);
	
	var traverse = function(name,obj,parent){
		var attrs = {};
		if(obj instanceof Array) {
			var ar = [];
			obj.forEach(function(_){
				_ = typeof _ == "object" ? _ : {"#text":_};
				ar.push(traverse(name,_,parent));
			});
			ar.forEach(function(_,i){
				if(i>0) domConstruct.place(ar[i].firstChild,ar[0]);
			});
			return ar[0];
		}
		for(var k in obj) {
			if(k.charAt(0)=="@") {
				var attr = k.replace("@","");
				attrs[attr] = obj[k];
				delete obj[k];
			}
		}
		var elm = domConstruct.create(name,attrs,parent);
		for(var k in obj) {
			var v = obj[k];
			if(k=="#text") {
				elm.appendChild(document.createTextNode(v));
			} else {
				if(typeof v=="string") v = {"#text":v};
				traverse(k,v,elm);
			}
		}
		return elm;
	}
	
	markup.html = function(stack,args,context) {
		stack.push(traverse("body",args));
		domConstruct.place(stack[0],document.body,"replace");
		return stack;
	}
	
	return markup.html;
	
});
