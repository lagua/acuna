define([
	"acuna/kernel",
	"acuna/kernel/math"
],function(kernel,math){

var dbl = function(__s,__a,__c) {
	__s = function(__s,__a,__c) {
__s = kernel['dup'](__s,__a,__c);
__s = math['+'](__s,__a,__c);
return __s;
}(__s,[],__c);
	return __s;
};
var concat = function(__s,__a,__c) {
	__s = function(__s,__a,__c) {
__s = function(__s,__a,__c) {
__a = [7].concat(__a);
__s = __s.concat([3,4]);
__s = math['max'](__s,__a,__c);
return __s.concat(__a);
}(__s,__a,__c);
__s = math['neg'](__s,__a,__c);
__s = dbl(__s,__a,__c);
__s = math['+'](__s,__a,__c);
return __s;
}(__s,[],__c);
	return __s;
};
return concat;
});