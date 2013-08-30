define(["dojo/_base/lang"],
	function(lang){
	
	"use strict";
	return {
		load: function(/*string*/ id, /*Function*/ require, /*Function*/ load){
			load((function(id){
				return window[id];
			})(id));
		}
	};
});
