define(["dojo/_base/lang", "dojo/_base/array"],
	function(lang, array){
	
	"use strict";

	var kernel = lang.getObject("acuna.kernel", true);

	lang.mixin(kernel, {
		forEach: function(stack,args,context){
			var f = stack.pop();
			var a = stack.pop();
			var lstack = stack.slice();
			array.forEach(a,function(_){
				lstack = f(lstack.concat(_),[],context);
			});
			return stack;
		},
		concat: function(stack,args,context) {
			var x = stack.pop();
			var y = stack.pop();
			stack.push(y.concat(x));
			return stack;
		},
		map: function(stack,args,context){
			var f = stack.pop();
			var a = stack.pop();
			var lstack = stack.slice();
			stack.push(array.map(a,function(_){
				lstack = f(lstack.concat(_),[],context);
				return lstack.pop();
			}));
			return stack;
		},
		reverse: function(stack,args,context) {
			var x = stack.pop();
			x.reverse();
			stack.push(x);
			return stack;
		}
	});
	
	return kernel;

});