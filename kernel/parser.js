define([
"dojo/_base/lang",
"dojo/_base/array",
"dojo/request",
"dojo/json"
],function(lang,array,request,JSON) {
	lang.getObject("acuna.kernel",true);
	
	var isNumeric = function(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	};
	
	var Word = function(word,depth,args){
		this.word = word;
		this.depth = depth;
		this.args = args;
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
	
	var parser = {
		parse:function(s,path,preserveData){
			var file = path.substring(path.lastIndexOf("/")+1);
			var ar = file.split(/\./g);
			var ext = ar.pop();
			var word = ar.join(".");
			var context = {
				path:path,
				file:file,
				word:word,
				ext:ext,
				DEFINE:[],
				USE:[],
				modules:{},
				resolvedWords:{},
				result:[],
				words:[],
				data:{},
				datablocks:{}
			};
			s.split(/(?:\r\n){2,}?/g).forEach(function(b){
				var first = b.match(/^\S+/);
				var target = (first[0]=="DEFINE" || first[0]=="USE") ? first[0] : "words";
				// word block
				var curdepth;
				var words = [];
				var parent,word;
				var endword;
				if(target=="DEFINE") {
					var ar = b.split(/\r\n/);
					var l = ar.shift();
					var parts = l.match(/[^"\s]+|"(.*?)"/g);
					if(parts[1])
					context.datablocks[parts[1].replace(/"/g,"")] = ar.join("\n");
				}
				b.split(/\r\n/).forEach(function(l){
					// capture nesting
					var tmatch = l.match(/^\t+/g);
					var tabs = tmatch && tmatch.length>0 ? tmatch[0] : null;
					var depth = tabs ? tabs.match(/\t/g).length : 0;
					l = l.replace(tabs,"");
					var parts = l.match(/[^"\s]+|"(.*?)"/g);
					if(!parts) return;
					var f = parts[0];
					/*
					var data = array.filter(parts,function(p){
						return p.indexOf("\"")>-1 || isNumeric(p);
					});
					*/
					array.forEach(parts,function(p,index){
						if(p.indexOf("\"")==-1 && !isNumeric(p)) {
							word = new Word(p,depth,[]);
							var leftword = parts[index-1] ? parts[index-1] : null;
							leftword = leftword && leftword.indexOf("\"")==-1 && !isNumeric(leftword);
							if(!leftword && endword && depth>curdepth) {
								parent = endword;
								parent.args.push(word);
							} else if(parent && depth>0) {
								parent.args.push(word);
							} else {
								parent = word;
								words.push(word);
							}
							if(index==0 && endword) endword = false;
							if(p=="DEFINE" || index==parts.length-1) {
								endword = word;
								if(p=="DEFINE") word.args.push([]);
							}
						} else {
							// consider new lines
							// and first word && depth=0
							var val = preserveData && target == "words" ? p : isNumeric(p) ? parseFloat(p) : p.replace(/"/g,"");
							var atDepth = function(ar,d,val) {
								for(var i=0;i<d;i++) {
									var len = ar.length;
									if(!len) {
										ar.push([]);
										len = 1;
									}
									ar = ar[len-1];
								}
								ar.push(val);
							} 
							if(!endword) {
								word.args.push(val);
							} else {
								var wlen = word.args.length;
								if(depth<2 || !wlen) {
									if(depth<curdepth) {
										// we started adding data so continue
										// should be same as depth<curdepth
										atDepth(word.args[wlen-1],depth-1,val);
									} else {
										if(index==0) word.args.push([]);
										wlen = word.args.length;
										word.args[wlen-1].push(val);
									}
								} else {
									if(index==0) word.args[wlen-1].push([]);
									atDepth(word.args[wlen-1],depth-1,val);
								}
							}
						}
					});
					curdepth = depth;
				});
				context[target].push(words);
			});
			return context;
		},
		define:function(context){
			array.forEach(context.DEFINE,function(d) {
				if(d.length>1) {
					context.data[d[0].args[0]] = d[1];
				} else {
					// if first array is empty it's self
					// else it is data
					if(d[0].args[0].length>0) {
						var data = d[0].args.pop();
						if(data instanceof Array && data.length==1) data = data[0];
						context.data[d[0].args[0]] = data;
					}
				}
			});
			return context;
		},
		getModules:function(context){
			var use = [], modules = {};
			array.forEach(context.USE,function(u) {
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
				if(u.word!="USE") {
					m = getModuleByWord(u.word);
					if(modules[m]){
						modules[m].targets[lastuse.args[0]] = {
							args:u.args
						};
					}
				} else {
					m = u.args[0];
					modules[m] = {
						word:u.args[1],
						module:m,
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
		use:function(context,callback) {
			var modules = parser.getModules(context);
			var reqs = [];
			for(var m in modules) {
				if(m.targets.length) reqs.push(m);
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
					for(var i=0;i<arguments.length;i++) {
						m = modules[toResolve[i].module];
						var a = arguments[i];
						// vocabulary!
						if(typeof a != "function" && !m.word) {
							array.forEach(m.context,function(item){
								if(item.f) {
									a = item.f(a,item.args);
								}
							});
							lang.mixin(context.resolvedWords,a);
						} else {
							context.resolvedWords[m.word] = a;
						}
						modules[toResolve[i].module] = a;
					}
					context.modules = modules;
					if(callback) callback(context);
				});
			});
		},
		parseData:function(w,root) {
			if(typeof w == "object" && w instanceof Word) {
				var obj = {};
				obj[w.word] = {};
				for(var i=0;i<w.args.length;i++) {
					var a = w.args[i];
					var res = parser.parseData(a);
					obj[w.word] = res instanceof Object ? lang.mixin(obj[w.word],res) : res;
				}
				return root ? [obj] : obj;
			} else {
				return w;
			}
		},
		parseArgs:function(w,context) {
			var args = [];
			var checkWord = function(a) {
				if(typeof a == "object" && a instanceof Word) {
					if(context.resolvedWords[a.word]) {
						return [context.resolvedWords[a.word],parser.parseArgs(a,context)];
					} else if(context.data[a.word]) {
						return parser.parseData(context.data[a.word], true);
					}
				} else {
					if(typeof a == "object" && a instanceof Array) {
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
				if(typeof a == "object" && a instanceof Word) {
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
						return ["words['"+a.word+"']",parser.parseArgsToString(a,context,useContextData)];
					}
				} else {
					if(typeof a == "object" && a instanceof Array) {
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
				if(typeof a == "object" && a instanceof Word) {
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
		words:function(context) {
			var use = [];
			// words array is a chain
			var stack = [];
			array.forEach(context.words,function(block) {
				array.forEach(block,function(w) {
					stripSingles(w,context);
					var args = parser.parseArgs(w,context);
					var f = context.resolvedWords[w.word];
					if(f) {
						stack = f(stack,args,context);
					}
				});
				context.stack = stack;
			});
			return stack;
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
			var context = parser.define(context);
			var modules = parser.getModules(context);
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
			var jscontext = {
				path:context.path,
				file:context.file,
				word:context.word,
				ext:context.ext,
				data:data
			};
			var getResolved = function(t){
				for(var m in modules) {
					if(modules[m].targets[t]) return modules[m];
				}
			}
			requireVocabs(vocabs,function(vocabs){
				var str = options.module ? "define" : "require";
				str += "([\n"+reqs.join(",\n")+"\n],function(){\n\n";
				var resolvedWords = [];
				for(m in modules) {
					var i = modules[m].index;
					var w = modules[m].word;
					if(w) {
						resolvedWords.push("'"+w+"':arguments["+i+"]");
					} else {
						var r = getResolved(m);
						var ri = r ? r.index : 0;
						var rargs = r ? r.targets[m].args : null;
						array.forEach(vocabs[m],function(w){
							var s = "'"+w+"':"
							if(r) s += "arguments["+ri+"]("
							s += "arguments["+i+"]";
							if(r) s += rargs ? ","+JSON.stringify(rargs)+")" : ")";
							s += "['"+w+"']";
							resolvedWords.push(s);
						});
					}
					//var v =  s.target.args[0].split(/\//g).pop();
					//str += "\""+v+"\":"+s.word+"("+v+",[\""+s.args.join("\",\"")+"\"]);\n";
				}
				str += "var words = {\n"+resolvedWords.join(",\n")+"\n};\n\n";
				if(options.module) str += "return function(stack,args,remotecontext){\n";
				str += "var context = "+JSON.stringify(jscontext,undefined,2)+";\n";
				str += "var stack = [];\n";
				
				array.forEach(context.words,function(block,index) {
					array.forEach(block,function(w) {
						stripSingles(w,context);
						var args = parser.parseArgsToString(w,context,options.useContextData);
						args = JSON.stringify(args);
						args = args.replace(/\\"/g,"@@");
						args = args.replace(/"/g,"").replace(/@@/g,'"');
						var f = w.word;
						str += "stack = words['"+f+"'](stack,"+args+",context);\n";
					});
					str += "context.stack = stack;\n";
				});
				if(options.module) {
					str += "return stack;\n";
					str += "};\n";
				}
				str += "\n});";
				if(callback) callback(str);
			});
		},
		load:function(file,callback,preserveData){
			request.get(file).then(function(result){
				var context = parser.parse(result,file,preserveData);
				if(callback) callback(context);
			});
		},
		execute:function(file,callback){
			var context = {};
			request.get(file).then(function(result){
				var context = parser.parse(result,file);
				context = parser.define(context);
				context = parser.use(context,function(context){
					stack = parser.words(context);
					if(callback) callback(context);
				});
			});
		}
	}
	
	acuna.kernel.parser = parser;
	
	return parser;
	
});