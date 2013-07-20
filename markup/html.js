define(["dojo/_base/lang", "dojo/dom-construct"],
	function(lang, domConstruct){
	
	"use strict";

	var markup = lang.getObject("acuna.markup", true);
	
	var traverse = function(name,obj,parent){
		var attrs = {};
		for(var k in obj) {
			if(k.charAt(0)=="@") {
				var attr = k.replace("@","");
				attrs[attr] = obj[k];
				delete obj[k];
			}
		}
		var elm = domConstruct.create(name,attrs,parent);
		for(var k in obj) {
		 if(k=="#text") {
				elm.appendChild(document.createTextNode(obj[k]));
			} else {
			traverse(k,obj[k],elm);
			}
		}
		return elm;
	}
	
	markup.html = function(stack,args,context) {
		stack.push(traverse("body",args[0]).firstCild);
		return stack;
	}
	
	return markup.html;
	
});
