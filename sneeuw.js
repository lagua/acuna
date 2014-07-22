define([ "acuna/kernel/extended" ], function(extended) {

	function new_object(__s, __c) {
		__s = extended.win(__s, __c);
		__s.push("Object");
		__s = extended.get(__s, __c);
		__s = extended['new'](__s, __c);
		return __s;
	}

	function interval(__s, __c) {
		__s = extended.swap(__s, __c);
		__s = __s.concat([ 2, false, "setInterval" ]);
		__s = extended['call_global'](__s, __c);
		__s = extended['pop'](__s, __c);
		return __s;
	}

	function by_id(__s, __c) {
		__s = extended.doc(__s, __c);
		__s = __s.concat([ 1, false, "getElementById" ]);
		__s = extended['call'](__s, __c);
		return __s;
	}

	function body(__s, __c) {
		__s = extended.doc(__s, __c);
		__s.push("body");
		__s = extended.get(__s, __c);
		return __s;
	}

	function get_ctx(__s,__c) {
		__s = __s.concat(["2d"]);
		__s = canvas(__s,__c);
		__s = __s.concat([1,false,"getContext"]);
		__s = extended['call'](__s,__c);
		return __s;
	}
	
	function ctx(__s,__c) {
		__s = __s.concat(["_ctx"]);
		__s = extended['get_var'](__s,__c);
		return __s;
	}
	
	function canvas(__s,__c) {
		__s = __s.concat(["_canvas"]);
		__s = extended['get_var'](__s,__c);
		return __s;
	}

	function teken_sneeuw(__s1, __c) {
		var __s = __s1.concat([ 0, 0 ]);
		__s = canvas(__s, __c);
		__s.push("width");
		__s = extended.get(__s, __c);
		__s = canvas(__s,__c);
		__s.push("height");
		__s = extended.get(__s, __c);
		__s = ctx(__s, __c);
		__s = __s.concat([ 4, false, "clearRect" ]);
		__s = extended['call'](__s, __c);
		__s = ctx(__s, __c);
		__s = __s.concat([ "fillStyle", "rgba(255, 255, 255, 0.8)" ]);
		__s = extended.set(__s, __c);
		__s = extended['pop'](__s, __c);
		__s = __s.concat([ 0, false, "beginPath" ]);
		__s = extended['call'](__s, __c);
		__s = extended.dup(__s, __c);
		__s = __s.concat([ function(__s1, __c) {
			var __s = extended.dup(__s1, __c);
			__s.push("x");
			__s = extended.get(__s, __c);
			__s = extended.get2(__s, __c);
			__s.push("y");
			__s = extended.get(__s, __c);
			__s = ctx(__s, __c);
			__s = __s.concat([ 2, false, "moveTo" ]);
			__s = extended['call'](__s, __c);
			__s = extended.dup(__s, __c);
			__s.push("x");
			__s = extended.get(__s, __c);
			__s = extended.get2(__s, __c);
			__s.push("y");
			__s = extended.get(__s, __c);
			__s = extended.dig(__s, __c);
			__s.push("r");
			__s = extended.get(__s, __c);
			__s.push(0);
			__s = extended.PI(__s, __c);
			__s.push(2);
			__s = extended['*'](__s, __c);
			__s.push(true);
			__s = ctx(__s, __c);
			__s = __s.concat([ 6, false, "arc" ]);
			__s = extended['call'](__s, __c);
			return __s;
		} ]);
		__s = extended['for_each'](__s, __c);
		__s = ctx(__s, __c);
		__s = __s.concat([ 0, false, "fill" ]);
		__s = extended['call'](__s, __c);
		return __s;
	}
	function update_sneeuw(__s1, __c) {
		var __s = __s1.concat([ 0.01 ]);
		__s = extended['+'](__s, __c);
		__s = extended.swap(__s, __c);
		__s = extended.dup(__s, __c);
		__s = __s.concat([ function(__s1, __c) {
			var __s = extended.dup(__s1, __c);
			__s.push("d");
			__s = extended.get(__s, __c);
			__s = extended.get4(__s, __c);
			__s = extended['+'](__s, __c);
			__s = extended.cos(__s, __c);
			__s.push(1);
			__s = extended['+'](__s, __c);
			__s = extended.get2(__s, __c);
			__s.push("r");
			__s = extended.get(__s, __c);
			__s.push(2);
			__s = extended['/'](__s, __c);
			__s = extended['+'](__s, __c);
			__s = extended.get2(__s, __c);
			__s.push("y");
			__s = extended.get(__s, __c);
			__s = extended['+'](__s, __c);
			__s.push("y");
			__s = extended.swap(__s, __c);
			__s = extended.set(__s, __c);
			__s = __s.concat([ function(__s1, __c) {
				var __s = __s1;
				__s = extended.dup(__s, __c);
				__s.push("x");
				__s = extended.get(__s, __c);
				__s = extended.get4(__s, __c);
				__s = extended.sin(__s, __c);
				__s.push(2);
				__s = extended['*'](__s, __c);
				__s = extended['+'](__s, __c);
				__s.push("x");
				__s = extended.swap(__s, __c);
				__s = extended.set(__s, __c);
				return __s;
			} ]);
			__s = extended.dip(__s, __c);
			__s = canvas(__s,__c);
			__s.push("width");
			__s = extended.get(__s, __c);
			__s = canvas(__s,__c);
			__s.push("height");
			__s = extended.get(__s, __c);
			__s = extended.get2(__s, __c);
			__s.push(5);
			__s = extended['+'](__s, __c);
			__s = extended.get5(__s, __c);
			__s = extended.gt(__s, __c);
			__s = extended.dig5(__s, __c);
			__s.push(5);
			__s = extended.neg(__s, __c);
			__s = extended.swap(__s, __c);
			__s = extended.lt(__s, __c);
			__s = extended.or(__s, __c);
			__s = extended.get2(__s, __c);
			__s = extended.dig5(__s, __c);
			__s = extended.gt(__s, __c);
			__s = extended.or(__s, __c);
			__s = __s.concat([ function(__s1, __c) {
				var __s = __s1;
				__s = extended['pop'](__s, __c);
				__s = extended.random(__s, __c);
				__s = extended['*'](__s, __c);
				__s.push("x");
				__s = extended.swap(__s, __c);
				__s = extended.set(__s, __c);
				__s = extended['pop'](__s, __c);
				__s = __s.concat([ "y", -10 ]);
				__s = extended.set(__s, __c);
				__s = extended['pop'](__s, __c);
				return __s;
			} ]);
			__s = extended.if_true(__s, __c);
			return __s;
		} ]);
		__s = extended['for_each'](__s, __c);
		__s = teken_sneeuw(__s, __c);
		__s = extended.swap(__s, __c);
		return __s;
	}
	function sneeuw(__s1, __c) {
		var __s = __s1;
		__s.push("canvas");
		__s = by_id(__s, __c);
		__s.push("_canvas");
		__s = extended['set_var'](__s,__c);
		__s = get_ctx(__s, __c);
		__s.push("_ctx");
		__s = extended['set_var'](__s,__c);
		__s = canvas(__s,__c);
		__s.push("offsetWidth");
		__s = extended.get(__s, __c);
		__s = canvas(__s,__c);
		__s.push("width");
		__s = extended.dig(__s, __c);
		__s = extended.set(__s, __c);
		__s = extended['swap'](__s,__c);
		__s.push("offsetHeight");
		__s = extended.get(__s, __c);
		__s = canvas(__s,__c);
		__s.push("height");
		__s = extended.dig(__s, __c);
		__s = extended.set(__s, __c);
		__s = extended['swap'](__s,__c);
		__s = extended['pop'](__s,__c);
		__s = extended.nil(__s, __c);
		__s.push(1500);
		__s = __s.concat([ function(__s, __c) {
			__s = extended['pop'](__s, __c);
			__s = new_object(__s, __c);
			__s = extended.get4(__s, __c);
			__s = extended.random(__s, __c);
			__s = extended['*'](__s, __c);
			__s.push("x");
			__s = extended.swap(__s, __c);
			__s = extended.set(__s, __c);
			__s = extended['pop'](__s, __c);
			__s = extended.get3(__s, __c);
			__s = extended.random(__s, __c);
			__s = extended['*'](__s, __c);
			__s.push("y");
			__s = extended.swap(__s, __c);
			__s = extended.set(__s, __c);
			__s = extended['pop'](__s, __c);
			__s.push(5);
			__s = extended.random(__s, __c);
			__s = extended['*'](__s, __c);
			__s.push("r");
			__s = extended.swap(__s, __c);
			__s = extended.set(__s, __c);
			__s = extended['pop'](__s, __c);
			__s.push(1500);
			__s = extended.random(__s, __c);
			__s = extended['*'](__s, __c);
			__s.push("d");
			__s = extended.swap(__s, __c);
			__s = extended.set(__s, __c);
			__s = extended['pop'](__s, __c);
			__s = extended.cons(__s, __c);
			return __s;
		} ]);
		__s = extended['for'](__s, __c);
		__s = extended.bury(__s, __c);
		__s = extended['pop'](__s, __c);
		__s = extended['pop'](__s, __c);
		__s = teken_sneeuw(__s, __c);
		__s = __s.concat([ 0, 1000, 60 ]);
		__s = extended['/'](__s, __c);
		__s.push(update_sneeuw);
		__s = interval(__s, __c);
		return __s;
	}

	return sneeuw;
});