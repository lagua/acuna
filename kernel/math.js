define(["dojo/_base/lang","dojo/_base/array"],
	function(lang,array){
	
	var matho = lang.getObject("acuna.kernel.math", true);

	lang.mixin(matho, {
		neg:function(stack,args,context){
			stack.push(-stack.pop());
			return stack;
		}
	});
	var operators = ["+","-","*","/","%"];
	array.forEach(operators,function(o){
		matho[o] = function(stack,args,context) {
			var x = stack.pop();
			var y = stack.pop();
			stack.push(eval("y"+o+"x"));
			return stack;
		}
	});
	var math = Object.getOwnPropertyNames(Math);
	array.forEach(math,function(k){
		if(typeof Math[k] == "function") {
			var len = Math[k].length;
			if(len==1){
				matho[k] = function(stack,args,context) {
					stack.push(Math[k](stack.pop()));
					return stack;
				}
			} else if(len==2){
				matho[k] = function(stack,args,context) {
					var x = Math[k](stack.pop(),stack.pop());
					stack.push(x);
					return stack;
				}
			}
		} else {
			matho[k] = function(stack,args,context) {
				stack.push(Math[k]);
				return stack;
			}
		}
	});
	return matho;
});