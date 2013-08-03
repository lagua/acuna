define(["dojo/_base/lang", "dojo/_base/array", "dojo/selector/_loader!default", "dijit/registry", "dijit/_WidgetBase"],
	function(lang, array, defaultEngine, registry, _WidgetBase){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	var query = function(stack,args,context) {
		stack.pop();
		var nodelist = defaultEngine(args.shift());
		var widgetlist = [];
		array.forEach(nodelist,function(node){
			var widget = registry.byNode(node);
			if(!widget) {
				widget = new _WidgetBase({
					id:node.id
				},node);
				widget.startup();
			}
			widgetlist.push(widget);
		});
		stack = stack.concat(widgetlist);
		return stack;
	};
	
	acuna.query = query;
	
	return query;
	
});
