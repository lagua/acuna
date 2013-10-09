define(["dojo/_base/declare","dojo/_base/lang", "dojo/_base/array","dijit/registry"],
	function(declare,lang, array, registry){
	
	"use strict";

	var widget = lang.getObject("acuna.widget", true);

	var extend = function(stack,args,context) {
		var mixins = stack.pop();
		var nodes = stack.pop();
		nodes = array.map(nodes,function(node){
			var ref = node.domNode.nextElementSibling;
			var insertIndex = "before";
			if(!ref) {
				ref = node.domNode.parentNode;
				insertIndex = "last";
			}
			var params = lang.mixin(node.params || {}, params);
			var domNode = node.domNode;
			registry.remove(node.id);
			node.destroyRecursive(true);
			var style = domNode.style;
			domNode.innerHTML = "";
			var Widget = declare(mixins);
			node = new Widget(params,domNode);
			node.placeAt(ref,insertIndex);
			node.set("style",style);
			node.startup();
			return node;
		},this);
		
		stack.push(nodes);
		
		return stack;
	};
	
	widget.extend = extend;
	
	return extend;
	
});