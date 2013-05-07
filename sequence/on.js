define(["dojo/_base/lang", "dojo/_base/array", "dojo/on", "acuna/sequence/merge", "acuna/sequence/each"],
	function(lang, array, on, merge, each){
	
	"use strict";

	var seq = lang.getObject("acuna.sequence", true);
	
	var defer = function(stack,args,context) {
		console.log("defer",stack)
		return function(){
			args[0](stack,args[1],context);
		};
	}
	
	seq.on = function(stack,args,context) {
		stack = merge(stack,args,context);
		stack = each(stack,[on],context);
		return stack;
	}
	
	/*seq.on = function(stack,args,context){
		// mylistener is function, eg style
		// style expects list, style array and context
		var eventName = args[0].toString();
		var mylistener = args[1];
		stack = array.map(stack,function(item){
			var listener = function(e){
				mylistener[0]([item],mylistener[1],context);
			};
			return on(item.domNode, eventName, listener);;
		});
		context.stack = stack;
		return stack;
	};*/
	
	return seq.on;
	
});
