define(["dojo/_base/lang"],
	function(lang){
	
	var kernel = lang.getObject("acuna.kernel", true);

	kernel.array = {};
	lang.mixin(kernel.array, {
		count: function(stack,context) {
			var l = stack.pop();
			stack.push(l.length);
			return stack;
		},
		get_at:function(stack,context) {
			var l = stack.pop();
			var p = stack.pop();
			return stack.concat([p[l]]);
		},
		set_at:function(stack,context) {
			var p,x;
			x = stack.pop();
			p = stack.pop();
			var l = stack.pop();
			l[p] = x;
			return stack.concat([l]);
		},
		get_at2:function(stack,context) {
			var p1, p2;
			p2 = stack.pop();
			p1 = stack.pop();
			var l = stack.pop();
			return stack.concat([l,l[p1][p2]]);
		},
		set_at2:function(stack,context) {
			var p1, p2, x;
			x = stack.pop();
			p2 = stack.pop();
			p1 = stack.pop();
			var l = stack.pop();
			l[p1][p2] = x;
			return stack.concat([l]);
		},
		for_each: function(stack,context){
			var f = stack.pop();
			var a = stack.pop();
			var tf = function(_){
				var lstack = stack.slice();
				lstack.push(_);
				lstack = f(lstack,context);
			};
			for(var i=0,l = a.length;i<l;i++) {
				tf(a[i]);
			}
			return stack;
		},
		map: function(stack,context){
			var f = stack.pop();
			var a = stack.pop();
			a = a.map(function(_){
				var lstack = stack.slice();
				lstack.push(_);
				lstack = f(lstack,context);
				var r = lstack.pop();
				return r;
			});
			stack.push(a);
			return stack;
		}
	});
	
	return kernel.array;

});