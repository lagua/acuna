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
	
	var stripSingles = function(w,context) {
		if(w instanceof Word && w.args) {
			var dataword = false;
			for(var i=0;i<w.args.length;i++) {
				if(w.args[i] instanceof Array && w.args[i].length==1){
					var rest = w.args.slice(i+1);
					for(var j=0;j<rest.length;j++) {
						if(typeof rest[j]=="object" && rest[j] instanceof Word && context.data[rest[j].word]) {
							dataword = true;
							break;
						}
					}
					w.args[i] = w.args[i][0];
				} else if(w.args[i] instanceof Word) {
					stripSingles(w.args[i],context);
				}
			}
			if(dataword) w.args = [w.args];
		}
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
								lastwrd = new Word(p,defno,blockno,lineno,index,depth,[]);
								quot.push(lastwrd);
							}
						});
						return {
							quot:quot,
							depth:depth,
							line:lineno,
							word:lastwrd
						};
					});
					var quot = [];
					quots.forEach(function(q,i){
						if(!q) {
							quots[i-1].quot.slice(-1)[0].comma = true;
							return;
						}
						if(!q.depth) {
							quot = quot.concat(q.quot);
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
							def.blocks.push({
								quot:quot,
								block:blockno
							});
						}
					}
				});
			});
			return context;
		},
		define:function(context){
			/*for(var k in context.DEFINE) {
				var def = context.DEFINE[k];
				if(!def.USE.length) {
					if(def.words.length && !def.args.length) {
						// treat like args and parse
						context.data[k] = parser.parseData(new Word(k,0,0,0,0,0,def.words[0]))[k];
					} else {
						context.data[k] = def.args;
					}
					if(context.data[k].length == 1) context.data[k] = context.data[k][0];
				}
			}*/
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
							parser.define(context);
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
				// TODO use array for mixed content, object for anything else
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
		parseArgs:function(w,def,context) {
			var args = [];
			var checkWord = function(a) {
				if(isWord(a)) {
					if(context.resolvedWords[a.word]) {
						var f = context.resolvedWords[a.word];
						if(!a.args.length) return f;
						var fargs = parser.parseArgs(a,def,context);
						return function(stack,args,context) {
							return f(stack,lang.clone(fargs),context);
						}
					} else if(context.data[a.word]) {
						return parser.parseData(context.data[a.word], true);
					} else {
						// it's just an object
						return parser.parseData(a);
					}
				} else {
					if(isWord(a)) {
						for(var i=0;i<a.length;i++) {
							a[i] = checkWord(a[i]);
						}
					}
					return a;
				}
			};
			for(var i=0;i<w.args.length;i++) {
				args.push(checkWord(w.args[i]));
			}
			return args;
		},
		parseArgsToString:function(w,context,useContextData) {
			var args = [];
			var checkWord = function(a){
				if(isWord(a)) {
					if(context.data[a.word]) {
						var len = args.length;
						if(useContextData) {
							return "context.data."+a.word;
						} else {
							var data = parser.parseData(context.data[a.word], true);
							if(len && args[len-1] instanceof Array) {
								args[len-1].push(JSON.stringify(data));
							} else {
								args.push(JSON.stringify(data));
							}
						}
					} else {
						if(a.args.length) {
							return a.word+"("+parser.parseArgsToString(a,context,useContextData)+")";
						} else {
							return a.word;
						}
					}
				} else {
					if(isWord(a)) {
						for(var i=0;i<a.length;i++) {
							a[i] = checkWord(a[i]);
						}
					}
					return a;
				}
			}
			for(var i=0;i<w.args.length;i++) {
				args.push(checkWord(w.args[i]));
			}
			return args;
		},
		parseArgsToCSS:function(w,data) {
			var args = [];
			for(var i=0;i<w.args.length;i++) {
				var a = w.args[i];
				if(isWord(a)) {
					if(data[a.word]) {
						var len = args.length;
						if(len && args[len-1] instanceof Array) {
							args[len-1].push(data[a.word]);
						} else {
							args.push("context.data."+a.word);
						}
					} else {
						args.push([a.word,parser.parseArgsToString(a,data)]);
					}
				} else {
					args.push(a);
				}
			}
			return args;
		},
		parseQuot:function(quot,o,context){
			var mixed = false;
			var type = o.type;
			var obj = o.obj;
			var quotation = [];
			var newo;
			for(var i=0;i<quot.length;i++) {
				var a = quot[i];
				if(isWord(a)) {
					// - loop all args to find any resolved word
					// - does parent word expect quotation? is it object, resolvedWord?
					// - if parent uses args return array
					// - if parent expects quotation, push it to the stack
					// - if parent is object, create object
					// TODO:
					// collect function objects
					// check if functions spread over more lines
					// if so, preserve functions
					// else build quotation
					// parse args on same line different than on next lines
					// check first args on new lines and in quotations (push to stack)
					// or: what does a block (empty line) mean?
					// perhaps args should have metadata object too... (or something)
					// push block args to correct block!
					// treat args as array as long as not object!
					// NOTE same line args = args, other lines = pre_args
					var rw = lang.getObject(a.word,false,context.resolvedWords);
					var wo = parser.parseWord(a,context,true);
					if(rw) {
						type = "quot";
						var f = rw;
						//if(!a.args.length) {
							/*if(context.breakonwords && w.word!="bridge") {
								breakonwords.push({w:a,f:function(stack,context) {
									return f(stack,[],context);
								}});
								res = function(stack,args,context){
									console.log(arguments.callee.caller.toString())
									return stack;
								};
							} else {*/
								//res = f;
							//}
						//} else {
							//var fargs = wo && wo[a.word] ? wo[a.word] : {};
							//fargs = typeof fargs == "object" && fargs instanceof Object && !Object.size(fargs) ? [] : fargs;
							//fargs = fargs instanceof Array ? fargs : [fargs];
							/*if(context.breakonwords && w.word!="bridge") {
								mixed = true;
								breakonwords.push({w:a,f:function(stack,context) {
									return f(stack,[],context);
								}});
								res = function(stack,args,context){
									console.log(arguments.caller)
									return stack.concat(fargs.slice());
								}
							} else {
								res = function(stack,args,context) {
									return f(stack,fargs.slice(),context);
								};*/
							if(!a.args.length) {
								quotation.push({w:a.word,f:f});
							} else {
								var args = wo.args.slice(), pre_args = [], post_args = [];
								while(args.length) {
									var arg = args.pop();
									if(typeof arg == "object" || typeof arg == "function") {
										pre_args.unshift(arg);
									} else {
										post_args.unshift(arg);
									}
								}
								var fc = function(f,pre_args,args) {
									return function(stack,fargs,context) {
										stack = stack.concat(pre_args);
										stack = f(stack,args,context);
										return stack.concat(args);
									}
								}
								//var args2stack = context.DEFINE[a.word] && context.DEFINE[a.word].args2stack;
								//if(args2stack) pre_args = post_args.splice(0,args2stack).concat(pre_args);
								quotation.push({w:a.word,f:fc(f,pre_args,post_args)});
							}
							//}
						//}
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
					obj.push(a);
				}
			}
			if(quotation.length) {
				var f = function(pre_args) {
					return function(stack,args,context) {
						//stack = stack.concat(pre_args);
						quotation.forEach(function(q){
							stack = q.f(stack,args,context);
						});
						return stack;
					};
				};
				var q = quotation.length == 1 ? quotation.pop().f : f();
				obj.push(q);
			}
			return {obj:obj,type:type};
		},
		parseWord:function(w,context,child){
			var obj = {obj:[],type:"value"};
			var breakonwords = [];
			var quotation = [];
			var args = [], values = [];
			// use array for mixed content, object for anything else
			while(w.args.length) {
				var a = w.args.shift();
				// quotation
				if(a instanceof Array) {
					obj = parser.parseQuot(a,obj,context);
					if(obj.type== "value" && obj.obj.length) {
						args.push(obj.obj);
						obj.obj = [];
					}
				} else {
					args.push(a);
				}
			}
			if(obj.type=="quot") {
				if(obj.obj.length) args = args.concat(obj.obj);
			} else if(obj.type=="value") {
				if(values.length) args.push(values);
			} else {
				if(!(obj.obj instanceof Array) || obj.obj.length) args.push(obj.obj);
			}
			w.type = obj.type;
			w.args = args;
			//obj.breakonwords = breakonwords;
			return w;
		},
		words:function(context) {
			var f = function(word){
				var def = context.DEFINE[word];
				return function(stack,args,context){
					// TODO when to clear the stack?
					stack = def.args.length ? stack.concat(def.args[0]) : stack;
					if(def.args2stack) stack = stack.concat(args.splice(0,def.args2stack));
					// args2stack should be a hint, because args are not passed around!
					var breakonwords = [];
					array.forEach(def.blocks,function(block) {
						array.forEach(block.quot,function(w) {
							if(!isWord(w)) {
								stack.push(w);
							} else if(context.resolvedWords[w.word]) {
								//stripSingles(w,context);
								//args = parser.parseArgs(w,def,context);
								w = parser.parseWord(w,context);
								//var args = wo && wo[w.word] ? wo[w.word] : [];
								//args = typeof args == "object" && args instanceof Object && !Object.size(args) ? [] : args;
								//args = args instanceof Array ? args : [args];
								var args = w.args.slice(), pre_args = [], post_args = [];
								while(args.length) {
									var a = args.pop();
									if(typeof a == "object" || typeof a == "function") {
										pre_args.unshift(a);
									} else {
										post_args.unshift(a);
									}
								}
								if(context.DEFINE[w.word] && context.DEFINE[w.word].args2stack) {
									pre_args = post_args.splice(0,context.DEFINE[w.word].args2stack).concat(pre_args);
								}
								if(context.breakonwords) {
									var f = function(word,args){
										return function(stack,context) {
											stack = context.resolvedWords[word](stack,args,context,word);
											return stack;
										}
									};
									breakonwords.push({w:w,f:f(w.word,args)});
									//breakonwords = breakonwords.concat(wo.breakonwords);
								} else {
									var f = function(word,pre_args){
										return function(stack,args,context) {
											stack = stack.concat(pre_args);
											stack = context.resolvedWords[word](stack,args,context,word);
											return stack.concat(args);
										}
									};
									stack = f(w.word,pre_args)(stack,post_args,context);
								}
							}
						});
					});
					if(context.breakonwords) context.breakonwords = breakonwords.concat(context.breakonwords);
					return stack.concat(args.splice(0,args.length));
				}
			};
			for(var k in context.DEFINE) {
				if(context.DEFINE[k].blocks.length) context.resolvedWords[k] = f(k);
			}
			return context;
		},
		toCSS:function(context){
			var str = "";
			var context = parser.define(context);
			var data = {};
			for(var k in context.data) {
				data[k] = parser.parseData(context.data[k],true);
			}
			array.forEach(context.words,function(block,index) {
				array.forEach(block,function(w) {
					var args = parser.parseArgsToCSS(w,data);
					switch(w.word) {
						case "query":
						args = args.join(",");
						args = args.replace(/"/g,"");
						str += args + " {\n";
						break;
						
						case "style":
						for(var i=0;i<args.length;i++) {
							var s =args[i][0]+":"+args[i][1]+";\n";
							str += s.replace(/"/g,"");
						}
						break;
					}
				});
			});
			return str;
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
			if(options.useContextData) {
				for(var k in context.data) {
					data[k] = parser.parseData(context.data[k],true);
				}
			}
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
					} else {
						var nm = normalizeModule(m);
						mods.push(nm);
						/*var r = getResolved(m);
						var ri = r ? r.index : 0;
						var rargs = r ? r.targets[m].args : null;*/
						array.forEach(vocabs[m],function(w){
							/*var s = "'"+w+"':"
							if(r) s += "arguments["+ri+"]("
							s += "arguments["+i+"]";
							if(r) s += rargs ? ","+JSON.stringify(rargs)+")" : ")";
							s += "['"+w+"']";*/
							resolvedWords[w] = nm;
						});
					}
				}
				str += mods.join(",");
				str += "){\n\n";
				var t = "\t\t";
				for(var k in context.DEFINE) {
					def = context.DEFINE[k];
					if(k == context.exec || !def.words.length) continue;
					str += "\tvar "+k+" = function(stack,args,context){\n";
					if(def.args.length) str += t+"stack = stack.concat("+JSON.stringify(def.args[0])+");\n";
					if(def.args2stack) str += t+"stack = stack.concat(args.splice(0,"+def.args2stack+"));\n";
					array.forEach(def.words,function(block,index) {
						array.forEach(block,function(w) {
							stripSingles(w,context);
							var args = parser.parseArgsToString(w,context,options.useContextData);
							args = JSON.stringify(args);
							args = args.replace(/\\"/g,"@@");
							args = args.replace(/"/g,"").replace(/@@/g,'"');
							var f = resolvedWords[w.word] ? resolvedWords[w.word]+"['"+w.word+"']" : w.word;
							str += t+"stack = "+f+"(stack,"+args+",context);\n";
						});
					});
					str += t+"return stack.concat(args);\n";
					str += "\t};\n\n";
				}
				t = options.module ? "\t\t" : "\t";
				if(options.module) {
					str += "\treturn function(stack,args,context){\n";
				}
				if(def.args.length) str += t+"stack = stack.concat("+JSON.stringify(def.args[0])+");\n";
				if(def.args2stack) str += t+"stack = stack.concat(args.splice(0,"+def.args2stack+"));\n";
				array.forEach(def.words,function(block,index) {
					array.forEach(block,function(w) {
						stripSingles(w,context);
						var args = parser.parseArgsToString(w,context,options.useContextData);
						args = JSON.stringify(args);
						args = args.replace(/\\"/g,"@@");
						args = args.replace(/"/g,"").replace(/@@/g,'"');
						var f = resolvedWords[w.word] ? resolvedWords[w.word]+"['"+w.word+"']" : w.word;
						str += t+"stack = "+f+"(stack,"+args+",context);\n";
					});
				});
				str += t+"return stack.concat(args);\n";
				if(options.module) {
					str += "\t};\n";
				}
				
				str += "\n});";
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
				context = parser.define(context);
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
