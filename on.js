define([
"acuna/kernel/extended",
"dojo/on"
],function(extended,don){

return function(stack,args,context){
	stack = stack.concat(args.splice(0,2));
	stack = extended['dupdd'](stack,[false],context);
	stack = concat['bridge'](stack,[don],context);
	stack = stack.concat(args);
	return stack;
};

});