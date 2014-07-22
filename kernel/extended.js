define(["dojo/_base/lang","acuna/kernel","./math","./array"],
	function(lang,k,math,array){
	k = lang.mixin(k,math);
	k = lang.mixin(k,array);
	lang.mixin(k, {
		keep:function(__s,__c) {
			__s = k.dup(__s,__c);
			__s.push(k.apply);
			return k.dip(__s,__c);
		},
		negate:function(__s,__c){
			__s.push(k["not"]);
			return k.compose(__s,__c);
		},
		whilen:function(__s,__c){
			k.negate(__s,__c);
			return k["while"](__s,__c);
		},
		dec:function(__s,__c){
			__s.push(1);
			return k["-"](__s,__c);
		},
		eqz:function(__s,__c){
			__s.push(0);
			return k["eq"](__s,__c);
		},
		neqz:function(__s,__c){
			__s.push(0);
			return k["ne"](__s,__c);
		},
		repeat: function(__s,__c) {
			__s.push(function(__s,__c) {
				__s = k['dip'](__s,__c);
				__s = k['dec'](__s,__c);
				return __s;
			});
			__s = k['papply'](__s,__c);
			__s.push(function(__s,__c) {
				__s = k['dup'](__s,__c);
				__s = k['neqz'](__s,__c);
				return __s;
			});
			__s = k['while'](__s,__c);
			__s = k['pop'](__s,__c);
			return __s;
		},
		dd:function(__s,__c) {
			__s = k.dupd(__s,__c);
			return k.dip(__s,__c);
		},
		dupd:function(__s,__c) {
			__s.push(k.dup);
			return k.dip(__s,__c);
		},
		dupdd:function(__s,__c) {
			__s.push(k.dupd);
			return k.dip(__s,__c);
		},
		popd:function(__s,__c) {
			__s.push(k.pop);
			return k.dip(__s,__c);
		},
		swapd:function(__s,__c) {
			__s.push(k.swap);
			return k.dip(__s,__c);
		},
		over:function(__s,__c) {
			__s = k.dupd(__s,__c);
			return k.swap(__s,__c);
		},
		under:function(__s,__c) {
			__s = k.dup(__s,__c);
			return k.swapd(__s,__c);
		},
		under3:function(__s,__c) {
			// swap [under] dip swap
			__s = k.swap(__s,__c);
			__s.push(k.under);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		under4:function(__s,__c) {
			__s = k.swap(__s,__c);
			__s.push(k.under3);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		under5:function(__s,__c) {
			__s = k.swap(__s,__c);
			__s.push(k.under4);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		bury:function(__s,__c) {
			__s = k.swap(__s,__c);
			__s = k.swapd(__s,__c);
			return __s;
		},
		bury4:function(__s,__c) {
			__s = k.swap(__s,__c);
			__s.push(k.bury);
			return k.dip(__s,__c);
		},
		bury5:function(__s,__c) {
			__s = k.swap(__s,__c);
			__s.push(k.bury4);
			return k.dip(__s,__c);
		},
		dig:function(__s,__c) {
			__s = k.swapd(__s,__c);
			return k.swap(__s,__c);
		},
		dig4:function(__s,__c) {
			__s.push(k.dig);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		dig5:function(__s,__c) {
			__s.push(k.dig4);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		get2:function(__s,__c) {
			__s.push(k.dup);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		get3:function(__s,__c) {
			__s.push(k.get2);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		get4:function(__s,__c) {
			__s.push(k.get3);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		},
		get5:function(__s,__c) {
			__s.push(k.get4);
			__s = k.dip(__s,__c);
			return k.swap(__s,__c);
		}
	});
	return k;
});