define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	var matho = lang.getObject("acuna.kernel.math", true);

	lang.mixin(matho, {
		neg:function(stack,context){
			stack.push(-stack.pop());
			return stack;
		}
	});
	var operators = {
		"+":function(x,y){ return x + y},
		"-":function(x,y){ return x - y},
		"*":function(x,y){ return x * y},
		"/":function(x,y){ return x / y},
		"%":function(x,y){ return x % y}
	};
	var mf = function(o) {
		return function(stack,context) {
			var x = stack.pop();
			var y = stack.pop();
			stack.push(operators[o](y,x));
			return stack;
		}
	};
	for(var o in operators){
		matho[o] = mf(o);
	}
	var math = Object.getOwnPropertyNames(Math);
	array.forEach(math,function(k){
		if(typeof Math[k] == "function") {
			var len = Math[k].length;
			if(!len){
				matho[k] = function(stack,context) {
					stack.push(Math[k]());
					return stack;
				}
			} else if(len==1){
				matho[k] = function(stack,context) {
					stack.push(Math[k](stack.pop()));
					return stack;
				}
			} else if(len==2){
				matho[k] = function(stack,context) {
					var x = Math[k](stack.pop(),stack.pop());
					stack.push(x);
					return stack;
				}
			}
		} else {
			matho[k] = function(stack,context) {
				stack.push(Math[k]);
				return stack;
			}
		}
	});
	return matho;
});