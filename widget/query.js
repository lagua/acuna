define(["dojo/_base/lang", "dojo/_base/array", "dojo/selector/_loader!default", "dijit/registry", "dijit/_WidgetBase"],
	function(lang, array, defaultEngine, registry, _WidgetBase){
	
	"use strict";

	var widget = lang.getObject("acuna.widget", true);
	
	var query = function(stack,args,context) {
		var x = stack.pop();
		var nodelist = defaultEngine(args.shift(),x);
		var widgetlist = [];
		array.forEach(nodelist,function(node){
			var widget = registry.byNode(node);
			if(!widget && node.id) widget = registry.byId(node.id);
			if(!widget) {
				widget = new _WidgetBase(null,node);
				widget.startup();
			}
			widgetlist.push(widget);
		});
		stack.push(widgetlist);
		return stack;
	};
	
	widget.query = query;
	
	return query;
	
});
