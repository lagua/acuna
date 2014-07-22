define([
"dojo/_base/lang",
"dojo/request",
"dojo/Deferred",
"dojo/json",
//"mori/mori"
],function(lang,request,Deferred,JSON/*,mori*/) {
	
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};
	
	/*var oriPop = Array.prototype.pop;
	var oriPush = Array.prototype.push;
	
	Array.prototype.pop = function(t) {
		if(!this.length) throw new Error("Stack underflow occurred.");
		var x = oriPop.apply(this,arguments);
		if(!t) return x;
		var xt = typeof x;
		if(xt !== t) throw new Error("The required type is a "+t+". Value on the stack is a "+xt+".");
		return x;
	};
	
	Array.prototype.push = function() {
		oriPush.apply(this,arguments);
	};*/

	function isBool(n){
		return n==="true" || n==="false";
	};
	
	function isNull(n){
		return n==="null";
	};
	
	function isData(n) {
		return isBool(n) || isNumeric(n) || isString(n) || isNull(n);
	};
	
	function isNumeric(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	
	function isString(n) {
		return n.indexOf("\"") > -1;
	}
	
	function isWord(a) {
		return typeof a == "object" && a instanceof Word;
	};
	
	function normalizeModule(m) {
		var w = m.split("/").pop();
		return w.split("-").map(function(_,i){
			return i===0 ? _ : _.charAt(0).toUpperCase() + _.substr(1);
		}).join("");
	};
	
	function Word(word,def,block,line,index,depth,args){
		this.word = word;
		this.def = def;
		this.block = block;
		this.line = line;
		this.index = index;
		this.depth = depth;
		this.args = args || [];
	};
	
	function inUse(def,word){
		for(var i=0;i<def.USE.length;i++){
			if(def.USE[i].args[1]==word) return true;
		}
	};
	
	function recurse(s,a,c){ console.log(s); return s; };
	
	var parser = {
		parse:function(context,string,path,preserveData){
			string = string.replace(/\r\n/g,"\n");
			string = string.replace(/ {4}/g,"\t");
			var file = path.substring(path.lastIndexOf("/")+1);
			var ar = file.split(/\./g);
			var ext = ar.pop();
			var defWord = ar.join(".");
			var defblocks = string.split(/(?:\n){3,}?/g);
			var useWord;
			context.string = string;
			defblocks.reverse();
			defblocks.forEach(function(defblock,defno){
				var word, def;
				// search each block in una string
				defblock.split(/(?!\n{2,}\t)\n{2,}?/g).forEach(function(block,blockno,blocks){
					var words = [];
					var first = block.match(/^\S+/);
					// DEFINE should only happen once per block
					// in other words: each block MUST start with DEFINE
					if(first instanceof Array && first.length) first = first[0]; 
					var target = first && first.toUpperCase()=="DEFINE" || first.toUpperCase()=="USE" ? first.toUpperCase() : "";
					// word block
					var quots = [];
					if(target=="DEFINE" && blockno==0) {
						var ar = block.split(/\n/);
						var l = ar.shift();
						var parts = l.match(/[^"\s]+|"(.*?)"/g);
						block = ar.join("\n");
						// if defWord exists the string is loaded from an external file
						if(parts[1]) {
							useWord = parts[1].replace(/"/g,"");
						} else {
							useWord = defWord || "exec";
							if(!context.exec) context.exec = useWord;
						}
						if(useWord) {
							context.blocks[useWord] = defblock;
							word = new Word(useWord,defno,0,0,0,0,[]);
							word.path = path;
							word.exec = !parts[1];
							word.file = file;
							word.ext = ext;
							word.words = [];
							word.comments = [];
							word.USE = [];
							word.resolvedWords = {};
							word.blocks = [];
							if(parts[2] && isNumeric(parts[2])) word.args2stack = parseInt(parts[2],10);
							context.DEFINE[useWord] = def = parent = word;
						}
					}
					if(!block) return;
					if(blockno>word.block) word = def;
					var parent;
					// search each line
					quots = block.split(/\n/).map(function(line,lineno,lines){
						// capture nesting
						var wordcount = 0;
						var tmatch = line.match(/^\t+/g);
						var tabs = tmatch && tmatch.length>0 ? tmatch[0] : null;
						// count tabs
						var depth = tabs ? tabs.match(/\t/g).length : 0;
						line = tabs ? line.replace(tabs,"") : line;
						line = line.replace(/\\"/g,"&quot;");
						// split line on spaces, preserving anything between quotes
						var parts = line.match(/[^"\s]+|"(.*?)"/g);
						if(!parts) return;
						// search line parts
						var lastwrd;
						var quot = [];
						parts.forEach(function(p,index){
							if(isData(p)) {
								 var val = isBool(p) || isNull(p) ?  eval(p) : isNumeric(p) ? parseFloat(p) : p.replace(/"/g,"").replace(/&quot;/g,"\"").replace(/\\n/g,"\n").replace(/\\t/g,"\t");
								 if(lastwrd) {
									 lastwrd.args.push(val);
								 } else {
									 quot.push(val);
								 }
							} else {
								wordcount++;
								lastwrd = new Word(p,defno,blockno,lineno,index,depth,[]);
								quot.push(lastwrd);
							}
						});
						return {
							quot:quot,
							depth:depth,
							line:lineno,
							word:lastwrd,
							count:parts.length,
							wordcount:wordcount
						};
					});
					var quot = [];
					var singledata = true;
					quots.forEach(function(q,i){
						var j;
						if(!q) {
							j = i-1;
							var prev = quots[j];
							var next = quots[i+1];
							while(j>0 && (!prev || next.depth!=prev.depth)) {
								j--;
								prev = quots[j];
							}
							if(prev && prev.quot) prev.quot[prev.quot.length-1].comma = true;
							return;
						}
						if(q.wordcount) singledata = false;
						if(!q.depth) {
							// FIXME: what to do in which case?
							// is it tabular data?
							// all just data: tabular
							// single line of data, mixed content: array
							if(q.wordcount==0 && q.count && quots.length > 1) {
								singledata = false;
								quot.push(q.quot);
							} else {
								quot = quot.concat(q.quot);
							}
						} else {
							for(j=i-1;j>=0;j--) {
								var tq = quots[j];
								if(!tq) continue;
								if(tq.depth==q.depth-1) {
									if(tq.word) {
										tq.word.args.push(q.quot);
									} else {
										quot.push(q.quot);
									}
									break;
								}
							}
						}
					});
					if(quot.length) {
						if(target=="USE") {
							def.USE = def.USE.concat(quot);
						} else if(target=="DEFINE") {
							def.comments = def.comments.concat(quot);
						} else {
							//if(quot.length>1) quot[quot.length-1].comma = true;
							if(singledata) {
								def.args = def.args.concat(quot);
							} else {
								def.args.push(quot);
							}
						}
					}
				});
			});
			return context;
		},
		getModules:function(def){
			var use = [], modules = {};
			def.USE.forEach(function(u) {
				use = use.concat(u);
			});
			var lastuse;
			function getModuleByWord(word) {
				for(var k in modules) {
					if(modules[k].word==word) return k;
				}
			};
			var i = 0;
			use.forEach(function(u) {
				var m;
				if(u.word.toUpperCase()!="USE") {
					m = getModuleByWord(u.word);
					if(modules[m]){
						modules[m].targets[lastuse.args[0]] = {
							args:u.args
						};
					}
				} else {
					m = u.args[0];
					var ext = m.split("\.").pop();
					if(ext=="una") m = "dojo/text!" + m;
					modules[m] = {
						word:u.args[1],
						module:m,
						ext:ext,
						index:i,
						targets:{},
						context:[]
					};
					i++;
					lastuse = u;
				}
			});
			return modules;
		},
		use:function(context,callback){
			var def = context.DEFINE[context.exec];
			var modules = parser.getModules(def);
			var reqs = [];
			for(var m in modules) {
				if(Object.size(modules[m].targets)>0) reqs.push(m);
			}
			// pre-require reqs
			require(reqs,function(){
				var m;
				// replace targets
				for(var i=0;i<arguments.length;i++) {
					var r = modules[reqs[i]];
					for(m in r.targets) {
						modules[m].context.push({
							f:arguments[i],
							args:r.targets[m].args
						});
					}
				}
				reqs = [];
				var toResolve = [];
				for(m in modules) {
					toResolve.push({
						module:m
					});
					reqs.push(m);
				}
				require(reqs,function(){
					var items = [];
					for(var i=0;i<arguments.length;i++) {
						m = modules[toResolve[i].module];
						var a = arguments[i];
						if(m.ext=="una") {
							context = parser.parse(context,a,m.module,false);
							modules[toResolve[i].module] = context.DEFINE[m.word];
						} else if(typeof a != "function" && !m.word) {
							if(m.context.length) {
								items = items.concat(m.context.map(function(item){
									if(item.f) {
										item.module = a;
										item.index = i;
										return item;
									}
								}));
							} else {
								lang.mixin(context.resolvedWords,a);
							}
						} else {
							function mf(a) {
								function mff(stack,context) {
									stack.push(a);
									return stack;
								};
								return mff;
							};
							// in case we want to wrap objects
							context.resolvedWords[m.word] = a; //mf(a);
							modules[toResolve[i].module] = a;
						}
					}
					def.modules = modules;
					if(items.length) {
						all(items.map(function(item){
							return item.f(item.module,item.args);
						})).then(function(res){
							res.forEach(function(a,i){
								var m = toResolve[items[i].index].module;
								lang.mixin(context.resolvedWords,a);
								def.modules[m] = items[i].module;
							});
							if(callback) callback(context);
						});
					} else {
						if(callback) callback(context);
					}
				});
			});
		},
		parseData:function(w,root) {
			if(typeof w == "object" && w instanceof Word) {
				var obj = {};
				var mixed = false;
				obj[w.word] = {};
				var keys = [];
				// use array for mixed content, object for anything else
				for(var i=0,l=w.args.length;i<l;i++) {
					var a = w.args[i];
					
					var key = a.word;
					mixed = mixed || keys.indexOf(key)>-1;
					
					var res = parser.parseData(a);
					
					mixed = mixed || (typeof res != "object" && w.args.length > 1);
					
					keys.push(key);
					
					if(mixed) {
						if(!(obj[w.word] instanceof Array)) {
							if(typeof obj[w.word] != "object") {
								obj[w.word] = [obj[w.word]];
							} else {
								var o = lang.clone(obj[w.word]);
								obj[w.word] = [];
								for(var k in o) {
									var newo = {};
									newo[k] = o[k];
									obj[w.word].push(newo);
								}
							}
						}
						obj[w.word].push(res);
					} else {
						obj[w.word] = res instanceof Object ? lang.mixin(obj[w.word],res) : res;
					}
				}
				return root ? [obj] : obj;
			} else {
				return w;
			}
		},
		parseQuot:function(quot,o,context,str){
			var mixed = false;
			var type = o.type;
			var obj = o.obj;
			var quotation = o.quot;
			var comma = false;
			var newo;
			for(var i=0;i<quot.length;i++) {
				var a = quot[i];
				if(isWord(a)) {
					var rec = false;
					var word = a.word.charAt(0) == "." ? a.word.substr(1) : a.word; 
					var rw = lang.getObject(word,false,context.resolvedWords);
					var wo = parser.parseWord(a,context,str);
					// allow recursion / ignore parsing order
					if(!rw && context.DEFINE[word]) {
						rec = true;
					}
					if(rw ||rec) {
						comma = comma || a.comma;
						type = "quot";
						var f = str ? (context.resolvedWords[a.word] != a.word ? context.resolvedWords[a.word] + "['"+a.word+"']" : a.word) : rw;
						if(rec) {
							f = new Function("return function "+a.word+"(){};")();
							console.log(a.word,f)
						}
						if(!a.args.length && !obj.length) {
							quotation.push(str ? "function:"+f : f);
						} else {
							var args = wo.args.slice(), pre_args = obj.splice(0,obj.length), post_args = [];
							while(args.length) {
								var arg = args.pop();
								if(typeof arg == "object" || typeof arg == "function" || (str && typeof arg == "string" && arg.substr(0,9)=="function:")) {
									if(str) {
										arg = typeof arg == "string" && arg.substr(0,9)=="function:" ? arg.substr(9) : JSON.stringify(arg);
									}
									pre_args.push(arg);	
								} else {
									post_args.unshift(arg);
								}
							}
							var fc = str ? function(f,pre_args,args) {
								var str = "function(__s,__c) {\n";
								str += pre_args.length ? "__s = __s.concat(["+pre_args.join(",")+"]);\n" : "";
								str += "__s = "+f+"(__s,__c);\n";
								str += (args.length) ? "__s = __s.concat("+JSON.stringify(args)+");\n" : "";
								str += "return __s;\n";
								str += "}";
								return str;
							} : function(f,pre_args,args) {
								function ff(stack,context) {
									stack = stack.concat(pre_args);
									stack = context.resolvedWords[f](stack,context);
									return stack.concat(args);
								}
								return ff;
							};
							quotation.push(str ? "function:"+fc(f,pre_args,post_args) : fc(a.word,pre_args,post_args));
						}
					} else {
						type = "object";
						var key = a.word;
						mixed = mixed || (obj instanceof Array && obj.length) || (key && obj[key]);
						
						var res = wo.args.length > 1 ? wo.args : wo.args[0];
						
						if(mixed) {
							if(!(obj instanceof Array)) {
								var o = lang.clone(obj);
								obj = [];
								for(var k in o) {
									newo = {};
									newo[k] = o[k];
									obj.push(newo);
								}
							}
							newo = {};
							newo[key] = res;
							obj.push(newo);
						} else {
							if(obj instanceof Array) obj = {};
							obj[key] = res;
						}
					}
				} else {
					if(!(obj instanceof Array)) obj = [obj];
					if(a instanceof Array) {
						var w = parser.parseWord({
							args:[a]
						},context,str)
						obj = obj.concat(str ? w.args.map(function(_) {
							return _.substr(0,9)=="function:" ? _.substr(9) : _;
						}) : w.args);
					} else {
						obj.push(a);
					}
				}
			}
			return {obj:obj,type:type,quot:quotation,comma:comma};
		},
		createQuot: function(quot){
			if(quot.length) {
				function f() {
					function ff(stack,context) {
						for(var i=0,l=quot.length;i<l;i++) {
							//console.log(q.toString())
							var q = quot[i];
							//if(q.name && context.resolvedWords[q.name]) {
							//	stack = context.resolvedWords[q.name](stack,context);
							//} else {
								stack = q(stack,context);
							//}
						}
						return stack;
					};
					return ff;
				};
				return quot.length == 1 ? quot.pop() : f();
			}
		},
		createQuotStr: function(quotation){
			var str = "";
			if(quotation.length) {
				if(quotation.length > 1) {
					str += "function:function(__s,__c) {\n";
					quotation.forEach(function(q){
						str += "__s = "+q.substr(9,q.length)+"(__s,__c);\n";
					});
					str += "return __s;\n";
					str += "}";
				} else {
					str += quotation.pop();
				}
			}
			return str;
		},
		parseWord:function(w,context,str){
			var obj = {obj:[],type:"value",quot:[],comma:false};
			var breakonwords = [];
			var quotation = [];
			var args = [], values = [];
			// use array for mixed content, object for anything else
			while(w.args.length) {
				var a = w.args.shift();
				// quotation
				if(a instanceof Array) {
					obj = parser.parseQuot(a,obj,context,str);
					if(obj.type== "value" && obj.obj.length) {
						args.push(obj.obj);
						obj.obj = [];
					}
					if(obj.type=="quot" && obj.comma) {
						var q = str ? parser.createQuotStr(obj.quot) : parser.createQuot(obj.quot);
						if(q) args.push(q);
						obj.quot = [], obj.obj = [];
						obj.comma = false;
					}
				} else {
					args.push(a);
				}
			}
			if(obj.type=="quot") {
				var q = str ? parser.createQuotStr(obj.quot) : parser.createQuot(obj.quot);
				if(q) args.push(q);
			} else if(obj.type=="value") {
				if(values.length) args.push(values);
			} else {
				if(!(obj.obj instanceof Array) || obj.obj.length) args.push(obj.obj);
			}
			w.type = obj.type;
			w.args = args;
			return w;
		},
		words:function(context) {
			for(var k in context.DEFINE) {
				if(context.DEFINE[k].args.length) {
					var w = parser.parseWord(context.DEFINE[k],context,false,true);
					var args = w.args.slice(), pre_args = [], post_args = [];
					var quots = [];
					while(args.length) {
						var a = args.pop();
						if(typeof a =="function") {
							quots.unshift(a);
						} else {
							pre_args.unshift(a);
						}
					}
					function f(w,quots,pre_args){
						function ff(stack,context) {
							stack = stack.concat(pre_args);
							for(var i=0,l = quots.length;i<l;i++) {
								//console.log(q.toString())
								stack = quots[i](stack,context);
							}
							return stack;
						}
						return ff;
					};
					context.resolvedWords[k] = f(k,quots,pre_args);
				}
			}
			return context;
		},
		toCSS:function(context,callback){
			function hasObj(obj) {
			    for(var k in obj) return (typeof obj[k] == "object");
			}
			function stringify(obj) {
			    return JSON.stringify(obj,function(key, val){
					if(key) {
						return val + ";";
					}
					return val;
				},4).replace(/\"|,/g,"")+"\n";
			}
			function traverse(obj) {
				var str = "";
			    for(var k in obj) {
			        if(hasObj(obj[k])) {
			            for(var k2 in obj[k]) {
			                str += k + " " + k2 + " {\n";
			                str += traverse(obj[k][k2]);
			                str += "}\n\n";
			            }
			        } else {
			            str += k + " ";
			            str += stringify(obj[k]);
			            str += "\n";
			        }
			    }
			    return str;
			}
			var str = "";
			context.DEFINE[context.exec].args.forEach(function(a){
				a.forEach(function(w){
					if(w.word == "style") {
						w = parser.parseWord(w,context);
						var obj = w.args[0];
						str += traverse(obj);
					}
				});
			});
			callback(str);
		},
		toJS:function(file,callback,direct,args,seed,options){
			seed = seed || {};
			options = options || {};
			var context = lang.mixin({
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				vars:{},
				stack:[],
				document:document,
				window:window
			},seed);
			var d = new Deferred();
			if(direct) {
				d.resolve(direct);
			} else {
				d = request.get(file);
			}
			d.then(function(result){
				context = parser.parse(context,result,file);
				var def = context.DEFINE[context.exec];
				var modules = parser.getModules(def);
				var reqs = [];
				var words = [];
				function requireVocabs(list,callback){
					var result = {};
					if(!list.length && callback) callback();
					require(list,function(){
						for(var i=0;i<list.length;i++) {
							result[list[i]] = [];
							for(var k in arguments[i]) {
								result[list[i]].push(k);
							}
						}
						if(callback) callback(result);
					});
				};
				var vocabs = [];
				var data = {};
				/*if(options.useContextData) {
					for(var k in context.data) {
						data[k] = parser.parseData(context.data[k],true);
					}
				}*/
				for(m in modules) {
					if(!modules[m].word) {
						vocabs.push(m);
					}
					reqs.push('"'+m+'"');
				}
				function getResolved(t){
					for(var m in modules) {
						if(modules[m].targets[t]) return modules[m];
					}
				}
				requireVocabs(vocabs,function(vocabs){
					var str = options.module ? "define" : "require";
					str += "([\n\t"+reqs.join(",\n\t")+"\n],function(";
					var resolvedWords = {};
					var mods = [];
					for(m in modules) {
						var i = modules[m].index;
						var w = modules[m].word;
						if(w) {
							mods.push(w);
							context.resolvedWords[w] = w;
						} else {
							var nm = normalizeModule(m);
							mods.push(nm);
							vocabs[m].forEach(function(w){
								context.resolvedWords[w] = nm;
							});
						}
					}
					str += mods.join(",");
					str += "){\n\n";
					var t = "\t\t";
					for(var k in context.DEFINE) {
						if(context.DEFINE[k].args.length) {
							var w = parser.parseWord(context.DEFINE[k],context,true);
							var args = w.args.slice(), pre_args = [], post_args = [];
							var quots = [];
							while(args.length) {
								var a = args.pop();
								if(typeof a =="string") {
									a = a.substr(0,9) == "function:" ? a.substr(9) : a;
									quots.unshift(a);
								} else {
									pre_args.unshift(a);
								}
							}
							function f(args2stack,quots,pre_args){
								var str = "function(__s,__c) {\n";
								str += pre_args.length ? "\t__s = __s.concat("+JSON.stringify(pre_args)+");\n" : "";
								//str += args2stack ? "\t__s = __s.concat(__a.splice(0,"+args2stack+"));\n" : "";
								quots.forEach(function(q){
									//q = q.substr(0,9)=="function:" ? q.substr(9) : q;
									str += "\t__s = "+q+"(__s,__c);\n";
								});
								str += "\treturn __s;\n";
								str += "};\n";
								return str;
							};
							context.resolvedWords[k] = k;
							str += "var "+k+" = "+f(w.args2stack,quots,pre_args);
							str += k==context.exec ? "return "+k+";\n" : "";
						}
					}
					str += "});";
					if(callback) callback(str);
				});
			});
		},
		load:function(file,callback,preserveData){
			var context = {
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				stack:[]
			};
			request.get(file).then(function(result){
				context = parser.parse(context,result,file,preserveData);
				if(callback) callback(context);
			});
		},
		nextword:function(context,callback){
			var w = context.breakonwords.shift();
			console.log(w.w.word)
			parser.onWord(w.w);
			var stack = context.stack;
			stack = w.f(stack,context);
			context.stack = stack;
			if(callback) {
				callback(context);
			}
		},
		onWord:function(w){
		},
		createContext:function(file,seed) {
			seed = seed || {};
			var d = new Deferred();
			var context = lang.mixin({
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				vars:{},
				stack:[],
				document:document,
				window:window
			},seed);
			request.get(file).then(function(result){
				context = parser.parse(context,result,file);
				context = parser.use(context,function(context){
					context = parser.words(context);
					if(context.resolvedWords[context.exec]) {
						context.stack = context.resolvedWords[context.exec]([],context,context.exec);
					}
					d.resolve(context);
				},function(err){
					d.reject(err);
				});
			});
			return d;
		},
		executeOnContext:function(context,result){
			var exec = context.DEFINE[context.exec];
			context = parser.parse(context,result,exec.path);
			context = parser.words(context);
			context.stack = context.resolvedWords[context.exec](context.stack,context,context.exec);
			console.log(context.stack)
		},
		execute:function(file,callback,direct,seed){
			seed = seed || {};
			var context = lang.mixin({
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				vars:{},
				stack:[],
				document:document,
				window:window
			},seed);
			var d = new Deferred();
			if(direct) {
				d.resolve(direct);
			} else {
				d = request.get(file);
			}
			d.then(function(result){
				context = parser.parse(context,result,file);
				context = parser.use(context,function(context){
					context = parser.words(context);
					if(context.breakonwords) {
						console.log(context.exec);
						stack = context.resolvedWords[context.exec](context.stack,context,context.exec);
					} else if(context.resolvedWords[context.exec]) {
						stack = context.resolvedWords[context.exec](context.stack,context,context.exec);
					}
					if(callback) callback(context);
				});
			},function(err){
				alert(err);
			});
		}
	}
	
	return parser;
	
});
