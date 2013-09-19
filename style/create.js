define([ "dojo/_base/lang","dojo/json" ], function(lang,JSON) {
	var style = lang.getObject("acuna.style", true);
	
	var insert = function(a,context) {
		var style = context.document.documentElement.appendChild(context.document.createElement("style"));
	    style.sheet.insertRule(a, 0);
	};
	
	style.create = function(stack,args,context){
		var x = stack.pop();
		var step = "{\n";
		while (x instanceof Object) {
			for(var k in x) {
				step += k+":"+x[k]+";\n";
			}
			x = stack.pop();
		}
		insert(x+" "+step+"}",context);
		return stack;
	};
	
	return style.create;
	
});