define([
"dojo/_base/lang",
"dojo/_base/array",
"dojo/request",
"dojo/Deferred",
"dojo/json"
],function(lang,array,request,Deferred,JSON) {
	lang.getObject("acuna.kernel",true);
	
	Object.size = function(obj) {
	    var size = 0, key;
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) size++;
	    }
	    return size;
	};

	var isBool = function(n){
		return n==="true" || n==="false";
	};
	
	var isData = function(n) {
		return isBool(n) || isNumeric(n) || isString(n);
	};
	
	var isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	
	var isString = function(n) {
		return n.indexOf("\"") > -1;
	}
	
	var isWord = function(a) {
		return typeof a == "object" && a instanceof Word;
	};
	
	var normalizeModule = function(m) {
		var w = m.split("/").pop();
		return array.map(w.split("-"),function(_,i){
			return i===0 ? _ : _.charAt(0).toUpperCase() + _.substr(1);
		}).join("");
	};
	
	var Word = function(word,def,block,line,index,depth,args){
		this.word = word;
		this.def = def;
		this.block = block;
		this.line = line;
		this.index = index;
		this.depth = depth;
		this.args = args || [];
	};
	
	var inUse = function(def,word){
		for(var i=0;i<def.USE.length;i++){
			if(def.USE[i].args[1]==word) return true;
		}
	};
	
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
						line = line.replace(tabs,"");
						// split line on spaces, preserving anything between quotes
						var parts = line.match(/[^"\s]+|"(.*?)"/g);
						if(!parts) return;
						// search line parts
						var lastwrd;
						var quot = [];
						array.forEach(parts,function(p,index){
							if(isData(p)) {
								 var val = isBool(p) ?  eval(p) : isNumeric(p) ? parseFloat(p) : p.replace(/"/g,"");
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
					quots.forEach(function(q,i){
						if(!q) {
							var prev = quots[i-1].quot;
							if(prev) prev[prev.length-1].comma = true;
							return;
						}
						if(!q.depth) {
							// FIXME: what to do in which case?
							// is it tabular data?
							if(q.wordcount==0 && q.count) {
								quot.push(q.quot);
							} else {
								quot = quot.concat(q.quot);
							}
						} else {
							for(var j=i-1;j>=0;j--) {
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
							def.comments.concat(quot);
						} else {
							quot[quot.length-1].comma = true;
							def.args.push(quot);
						}
					}
				});
			});
			return context;
		},
		getModules:function(def){
			var use = [], modules = {};
			array.forEach(def.USE,function(u) {
				use = use.concat(u);
			});
			var lastuse;
			var getModuleByWord = function(word) {
				for(var k in modules) {
					if(modules[k].word==word) return k;
				}
			};
			var i = 0;
			array.forEach(use,function(u) {
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
								items = items.concat(array.map(m.context,function(item){
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
							context.resolvedWords[m.word] = a;
							modules[toResolve[i].module] = a;
						}
					}
					def.modules = modules;
					if(items.length) {
						all(array.map(items,function(item){
							return item.f(item.module,item.args);
						})).then(function(res){
							array.forEach(res,function(a,i){
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
				for(var i=0;i<w.args.length;i++) {
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
					var word = a.word.charAt(0) == "." ? a.word.substr(1) : a.word; 
					var rw = lang.getObject(word,false,context.resolvedWords);
					var wo = parser.parseWord(a,context,str);
					if(rw) {
						comma = comma || a.comma;
						type = "quot";
						var f = str ? (context.resolvedWords[a.word] != a.word ? context.resolvedWords[a.word] + "['"+a.word+"']" : a.word) : rw;
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
								var str = "function(__s,__a,__c) {\n";
								str += (args.length) ? "__a = "+JSON.stringify(args)+".concat(__a);\n" : "";
								str += pre_args.length ? "__s = __s.concat(["+pre_args.join(",")+"]);\n" : "";
								str += "__s = "+f+"(__s,__a,__c);\n";
								str += "return __s.concat(__a);\n";
								str += "}";
								return str;
							} : function(f,pre_args,args) {
								return function(stack,fargs,context) {
									stack = stack.concat(pre_args);
									stack = f(stack,args,context);
									return stack.concat(args);
								}
							};
							quotation.push(str ? "function:"+fc(f,pre_args,post_args) : fc(f,pre_args,post_args));
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
						obj = obj.concat(str ? array.map(w.args,function(_) {
							return _.substr(0,9)=="function:" ? _.substr(9) : _;
						}) : w.args);
					} else {
						obj.push(a);
					}
				}
			}
			return {obj:obj,type:type,quot:quotation,comma:comma};
		},
		createQuot: function(quotation){
			if(quotation.length) {
				var f = function() {
					return function(stack,args,context) {
						quotation.forEach(function(q){
							//console.log(q.toString())
							stack = q(stack,args,context);
						});
						return stack;
					};
				};
				return quotation.length == 1 ? quotation.pop() : f();
			}
		},
		createQuotStr: function(quotation){
			var str = "";
			if(quotation.length) {
				if(quotation.length > 1) {
					str += "function:function(__s,__a,__c) {\n";
					quotation.forEach(function(q){
						str += "__s = "+q.substr(9,q.length)+"(__s,__a,__c);\n";
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
					var w = parser.parseWord(context.DEFINE[k],context);
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
					var f = function(w,args2stack,quots,pre_args){
						return function(stack,args,context) {
							stack = stack.concat(pre_args);
							if(args2stack) stack = stack.concat(args.splice(0,args2stack));
							array.forEach(quots,function(q){
								//console.log(q.toString())
								stack = q(stack,[],context);
							});
							return stack;
						}
					};
					context.resolvedWords[k] = f(k,w.args2stack,quots,pre_args);
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
			array.forEach(context.DEFINE[context.exec].args,function(a){
				array.forEach(a,function(w){
					if(w.word == "style") {
						w = parser.parseWord(w,context);
						var obj = w.args[0];
						str += traverse(obj);
					}
				});
			});
			callback(str);
		},
		toJS:function(context,callback,options){
			options = options || {};
			var def = context.DEFINE[context.exec];
			var modules = parser.getModules(def);
			var reqs = [];
			var words = [];
			var vocabs = {};
			var requireVocabs = function(list,callback){
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
			var getResolved = function(t){
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
						array.forEach(vocabs[m],function(w){
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
						var f = function(args2stack,quots,pre_args){
							var str = "function(__s,__a,__c) {\n";
							str += pre_args.length ? "\t__s = __s.concat("+JSON.stringify(pre_args)+");\n" : "";
							str += args2stack ? "\t__s = __s.concat(__a.splice(0,"+args2stack+"));\n" : "";
							quots.forEach(function(q){
								//q = q.substr(0,9)=="function:" ? q.substr(9) : q;
								str += "\t__s = "+q+"(__s,[],__c);\n";
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
		execute:function(file,callback,direct,args,seed){
			seed = seed || {};
			var context = lang.mixin({
				DEFINE:{},
				modules:{},
				resolvedWords:{},
				data:{},
				blocks:{},
				stack:[]
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
						stack = context.resolvedWords[context.exec]([],args || [],context,context.exec);
					} else if(context.resolvedWords[context.exec]) {
						stack = context.resolvedWords[context.exec]([],args || [],context,context.exec);
					} else if(context.DEFINE[context.exec].args.length) {
						stack = context.DEFINE[context.exec].args[0];
					} else {
						stack = [];
					}
					context.stack = stack;
					if(callback) callback(context);
				});
			});
		}
	}
	
	acuna.kernel.parser = parser;
	
	return parser;
	
});
