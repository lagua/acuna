define(["dojo/_base/lang"],
	function(lang){
	
	var kernel = lang.getObject("kernel", true);

	kernel.array = {};
	lang.mixin(kernel.array, {
		count: function(stack,args,context) {
			var l = stack.pop();
			stack.push(l.length);
			return stack;
		},
		get_at:function(stack,args,context) {
			var l = stack.pop();
			var p = args.shift();
			return stack.concat([l,l[p]]);
		},
		set_at:function(stack,args,context) {
			var p,x;
			x = stack.pop();
			p = stack.pop();
			var l = stack.pop();
			l[p] = x;
			return stack.concat([l]);
		},
		get_at2:function(stack,args,context) {
			var p1, p2;
			p2 = stack.pop();
			p1 = stack.pop();
			var l = stack.pop();
			return stack.concat([l,l[p1][p2]]);
		},
		set_at2:function(stack,args,context) {
			var p1, p2, x;
			x = stack.pop();
			p2 = stack.pop();
			p1 = stack.pop();
			var l = stack.pop();
			l[p1][p2] = x;
			return stack.concat([l]);
		},
		forEach: function(stack,args,context){
			var f = stack.pop();
			var a = stack.pop();
			a.forEach(function(_){
				f([_],[],context);
			});
			return stack;
		},
		map: function(stack,args,context){
			var f = stack.pop();
			var a = stack.pop();
			a = a.map(function(_){
				return f([_],[],context).pop();
			});
			stack.push(a);
			return stack;
		}
	});
	
	return kernel.array;

});