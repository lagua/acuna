define([
"acuna/kernel/extended",
"dojo/dom-style"
],function(extended,domStyle){

return function(stack,args,context){
	stack = stack.concat(args.splice(0,2));
	stack = extended['dupdd'](stack,[],context);
	stack = extended['bridge'](stack,[domStyle.set],context);
	stack = extended['pop'](stack,[],context);
	stack = stack.concat(args);
	return stack;
};

});