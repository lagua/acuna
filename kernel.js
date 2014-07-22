define(["dojo/_base/lang","dojo/Deferred"],
	function(lang,Deferred){
	
	var kernel = lang.getObject("acuna.kernel", true);
	var leave = false;
	
	if(!Object.keys) Object.keys = function(o) {
		if (o !== Object(o))
			throw new TypeError('Object.keys called on a non-object');
		var k=[],p;
		for (p in o) if (Object.prototype.hasOwnProperty.call(o,p)) k.push(p);
		return k;
	};
	
	var bridge = function(stack,context,obj){
		// the function to bridge
		var f = stack.pop();
		// should the bridge function receive args from the stack?
		var useargs = stack.pop();
		// number of arguments to use
		var l = stack.pop();
		if(!obj) obj = stack.pop();
		var fargs = l ? stack.splice(-l) : [];
		var lstack = stack.slice();
		fargs = fargs.map(function(_){
			if(typeof _ === "function") {
				function f(_){
					function ff() {
						if(useargs) lstack = lstack.concat(Array.prototype.slice.call(arguments));
						lstack = _(lstack,context);
					}
					return ff;
				};
				_ = f(_);
			}
			return _;
		});
		if(typeof f === "string") f = obj[f];
		var a = f.apply(obj,fargs);
		if(a!==undefined) stack.push(a);
		return stack;
	};
	
	function isNode(o){
	  return (
		typeof Node === "object" ? o instanceof Node : 
		o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	  );
	}
	
	function syntaxHighlight(json) {
		json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
			var cls = 'number';
			if (/^"/.test(match)) {
				if(/DOMNode@/.test(match)) {
					cls = "DOMNode";
					match = match.replace(/\"/g,"");
					match = match.replace("DOMNode@","");
					var ar = match.split("#");
					match = ar.length > 1 ? ar[0]+"<span class='boolean'>#"+ar[1]+"</span>" : ar[0];
				} else if (/:$/.test(match)) {
					match = match.replace(/\"/g,"");
					cls = 'key';
				} else if (/function\(\)/.test(match)) {
					match = match.replace(/\"/g,"");
					cls = "function";
				} else {
					cls = 'string';
				}
			} else if (/true|false/.test(match)) {
				cls = 'boolean';
			} else if (/null/.test(match)) {
				cls = 'null';
			}
			return '<span class="' + cls + '">' + match + '</span>';
		});
	}
	
	var operators = {
		"eq":function(x,y) { return x === y; },
		"ne":function(x,y) { return x !== y; },
		"gt":function(x,y) { return x > y; },
		"lt":function(x,y) { return x < y; },
		"and":function(x,y) { return x && y; },
		"or":function(x,y) { return x || y; },
		"gte":function(x,y) { return x >= y; },
		"lte":function(x,y) { return x <= y; }
	};
	
	var comp = function(op) {
		return function(stack,context) {
			var x = stack.pop();
			var y = stack.pop();
			stack.push(operators[op](x,y));
			return stack;
		}
	};
	
	for(var op in operators) {
		kernel[op] = comp(op);
	}
	
	lang.mixin(kernel, {
		test:function(stack,context){
			console.log(stack);
			return stack;
		},
		set_var:function(stack,context){
			var k = stack.pop();
			var v = stack.pop();
			context.vars[k] = v;
			return stack;
		},
		get_var:function(stack,context){
			var k = stack.pop();
			stack.push(context.vars[k]);
			return stack;
		},
		has_var:function(stack,context){
			var k = stack.pop();
			stack.push(context.vars.hasOwnProperty(k));
			return stack;
		},
		unset_var:function(stack,context) {
			var k = stack.pop();
			delete context.vars[k];
			return stack;
		},
		clear_stack:function(stack,context){
			context.stack = [];
			return [];
		},
		"call_global":function(stack,context){
			return bridge(stack,context,context.window);
		},
		"call":function(stack,context){
			return bridge(stack,context);
		},
		"new":function(stack,context){
			var c = stack.pop();
			stack.push(new c());
			return stack;
		},
		win:function(stack,context){
			stack.push(context.window);
			return stack;
		},
		doc:function(stack,context){
			stack.push(context.document);
			return stack;
		},
		current_context:function(stack,context){
			stack.push(context);
			return stack;
		},
		current_stack:function(stack,context){
			stack.push(context.stack);
			return stack;
		},
		nil:function(stack,context){
			stack.push([]);
			return stack;
		},
		cons:function(stack,context){
			var x = stack.pop();
			var a = stack.pop();
			a.push(x);
			stack.push(a);
			return stack;
		},
		uncons:function(stack,context) {
			var x = stack[stack.length-1].pop();
			stack.push(x);
			return stack;
		},
		clone:function(stack,context){
			var o = stack.pop();
			stack.push(lang.clone(o));
			return stack;
		},
		get_keys:function(stack,context){
			var o = stack.pop();
			stack.push(Object.keys(o));
			return stack;
		},
		get_values: function(stack,context){
			var o = stack.pop();
			var t = [];
			for(var k in o) {
				if(obj.hasOwnProperty(k)) t.push(o[k]);
			}
			stack.push(t);
			return stack;
		},
		noop:function(stack,context){
			return stack;
		},
		get:function(stack,context) {
			// get a property
			var p = stack.pop();
			var o = stack.pop();
			stack.push(o[p]);
			return stack;
		},
		set:function(stack,context) {
			// get a property
			var v = stack.pop();
			var p = stack.pop();
			var o = stack.pop();
			o[p]=v;
			return stack.concat([o,v]);
		},
		apply:function(stack,context) {
			var f = stack.pop();
			stack = f(stack,context);
			return stack;
		},
		papply:function(stack,context) {
			var t = stack.pop();
			var a = stack.pop();
			var f = function(t,a) {
				return function(stack,context) {
					stack.push(a);
					return t(stack,context);
				}
			}
			stack.push(f(t,a));
			return stack;
		},
		dup:function(stack,context) {
			var x = stack.pop();
			stack.push(x);
			stack.push(x);
			return stack;
		},
		pop:function(stack,context){
			stack.pop();
			return stack;
		},
		is_undef:function(stack,context){
			var v = stack.pop();
			stack.push(v===undefined);
			return stack;
		},
		is_null:function(stack,context){
			var v = stack.pop();
			stack.push(v===null);
			return stack;
		},
		swap:function(stack,context){
			var x = stack.pop();
			var y = stack.pop();
			stack.push(x);
			stack.push(y);
			return stack;
		},
		dip:function(stack,context){
			// quotation
			var f = stack.pop();
			var t = stack.pop();
			stack = f(stack,context);
			stack.push(t);
			return stack;
		},
		quot:function(stack,context) {
			var f = stack.pop();
			stack.push(f);
			return stack;
		},
		compose:function(stack,context){
			// quotation
			var a = stack.pop();
			var b = stack.pop();
			var f = function(a,b){
				return function(stack,context){
					stack = a(stack,context);
					return b(stack,context);
				}
			};
			stack.push(f(a,b));
			return stack;
		},
		leave:function(stack,context){
			leave = true;
			return stack;
		},
		"while":function(stack,context) {
			var t = stack.pop("function");
			var f = stack.pop("function");
			stack = t(stack,context);
			var b = stack.pop("boolean");
			while(b) {
				stack = f(stack,context);
				stack = t(stack,context);
				b = stack.pop("boolean");
			}
			return stack;
		},
		"for":function(stack,context) {
			var f = stack.pop();
			var l = stack.pop();
			var z = l;
			while(l--) {
				stack.push(z-l);
				stack = f(stack,context);
				if(leave) {
					leave = false;
					break;
				}
			}
			return stack;
		},
		"not":function(stack,context){
			var x = stack.pop("boolean");
			stack.push(!x);
			return stack;
		},
		if_true:function(stack,context){
			var f = stack.pop("function");
			var b = stack.pop("boolean");
			if(b!==true) return stack;
			return f(stack,context);
		},
		is_object:function(stack,context) {
			var t = stack[stack.length-1];
			stack.push(t && typeof t == "object" && !(t instanceof Array));
			return stack;
		},
		"throw":function(stack,context){
			alert("error: "+stack.pop());
			return stack;
		},
		"if":function(stack,context){
			var c = [];
			c[1] = stack.pop("function");
			c[0] = stack.pop("function");
			var b = stack.pop("boolean");
			b = true === b;
			var f = c[+b];
			return f(stack,context);
		},
		pretty_print:function(stack,context){
			var a = stack.pop();
			a = a.map(function(_){
				return syntaxHighlight(JSON.stringify(_,function(key, val) {
					if(typeof val == "function") {
						val = "function()";
					} else if(typeof val == "object") {
						if(isNode(val)) val = "DOMNode@"+val.nodeName.toLowerCase()+(val.id ? "#"+val.id : "")
					}
					return val;
				}));
			});
			stack.push(a);
			return stack;
		}
	});
	return kernel;
});