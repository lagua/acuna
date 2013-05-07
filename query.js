define(["dojo/_base/lang", "dojo/_base/array", "dojo/selector/_loader!default", "dijit/registry", "dijit/_WidgetBase"],
	function(lang, array, defaultEngine, registry, _WidgetBase){
	
	"use strict";

	var acuna = lang.getObject("acuna", true);
	
	var query = function(context,args) {
		var q = args[0];
		var nodelist = defaultEngine(q);
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
		return widgetlist;
	};
	
	acuna.query = query;
	
	return query;
	
});
