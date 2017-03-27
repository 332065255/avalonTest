/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/*!
built in 2017-1-4:13:4 version 2.2.4 by 司徒正美
https://github.com/RubyLouvre/avalon/tree/2.2.3

修正IE下 orderBy BUG
更改下载Promise的提示
修复avalon.modern 在Proxy 模式下使用ms-for 循环对象时出错的BUG
修复effect内部传参 BUG
重构ms-validate的绑定事件的机制

*/(function (global, factory) {
     true ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.avalon = factory();
})(this, function () {
    'use strict';

    var win = typeof window === 'object' ? window : typeof global === 'object' ? global : {};

    var inBrowser = !!win.location && win.navigator;
    /* istanbul ignore if  */

    var document$1 = inBrowser ? win.document : {
        createElement: Object,
        createElementNS: Object,
        documentElement: 'xx',
        contains: Boolean
    };
    var root = inBrowser ? document$1.documentElement : {
        outerHTML: 'x'
    };

    var versions = {
        objectobject: 7, //IE7-8
        objectundefined: 6, //IE6
        undefinedfunction: NaN, // other modern browsers
        undefinedobject: NaN };
    /* istanbul ignore next  */
    var msie = document$1.documentMode || versions[typeof document$1.all + typeof XMLHttpRequest];

    var modern = /NaN|undefined/.test(msie) || msie > 8;

    /*
     https://github.com/rsms/js-lru
     entry             entry             entry             entry        
     ______            ______            ______            ______       
     | head |.newer => |      |.newer => |      |.newer => | tail |      
     |  A   |          |  B   |          |  C   |          |  D   |      
     |______| <= older.|______| <= older.|______| <= older.|______|      
     
     removed  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  <--  added 
     */
    function Cache(maxLength) {
        // 标识当前缓存数组的大小
        this.size = 0;
        // 标识缓存数组能达到的最大长度
        this.limit = maxLength;
        //  head（最不常用的项），tail（最常用的项）全部初始化为undefined

        this.head = this.tail = void 0;
        this._keymap = {};
    }

    Cache.prototype = {
        put: function put(key, value) {
            var entry = {
                key: key,
                value: value
            };
            this._keymap[key] = entry;
            if (this.tail) {
                // 如果存在tail（缓存数组的长度不为0），将tail指向新的 entry
                this.tail.newer = entry;
                entry.older = this.tail;
            } else {
                // 如果缓存数组的长度为0，将head指向新的entry
                this.head = entry;
            }
            this.tail = entry;
            // 如果缓存数组达到上限，则先删除 head 指向的缓存对象
            /* istanbul ignore if */
            if (this.size === this.limit) {
                this.shift();
            } else {
                this.size++;
            }
            return value;
        },
        shift: function shift() {
            /* istanbul ignore next */
            var entry = this.head;
            /* istanbul ignore if */
            if (entry) {
                // 删除 head ，并改变指向
                this.head = this.head.newer;
                // 同步更新 _keymap 里面的属性值
                this.head.older = entry.newer = entry.older = this._keymap[entry.key] = void 0;
                delete this._keymap[entry.key]; //#1029
                // 同步更新 缓存数组的长度
                this.size--;
            }
        },
        get: function get(key) {
            var entry = this._keymap[key];
            // 如果查找不到含有`key`这个属性的缓存对象
            if (entry === void 0) return;
            // 如果查找到的缓存对象已经是 tail (最近使用过的)
            /* istanbul ignore if */
            if (entry === this.tail) {
                return entry.value;
            }
            // HEAD--------------TAIL
            //   <.older   .newer>
            //  <--- add direction --
            //   A  B  C  <D>  E
            if (entry.newer) {
                // 处理 newer 指向
                if (entry === this.head) {
                    // 如果查找到的缓存对象是 head (最近最少使用过的)
                    // 则将 head 指向原 head 的 newer 所指向的缓存对象
                    this.head = entry.newer;
                }
                // 将所查找的缓存对象的下一级的 older 指向所查找的缓存对象的older所指向的值
                // 例如：A B C D E
                // 如果查找到的是D，那么将E指向C，不再指向D
                entry.newer.older = entry.older; // C <-- E.
            }
            if (entry.older) {
                // 处理 older 指向
                // 如果查找到的是D，那么C指向E，不再指向D
                entry.older.newer = entry.newer; // C. --> E
            }
            // 处理所查找到的对象的 newer 以及 older 指向
            entry.newer = void 0; // D --x
            // older指向之前使用过的变量，即D指向E
            entry.older = this.tail; // D. --> E
            if (this.tail) {
                // 将E的newer指向D
                this.tail.newer = entry; // E. <-- D
            }
            // 改变 tail 为D 
            this.tail = entry;
            return entry.value;
        }
    };

    var delayCompile = {};

    var directives = {};

    function directive(name, opts) {
        if (directives[name]) {
            avalon.warn(name, 'directive have defined! ');
        }
        directives[name] = opts;
        if (!opts.update) {
            opts.update = function () {};
        }
        if (opts.delay) {
            delayCompile[name] = 1;
        }
        return opts;
    }

    function delayCompileNodes(dirs) {
        for (var i in delayCompile) {
            if ('ms-' + i in dirs) {
                return true;
            }
        }
    }

    var window$1 = win;
    function avalon(el) {
        return new avalon.init(el);
    }

    avalon.init = function (el) {
        this[0] = this.element = el;
    };

    avalon.fn = avalon.prototype = avalon.init.prototype;

    function shadowCopy(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
    var rword = /[^, ]+/g;
    var rnowhite = /\S+/g; //存在非空字符
    var platform = {}; //用于放置平台差异的方法与属性


    function oneObject(array, val) {
        if (typeof array === 'string') {
            array = array.match(rword) || [];
        }
        var result = {},
            value = val !== void 0 ? val : 1;
        for (var i = 0, n = array.length; i < n; i++) {
            result[array[i]] = value;
        }
        return result;
    }

    var op = Object.prototype;
    function quote(str) {
        return avalon._quote(str);
    }
    var inspect = op.toString;
    var ohasOwn = op.hasOwnProperty;
    var ap = Array.prototype;

    var hasConsole = typeof console === 'object';
    avalon.config = { debug: true };
    function log() {
        if (hasConsole && avalon.config.debug) {
            Function.apply.call(console.log, console, arguments);
        }
    }
    function warn() {
        if (hasConsole && avalon.config.debug) {
            var method = console.warn || console.log;
            // http://qiang106.iteye.com/blog/1721425
            Function.apply.call(method, console, arguments);
        }
    }
    function error(str, e) {
        throw (e || Error)(str);
    }
    function noop() {}
    function isObject(a) {
        return a !== null && typeof a === 'object';
    }

    function range(start, end, step) {
        // 用于生成整数数组
        step || (step = 1);
        if (end == null) {
            end = start || 0;
            start = 0;
        }
        var index = -1,
            length = Math.max(0, Math.ceil((end - start) / step)),
            result = new Array(length);
        while (++index < length) {
            result[index] = start;
            start += step;
        }
        return result;
    }

    var rhyphen = /([a-z\d])([A-Z]+)/g;
    function hyphen(target) {
        //转换为连字符线风格
        return target.replace(rhyphen, '$1-$2').toLowerCase();
    }

    var rcamelize = /[-_][^-_]/g;
    function camelize(target) {
        //提前判断，提高getStyle等的效率
        if (!target || target.indexOf('-') < 0 && target.indexOf('_') < 0) {
            return target;
        }
        //转换为驼峰风格
        return target.replace(rcamelize, function (match) {
            return match.charAt(1).toUpperCase();
        });
    }

    var _slice = ap.slice;
    function slice(nodes, start, end) {
        return _slice.call(nodes, start, end);
    }

    var rhashcode = /\d\.\d{4}/;
    //生成UUID http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
    function makeHashCode(prefix) {
        /* istanbul ignore next*/
        prefix = prefix || 'avalon';
        /* istanbul ignore next*/
        return String(Math.random() + Math.random()).replace(rhashcode, prefix);
    }
    //生成事件回调的UUID(用户通过ms-on指令)
    function getLongID(fn) {
        /* istanbul ignore next */
        return fn.uuid || (fn.uuid = makeHashCode('e'));
    }
    var UUID = 1;
    //生成事件回调的UUID(用户通过avalon.bind)
    function getShortID(fn) {
        /* istanbul ignore next */
        return fn.uuid || (fn.uuid = '_' + ++UUID);
    }

    var rescape = /[-.*+?^${}()|[\]\/\\]/g;
    function escapeRegExp(target) {
        //http://stevenlevithan.com/regex/xregexp/
        //将字符串安全格式化为正则表达式的源码
        return (target + '').replace(rescape, '\\$&');
    }

    var eventHooks = {};
    var eventListeners = {};
    var validators = {};
    var cssHooks = {};

    window$1.avalon = avalon;

    function createFragment() {
        /* istanbul ignore next  */
        return document$1.createDocumentFragment();
    }

    var rentities = /&[a-z0-9#]{2,10};/;
    var temp = document$1.createElement('div');
    shadowCopy(avalon, {
        Array: {
            merge: function merge(target, other) {
                //合并两个数组 avalon2新增
                target.push.apply(target, other);
            },
            ensure: function ensure(target, item) {
                //只有当前数组不存在此元素时只添加它
                if (target.indexOf(item) === -1) {
                    return target.push(item);
                }
            },
            removeAt: function removeAt(target, index) {
                //移除数组中指定位置的元素，返回布尔表示成功与否
                return !!target.splice(index, 1).length;
            },
            remove: function remove(target, item) {
                //移除数组中第一个匹配传参的那个元素，返回布尔表示成功与否
                var index = target.indexOf(item);
                if (~index) return avalon.Array.removeAt(target, index);
                return false;
            }
        },
        evaluatorPool: new Cache(888),
        parsers: {
            number: function number(a) {
                return a === '' ? '' : parseFloat(a) || 0;
            },
            string: function string(a) {
                return a === null || a === void 0 ? '' : a + '';
            },
            "boolean": function boolean(a) {
                if (a === '') return a;
                return a === 'true' || a === '1';
            }
        },
        _decode: function _decode(str) {
            if (rentities.test(str)) {
                temp.innerHTML = str;
                return temp.innerText || temp.textContent;
            }
            return str;
        }
    });

    //============== config ============
    function config(settings) {
        for (var p in settings) {
            var val = settings[p];
            if (typeof config.plugins[p] === 'function') {
                config.plugins[p](val);
            } else {
                config[p] = val;
            }
        }
        return this;
    }

    var plugins = {
        interpolate: function interpolate(array) {
            var openTag = array[0];
            var closeTag = array[1];
            if (openTag === closeTag) {
                throw new SyntaxError('interpolate openTag cannot equal to closeTag');
            }
            var str = openTag + 'test' + closeTag;

            if (/[<>]/.test(str)) {
                throw new SyntaxError('interpolate cannot contains "<" or ">"');
            }

            config.openTag = openTag;
            config.closeTag = closeTag;
            var o = escapeRegExp(openTag);
            var c = escapeRegExp(closeTag);

            config.rtext = new RegExp(o + '(.+?)' + c, 'g');
            config.rexpr = new RegExp(o + '([\\s\\S]*)' + c);
        }
    };
    function createAnchor(nodeValue) {
        return document$1.createComment(nodeValue);
    }
    config.plugins = plugins;
    config({
        interpolate: ['{{', '}}'],
        debug: true
    });
    //============  config ============

    shadowCopy(avalon, {
        shadowCopy: shadowCopy,

        oneObject: oneObject,
        inspect: inspect,
        ohasOwn: ohasOwn,
        rword: rword,
        version: "2.2.4",
        vmodels: {},

        directives: directives,
        directive: directive,

        eventHooks: eventHooks,
        eventListeners: eventListeners,
        validators: validators,
        cssHooks: cssHooks,

        log: log,
        noop: noop,
        warn: warn,
        error: error,
        config: config,

        modern: modern,
        msie: msie,
        root: root,
        document: document$1,
        window: window$1,
        inBrowser: inBrowser,

        isObject: isObject,
        range: range,
        slice: slice,
        hyphen: hyphen,
        camelize: camelize,
        escapeRegExp: escapeRegExp,
        quote: quote,

        makeHashCode: makeHashCode

    });

    /**
     * 此模块用于修复语言的底层缺陷
     */
    function isNative(fn) {
        return (/\[native code\]/.test(fn)
        );
    }

    /* istanbul ignore if*/
    if (!isNative('司徒正美'.trim)) {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function () {
            return this.replace(rtrim, '');
        };
    }
    if (!Object.create) {
        Object.create = function () {
            function F() {}

            return function (o) {
                if (arguments.length != 1) {
                    throw new Error('Object.create implementation only accepts one parameter.');
                }
                F.prototype = o;
                return new F();
            };
        }();
    }
    var hasDontEnumBug = !{
        'toString': null
    }.propertyIsEnumerable('toString');
    var hasProtoEnumBug = function () {}.propertyIsEnumerable('prototype');
    var dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'];
    var dontEnumsLength = dontEnums.length;
    /* istanbul ignore if*/
    if (!isNative(Object.keys)) {
        Object.keys = function (object) {
            //ecma262v5 15.2.3.14
            var theKeys = [];
            var skipProto = hasProtoEnumBug && typeof object === 'function';
            if (typeof object === 'string' || object && object.callee) {
                for (var i = 0; i < object.length; ++i) {
                    theKeys.push(String(i));
                }
            } else {
                for (var name in object) {
                    if (!(skipProto && name === 'prototype') && ohasOwn.call(object, name)) {
                        theKeys.push(String(name));
                    }
                }
            }

            if (hasDontEnumBug) {
                var ctor = object.constructor,
                    skipConstructor = ctor && ctor.prototype === object;
                for (var j = 0; j < dontEnumsLength; j++) {
                    var dontEnum = dontEnums[j];
                    if (!(skipConstructor && dontEnum === 'constructor') && ohasOwn.call(object, dontEnum)) {
                        theKeys.push(dontEnum);
                    }
                }
            }
            return theKeys;
        };
    }
    /* istanbul ignore if*/
    if (!isNative(Array.isArray)) {
        Array.isArray = function (a) {
            return Object.prototype.toString.call(a) === '[object Array]';
        };
    }

    /* istanbul ignore if*/
    if (!isNative(isNative.bind)) {
        /* istanbul ignore next*/
        Function.prototype.bind = function (scope) {
            if (arguments.length < 2 && scope === void 0) return this;
            var fn = this,
                argv = arguments;
            return function () {
                var args = [],
                    i;
                for (i = 1; i < argv.length; i++) {
                    args.push(argv[i]);
                }for (i = 0; i < arguments.length; i++) {
                    args.push(arguments[i]);
                }return fn.apply(scope, args);
            };
        };
    }
    //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/slice
    /**
     * Shim for "fixing" IE's lack of support (IE < 9) for applying slice
     * on host objects like NamedNodeMap, NodeList, and HTMLCollection
     * (technically, since host objects have been implementation-dependent,
     * at least before ES6, IE hasn't needed to work this way).
     * Also works on strings, fixes IE < 9 to allow an explicit undefined
     * for the 2nd argument (as in Firefox), and prevents errors when
     * called on other DOM objects.
     */

    try {
        // Can't be used with DOM elements in IE < 9
        _slice.call(avalon.document.documentElement);
    } catch (e) {
        // Fails in IE < 9
        // This will work for genuine arrays, array-like objects,
        // NamedNodeMap (attributes, entities, notations),
        // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
        // and will not fail on other DOM objects (as do DOM elements in IE < 9)
        /* istanbul ignore next*/
        ap.slice = function (begin, end) {
            // IE < 9 gets unhappy with an undefined end argument
            end = typeof end !== 'undefined' ? end : this.length;

            // For native Array objects, we use the native slice function
            if (Array.isArray(this)) {
                return _slice.call(this, begin, end);
            }

            // For array like object we handle it ourselves.
            var i,
                cloned = [],
                size,
                len = this.length;

            // Handle negative value for "begin"
            var start = begin || 0;
            start = start >= 0 ? start : len + start;

            // Handle negative value for "end"
            var upTo = end ? end : len;
            if (end < 0) {
                upTo = len + end;
            }

            // Actual expected size of the slice
            size = upTo - start;

            if (size > 0) {
                cloned = new Array(size);
                if (this.charAt) {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this.charAt(start + i);
                    }
                } else {
                    for (i = 0; i < size; i++) {
                        cloned[i] = this[start + i];
                    }
                }
            }

            return cloned;
        };
    }
    /* istanbul ignore next*/
    function iterator(vars, body, ret) {
        var fun = 'for(var ' + vars + 'i=0,n = this.length; i < n; i++){' + body.replace('_', '((i in this) && fn.call(scope,this[i],i,this))') + '}' + ret;
        /* jshint ignore:start */
        return Function('fn,scope', fun);
        /* jshint ignore:end */
    }
    /* istanbul ignore if*/
    if (!isNative(ap.map)) {
        avalon.shadowCopy(ap, {
            //定位操作，返回数组中第一个等于给定参数的元素的索引值。
            indexOf: function indexOf(item, index) {
                var n = this.length,
                    i = ~~index;
                if (i < 0) i += n;
                for (; i < n; i++) {
                    if (this[i] === item) return i;
                }return -1;
            },
            //定位操作，同上，不过是从后遍历。
            lastIndexOf: function lastIndexOf(item, index) {
                var n = this.length,
                    i = index == null ? n - 1 : index;
                if (i < 0) i = Math.max(0, n + i);
                for (; i >= 0; i--) {
                    if (this[i] === item) return i;
                }return -1;
            },
            //迭代操作，将数组的元素挨个儿传入一个函数中执行。Prototype.js的对应名字为each。
            forEach: iterator('', '_', ''),
            //迭代类 在数组中的每个项上运行一个函数，如果此函数的值为真，则此元素作为新数组的元素收集起来，并返回新数组
            filter: iterator('r=[],j=0,', 'if(_)r[j++]=this[i]', 'return r'),
            //收集操作，将数组的元素挨个儿传入一个函数中执行，然后把它们的返回值组成一个新数组返回。Prototype.js的对应名字为collect。
            map: iterator('r=[],', 'r[i]=_', 'return r'),
            //只要数组中有一个元素满足条件（放进给定函数返回true），那么它就返回true。Prototype.js的对应名字为any。
            some: iterator('', 'if(_)return true', 'return false'),
            //只有数组中的元素都满足条件（放进给定函数返回true），它才返回true。Prototype.js的对应名字为all。
            every: iterator('', 'if(!_)return false', 'return true')
        });
    }

    //这里放置存在异议的方法
    var compaceQuote = function () {
        //https://github.com/bestiejs/json3/blob/master/lib/json3.js
        var Escapes = {
            92: "\\\\",
            34: '\\"',
            8: "\\b",
            12: "\\f",
            10: "\\n",
            13: "\\r",
            9: "\\t"
        };

        var leadingZeroes = '000000';
        var toPaddedString = function toPaddedString(width, value) {
            return (leadingZeroes + (value || 0)).slice(-width);
        };
        var unicodePrefix = '\\u00';
        var escapeChar = function escapeChar(character) {
            var charCode = character.charCodeAt(0),
                escaped = Escapes[charCode];
            if (escaped) {
                return escaped;
            }
            return unicodePrefix + toPaddedString(2, charCode.toString(16));
        };
        var reEscape = /[\x00-\x1f\x22\x5c]/g;
        return function (value) {
            /* istanbul ignore next */
            reEscape.lastIndex = 0;
            /* istanbul ignore next */
            return '"' + (reEscape.test(value) ? String(value).replace(reEscape, escapeChar) : value) + '"';
        };
    }();
    try {
        avalon._quote = JSON.stringify;
    } catch (e) {
        /* istanbul ignore next  */
        avalon._quote = compaceQuote;
    }

    var class2type = {};
    'Boolean Number String Function Array Date RegExp Object Error'.replace(avalon.rword, function (name) {
        class2type['[object ' + name + ']'] = name.toLowerCase();
    });

    avalon.type = function (obj) {
        //取得目标的类型
        if (obj == null) {
            return String(obj);
        }
        // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
        return typeof obj === 'object' || typeof obj === 'function' ? class2type[inspect.call(obj)] || 'object' : typeof obj;
    };

    var rfunction = /^\s*\bfunction\b/;

    avalon.isFunction = /* istanbul ignore if */typeof alert === 'object' ? function (fn) {
        /* istanbul ignore next */
        try {
            /* istanbul ignore next */
            return rfunction.test(fn + '');
        } catch (e) {
            /* istanbul ignore next */
            return false;
        }
    } : function (fn) {
        return inspect.call(fn) === '[object Function]';
    };

    // 利用IE678 window == document为true,document == window竟然为false的神奇特性
    // 标准浏览器及IE9，IE10等使用 正则检测
    /* istanbul ignore next */
    function isWindowCompact(obj) {
        if (!obj) {
            return false;
        }
        return obj == obj.document && obj.document != obj; //jshint ignore:line
    }

    var rwindow = /^\[object (?:Window|DOMWindow|global)\]$/;

    function isWindowModern(obj) {
        return rwindow.test(inspect.call(obj));
    }

    avalon.isWindow = isWindowModern(avalon.window) ? isWindowModern : isWindowCompact;

    var enu;
    var enumerateBUG;
    for (enu in avalon({})) {
        break;
    }

    enumerateBUG = enu !== '0'; //IE6下为true, 其他为false

    /*判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例*/
    /* istanbul ignore next */
    function isPlainObjectCompact(obj, key) {
        if (!obj || avalon.type(obj) !== 'object' || obj.nodeType || avalon.isWindow(obj)) {
            return false;
        }
        try {
            //IE内置对象没有constructor
            if (obj.constructor && !ohasOwn.call(obj, 'constructor') && !ohasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
            var isVBscript = obj.$vbthis;
        } catch (e) {
            //IE8 9会在这里抛错
            return false;
        }
        /* istanbul ignore if */
        if (enumerateBUG) {
            for (key in obj) {
                return ohasOwn.call(obj, key);
            }
        }
        for (key in obj) {}
        return key === undefined$1 || ohasOwn.call(obj, key);
    }

    /* istanbul ignore next */
    function isPlainObjectModern(obj) {
        // 简单的 typeof obj === 'object'检测，会致使用isPlainObject(window)在opera下通不过
        return inspect.call(obj) === '[object Object]' && Object.getPrototypeOf(obj) === Object.prototype;
    }
    /* istanbul ignore next */
    avalon.isPlainObject = /\[native code\]/.test(Object.getPrototypeOf) ? isPlainObjectModern : isPlainObjectCompact;

    var rcanMix = /object|function/;

    //与jQuery.extend方法，可用于浅拷贝，深拷贝
    /* istanbul ignore next */
    avalon.mix = avalon.fn.mix = function () {
        var n = arguments.length,
            isDeep = false,
            i = 0,
            array = [];
        if (arguments[0] === true) {
            isDeep = true;
            i = 1;
        }
        //将所有非空对象变成空对象
        for (; i < n; i++) {
            var el = arguments[i];
            el = el && rcanMix.test(typeof el) ? el : {};
            array.push(el);
        }
        if (array.length === 1) {
            array.unshift(this);
        }
        return innerExtend(isDeep, array);
    };
    var undefined$1;

    function innerExtend(isDeep, array) {
        var target = array[0],
            copyIsArray,
            clone,
            name;
        for (var i = 1, length = array.length; i < length; i++) {
            //只处理非空参数
            var options = array[i];
            var noCloneArrayMethod = Array.isArray(options);
            for (name in options) {
                if (noCloneArrayMethod && !options.hasOwnProperty(name)) {
                    continue;
                }
                try {
                    var src = target[name];
                    var copy = options[name]; //当options为VBS对象时报错
                } catch (e) {
                    continue;
                }

                // 防止环引用
                if (target === copy) {
                    continue;
                }
                if (isDeep && copy && (avalon.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {

                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];
                    } else {
                        clone = src && avalon.isPlainObject(src) ? src : {};
                    }

                    target[name] = innerExtend(isDeep, [clone, copy]);
                } else if (copy !== undefined$1) {
                    target[name] = copy;
                }
            }
        }
        return target;
    }

    var rarraylike = /(Array|List|Collection|Map|Arguments)\]$/;
    /*判定是否类数组，如节点集合，纯数组，arguments与拥有非负整数的length属性的纯JS对象*/
    /* istanbul ignore next */
    function isArrayLike(obj) {
        if (!obj) return false;
        var n = obj.length;
        if (n === n >>> 0) {
            //检测length属性是否为非负整数
            var type = inspect.call(obj);
            if (rarraylike.test(type)) return true;
            if (type !== '[object Object]') return false;
            try {
                if ({}.propertyIsEnumerable.call(obj, 'length') === false) {
                    //如果是原生对象
                    return rfunction.test(obj.item || obj.callee);
                }
                return true;
            } catch (e) {
                //IE的NodeList直接抛错
                return !obj.window; //IE6-8 window
            }
        }
        return false;
    }

    avalon.each = function (obj, fn) {
        if (obj) {
            //排除null, undefined
            var i = 0;
            if (isArrayLike(obj)) {
                for (var n = obj.length; i < n; i++) {
                    if (fn(i, obj[i]) === false) break;
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && fn(i, obj[i]) === false) {
                        break;
                    }
                }
            }
        }
    };
    (function () {
        var welcomeIntro = ["%cavalon.js %c" + avalon.version + " %cin debug mode, %cmore...", "color: rgb(114, 157, 52); font-weight: normal;", "color: rgb(85, 85, 85); font-weight: normal;", "color: rgb(85, 85, 85); font-weight: normal;", "color: rgb(82, 140, 224); font-weight: normal; text-decoration: underline;"];
        var welcomeMessage = "You're running avalon in debug mode - messages will be printed to the console to help you fix problems and optimise your application.\n\n" + 'To disable debug mode, add this line at the start of your app:\n\n  avalon.config({debug: false});\n\n' + 'Debug mode also automatically shut down amicably when your app is minified.\n\n' + "Get help and support:\n  https://segmentfault.com/t/avalon\n  http://avalonjs.coding.me/\n  http://www.baidu-x.com/?q=avalonjs\n  http://www.avalon.org.cn/\n\nFound a bug? Raise an issue:\n  https://github.com/RubyLouvre/avalon/issues\n\n";
        if (typeof console === 'object') {
            var con = console;
            var method = con.groupCollapsed || con.log;
            Function.apply.call(method, con, welcomeIntro);
            con.log(welcomeMessage);
            if (method !== console.log) {
                con.groupEnd(welcomeIntro);
            }
        }
    })();

    function toFixedFix(n, prec) {
        var k = Math.pow(10, prec);
        return '' + (Math.round(n * k) / k).toFixed(prec);
    }
    function numberFilter(number, decimals, point, thousands) {
        //https://github.com/txgruppi/number_format
        //form http://phpjs.org/functions/number_format/
        //number 必需，要格式化的数字
        //decimals 可选，规定多少个小数位。
        //point 可选，规定用作小数点的字符串（默认为 . ）。
        //thousands 可选，规定用作千位分隔符的字符串（默认为 , ），如果设置了该参数，那么所有其他参数都是必需的。
        number = (number + '').replace(/[^0-9+\-Ee.]/g, '');
        var n = !isFinite(+number) ? 0 : +number,
            prec = !isFinite(+decimals) ? 3 : Math.abs(decimals),
            sep = typeof thousands === 'string' ? thousands : ",",
            dec = point || ".",
            s = '';

        // Fix for IE parseFloat(0.55).toFixed(0) = 0;
        s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
        if (s[0].length > 3) {
            s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
        }
        /** //好像没有用
         var s1 = s[1] || ''
        
          if (s1.length < prec) {
                  s1 += new Array(prec - s[1].length + 1).join('0')
                  s[1] = s1
          }
          **/
        return s.join(dec);
    }

    var rscripts = /<script[^>]*>([\S\s]*?)<\/script\s*>/gim;
    var ron = /\s+(on[^=\s]+)(?:=("[^"]*"|'[^']*'|[^\s>]+))?/g;
    var ropen = /<\w+\b(?:(["'])[^"]*?(\1)|[^>])*>/ig;
    var rsanitize = {
        a: /\b(href)\=("javascript[^"]*"|'javascript[^']*')/ig,
        img: /\b(src)\=("javascript[^"]*"|'javascript[^']*')/ig,
        form: /\b(action)\=("javascript[^"]*"|'javascript[^']*')/ig
    };

    //https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet
    //    <a href="javasc&NewLine;ript&colon;alert('XSS')">chrome</a> 
    //    <a href="data:text/html;base64, PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KDEpPg==">chrome</a>
    //    <a href="jav	ascript:alert('XSS');">IE67chrome</a>
    //    <a href="jav&#x09;ascript:alert('XSS');">IE67chrome</a>
    //    <a href="jav&#x0A;ascript:alert('XSS');">IE67chrome</a>
    function sanitizeFilter(str) {
        return str.replace(rscripts, "").replace(ropen, function (a, b) {
            var match = a.toLowerCase().match(/<(\w+)\s/);
            if (match) {
                //处理a标签的href属性，img标签的src属性，form标签的action属性
                var reg = rsanitize[match[1]];
                if (reg) {
                    a = a.replace(reg, function (s, name, value) {
                        var quote = value.charAt(0);
                        return name + "=" + quote + "javascript:void(0)" + quote; // jshint ignore:line
                    });
                }
            }
            return a.replace(ron, " ").replace(/\s+/g, " "); //移除onXXX事件
        });
    }

    /*
     'yyyy': 4 digit representation of year (e.g. AD 1 => 0001, AD 2010 => 2010)
     'yy': 2 digit representation of year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
     'y': 1 digit representation of year, e.g. (AD 1 => 1, AD 199 => 199)
     'MMMM': Month in year (January-December)
     'MMM': Month in year (Jan-Dec)
     'MM': Month in year, padded (01-12)
     'M': Month in year (1-12)
     'dd': Day in month, padded (01-31)
     'd': Day in month (1-31)
     'EEEE': Day in Week,(Sunday-Saturday)
     'EEE': Day in Week, (Sun-Sat)
     'HH': Hour in day, padded (00-23)
     'H': Hour in day (0-23)
     'hh': Hour in am/pm, padded (01-12)
     'h': Hour in am/pm, (1-12)
     'mm': Minute in hour, padded (00-59)
     'm': Minute in hour (0-59)
     'ss': Second in minute, padded (00-59)
     's': Second in minute (0-59)
     'a': am/pm marker
     'Z': 4 digit (+sign) representation of the timezone offset (-1200-+1200)
     format string can also be one of the following predefined localizable formats:
     
     'medium': equivalent to 'MMM d, y h:mm:ss a' for en_US locale (e.g. Sep 3, 2010 12:05:08 pm)
     'short': equivalent to 'M/d/yy h:mm a' for en_US locale (e.g. 9/3/10 12:05 pm)
     'fullDate': equivalent to 'EEEE, MMMM d,y' for en_US locale (e.g. Friday, September 3, 2010)
     'longDate': equivalent to 'MMMM d, y' for en_US locale (e.g. September 3, 2010
     'mediumDate': equivalent to 'MMM d, y' for en_US locale (e.g. Sep 3, 2010)
     'shortDate': equivalent to 'M/d/yy' for en_US locale (e.g. 9/3/10)
     'mediumTime': equivalent to 'h:mm:ss a' for en_US locale (e.g. 12:05:08 pm)
     'shortTime': equivalent to 'h:mm a' for en_US locale (e.g. 12:05 pm)
     */

    function toInt(str) {
        return parseInt(str, 10) || 0;
    }

    function padNumber(num, digits, trim) {
        var neg = '';
        /* istanbul ignore if*/
        if (num < 0) {
            neg = '-';
            num = -num;
        }
        num = '' + num;
        while (num.length < digits) {
            num = '0' + num;
        }if (trim) num = num.substr(num.length - digits);
        return neg + num;
    }

    function dateGetter(name, size, offset, trim) {
        return function (date) {
            var value = date["get" + name]();
            if (offset > 0 || value > -offset) value += offset;
            if (value === 0 && offset === -12) {
                /* istanbul ignore next*/
                value = 12;
            }
            return padNumber(value, size, trim);
        };
    }

    function dateStrGetter(name, shortForm) {
        return function (date, formats) {
            var value = date["get" + name]();
            var get = (shortForm ? "SHORT" + name : name).toUpperCase();
            return formats[get][value];
        };
    }

    function timeZoneGetter(date) {
        var zone = -1 * date.getTimezoneOffset();
        var paddedZone = zone >= 0 ? "+" : "";
        paddedZone += padNumber(Math[zone > 0 ? "floor" : "ceil"](zone / 60), 2) + padNumber(Math.abs(zone % 60), 2);
        return paddedZone;
    }
    //取得上午下午
    function ampmGetter(date, formats) {
        return date.getHours() < 12 ? formats.AMPMS[0] : formats.AMPMS[1];
    }
    var DATE_FORMATS = {
        yyyy: dateGetter("FullYear", 4),
        yy: dateGetter("FullYear", 2, 0, true),
        y: dateGetter("FullYear", 1),
        MMMM: dateStrGetter("Month"),
        MMM: dateStrGetter("Month", true),
        MM: dateGetter("Month", 2, 1),
        M: dateGetter("Month", 1, 1),
        dd: dateGetter("Date", 2),
        d: dateGetter("Date", 1),
        HH: dateGetter("Hours", 2),
        H: dateGetter("Hours", 1),
        hh: dateGetter("Hours", 2, -12),
        h: dateGetter("Hours", 1, -12),
        mm: dateGetter("Minutes", 2),
        m: dateGetter("Minutes", 1),
        ss: dateGetter("Seconds", 2),
        s: dateGetter("Seconds", 1),
        sss: dateGetter("Milliseconds", 3),
        EEEE: dateStrGetter("Day"),
        EEE: dateStrGetter("Day", true),
        a: ampmGetter,
        Z: timeZoneGetter
    };
    var rdateFormat = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/;
    var raspnetjson = /^\/Date\((\d+)\)\/$/;
    function dateFilter(date, format) {
        var locate = dateFilter.locate,
            text = "",
            parts = [],
            fn,
            match;
        format = format || "mediumDate";
        format = locate[format] || format;
        if (typeof date === "string") {
            if (/^\d+$/.test(date)) {
                date = toInt(date);
            } else if (raspnetjson.test(date)) {
                date = +RegExp.$1;
            } else {
                var trimDate = date.trim();
                var dateArray = [0, 0, 0, 0, 0, 0, 0];
                var oDate = new Date(0);
                //取得年月日
                trimDate = trimDate.replace(/^(\d+)\D(\d+)\D(\d+)/, function (_, a, b, c) {
                    var array = c.length === 4 ? [c, a, b] : [a, b, c];
                    dateArray[0] = toInt(array[0]); //年
                    dateArray[1] = toInt(array[1]) - 1; //月
                    dateArray[2] = toInt(array[2]); //日
                    return "";
                });
                var dateSetter = oDate.setFullYear;
                var timeSetter = oDate.setHours;
                trimDate = trimDate.replace(/[T\s](\d+):(\d+):?(\d+)?\.?(\d)?/, function (_, a, b, c, d) {
                    dateArray[3] = toInt(a); //小时
                    dateArray[4] = toInt(b); //分钟
                    dateArray[5] = toInt(c); //秒
                    if (d) {
                        //毫秒
                        dateArray[6] = Math.round(parseFloat("0." + d) * 1000);
                    }
                    return "";
                });
                var tzHour = 0;
                var tzMin = 0;
                trimDate = trimDate.replace(/Z|([+-])(\d\d):?(\d\d)/, function (z, symbol, c, d) {
                    dateSetter = oDate.setUTCFullYear;
                    timeSetter = oDate.setUTCHours;
                    if (symbol) {
                        tzHour = toInt(symbol + c);
                        tzMin = toInt(symbol + d);
                    }
                    return '';
                });

                dateArray[3] -= tzHour;
                dateArray[4] -= tzMin;
                dateSetter.apply(oDate, dateArray.slice(0, 3));
                timeSetter.apply(oDate, dateArray.slice(3));
                date = oDate;
            }
        }
        if (typeof date === 'number') {
            date = new Date(date);
        }

        while (format) {
            match = rdateFormat.exec(format);
            /* istanbul ignore else */
            if (match) {
                parts = parts.concat(match.slice(1));
                format = parts.pop();
            } else {
                parts.push(format);
                format = null;
            }
        }
        parts.forEach(function (value) {
            fn = DATE_FORMATS[value];
            text += fn ? fn(date, locate) : value.replace(/(^'|'$)/g, "").replace(/''/g, "'");
        });
        return text;
    }

    var locate = {
        AMPMS: {
            0: '上午',
            1: '下午'
        },
        DAY: {
            0: '星期日',
            1: '星期一',
            2: '星期二',
            3: '星期三',
            4: '星期四',
            5: '星期五',
            6: '星期六'
        },
        MONTH: {
            0: '1月',
            1: '2月',
            2: '3月',
            3: '4月',
            4: '5月',
            5: '6月',
            6: '7月',
            7: '8月',
            8: '9月',
            9: '10月',
            10: '11月',
            11: '12月'
        },
        SHORTDAY: {
            '0': '周日',
            '1': '周一',
            '2': '周二',
            '3': '周三',
            '4': '周四',
            '5': '周五',
            '6': '周六'
        },
        fullDate: 'y年M月d日EEEE',
        longDate: 'y年M月d日',
        medium: 'yyyy-M-d H:mm:ss',
        mediumDate: 'yyyy-M-d',
        mediumTime: 'H:mm:ss',
        'short': 'yy-M-d ah:mm',
        shortDate: 'yy-M-d',
        shortTime: 'ah:mm'
    };
    locate.SHORTMONTH = locate.MONTH;
    dateFilter.locate = locate;

    /**
    $$skipArray:是系统级通用的不可监听属性
    $skipArray: 是当前对象特有的不可监听属性
    
     不同点是
     $$skipArray被hasOwnProperty后返回false
     $skipArray被hasOwnProperty后返回true
     */
    var falsy;
    var $$skipArray = {
        $id: falsy,
        $render: falsy,
        $track: falsy,
        $element: falsy,
        $computed: falsy,
        $watch: falsy,
        $fire: falsy,
        $events: falsy,
        $accessors: falsy,
        $hashcode: falsy,
        $mutations: falsy,
        $vbthis: falsy,
        $vbsetter: falsy
    };

    /*
    https://github.com/hufyhang/orderBy/blob/master/index.js
    */

    function orderBy(array, by, decend) {
        var type = avalon.type(array);
        if (type !== 'array' && type !== 'object') throw 'orderBy只能处理对象或数组';
        var criteria = typeof by == 'string' ? function (el) {
            return el && el[by];
        } : typeof by === 'function' ? by : function (el) {
            return el;
        };
        var mapping = {};
        var temp = [];
        __repeat(array, Array.isArray(array), function (key) {
            var val = array[key];
            var k = criteria(val, key);
            if (k in mapping) {
                mapping[k].push(key);
            } else {
                mapping[k] = [key];
            }
            temp.push(k);
        });

        temp.sort();
        if (decend < 0) {
            temp.reverse();
        }
        var _array = type === 'array';
        var target = _array ? [] : {};
        return recovery(target, temp, function (k) {
            var key = mapping[k].shift();
            if (_array) {
                target.push(array[key]);
            } else {
                target[key] = array[key];
            }
        });
    }

    function __repeat(array, isArray$$1, cb) {
        if (isArray$$1) {
            array.forEach(function (val, index) {
                cb(index);
            });
        } else if (typeof array.$track === 'string') {
            array.$track.replace(/[^☥]+/g, function (k) {
                cb(k);
            });
        } else {
            for (var i in array) {
                if (array.hasOwnProperty(i)) {
                    cb(i);
                }
            }
        }
    }
    function filterBy(array, search) {
        var type = avalon.type(array);
        if (type !== 'array' && type !== 'object') throw 'filterBy只能处理对象或数组';
        var args = avalon.slice(arguments, 2);
        var stype = avalon.type(search);
        if (stype === 'function') {
            var criteria = search;
        } else if (stype === 'string' || stype === 'number') {
            if (search === '') {
                return array;
            } else {
                var reg = new RegExp(avalon.escapeRegExp(search), 'i');
                criteria = function criteria(el) {
                    return reg.test(el);
                };
            }
        } else {
            return array;
        }
        var index = 0;
        var isArray$$1 = type === 'array';
        var target = isArray$$1 ? [] : {};
        __repeat(array, isArray$$1, function (key) {
            var val = array[key];
            if (criteria.apply(val, [val, index].concat(args))) {
                if (isArray$$1) {
                    target.push(val);
                } else {
                    target[key] = val;
                }
            }
            index++;
        });
        return target;
    }

    function selectBy(data, array, defaults) {
        if (avalon.isObject(data) && !Array.isArray(data)) {
            var target = [];
            return recovery(target, array, function (name) {
                target.push(data.hasOwnProperty(name) ? data[name] : defaults ? defaults[name] : '');
            });
        } else {
            return data;
        }
    }

    function limitBy(input, limit, begin) {
        var type = avalon.type(input);
        if (type !== 'array' && type !== 'object') throw 'limitBy只能处理对象或数组';
        //必须是数值
        if (typeof limit !== 'number') {
            return input;
        }
        //不能为NaN
        if (limit !== limit) {
            return input;
        }
        //将目标转换为数组
        if (type === 'object') {
            input = convertArray(input, false);
        }
        var n = input.length;
        limit = Math.floor(Math.min(n, limit));
        begin = typeof begin === 'number' ? begin : 0;
        if (begin < 0) {
            begin = Math.max(0, n + begin);
        }
        var data = [];
        for (var i = begin; i < n; i++) {
            if (data.length === limit) {
                break;
            }
            data.push(input[i]);
        }
        var isArray$$1 = type === 'array';
        if (isArray$$1) {
            return data;
        }
        var target = {};
        return recovery(target, data, function (el) {
            target[el.key] = el.value;
        });
    }

    function recovery(ret, array, callback) {
        for (var i = 0, n = array.length; i < n; i++) {
            callback(array[i]);
        }
        return ret;
    }

    //Chrome谷歌浏览器中js代码Array.sort排序的bug乱序解决办法
    //http://www.cnblogs.com/yzeng/p/3949182.html
    function convertArray(array, isArray$$1) {
        var ret = [],
            i = 0;
        __repeat(array, isArray$$1, function (key) {
            ret[i] = {
                oldIndex: i,
                value: array[key],
                key: key
            };
            i++;
        });
        return ret;
    }

    var eventFilters = {
        stop: function stop(e) {
            e.stopPropagation();
            return e;
        },
        prevent: function prevent(e) {
            e.preventDefault();
            return e;
        }
    };
    var keys = {
        esc: 27,
        tab: 9,
        enter: 13,
        space: 32,
        del: 46,
        up: 38,
        left: 37,
        right: 39,
        down: 40
    };
    for (var name$1 in keys) {
        (function (filter, key) {
            eventFilters[filter] = function (e) {
                if (e.which !== key) {
                    e.$return = true;
                }
                return e;
            };
        })(name$1, keys[name$1]);
    }

    //https://github.com/teppeis/htmlspecialchars
    function escapeFilter(str) {
        if (str == null) return '';

        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    var filters = avalon.filters = {};

    avalon.composeFilters = function () {
        var args = arguments;
        return function (value) {
            for (var i = 0, arr; arr = args[i++];) {
                var name = arr[0];
                var filter = avalon.filters[name];
                if (typeof filter === 'function') {
                    arr[0] = value;
                    try {
                        value = filter.apply(0, arr);
                    } catch (e) {}
                }
            }
            return value;
        };
    };

    avalon.escapeHtml = escapeFilter;

    avalon.mix(filters, {
        uppercase: function uppercase(str) {
            return String(str).toUpperCase();
        },
        lowercase: function lowercase(str) {
            return String(str).toLowerCase();
        },
        truncate: function truncate(str, length, end) {
            //length，新字符串长度，truncation，新字符串的结尾的字段,返回新字符串
            if (!str) {
                return '';
            }
            str = String(str);
            if (isNaN(length)) {
                length = 30;
            }
            end = typeof end === "string" ? end : "...";
            return str.length > length ? str.slice(0, length - end.length) + end : /* istanbul ignore else*/
            str;
        },

        camelize: avalon.camelize,
        date: dateFilter,
        escape: escapeFilter,
        sanitize: sanitizeFilter,
        number: numberFilter,
        currency: function currency(amount, symbol, fractionSize) {
            return (symbol || '\xA5') + numberFilter(amount, isFinite(fractionSize) ? /* istanbul ignore else*/fractionSize : 2);
        }
    }, { filterBy: filterBy, orderBy: orderBy, selectBy: selectBy, limitBy: limitBy }, eventFilters);

    var rcheckedType = /^(?:checkbox|radio)$/;

    /* istanbul ignore next */
    function fixElement(dest, src) {
        if (dest.nodeType !== 1) {
            return;
        }
        var nodeName = dest.nodeName.toLowerCase();

        if (nodeName === "script") {
            if (dest.text !== src.text) {
                dest.type = "noexec";
                dest.text = src.text;
                dest.type = src.type || "";
            }
        } else if (nodeName === 'object') {
            var params = src.childNodes;
            if (dest.childNodes.length !== params.length) {
                avalon.clearHTML(dest);
                for (var i = 0, el; el = params[i++];) {
                    dest.appendChild(el.cloneNode(true));
                }
            }
        } else if (nodeName === 'input' && rcheckedType.test(src.nodeName)) {

            dest.defaultChecked = dest.checked = src.checked;
            if (dest.value !== src.value) {
                dest.value = src.value;
            }
        } else if (nodeName === 'option') {
            dest.defaultSelected = dest.selected = src.defaultSelected;
        } else if (nodeName === 'input' || nodeName === 'textarea') {
            dest.defaultValue = src.defaultValue;
        }
    }

    /* istanbul ignore next */
    function getAll(context) {
        return typeof context.getElementsByTagName !== 'undefined' ? context.getElementsByTagName('*') : typeof context.querySelectorAll !== 'undefined' ? context.querySelectorAll('*') : [];
    }

    /* istanbul ignore next */
    function fixClone(src) {
        var target = src.cloneNode(true);
        //http://www.myexception.cn/web/665613.html
        // target.expando = null
        var t = getAll(target);
        var s = getAll(src);
        for (var i = 0; i < s.length; i++) {
            fixElement(t[i], s[i]);
        }
        return target;
    }

    /* istanbul ignore next */
    function fixContains(root, el) {
        try {
            //IE6-8,游离于DOM树外的文本节点，访问parentNode有时会抛错
            while (el = el.parentNode) {
                if (el === root) return true;
            }
        } catch (e) {}
        return false;
    }

    avalon.contains = fixContains;

    avalon.cloneNode = function (a) {
        return a.cloneNode(true);
    };

    //IE6-11的文档对象没有contains
    /* istanbul ignore next */
    function shimHack() {
        if (msie < 10) {
            avalon.cloneNode = fixClone;
        }
        if (!document$1.contains) {
            document$1.contains = function (b) {
                return fixContains(document$1, b);
            };
        }
        if (avalon.modern) {
            if (!document$1.createTextNode('x').contains) {
                Node.prototype.contains = function (child) {
                    //IE6-8没有Node对象
                    return fixContains(this, child);
                };
            }
        }
        //firefox 到11时才有outerHTML
        function fixFF(prop, cb) {
            if (!(prop in root) && HTMLElement.prototype.__defineGetter__) {
                HTMLElement.prototype.__defineGetter__(prop, cb);
            }
        }
        fixFF('outerHTML', function () {
            var div = document$1.createElement('div');
            div.appendChild(this);
            return div.innerHTML;
        });
        fixFF('children', function () {
            var children = [];
            for (var i = 0, el; el = this.childNodes[i++];) {
                if (el.nodeType === 1) {
                    children.push(el);
                }
            }
            return children;
        });
        fixFF('innerText', function () {
            //firefox45+, chrome4+ http://caniuse.com/#feat=innertext
            return this.textContent;
        });
    }

    if (inBrowser) {
        shimHack();
    }

    function ClassList(node) {
        this.node = node;
    }

    ClassList.prototype = {
        toString: function toString() {
            var node = this.node;
            var cls = node.className;
            var str = typeof cls === 'string' ? cls : cls.baseVal;
            var match = str.match(rnowhite);
            return match ? match.join(' ') : '';
        },
        contains: function contains(cls) {
            return (' ' + this + ' ').indexOf(' ' + cls + ' ') > -1;
        },
        add: function add(cls) {
            if (!this.contains(cls)) {
                this.set(this + ' ' + cls);
            }
        },
        remove: function remove(cls) {
            this.set((' ' + this + ' ').replace(' ' + cls + ' ', ' '));
        },
        set: function set(cls) {
            cls = cls.trim();
            var node = this.node;
            if (typeof node.className === 'object') {
                //SVG元素的className是一个对象 SVGAnimatedString { baseVal='', animVal=''}，只能通过set/getAttribute操作
                node.setAttribute('class', cls);
            } else {
                node.className = cls;
            }
            if (!cls) {
                node.removeAttribute('class');
            }
            //toggle存在版本差异，因此不使用它
        }
    };

    function classListFactory(node) {
        if (!('classList' in node)) {
            node.classList = new ClassList(node);
        }
        return node.classList;
    }

    'add,remove'.replace(rword, function (method) {
        avalon.fn[method + 'Class'] = function (cls) {
            var el = this[0] || {};
            //https://developer.mozilla.org/zh-CN/docs/Mozilla/Firefox/Releases/26
            if (cls && typeof cls === 'string' && el.nodeType === 1) {
                cls.replace(rnowhite, function (c) {
                    classListFactory(el)[method](c);
                });
            }
            return this;
        };
    });

    avalon.shadowCopy(avalon.fn, {
        hasClass: function hasClass(cls) {
            var el = this[0] || {};
            return el.nodeType === 1 && classListFactory(el).contains(cls);
        },
        toggleClass: function toggleClass(value, stateVal) {
            var isBool = typeof stateVal === 'boolean';
            var me = this;
            String(value).replace(rnowhite, function (c) {
                var state = isBool ? stateVal : !me.hasClass(c);
                me[state ? 'addClass' : 'removeClass'](c);
            });
            return this;
        }
    });

    var propMap = { //不规则的属性名映射
        'accept-charset': 'acceptCharset',
        'char': 'ch',
        charoff: 'chOff',
        'class': 'className',
        'for': 'htmlFor',
        'http-equiv': 'httpEquiv'
    };
    /*
    contenteditable不是布尔属性
    http://www.zhangxinxu.com/wordpress/2016/01/contenteditable-plaintext-only/
    contenteditable=''
    contenteditable='events'
    contenteditable='caret'
    contenteditable='plaintext-only'
    contenteditable='true'
    contenteditable='false'
     */
    var bools = ['autofocus,autoplay,async,allowTransparency,checked,controls', 'declare,disabled,defer,defaultChecked,defaultSelected,', 'isMap,loop,multiple,noHref,noResize,noShade', 'open,readOnly,selected'].join(',');

    bools.replace(/\w+/g, function (name) {
        propMap[name.toLowerCase()] = name;
    });

    var anomaly = ['accessKey,bgColor,cellPadding,cellSpacing,codeBase,codeType,colSpan', 'dateTime,defaultValue,contentEditable,frameBorder,longDesc,maxLength,' + 'marginWidth,marginHeight,rowSpan,tabIndex,useMap,vSpace,valueType,vAlign'].join(',');

    anomaly.replace(/\w+/g, function (name) {
        propMap[name.toLowerCase()] = name;
    });

    //module.exports = propMap

    function isVML(src) {
        var nodeName = src.nodeName;
        return nodeName.toLowerCase() === nodeName && !!src.scopeName && src.outerText === '';
    }

    var rvalidchars = /^[\],:{}\s]*$/;
    var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
    var rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g;
    var rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;

    function compactParseJSON(data) {
        if (typeof data === 'string') {
            data = data.trim();
            if (data) {
                if (rvalidchars.test(data.replace(rvalidescape, '@').replace(rvalidtokens, ']').replace(rvalidbraces, ''))) {
                    return new Function('return ' + data)(); // jshint ignore:line
                }
            }
            throw TypeError('Invalid JSON: [' + data + ']');
        }
        return data;
    }

    var rsvg = /^\[object SVG\w*Element\]$/;
    var ramp = /&amp;/g;
    function updateAttrs(node, attrs) {
        for (var attrName in attrs) {
            try {
                var val = attrs[attrName];
                // 处理路径属性
                /* istanbul ignore if*/

                //处理HTML5 data-*属性 SVG
                if (attrName.indexOf('data-') === 0 || rsvg.test(node)) {
                    node.setAttribute(attrName, val);
                } else {
                    var propName = propMap[attrName] || attrName;
                    /* istanbul ignore if */
                    if (typeof node[propName] === 'boolean') {
                        if (propName === 'checked') {
                            node.defaultChecked = !!val;
                        }
                        node[propName] = !!val;
                        //布尔属性必须使用el.xxx = true|false方式设值
                        //如果为false, IE全系列下相当于setAttribute(xxx,''),
                        //会影响到样式,需要进一步处理
                    }

                    if (val === false) {
                        //移除属性
                        node.removeAttribute(propName);
                        continue;
                    }
                    //IE6中classNamme, htmlFor等无法检测它们为内建属性　
                    if (avalon.msie < 8 && /[A-Z]/.test(propName)) {
                        node[propName] = val + '';
                        continue;
                    }
                    //SVG只能使用setAttribute(xxx, yyy), VML只能使用node.xxx = yyy ,
                    //HTML的固有属性必须node.xxx = yyy
                    /* istanbul ignore next */
                    var isInnate = !avalon.modern && isVML(node) ? true : isInnateProps(node.nodeName, attrName);
                    if (isInnate) {
                        if (attrName === 'href' || attrName === 'src') {
                            /* istanbul ignore if */
                            if (avalon.msie < 8) {
                                val = String(val).replace(ramp, '&'); //处理IE67自动转义的问题
                            }
                        }
                        node[propName] = val + '';
                    } else {
                        node.setAttribute(attrName, val);
                    }
                }
            } catch (e) {
                // 对象不支持此属性或方法 src https://github.com/ecomfe/zrender 
                // 未知名称。\/n
                // e.message大概这样,需要trim
                //IE6-8,元素节点不支持其他元素节点的内置属性,如src, href, for
                /* istanbul ignore next */
                avalon.log(String(e.message).trim(), attrName, val);
            }
        }
    }
    var innateMap = {};

    function isInnateProps(nodeName, attrName) {
        var key = nodeName + ":" + attrName;
        if (key in innateMap) {
            return innateMap[key];
        }
        return innateMap[key] = attrName in document$1.createElement(nodeName);
    }
    try {
        avalon.parseJSON = JSON.parse;
    } catch (e) {
        /* istanbul ignore next */
        avalon.parseJSON = compactParseJSON;
    }

    avalon.fn.attr = function (name, value) {
        if (arguments.length === 2) {
            this[0].setAttribute(name, value);
            return this;
        } else {
            return this[0].getAttribute(name);
        }
    };

    var cssMap = {
        'float': 'cssFloat'
    };
    avalon.cssNumber = oneObject('animationIterationCount,columnCount,order,flex,flexGrow,flexShrink,fillOpacity,fontWeight,lineHeight,opacity,orphans,widows,zIndex,zoom');
    var prefixes = ['', '-webkit-', '-o-', '-moz-', '-ms-'];
    /* istanbul ignore next */
    avalon.cssName = function (name, host, camelCase) {
        if (cssMap[name]) {
            return cssMap[name];
        }
        host = host || avalon.root.style || {};
        for (var i = 0, n = prefixes.length; i < n; i++) {
            camelCase = avalon.camelize(prefixes[i] + name);
            if (camelCase in host) {
                return cssMap[name] = camelCase;
            }
        }
        return null;
    };
    /* istanbul ignore next */
    avalon.css = function (node, name, value, fn) {
        //读写删除元素节点的样式
        if (node instanceof avalon) {
            node = node[0];
        }
        if (node.nodeType !== 1) {
            return;
        }
        var prop = avalon.camelize(name);
        name = avalon.cssName(prop) || /* istanbul ignore next*/prop;
        if (value === void 0 || typeof value === 'boolean') {
            //获取样式
            fn = cssHooks[prop + ':get'] || cssHooks['@:get'];
            if (name === 'background') {
                name = 'backgroundColor';
            }
            var val = fn(node, name);
            return value === true ? parseFloat(val) || 0 : val;
        } else if (value === '') {
            //请除样式
            node.style[name] = '';
        } else {
            //设置样式
            if (value == null || value !== value) {
                return;
            }
            if (isFinite(value) && !avalon.cssNumber[prop]) {
                value += 'px';
            }
            fn = cssHooks[prop + ':set'] || cssHooks['@:set'];
            fn(node, name, value);
        }
    };
    /* istanbul ignore next */
    avalon.fn.css = function (name, value) {
        if (avalon.isPlainObject(name)) {
            for (var i in name) {
                avalon.css(this, i, name[i]);
            }
        } else {
            var ret = avalon.css(this, name, value);
        }
        return ret !== void 0 ? ret : this;
    };
    /* istanbul ignore next */
    avalon.fn.position = function () {
        var offsetParent,
            offset,
            elem = this[0],
            parentOffset = {
            top: 0,
            left: 0
        };
        if (!elem) {
            return parentOffset;
        }
        if (this.css('position') === 'fixed') {
            offset = elem.getBoundingClientRect();
        } else {
            offsetParent = this.offsetParent(); //得到真正的offsetParent
            offset = this.offset(); // 得到正确的offsetParent
            if (offsetParent[0].tagName !== 'HTML') {
                parentOffset = offsetParent.offset();
            }
            parentOffset.top += avalon.css(offsetParent[0], 'borderTopWidth', true);
            parentOffset.left += avalon.css(offsetParent[0], 'borderLeftWidth', true);

            // Subtract offsetParent scroll positions
            parentOffset.top -= offsetParent.scrollTop();
            parentOffset.left -= offsetParent.scrollLeft();
        }
        return {
            top: offset.top - parentOffset.top - avalon.css(elem, 'marginTop', true),
            left: offset.left - parentOffset.left - avalon.css(elem, 'marginLeft', true)
        };
    };
    /* istanbul ignore next */
    avalon.fn.offsetParent = function () {
        var offsetParent = this[0].offsetParent;
        while (offsetParent && avalon.css(offsetParent, 'position') === 'static') {
            offsetParent = offsetParent.offsetParent;
        }
        return avalon(offsetParent || avalon.root);
    };

    /* istanbul ignore next */
    cssHooks['@:set'] = function (node, name, value) {
        try {
            //node.style.width = NaN;node.style.width = 'xxxxxxx';
            //node.style.width = undefine 在旧式IE下会抛异常
            node.style[name] = value;
        } catch (e) {}
    };
    /* istanbul ignore next */
    cssHooks['@:get'] = function (node, name) {
        if (!node || !node.style) {
            throw new Error('getComputedStyle要求传入一个节点 ' + node);
        }
        var ret,
            styles = window$1.getComputedStyle(node, null);
        if (styles) {
            ret = name === 'filter' ? styles.getPropertyValue(name) : styles[name];
            if (ret === '') {
                ret = node.style[name]; //其他浏览器需要我们手动取内联样式
            }
        }
        return ret;
    };

    cssHooks['opacity:get'] = function (node) {
        var ret = cssHooks['@:get'](node, 'opacity');
        return ret === '' ? '1' : ret;
    };

    'top,left'.replace(avalon.rword, function (name) {
        cssHooks[name + ':get'] = function (node) {
            var computed = cssHooks['@:get'](node, name);
            return (/px$/.test(computed) ? computed : avalon(node).position()[name] + 'px'
            );
        };
    });

    var cssShow = {
        position: 'absolute',
        visibility: 'hidden',
        display: 'block'
    };

    var rdisplayswap = /^(none|table(?!-c[ea]).+)/;
    /* istanbul ignore next */
    function showHidden(node, array) {
        //http://www.cnblogs.com/rubylouvre/archive/2012/10/27/2742529.html
        if (node.offsetWidth <= 0) {
            //opera.offsetWidth可能小于0
            if (rdisplayswap.test(cssHooks['@:get'](node, 'display'))) {
                var obj = {
                    node: node
                };
                for (var name in cssShow) {
                    obj[name] = node.style[name];
                    node.style[name] = cssShow[name];
                }
                array.push(obj);
            }
            var parent = node.parentNode;
            if (parent && parent.nodeType === 1) {
                showHidden(parent, array);
            }
        }
    }
    /* istanbul ignore next*/
    avalon.each({
        Width: 'width',
        Height: 'height'
    }, function (name, method) {
        var clientProp = 'client' + name,
            scrollProp = 'scroll' + name,
            offsetProp = 'offset' + name;
        cssHooks[method + ':get'] = function (node, which, override) {
            var boxSizing = -4;
            if (typeof override === 'number') {
                boxSizing = override;
            }
            which = name === 'Width' ? ['Left', 'Right'] : ['Top', 'Bottom'];
            var ret = node[offsetProp]; // border-box 0
            if (boxSizing === 2) {
                // margin-box 2
                return ret + avalon.css(node, 'margin' + which[0], true) + avalon.css(node, 'margin' + which[1], true);
            }
            if (boxSizing < 0) {
                // padding-box  -2
                ret = ret - avalon.css(node, 'border' + which[0] + 'Width', true) - avalon.css(node, 'border' + which[1] + 'Width', true);
            }
            if (boxSizing === -4) {
                // content-box -4
                ret = ret - avalon.css(node, 'padding' + which[0], true) - avalon.css(node, 'padding' + which[1], true);
            }
            return ret;
        };
        cssHooks[method + '&get'] = function (node) {
            var hidden = [];
            showHidden(node, hidden);
            var val = cssHooks[method + ':get'](node);
            for (var i = 0, obj; obj = hidden[i++];) {
                node = obj.node;
                for (var n in obj) {
                    if (typeof obj[n] === 'string') {
                        node.style[n] = obj[n];
                    }
                }
            }
            return val;
        };
        avalon.fn[method] = function (value) {
            //会忽视其display
            var node = this[0];
            if (arguments.length === 0) {
                if (node.setTimeout) {
                    //取得窗口尺寸
                    return node['inner' + name] || node.document.documentElement[clientProp] || node.document.body[clientProp]; //IE6下前两个分别为undefined,0
                }
                if (node.nodeType === 9) {
                    //取得页面尺寸
                    var doc = node.documentElement;
                    //FF chrome    html.scrollHeight< body.scrollHeight
                    //IE 标准模式 : html.scrollHeight> body.scrollHeight
                    //IE 怪异模式 : html.scrollHeight 最大等于可视窗口多一点？
                    return Math.max(node.body[scrollProp], doc[scrollProp], node.body[offsetProp], doc[offsetProp], doc[clientProp]);
                }
                return cssHooks[method + '&get'](node);
            } else {
                return this.css(method, value);
            }
        };
        avalon.fn['inner' + name] = function () {
            return cssHooks[method + ':get'](this[0], void 0, -2);
        };
        avalon.fn['outer' + name] = function (includeMargin) {
            return cssHooks[method + ':get'](this[0], void 0, includeMargin === true ? 2 : 0);
        };
    });

    function getWindow(node) {
        return node.window || node.defaultView || node.parentWindow || false;
    }

    /* istanbul ignore if */
    if (msie < 9) {
        cssMap['float'] = 'styleFloat';
        var rnumnonpx = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i;
        var rposition = /^(top|right|bottom|left)$/;
        var ralpha = /alpha\([^)]+\)/i;
        var ropactiy = /(opacity|\d(\d|\.)*)/g;
        var ie8 = msie === 8;
        var salpha = 'DXImageTransform.Microsoft.Alpha';
        var border = {
            thin: ie8 ? '1px' : '2px',
            medium: ie8 ? '3px' : '4px',
            thick: ie8 ? '5px' : '6px'
        };
        cssHooks['@:get'] = function (node, name) {
            //取得精确值，不过它有可能是带em,pc,mm,pt,%等单位
            var currentStyle = node.currentStyle;
            var ret = currentStyle[name];
            if (rnumnonpx.test(ret) && !rposition.test(ret)) {
                //①，保存原有的style.left, runtimeStyle.left,
                var style = node.style,
                    left = style.left,
                    rsLeft = node.runtimeStyle.left;
                //②由于③处的style.left = xxx会影响到currentStyle.left，
                //因此把它currentStyle.left放到runtimeStyle.left，
                //runtimeStyle.left拥有最高优先级，不会style.left影响
                node.runtimeStyle.left = currentStyle.left;
                //③将精确值赋给到style.left，然后通过IE的另一个私有属性 style.pixelLeft
                //得到单位为px的结果；fontSize的分支见http://bugs.jquery.com/ticket/760
                style.left = name === 'fontSize' ? '1em' : ret || 0;
                ret = style.pixelLeft + 'px';
                //④还原 style.left，runtimeStyle.left
                style.left = left;
                node.runtimeStyle.left = rsLeft;
            }
            if (ret === 'medium') {
                name = name.replace('Width', 'Style');
                //border width 默认值为medium，即使其为0'
                if (currentStyle[name] === 'none') {
                    ret = '0px';
                }
            }
            return ret === '' ? 'auto' : border[ret] || ret;
        };
        cssHooks['opacity:set'] = function (node, name, value) {
            var style = node.style;

            var opacity = Number(value) <= 1 ? 'alpha(opacity=' + value * 100 + ')' : '';
            var filter = style.filter || '';
            style.zoom = 1;
            //不能使用以下方式设置透明度
            //node.filters.alpha.opacity = value * 100
            style.filter = (ralpha.test(filter) ? filter.replace(ralpha, opacity) : filter + ' ' + opacity).trim();

            if (!style.filter) {
                style.removeAttribute('filter');
            }
        };
        cssHooks['opacity:get'] = function (node) {
            var match = node.style.filter.match(ropactiy) || [];
            var ret = false;
            for (var i = 0, el; el = match[i++];) {
                if (el === 'opacity') {
                    ret = true;
                } else if (ret) {
                    return el / 100 + '';
                }
            }
            return '1'; //确保返回的是字符串
        };
    }

    /* istanbul ignore next */
    avalon.fn.offset = function () {
        //取得距离页面左右角的坐标
        var node = this[0],
            box = {
            left: 0,
            top: 0
        };
        if (!node || !node.tagName || !node.ownerDocument) {
            return box;
        }
        var doc = node.ownerDocument;
        var body = doc.body;
        var root$$1 = doc.documentElement;
        var win = doc.defaultView || doc.parentWindow;
        if (!avalon.contains(root$$1, node)) {
            return box;
        }
        //http://hkom.blog1.fc2.com/?mode=m&no=750 body的偏移量是不包含margin的
        //我们可以通过getBoundingClientRect来获得元素相对于client的rect.
        //http://msdn.microsoft.com/en-us/library/ms536433.aspx
        if (node.getBoundingClientRect) {
            box = node.getBoundingClientRect(); // BlackBerry 5, iOS 3 (original iPhone)
        }
        //chrome/IE6: body.scrollTop, firefox/other: root.scrollTop
        var clientTop = root$$1.clientTop || body.clientTop,
            clientLeft = root$$1.clientLeft || body.clientLeft,
            scrollTop = Math.max(win.pageYOffset || 0, root$$1.scrollTop, body.scrollTop),
            scrollLeft = Math.max(win.pageXOffset || 0, root$$1.scrollLeft, body.scrollLeft);
        // 把滚动距离加到left,top中去。
        // IE一些版本中会自动为HTML元素加上2px的border，我们需要去掉它
        // http://msdn.microsoft.com/en-us/library/ms533564(VS.85).aspx
        return {
            top: box.top + scrollTop - clientTop,
            left: box.left + scrollLeft - clientLeft
        };
    };

    //生成avalon.fn.scrollLeft, avalon.fn.scrollTop方法
    /* istanbul ignore next */
    avalon.each({
        scrollLeft: 'pageXOffset',
        scrollTop: 'pageYOffset'
    }, function (method, prop) {
        avalon.fn[method] = function (val) {
            var node = this[0] || {};
            var win = getWindow(node);
            var root$$1 = avalon.root;
            var top = method === 'scrollTop';
            if (!arguments.length) {
                return win ? prop in win ? win[prop] : root$$1[method] : node[method];
            } else {
                if (win) {
                    win.scrollTo(!top ? val : avalon(win).scrollLeft(), top ? val : avalon(win).scrollTop());
                } else {
                    node[method] = val;
                }
            }
        };
    });

    function getDuplexType(elem) {
        var ret = elem.tagName.toLowerCase();
        if (ret === 'input') {
            return rcheckedType.test(elem.type) ? 'checked' : elem.type;
        }
        return ret;
    }

    /**
     * IE6/7/8中，如果option没有value值，那么将返回空字符串。
     * IE9/Firefox/Safari/Chrome/Opera 中先取option的value值，如果没有value属性，则取option的innerText值。
     * IE11及W3C，如果没有指定value，那么node.value默认为node.text（存在trim作），但IE9-10则是取innerHTML(没trim操作)
     */

    function getOption(node) {
        if (node.hasAttribute && node.hasAttribute('value')) {
            return node.getAttribute('value');
        }
        var attr = node.getAttributeNode('value');
        if (attr && attr.specified) {
            return attr.value;
        }
        return node.innerHTML.trim();
    }

    var valHooks = {
        'option:get': msie ? getOption : function (node) {
            return node.value;
        },
        'select:get': function selectGet(node, value) {
            var option,
                options = node.options,
                index = node.selectedIndex,
                getter = valHooks['option:get'],
                one = node.type === 'select-one' || index < 0,
                values = one ? null : [],
                max = one ? index + 1 : options.length,
                i = index < 0 ? max : one ? index : 0;
            for (; i < max; i++) {
                option = options[i];
                //IE6-9在reset后不会改变selected，需要改用i === index判定
                //我们过滤所有disabled的option元素，但在safari5下，
                //如果设置optgroup为disable，那么其所有孩子都disable
                //因此当一个元素为disable，需要检测其是否显式设置了disable及其父节点的disable情况
                if ((option.selected || i === index) && !option.disabled && (!option.parentNode.disabled || option.parentNode.tagName !== 'OPTGROUP')) {
                    value = getter(option);
                    if (one) {
                        return value;
                    }
                    //收集所有selected值组成数组返回
                    values.push(value);
                }
            }
            return values;
        },
        'select:set': function selectSet(node, values, optionSet) {
            values = [].concat(values); //强制转换为数组
            var getter = valHooks['option:get'];
            for (var i = 0, el; el = node.options[i++];) {
                if (el.selected = values.indexOf(getter(el)) > -1) {
                    optionSet = true;
                }
            }
            if (!optionSet) {
                node.selectedIndex = -1;
            }
        }
    };

    avalon.fn.val = function (value) {
        var node = this[0];
        if (node && node.nodeType === 1) {
            var get = arguments.length === 0;
            var access = get ? ':get' : ':set';
            var fn = valHooks[getDuplexType(node) + access];
            if (fn) {
                var val = fn(node, value);
            } else if (get) {
                return (node.value || '').replace(/\r/g, '');
            } else {
                node.value = value;
            }
        }
        return get ? val : this;
    };

    /* 
     * 将要检测的字符串的字符串替换成??123这样的格式
     */
    var stringNum = 0;
    var stringPool = {
        map: {}
    };
    var rfill = /\?\?\d+/g;
    function dig(a) {
        var key = '??' + stringNum++;
        stringPool.map[key] = a;
        return key + ' ';
    }
    function fill(a) {
        var val = stringPool.map[a];
        return val;
    }
    function clearString(str) {
        var array = readString(str);
        for (var i = 0, n = array.length; i < n; i++) {
            str = str.replace(array[i], dig);
        }
        return str;
    }

    function readString(str) {
        var end,
            s = 0;
        var ret = [];
        for (var i = 0, n = str.length; i < n; i++) {
            var c = str.charAt(i);
            if (!end) {
                if (c === "'") {
                    end = "'";
                    s = i;
                } else if (c === '"') {
                    end = '"';
                    s = i;
                }
            } else {
                if (c === end) {
                    ret.push(str.slice(s, i + 1));
                    end = false;
                }
            }
        }
        return ret;
    }

    var voidTag = {
        area: 1,
        base: 1,
        basefont: 1,
        bgsound: 1,
        br: 1,
        col: 1,
        command: 1,
        embed: 1,
        frame: 1,
        hr: 1,
        img: 1,
        input: 1,
        keygen: 1,
        link: 1,
        meta: 1,
        param: 1,
        source: 1,
        track: 1,
        wbr: 1
    };

    var orphanTag = {
        script: 1,
        style: 1,
        textarea: 1,
        xmp: 1,
        noscript: 1,
        template: 1
    };

    /* 
     *  此模块只用于文本转虚拟DOM, 
     *  因为在真实浏览器会对我们的HTML做更多处理,
     *  如, 添加额外属性, 改变结构
     *  此模块就是用于模拟这些行为
     */
    function makeOrphan(node, nodeName, innerHTML) {
        switch (nodeName) {
            case 'style':
            case 'script':
            case 'noscript':
            case 'template':
            case 'xmp':
                node.children = [{
                    nodeName: '#text',
                    nodeValue: innerHTML
                }];
                break;
            case 'textarea':
                var props = node.props;
                props.type = nodeName;
                props.value = innerHTML;
                node.children = [{
                    nodeName: '#text',
                    nodeValue: innerHTML
                }];
                break;
            case 'option':
                node.children = [{
                    nodeName: '#text',
                    nodeValue: trimHTML(innerHTML)
                }];
                break;
        }
    }

    //专门用于处理option标签里面的标签
    var rtrimHTML = /<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi;
    function trimHTML(v) {
        return String(v).replace(rtrimHTML, '').trim();
    }

    //widget rule duplex validate

    //如果直接将tr元素写table下面,那么浏览器将将它们(相邻的那几个),放到一个动态创建的tbody底下
    function makeTbody(nodes) {
        var tbody,
            needAddTbody = false,
            count = 0,
            start = 0,
            n = nodes.length;
        for (var i = 0; i < n; i++) {
            var node = nodes[i];
            if (!tbody) {
                if (node.nodeName === 'tr') {
                    //收集tr及tr两旁的注释节点
                    tbody = {
                        nodeName: 'tbody',
                        props: {},
                        children: []
                    };
                    tbody.children.push(node);
                    needAddTbody = true;
                    if (start === 0) start = i;
                    nodes[i] = tbody;
                }
            } else {
                if (node.nodeName !== 'tr' && node.children) {
                    tbody = false;
                } else {
                    tbody.children.push(node);
                    count++;
                    nodes[i] = 0;
                }
            }
        }

        if (needAddTbody) {
            for (i = start; i < n; i++) {
                if (nodes[i] === 0) {
                    nodes.splice(i, 1);
                    i--;
                    count--;
                    if (count === 0) {
                        break;
                    }
                }
            }
        }
    }

    function validateDOMNesting(parent, child) {

        var parentTag = parent.nodeName;
        var tag = child.nodeName;
        var parentChild = nestObject[parentTag];
        if (parentChild) {
            if (parentTag === 'p') {
                if (pNestChild[tag]) {
                    avalon.warn('P element can not  add these childlren:\n' + Object.keys(pNestChild));
                    return false;
                }
            } else if (!parentChild[tag]) {
                avalon.warn(parentTag.toUpperCase() + 'element only add these children:\n' + Object.keys(parentChild) + '\nbut you add ' + tag.toUpperCase() + ' !!');
                return false;
            }
        }
        return true;
    }

    function makeObject(str) {
        return oneObject(str + ',template,#document-fragment,#comment');
    }
    var pNestChild = oneObject('div,ul,ol,dl,table,h1,h2,h3,h4,h5,h6,form,fieldset');
    var tNestChild = makeObject('tr,style,script');
    var nestObject = {
        p: pNestChild,
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inselect
        select: makeObject('option,optgroup,#text'),
        optgroup: makeObject('option,#text'),
        option: makeObject('#text'),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intd
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incaption
        // No special behavior since these rules fall back to "in body" mode for
        // all except special table nodes which cause bad parsing behavior anyway.

        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intr
        tr: makeObject('th,td,style,script'),

        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intbody
        tbody: tNestChild,
        tfoot: tNestChild,
        thead: tNestChild,
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-incolgroup
        colgroup: makeObject('col'),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-intable
        // table: oneObject('caption,colgroup,tbody,thead,tfoot,style,script,template,#document-fragment'),
        // https://html.spec.whatwg.org/multipage/syntax.html#parsing-main-inhead
        head: makeObject('base,basefont,bgsound,link,style,script,meta,title,noscript,noframes'),
        // https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
        html: oneObject('head,body')
    };

    /**
     * ------------------------------------------------------------
     * avalon2.1.1的新式lexer
     * 将字符串变成一个虚拟DOM树,方便以后进一步变成模板函数
     * 此阶段只会生成VElement,VText,VComment
     * ------------------------------------------------------------
     */
    function nomalString(str) {
        return avalon.unescapeHTML(str.replace(rfill, fill));
    }
    //https://github.com/rviscomi/trunk8/blob/master/trunk8.js

    var ropenTag = /^<([-A-Za-z0-9_]+)\s*([^>]*?)(\/?)>/;
    var rendTag = /^<\/([^>]+)>/;
    var rtagStart = /[\!\/a-z]/i; //闭标签的第一个字符,开标签的第一个英文,注释节点的!
    var rlineSp = /\\n\s*/g;
    var rattrs = /([^=\s]+)(?:\s*=\s*(\S+))?/;

    var rcontent = /\S/; //判定里面有没有内容
    function fromString(str) {
        return from(str);
    }
    avalon.lexer = fromString;

    var strCache = new Cache(100);

    function AST() {}
    AST.prototype = {
        init: function init(str) {
            this.ret = [];
            var stack = [];
            stack.last = function () {
                return stack[stack.length - 1];
            };
            this.stack = stack;
            this.str = str;
        },
        gen: function gen() {
            var breakIndex = 999999;
            do {
                this.tryGenText();
                this.tryGenComment();
                this.tryGenOpenTag();
                this.tryGenCloseTag();
                var node = this.node;
                this.node = 0;
                if (!node || --breakIndex === 0) {
                    break;
                }
                if (node.end) {
                    if (node.nodeName === 'table') {
                        makeTbody(node.children);
                    }
                    delete node.end;
                }
            } while (this.str.length);
            return this.ret;
        },

        fixPos: function fixPos(str, i) {
            var tryCount = str.length - i;
            while (tryCount--) {
                if (!rtagStart.test(str.charAt(i + 1))) {
                    i = str.indexOf('<', i + 1);
                } else {
                    break;
                }
            }
            if (tryCount === 0) {
                i = str.length;
            }
            return i;
        },
        tryGenText: function tryGenText() {
            var str = this.str;
            if (str.charAt(0) !== '<') {
                //处理文本节点
                var i = str.indexOf('<');
                if (i === -1) {
                    i = str.length;
                } else if (!rtagStart.test(str.charAt(i + 1))) {
                    //处理`内容2 {{ (idx1 < < <  1 ? 'red' : 'blue' ) + a }} ` 的情况 
                    i = this.fixPos(str, i);
                }
                var nodeValue = str.slice(0, i).replace(rfill, fill);
                this.str = str.slice(i);
                this.node = {
                    nodeName: '#text',
                    nodeValue: nodeValue
                };
                if (rcontent.test(nodeValue)) {
                    this.tryGenChildren(); //不收集空白节点
                }
            }
        },
        tryGenComment: function tryGenComment() {
            if (!this.node) {
                var str = this.str;
                var i = str.indexOf('<!--'); //处理注释节点
                /* istanbul ignore if*/
                if (i === 0) {
                    var l = str.indexOf('-->');
                    if (l === -1) {
                        avalon.error('注释节点没有闭合' + str);
                    }
                    var nodeValue = str.slice(4, l).replace(rfill, fill);
                    this.str = str.slice(l + 3);
                    this.node = {
                        nodeName: '#comment',
                        nodeValue: nodeValue
                    };
                    this.tryGenChildren();
                }
            }
        },
        tryGenOpenTag: function tryGenOpenTag() {
            if (!this.node) {
                var str = this.str;
                var match = str.match(ropenTag); //处理元素节点开始部分
                if (match) {
                    var nodeName = match[1];
                    var props = {};
                    if (/^[A-Z]/.test(nodeName) && avalon.components[nodeName]) {
                        props.is = nodeName;
                    }
                    nodeName = nodeName.toLowerCase();
                    var isVoidTag = !!voidTag[nodeName] || match[3] === '\/';
                    var node = this.node = {
                        nodeName: nodeName,
                        props: {},
                        children: [],
                        isVoidTag: isVoidTag
                    };
                    var attrs = match[2];
                    if (attrs) {
                        this.genProps(attrs, node.props);
                    }
                    this.tryGenChildren();
                    str = str.slice(match[0].length);
                    if (isVoidTag) {
                        node.end = true;
                    } else {
                        this.stack.push(node);
                        if (orphanTag[nodeName] || nodeName === 'option') {
                            var index = str.indexOf('</' + nodeName + '>');
                            var innerHTML = str.slice(0, index).trim();
                            str = str.slice(index);
                            makeOrphan(node, nodeName, nomalString(innerHTML));
                        }
                    }
                    this.str = str;
                }
            }
        },
        tryGenCloseTag: function tryGenCloseTag() {
            if (!this.node) {
                var str = this.str;
                var match = str.match(rendTag); //处理元素节点结束部分
                if (match) {
                    var nodeName = match[1].toLowerCase();
                    var last = this.stack.last();
                    /* istanbul ignore if*/
                    if (!last) {
                        avalon.error(match[0] + '前面缺少<' + nodeName + '>');
                        /* istanbul ignore else*/
                    } else if (last.nodeName !== nodeName) {
                        var errMsg = last.nodeName + '没有闭合,请注意属性的引号';
                        avalon.warn(errMsg);
                        avalon.error(errMsg);
                    }
                    var node = this.stack.pop();
                    node.end = true;
                    this.node = node;
                    this.str = str.slice(match[0].length);
                }
            }
        },
        tryGenChildren: function tryGenChildren() {
            var node = this.node;
            var p = this.stack.last();
            if (p) {
                validateDOMNesting(p, node);
                p.children.push(node);
            } else {
                this.ret.push(node);
            }
        },
        genProps: function genProps(attrs, props) {

            while (attrs) {
                var arr = rattrs.exec(attrs);

                if (arr) {
                    var name = arr[1];
                    var value = arr[2] || '';
                    attrs = attrs.replace(arr[0], '');
                    if (value) {
                        //https://github.com/RubyLouvre/avalon/issues/1844
                        if (value.indexOf('??') === 0) {
                            value = nomalString(value).replace(rlineSp, '').slice(1, -1);
                        }
                    }
                    if (!(name in props)) {
                        props[name] = value;
                    }
                } else {
                    break;
                }
            }
        }
    };

    var vdomAst = new AST();

    function from(str) {
        var cacheKey = str;
        var cached = strCache.get(cacheKey);
        if (cached) {
            return avalon.mix(true, [], cached);
        }
        stringPool.map = {};
        str = clearString(str);

        vdomAst.init(str);
        var ret = vdomAst.gen();
        strCache.put(cacheKey, avalon.mix(true, [], ret));
        return ret;
    }

    var rhtml = /<|&#?\w+;/;
    var htmlCache = new Cache(128);
    var rxhtml = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig;

    avalon.parseHTML = function (html) {
        var fragment = createFragment();
        //处理非字符串
        if (typeof html !== 'string') {
            return fragment;
        }
        //处理非HTML字符串
        if (!rhtml.test(html)) {
            return document$1.createTextNode(html);
        }

        html = html.replace(rxhtml, '<$1></$2>').trim();
        var hasCache = htmlCache.get(html);
        if (hasCache) {
            return avalon.cloneNode(hasCache);
        }
        var vnodes = fromString(html);
        for (var i = 0, el; el = vnodes[i++];) {
            var child = avalon.vdom(el, 'toDOM');
            fragment.appendChild(child);
        }
        if (html.length < 1024) {
            htmlCache.put(html, fragment);
        }
        return fragment;
    };

    avalon.innerHTML = function (node, html) {
        var parsed = avalon.parseHTML(html);
        this.clearHTML(node);
        node.appendChild(parsed);
    };

    //https://github.com/karloespiritu/escapehtmlent/blob/master/index.js
    avalon.unescapeHTML = function (html) {
        return String(html).replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    };

    avalon.clearHTML = function (node) {
        /* istanbul ignore next */
        while (node.lastChild) {
            node.removeChild(node.lastChild);
        }
        return node;
    };

    //http://www.feiesoft.com/html/events.html
    //http://segmentfault.com/q/1010000000687977/a-1020000000688757
    var canBubbleUp = {
        click: true,
        dblclick: true,
        keydown: true,
        keypress: true,
        keyup: true,
        mousedown: true,
        mousemove: true,
        mouseup: true,
        mouseover: true,
        mouseout: true,
        wheel: true,
        mousewheel: true,
        input: true,
        change: true,
        beforeinput: true,
        compositionstart: true,
        compositionupdate: true,
        compositionend: true,
        select: true,
        //http://blog.csdn.net/lee_magnum/article/details/17761441
        cut: true,
        copy: true,
        paste: true,
        beforecut: true,
        beforecopy: true,
        beforepaste: true,
        focusin: true,
        focusout: true,
        DOMFocusIn: true,
        DOMFocusOut: true,
        DOMActivate: true,
        dragend: true,
        datasetchanged: true
    };

    /* istanbul ignore if */
    var hackSafari = avalon.modern && document$1.ontouchstart;

    //添加fn.bind, fn.unbind, bind, unbind
    avalon.fn.bind = function (type, fn, phase) {
        if (this[0]) {
            //此方法不会链
            return avalon.bind(this[0], type, fn, phase);
        }
    };

    avalon.fn.unbind = function (type, fn, phase) {
        if (this[0]) {
            var args = _slice.call(arguments);
            args.unshift(this[0]);
            avalon.unbind.apply(0, args);
        }
        return this;
    };

    /*绑定事件*/
    avalon.bind = function (elem, type, fn) {
        if (elem.nodeType === 1) {
            var value = elem.getAttribute('avalon-events') || '';
            //如果是使用ms-on-*绑定的回调,其uuid格式为e12122324,
            //如果是使用bind方法绑定的回调,其uuid格式为_12
            var uuid = getShortID(fn);
            var hook = eventHooks[type];
            /* istanbul ignore if */
            if (type === 'click' && hackSafari) {
                elem.addEventListener('click', avalon.noop);
            }
            /* istanbul ignore if */
            if (hook) {
                type = hook.type || type;
                if (hook.fix) {
                    fn = hook.fix(elem, fn);
                    fn.uuid = uuid;
                }
            }
            var key = type + ':' + uuid;
            avalon.eventListeners[fn.uuid] = fn;
            /* istanbul ignore if */
            if (value.indexOf(type + ':') === -1) {
                //同一种事件只绑定一次
                if (canBubbleUp[type] || avalon.modern && focusBlur[type]) {
                    delegateEvent(type);
                } else {
                    avalon._nativeBind(elem, type, dispatch);
                }
            }
            var keys = value.split(',');
            /* istanbul ignore if */
            if (keys[0] === '') {
                keys.shift();
            }
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                setEventId(elem, keys.join(','));
                //将令牌放进avalon-events属性中
            }
            return fn;
        } else {
            /* istanbul ignore next */
            var cb = function cb(e) {
                fn.call(elem, new avEvent(e));
            };

            avalon._nativeBind(elem, type, cb);
            return cb;
        }
    };

    function setEventId(node, value) {
        node.setAttribute('avalon-events', value);
    }
    /* istanbul ignore next */
    avalon.unbind = function (elem, type, fn) {
        if (elem.nodeType === 1) {
            var value = elem.getAttribute('avalon-events') || '';
            switch (arguments.length) {
                case 1:
                    avalon._nativeUnBind(elem, type, dispatch);
                    elem.removeAttribute('avalon-events');
                    break;
                case 2:
                    value = value.split(',').filter(function (str) {
                        return str.indexOf(type + ':') === -1;
                    }).join(',');
                    setEventId(elem, value);
                    break;
                default:
                    var search = type + ':' + fn.uuid;
                    value = value.split(',').filter(function (str) {
                        return str !== search;
                    }).join(',');
                    setEventId(elem, value);
                    delete avalon.eventListeners[fn.uuid];
                    break;
            }
        } else {
            avalon._nativeUnBind(elem, type, fn);
        }
    };

    var typeRegExp = {};

    function collectHandlers(elem, type, handlers) {
        var value = elem.getAttribute('avalon-events');
        if (value && (elem.disabled !== true || type !== 'click')) {
            var uuids = [];
            var reg = typeRegExp[type] || (typeRegExp[type] = new RegExp("\\b" + type + '\\:([^,\\s]+)', 'g'));
            value.replace(reg, function (a, b) {
                uuids.push(b);
                return a;
            });
            if (uuids.length) {
                handlers.push({
                    elem: elem,
                    uuids: uuids
                });
            }
        }
        elem = elem.parentNode;
        var g = avalon.gestureEvents || {};
        if (elem && elem.getAttribute && (canBubbleUp[type] || g[type])) {
            collectHandlers(elem, type, handlers);
        }
    }

    var rhandleHasVm = /^e/;

    function dispatch(event) {
        event = new avEvent(event);
        var type = event.type;
        var elem = event.target;
        var handlers = [];
        collectHandlers(elem, type, handlers);
        var i = 0,
            j,
            uuid,
            handler;
        while ((handler = handlers[i++]) && !event.cancelBubble) {
            var host = event.currentTarget = handler.elem;
            j = 0;
            while (uuid = handler.uuids[j++]) {
                if (event.stopImmediate) {
                    break;
                }
                var fn = avalon.eventListeners[uuid];
                if (fn) {
                    var vm = rhandleHasVm.test(uuid) ? handler.elem._ms_context_ : 0;
                    if (vm && vm.$hashcode === false) {
                        return avalon.unbind(elem, type, fn);
                    }
                    var ret = fn.call(vm || elem, event);

                    if (ret === false) {
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        }
    }

    var focusBlur = {
        focus: true,
        blur: true
    };

    function delegateEvent(type) {
        var value = root.getAttribute('delegate-events') || '';
        if (value.indexOf(type) === -1) {
            //IE6-8会多次绑定同种类型的同一个函数,其他游览器不会
            var arr = value.match(avalon.rword) || [];
            arr.push(type);
            root.setAttribute('delegate-events', arr.join(','));
            avalon._nativeBind(root, type, dispatch, !!focusBlur[type]);
        }
    }

    var eventProto = {
        webkitMovementY: 1,
        webkitMovementX: 1,
        keyLocation: 1,
        fixEvent: function fixEvent() {},
        preventDefault: function preventDefault() {
            var e = this.originalEvent || {};
            e.returnValue = this.returnValue = false;
            if (modern && e.preventDefault) {
                e.preventDefault();
            }
        },
        stopPropagation: function stopPropagation() {
            var e = this.originalEvent || {};
            e.cancelBubble = this.cancelBubble = true;
            if (modern && e.stopPropagation) {
                e.stopPropagation();
            }
        },
        stopImmediatePropagation: function stopImmediatePropagation() {
            this.stopPropagation();
            this.stopImmediate = true;
        },
        toString: function toString() {
            return '[object Event]'; //#1619
        }
    };

    function avEvent(event) {
        if (event.originalEvent) {
            return event;
        }
        for (var i in event) {
            if (!eventProto[i]) {
                this[i] = event[i];
            }
        }
        if (!this.target) {
            this.target = event.srcElement;
        }
        var target = this.target;
        this.fixEvent();
        this.timeStamp = new Date() - 0;
        this.originalEvent = event;
    }
    avEvent.prototype = eventProto;
    //针对firefox, chrome修正mouseenter, mouseleave
    /* istanbul ignore if */
    if (!('onmouseenter' in root)) {
        avalon.each({
            mouseenter: 'mouseover',
            mouseleave: 'mouseout'
        }, function (origType, fixType) {
            eventHooks[origType] = {
                type: fixType,
                fix: function fix(elem, fn) {
                    return function (e) {
                        var t = e.relatedTarget;
                        if (!t || t !== elem && !(elem.compareDocumentPosition(t) & 16)) {
                            delete e.type;
                            e.type = origType;
                            return fn.apply(this, arguments);
                        }
                    };
                }
            };
        });
    }
    //针对IE9+, w3c修正animationend
    avalon.each({
        AnimationEvent: 'animationend',
        WebKitAnimationEvent: 'webkitAnimationEnd'
    }, function (construct, fixType) {
        if (window$1[construct] && !eventHooks.animationend) {
            eventHooks.animationend = {
                type: fixType
            };
        }
    });

    /* istanbul ignore if */
    if (!("onmousewheel" in document$1)) {
        /* IE6-11 chrome mousewheel wheelDetla 下 -120 上 120
         firefox DOMMouseScroll detail 下3 上-3
         firefox wheel detlaY 下3 上-3
         IE9-11 wheel deltaY 下40 上-40
         chrome wheel deltaY 下100 上-100 */
        var fixWheelType = document$1.onwheel !== void 0 ? 'wheel' : 'DOMMouseScroll';
        var fixWheelDelta = fixWheelType === 'wheel' ? 'deltaY' : 'detail';
        eventHooks.mousewheel = {
            type: fixWheelType,
            fix: function fix(elem, fn) {
                return function (e) {
                    var delta = e[fixWheelDelta] > 0 ? -120 : 120;
                    e.wheelDelta = ~~elem._ms_wheel_ + delta;
                    elem._ms_wheel_ = e.wheelDeltaY = e.wheelDelta;
                    e.wheelDeltaX = 0;
                    if (Object.defineProperty) {
                        Object.defineProperty(e, 'type', {
                            value: 'mousewheel'
                        });
                    }
                    return fn.apply(this, arguments);
                };
            }
        };
    }

    /* istanbul ignore if */
    if (!modern) {
        delete canBubbleUp.change;
        delete canBubbleUp.select;
    }
    /* istanbul ignore next */
    avalon._nativeBind = modern ? function (el, type, fn, capture) {
        el.addEventListener(type, fn, !!capture);
    } : function (el, type, fn) {
        el.attachEvent('on' + type, fn);
    };
    /* istanbul ignore next */
    avalon._nativeUnBind = modern ? function (el, type, fn, a) {
        el.removeEventListener(type, fn, !!a);
    } : function (el, type, fn) {
        el.detachEvent('on' + type, fn);
    };
    /* istanbul ignore next */
    avalon.fireDom = function (elem, type, opts) {
        if (document$1.createEvent) {
            var hackEvent = document$1.createEvent('Events');
            hackEvent.initEvent(type, true, true, opts);
            avalon.shadowCopy(hackEvent, opts);
            elem.dispatchEvent(hackEvent);
        } else if (root.contains(elem)) {
            //IE6-8触发事件必须保证在DOM树中,否则报'SCRIPT16389: 未指明的错误'
            hackEvent = document$1.createEventObject();
            if (opts) avalon.shadowCopy(hackEvent, opts);
            try {
                elem.fireEvent('on' + type, hackEvent);
            } catch (e) {
                avalon.log('fireDom', type, 'args error');
            }
        }
    };

    var rmouseEvent = /^(?:mouse|contextmenu|drag)|click/;
    /* istanbul ignore next */
    avEvent.prototype.fixEvent = function () {
        var event = this;
        if (event.which == null && event.type.indexOf('key') === 0) {
            event.which = event.charCode != null ? event.charCode : event.keyCode;
        }
        if (rmouseEvent.test(event.type) && !('pageX' in event)) {
            var DOC = event.target.ownerDocument || document$1;
            var box = DOC.compatMode === 'BackCompat' ? DOC.body : DOC.documentElement;
            event.pageX = event.clientX + (box.scrollLeft >> 0) - (box.clientLeft >> 0);
            event.pageY = event.clientY + (box.scrollTop >> 0) - (box.clientTop >> 0);
            event.wheelDeltaY = ~~event.wheelDelta;
            event.wheelDeltaX = 0;
        }
    };

    //针对IE6-8修正input
    /* istanbul ignore if */
    if (!('oninput' in document$1.createElement('input'))) {
        eventHooks.input = {
            type: 'propertychange',
            fix: function fix(elem, fn) {
                return function (e) {
                    if (e.propertyName === 'value') {
                        e.type = 'input';
                        return fn.apply(this, arguments);
                    }
                };
            }
        };
    }

    var readyList = [];

    function fireReady(fn) {
        avalon.isReady = true;
        while (fn = readyList.shift()) {
            fn(avalon);
        }
    }

    avalon.ready = function (fn) {
        readyList.push(fn);
        if (avalon.isReady) {
            fireReady();
        }
    };

    avalon.ready(function () {
        avalon.scan && avalon.scan(document$1.body);
    });

    /* istanbul ignore next */
    function bootstrap() {
        function doScrollCheck() {
            try {
                //IE下通过doScrollCheck检测DOM树是否建完
                root.doScroll('left');
                fireReady();
            } catch (e) {
                setTimeout(doScrollCheck);
            }
        }
        if (document$1.readyState === 'complete') {
            setTimeout(fireReady); //如果在domReady之外加载
        } else if (document$1.addEventListener) {
            document$1.addEventListener('DOMContentLoaded', fireReady, false);
        } else if (document$1.attachEvent) {
            //必须传入三个参数，否则在firefox4-26中报错
            //caught exception: [Exception... "Not enough arguments"  nsresult: "0x
            document$1.attachEvent('onreadystatechange', function () {
                if (document$1.readyState === 'complete') {
                    fireReady();
                }
            });
            try {
                var isTop = window$1.frameElement === null;
            } catch (e) {}
            if (root.doScroll && isTop && window$1.external) {
                //fix IE iframe BUG
                doScrollCheck();
            }
        }

        avalon.bind(window$1, 'load', fireReady);
    }
    if (inBrowser) {
        bootstrap();
    }

    /**
     * ------------------------------------------------------------
     *                          DOM Api
     * shim,class,data,css,val,html,event,ready  
     * ------------------------------------------------------------
     */

    function fromDOM(dom) {
        return [from$1(dom)];
    }

    function from$1(node) {
        var type = node.nodeName.toLowerCase();
        switch (type) {
            case '#text':
            case '#comment':
                return {
                    nodeName: type,
                    dom: node,
                    nodeValue: node.nodeValue
                };
            default:
                var props = markProps(node, node.attributes || []);
                var vnode = {
                    nodeName: type,
                    dom: node,
                    isVoidTag: !!voidTag[type],
                    props: props
                };
                if (type === 'option') {
                    //即便你设置了option.selected = true,
                    //option.attributes也找不到selected属性
                    props.selected = node.selected;
                }
                if (orphanTag[type] || type === 'option') {
                    makeOrphan(vnode, type, node.text || node.innerHTML);
                    if (node.childNodes.length === 1) {
                        vnode.children[0].dom = node.firstChild;
                    }
                } else if (!vnode.isVoidTag) {
                    vnode.children = [];
                    for (var i = 0, el; el = node.childNodes[i++];) {
                        var child = from$1(el);
                        if (/\S/.test(child.nodeValue)) {
                            vnode.children.push(child);
                        }
                    }
                }
                return vnode;
        }
    }

    var rformElement = /input|textarea|select/i;

    function markProps(node, attrs) {
        var ret = {};
        for (var i = 0, n = attrs.length; i < n; i++) {
            var attr = attrs[i];
            if (attr.specified) {
                //IE6-9不会将属性名变小写,比如它会将用户的contenteditable变成contentEditable
                ret[attr.name.toLowerCase()] = attr.value;
            }
        }
        if (rformElement.test(node.nodeName)) {
            ret.type = node.type;
            var a = node.getAttributeNode('value');
            if (a && /\S/.test(a.value)) {
                //IE6,7中无法取得checkbox,radio的value
                ret.value = a.value;
            }
        }
        var style = node.style.cssText;
        if (style) {
            ret.style = style;
        }
        //类名 = 去重(静态类名+动态类名+ hover类名? + active类名)
        if (ret.type === 'select-one') {
            ret.selectedIndex = node.selectedIndex;
        }
        return ret;
    }

    function VText(text) {
        this.nodeName = '#text';
        this.nodeValue = text;
    }

    VText.prototype = {
        constructor: VText,
        toDOM: function toDOM() {
            /* istanbul ignore if*/
            if (this.dom) return this.dom;
            var v = avalon._decode(this.nodeValue);
            return this.dom = document$1.createTextNode(v);
        },
        toHTML: function toHTML() {
            return this.nodeValue;
        }
    };

    function VComment(text) {
        this.nodeName = '#comment';
        this.nodeValue = text;
    }
    VComment.prototype = {
        constructor: VComment,
        toDOM: function toDOM() {
            if (this.dom) return this.dom;
            return this.dom = document$1.createComment(this.nodeValue);
        },
        toHTML: function toHTML() {
            return '<!--' + this.nodeValue + '-->';
        }
    };

    function VElement(type, props, children, isVoidTag) {
        this.nodeName = type;
        this.props = props;
        this.children = children;
        this.isVoidTag = isVoidTag;
    }
    VElement.prototype = {
        constructor: VElement,
        toDOM: function toDOM() {
            if (this.dom) return this.dom;
            var dom,
                tagName = this.nodeName;
            if (avalon.modern && svgTags[tagName]) {
                dom = createSVG(tagName);
                /* istanbul ignore next*/
            } else if (!avalon.modern && (VMLTags[tagName] || rvml.test(tagName))) {
                dom = createVML(tagName);
            } else {
                dom = document$1.createElement(tagName);
            }

            var props = this.props || {};

            for (var i in props) {
                var val = props[i];
                if (skipFalseAndFunction(val)) {
                    /* istanbul ignore if*/
                    if (specalAttrs[i] && avalon.msie < 8) {
                        specalAttrs[i](dom, val);
                    } else {
                        dom.setAttribute(i, val + '');
                    }
                }
            }
            var c = this.children || [];
            var template = c[0] ? c[0].nodeValue : '';
            switch (this.nodeName) {
                case 'script':
                    dom.type = 'noexec';
                    dom.text = template;
                    try {
                        dom.innerHTML = template;
                    } catch (e) {}
                    dom.type = props.type || '';
                    break;
                case 'noscript':
                    dom.textContent = template;
                case 'style':
                case 'xmp':
                case 'template':
                    try {
                        dom.innerHTML = template;
                    } catch (e) {
                        /* istanbul ignore next*/
                        hackIE(dom, this.nodeName, template);
                    }
                    break;
                case 'option':
                    //IE6-8,为option添加文本子节点,不会同步到text属性中
                    /* istanbul ignore next */
                    if (msie < 9) dom.text = template;
                default:
                    /* istanbul ignore next */
                    if (!this.isVoidTag && this.children) {
                        this.children.forEach(function (el) {
                            return c && dom.appendChild(avalon.vdom(c, 'toDOM'));
                        });
                    }
                    break;
            }
            return this.dom = dom;
        },

        /* istanbul ignore next */

        toHTML: function toHTML() {
            var arr = [];
            var props = this.props || {};
            for (var i in props) {
                var val = props[i];
                if (skipFalseAndFunction(val)) {
                    arr.push(i + '=' + avalon.quote(props[i] + ''));
                }
            }
            arr = arr.length ? ' ' + arr.join(' ') : '';
            var str = '<' + this.nodeName + arr;
            if (this.isVoidTag) {
                return str + '/>';
            }
            str += '>';
            if (this.children) {
                str += this.children.map(function (el) {
                    return el ? avalon.vdom(el, 'toHTML') : '';
                }).join('');
            }
            return str + '</' + this.nodeName + '>';
        }
    };
    function hackIE(dom, nodeName, template) {
        switch (nodeName) {
            case 'style':
                dom.setAttribute('type', 'text/css');
                dom.styleSheet.cssText = template;
                break;
            case 'xmp': //IE6-8,XMP元素里面只能有文本节点,不能使用innerHTML
            case 'noscript':
                dom.textContent = template;
                break;
        }
    }
    function skipFalseAndFunction(a) {
        return a !== false && Object(a) !== a;
    }
    /* istanbul ignore next */
    var specalAttrs = {
        "class": function _class(dom, val) {
            dom.className = val;
        },
        style: function style(dom, val) {
            dom.style.cssText = val;
        },
        type: function type(dom, val) {
            try {
                //textarea,button 元素在IE6,7设置 type 属性会抛错
                dom.type = val;
            } catch (e) {}
        },
        'for': function _for(dom, val) {
            dom.setAttribute('for', val);
            dom.htmlFor = val;
        }
    };

    function createSVG(type) {
        return document$1.createElementNS('http://www.w3.org/2000/svg', type);
    }
    var svgTags = avalon.oneObject('circle,defs,ellipse,image,line,' + 'path,polygon,polyline,rect,symbol,text,use,g,svg');

    var rvml = /^\w+\:\w+/;
    /* istanbul ignore next*/
    function createVML(type) {
        if (document$1.styleSheets.length < 31) {
            document$1.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
        } else {
            // no more room, add to the existing one
            // http://msdn.microsoft.com/en-us/library/ms531194%28VS.85%29.aspx
            document$1.styleSheets[0].addRule(".rvml", "behavior:url(#default#VML)");
        }
        var arr = type.split(':');
        if (arr.length === 1) {
            arr.unshift('v');
        }
        var tag = arr[1];
        var ns = arr[0];
        if (!document$1.namespaces[ns]) {
            document$1.namespaces.add(ns, "urn:schemas-microsoft-com:vml");
        }
        return document$1.createElement('<' + ns + ':' + tag + ' class="rvml">');
    }

    var VMLTags = avalon.oneObject('shape,line,polyline,rect,roundrect,oval,arc,' + 'curve,background,image,shapetype,group,fill,' + 'stroke,shadow, extrusion, textbox, imagedata, textpath');

    function VFragment(children, key, val, index) {
        this.nodeName = '#document-fragment';
        this.children = children;
        this.key = key;
        this.val = val;
        this.index = index;
        this.props = {};
    }
    VFragment.prototype = {
        constructor: VFragment,
        toDOM: function toDOM() {
            if (this.dom) return this.dom;
            var f = this.toFragment();
            //IE6-11 docment-fragment都没有children属性 
            this.split = f.lastChild;
            return this.dom = f;
        },
        dispose: function dispose() {
            this.toFragment();
            this.innerRender && this.innerRender.dispose();
            for (var i in this) {
                this[i] = null;
            }
        },
        toFragment: function toFragment() {
            var f = createFragment();
            this.children.forEach(function (el) {
                return f.appendChild(avalon.vdom(el, 'toDOM'));
            });
            return f;
        },
        toHTML: function toHTML() {
            var c = this.children;
            return c.map(function (el) {
                return avalon.vdom(el, 'toHTML');
            }).join('');
        }
    };

    /**
     * 虚拟DOM的4大构造器
     */
    avalon.mix(avalon, {
        VText: VText,
        VComment: VComment,
        VElement: VElement,
        VFragment: VFragment
    });

    var constNameMap = {
        '#text': 'VText',
        '#document-fragment': 'VFragment',
        '#comment': 'VComment'
    };

    var vdom = avalon.vdomAdaptor = avalon.vdom = function (obj, method) {
        if (!obj) {
            //obj在ms-for循环里面可能是null
            return method === "toHTML" ? '' : createFragment();
        }
        var nodeName = obj.nodeName;
        if (!nodeName) {
            return new avalon.VFragment(obj)[method]();
        }
        var constName = constNameMap[nodeName] || 'VElement';
        return avalon[constName].prototype[method].call(obj);
    };

    avalon.domize = function (a) {
        return avalon.vdom(a, 'toDOM');
    };

    avalon.pendingActions = [];
    avalon.uniqActions = {};
    avalon.inTransaction = 0;
    config.trackDeps = false;
    avalon.track = function () {
        if (config.trackDeps) {
            avalon.log.apply(avalon, arguments);
        }
    };

    /**
     * Batch is a pseudotransaction, just for purposes of memoizing ComputedValues when nothing else does.
     * During a batch `onBecomeUnobserved` will be called at most once per observable.
     * Avoids unnecessary recalculations.
     */

    function runActions() {
        if (avalon.isRunningActions === true || avalon.inTransaction > 0) return;
        avalon.isRunningActions = true;
        var tasks = avalon.pendingActions.splice(0, avalon.pendingActions.length);
        for (var i = 0, task; task = tasks[i++];) {
            task.update();
            delete avalon.uniqActions[task.uuid];
        }
        avalon.isRunningActions = false;
    }

    function propagateChanged(target) {
        var list = target.observers;
        for (var i = 0, el; el = list[i++];) {
            el.schedule(); //通知action, computed做它们该做的事
        }
    }

    //将自己抛到市场上卖
    function reportObserved(target) {
        var action = avalon.trackingAction || null;
        if (action !== null) {

            avalon.track('征收到', target.expr);
            action.mapIDs[target.uuid] = target;
        }
    }

    var targetStack = [];

    function collectDeps(action, getter) {
        if (!action.observers) return;
        var preAction = avalon.trackingAction;
        if (preAction) {
            targetStack.push(preAction);
        }
        avalon.trackingAction = action;
        avalon.track('【action】', action.type, action.expr, '开始征收依赖项');
        //多个observe持有同一个action
        action.mapIDs = {}; //重新收集依赖
        var hasError = true,
            result;
        try {
            result = getter.call(action);
            hasError = false;
        } finally {
            if (hasError) {
                avalon.warn('collectDeps fail', getter + '');
                action.mapIDs = {};
                avalon.trackingAction = preAction;
            } else {
                // 确保它总是为null
                avalon.trackingAction = targetStack.pop();
                try {
                    resetDeps(action);
                } catch (e) {
                    avalon.warn(e);
                }
            }
            return result;
        }
    }

    function resetDeps(action) {
        var prev = action.observers,
            curr = [],
            checked = {},
            ids = [];
        for (var i in action.mapIDs) {
            var dep = action.mapIDs[i];
            if (!dep.isAction) {
                if (!dep.observers) {
                    //如果它已经被销毁
                    delete action.mapIDs[i];
                    continue;
                }
                ids.push(dep.uuid);
                curr.push(dep);
                checked[dep.uuid] = 1;
                if (dep.lastAccessedBy === action.uuid) {
                    continue;
                }
                dep.lastAccessedBy = action.uuid;
                avalon.Array.ensure(dep.observers, action);
            }
        }
        var ids = ids.sort().join(',');
        if (ids === action.ids) {
            return;
        }
        action.ids = ids;
        if (!action.isComputed) {
            action.observers = curr;
        } else {
            action.depsCount = curr.length;
            action.deps = avalon.mix({}, action.mapIDs);
            action.depsVersion = {};
            for (var _i in action.mapIDs) {
                var _dep = action.mapIDs[_i];
                action.depsVersion[_dep.uuid] = _dep.version;
            }
        }

        for (var _i2 = 0, _dep2; _dep2 = prev[_i2++];) {
            if (!checked[_dep2.uuid]) {
                avalon.Array.remove(_dep2.observers, action);
            }
        }
    }

    function transaction(action, thisArg, args) {
        args = args || [];
        var name = 'transaction ' + (action.name || action.displayName || 'noop');
        transactionStart(name);
        var res = action.apply(thisArg, args);
        transactionEnd(name);
        return res;
    }
    avalon.transaction = transaction;

    function transactionStart(name) {
        avalon.inTransaction += 1;
    }

    function transactionEnd(name) {
        if (--avalon.inTransaction === 0) {
            avalon.isRunningActions = false;
            runActions();
        }
    }

    var keyMap = avalon.oneObject("break,case,catch,continue,debugger,default,delete,do,else,false," + "finally,for,function,if,in,instanceof,new,null,return,switch,this," + "throw,true,try,typeof,var,void,while,with," + /* 关键字*/
    "abstract,boolean,byte,char,class,const,double,enum,export,extends," + "final,float,goto,implements,import,int,interface,long,native," + "package,private,protected,public,short,static,super,synchronized," + "throws,transient,volatile");

    var skipMap = avalon.mix({
        Math: 1,
        Date: 1,
        $event: 1,
        window: 1,
        __vmodel__: 1,
        avalon: 1
    }, keyMap);

    var rvmKey = /(^|[^\w\u00c0-\uFFFF_])(@|##)(?=[$\w])/g;
    var ruselessSp = /\s*(\.|\|)\s*/g;
    var rshortCircuit = /\|\|/g;
    var brackets = /\(([^)]*)\)/;
    var rpipeline = /\|(?=\?\?)/;
    var rregexp = /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\\\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})]))/g;
    var robjectProp = /\.[\w\.\$]+/g; //对象的属性 el.xxx 中的xxx
    var robjectKey = /(\{|\,)\s*([\$\w]+)\s*:/g; //对象的键名与冒号 {xxx:1,yyy: 2}中的xxx, yyy
    var rfilterName = /\|(\w+)/g;
    var rlocalVar = /[$a-zA-Z_][$a-zA-Z0-9_]*/g;

    var exprCache = new Cache(300);

    function addScopeForLocal(str) {
        return str.replace(robjectProp, dig).replace(rlocalVar, function (el) {
            if (!skipMap[el]) {
                return "__vmodel__." + el;
            }
            return el;
        });
    }

    function addScope(expr, type) {
        var cacheKey = expr + ':' + type;
        var cache = exprCache.get(cacheKey);
        if (cache) {
            return cache.slice(0);
        }

        stringPool.map = {};
        //https://github.com/RubyLouvre/avalon/issues/1849
        var input = expr.replace(rregexp, function (a, b) {
            return b + dig(a.slice(b.length));
        }); //移除所有正则
        input = clearString(input); //移除所有字符串
        input = input.replace(rshortCircuit, dig). //移除所有短路运算符
        replace(ruselessSp, '$1'). //移除.|两端空白

        replace(robjectKey, function (_, a, b) {
            //移除所有键名
            return a + dig(b) + ':'; //比如 ms-widget="[{is:'ms-address-wrap', $id:'address'}]"这样极端的情况 
        }).replace(rvmKey, '$1__vmodel__.'). //转换@与##为__vmodel__
        replace(rfilterName, function (a, b) {
            //移除所有过滤器的名字
            return '|' + dig(b);
        });
        input = addScopeForLocal(input); //在本地变量前添加__vmodel__

        var filters = input.split(rpipeline); //根据管道符切割表达式
        var body = filters.shift().replace(rfill, fill).trim();
        if (/\?\?\d/.test(body)) {
            body = body.replace(rfill, fill);
        }
        if (filters.length) {
            filters = filters.map(function (filter) {
                var bracketArgs = '';
                filter = filter.replace(brackets, function (a, b) {
                    if (/\S/.test(b)) {
                        bracketArgs += ',' + b; //还原字符串,正则,短路运算符
                    }
                    return '';
                });
                var arg = '[' + avalon.quote(filter.trim()) + bracketArgs + ']';
                return arg;
            });
            filters = 'avalon.composeFilters(' + filters + ')(__value__)';
            filters = filters.replace(rfill, fill);
        } else {
            filters = '';
        }
        return exprCache.put(cacheKey, [body, filters]);
    }
    var rhandleName = /^__vmodel__\.[$\w\.]+$/;
    var rfixIE678 = /__vmodel__\.([^(]+)\(([^)]*)\)/;
    function makeHandle(body) {
        if (rhandleName.test(body)) {
            body = body + '($event)';
        }
        /* istanbul ignore if */
        if (msie < 9) {
            body = body.replace(rfixIE678, function (a, b, c) {
                return '__vmodel__.' + b + '.call(__vmodel__' + (/\S/.test(c) ? ',' + c : '') + ')';
            });
        }
        return body;
    }
    function createGetter(expr, type) {
        var arr = addScope(expr, type),
            body;
        if (!arr[1]) {
            body = arr[0];
        } else {
            body = arr[1].replace(/__value__\)$/, arr[0] + ')');
        }
        try {
            return new Function('__vmodel__', 'return ' + body + ';');
            /* istanbul ignore next */
        } catch (e) {
            avalon.log('parse getter: [', expr, body, ']error');
            return avalon.noop;
        }
    }

    /**
     * 生成表达式设值函数
     * @param  {String}  expr
     */
    function createSetter(expr, type) {
        var arr = addScope(expr, type);
        var body = 'try{ ' + arr[0] + ' = __value__}catch(e){}';
        try {
            return new Function('__vmodel__', '__value__', body + ';');
            /* istanbul ignore next */
        } catch (e) {
            avalon.log('parse setter: ', expr, ' error');
            return avalon.noop;
        }
    }

    var actionUUID = 1;
    //需要重构
    function Action(vm, options, callback) {
        for (var i in options) {
            if (protectedMenbers[i] !== 1) {
                this[i] = options[i];
            }
        }

        this.vm = vm;
        this.observers = [];
        this.callback = callback;
        this.uuid = ++actionUUID;
        this.ids = '';
        this.mapIDs = {}; //这个用于去重
        this.isAction = true;
        var expr = this.expr;
        // 缓存取值函数
        if (typeof this.getter !== 'function') {
            this.getter = createGetter(expr, this.type);
        }
        // 缓存设值函数（双向数据绑定）
        if (this.type === 'duplex') {
            this.setter = createSetter(expr, this.type);
        }
        // 缓存表达式旧值
        this.value = NaN;
        // 表达式初始值 & 提取依赖
        if (!this.node) {
            this.value = this.get();
        }
    }

    Action.prototype = {
        getValue: function getValue() {
            var scope = this.vm;
            try {
                return this.getter.call(scope, scope);
            } catch (e) {
                avalon.log(this.getter + ' exec error');
            }
        },
        setValue: function setValue(value) {
            var scope = this.vm;
            if (this.setter) {
                this.setter.call(scope, scope, value);
            }
        },


        // get --> getValue --> getter
        get: function get(fn) {
            var name = 'action track ' + this.type;

            if (this.deep) {
                avalon.deepCollect = true;
            }

            var value = collectDeps(this, this.getValue);
            if (this.deep && avalon.deepCollect) {
                avalon.deepCollect = false;
            }

            return value;
        },


        /**
         * 在更新视图前保存原有的value
         */
        beforeUpdate: function beforeUpdate() {
            var v = this.value;
            return this.oldValue = v && v.$events ? v.$model : v;
        },
        update: function update(args, uuid) {
            var oldVal = this.beforeUpdate();
            var newVal = this.value = this.get();
            var callback = this.callback;
            if (callback && this.diff(newVal, oldVal, args)) {
                callback.call(this.vm, this.value, oldVal, this.expr);
            }
            this._isScheduled = false;
        },
        schedule: function schedule() {
            if (!this._isScheduled) {
                this._isScheduled = true;
                if (!avalon.uniqActions[this.uuid]) {
                    avalon.uniqActions[this.uuid] = 1;
                    avalon.pendingActions.push(this);
                }

                runActions(); //这里会还原_isScheduled

            }
        },
        removeDepends: function removeDepends() {
            var self = this;
            this.observers.forEach(function (depend) {
                avalon.Array.remove(depend.observers, self);
            });
        },


        /**
         * 比较两个计算值是否,一致,在for, class等能复杂数据类型的指令中,它们会重写diff复法
         */
        diff: function diff(a, b) {
            return a !== b;
        },


        /**
         * 销毁指令
         */
        dispose: function dispose() {
            this.value = null;
            this.removeDepends();
            if (this.beforeDispose) {
                this.beforeDispose();
            }
            for (var i in this) {
                delete this[i];
            }
        }
    };

    var protectedMenbers = {
        vm: 1,
        callback: 1,

        observers: 1,
        oldValue: 1,
        value: 1,
        getValue: 1,
        setValue: 1,
        get: 1,

        removeDepends: 1,
        beforeUpdate: 1,
        update: 1,
        //diff
        //getter
        //setter
        //expr
        //vdom
        //type: "for"
        //name: "ms-for"
        //attrName: ":for"
        //param: "click"
        //beforeDispose
        dispose: 1
    };

    /**
    * 
     与Computed等共享UUID
    */
    var obid = 1;
    function Mutation(expr, value, vm) {
        //构造函数
        this.expr = expr;
        if (value) {
            var childVm = platform.createProxy(value, this);
            if (childVm) {
                value = childVm;
            }
        }
        this.value = value;
        this.vm = vm;
        try {
            vm.$mutations[expr] = this;
        } catch (ignoreIE) {}
        this.uuid = ++obid;
        this.updateVersion();
        this.mapIDs = {};
        this.observers = [];
    }

    Mutation.prototype = {
        get: function get() {
            if (avalon.trackingAction) {
                this.collect(); //被收集
                var childOb = this.value;
                if (childOb && childOb.$events) {
                    if (Array.isArray(childOb)) {
                        childOb.forEach(function (item) {
                            if (item && item.$events) {
                                item.$events.__dep__.collect();
                            }
                        });
                    } else if (avalon.deepCollect) {
                        for (var key in childOb) {
                            if (childOb.hasOwnProperty(key)) {
                                var collectIt = childOb[key];
                            }
                        }
                    }
                }
            }
            return this.value;
        },
        collect: function collect() {
            avalon.track(name, '被收集');
            reportObserved(this);
        },
        updateVersion: function updateVersion() {
            this.version = Math.random() + Math.random();
        },
        notify: function notify() {
            transactionStart();
            propagateChanged(this);
            transactionEnd();
        },
        set: function set(newValue) {
            var oldValue = this.value;
            if (newValue !== oldValue) {
                if (avalon.isObject(newValue)) {
                    var hash = oldValue && oldValue.$hashcode;
                    var childVM = platform.createProxy(newValue, this);
                    if (childVM) {
                        if (hash) {
                            childVM.$hashcode = hash;
                        }
                        newValue = childVM;
                    }
                }
                this.value = newValue;
                this.updateVersion();
                this.notify();
            }
        }
    };

    function getBody(fn) {
        var entire = fn.toString();
        return entire.substring(entire.indexOf('{}') + 1, entire.lastIndexOf('}'));
    }
    //如果不存在三目,if,方法
    var instability = /(\?|if\b|\(.+\))/;

    function __create(o) {
        var __ = function __() {};
        __.prototype = o;
        return new __();
    }

    function __extends(child, parent) {
        if (typeof parent === 'function') {
            var proto = child.prototype = __create(parent.prototype);
            proto.constructor = child;
        }
    }
    var Computed = function (_super) {
        __extends(Computed, _super);

        function Computed(name, options, vm) {
            //构造函数
            _super.call(this, name, undefined, vm);
            delete options.get;
            delete options.set;

            avalon.mix(this, options);
            this.deps = {};
            this.type = 'computed';
            this.depsVersion = {};
            this.isComputed = true;
            this.trackAndCompute();
            if (!('isStable' in this)) {
                this.isStable = !instability.test(getBody(this.getter));
            }
        }
        var cp = Computed.prototype;
        cp.trackAndCompute = function () {
            if (this.isStable && this.depsCount > 0) {
                this.getValue();
            } else {
                collectDeps(this, this.getValue.bind(this));
            }
        };

        cp.getValue = function () {
            return this.value = this.getter.call(this.vm);
        };

        cp.schedule = function () {
            var observers = this.observers;
            var i = observers.length;
            while (i--) {
                var d = observers[i];
                if (d.schedule) {
                    d.schedule();
                }
            }
        };

        cp.shouldCompute = function () {
            if (this.isStable) {
                //如果变动因子确定,那么只比较变动因子的版本
                var toComputed = false;
                for (var i in this.deps) {
                    if (this.deps[i].version !== this.depsVersion[i]) {
                        toComputed = true;
                        this.deps[i].version = this.depsVersion[i];
                    }
                }
                return toComputed;
            }
            return true;
        };
        cp.set = function () {
            if (this.setter) {
                avalon.transaction(this.setter, this.vm, arguments);
            }
        };
        cp.get = function () {

            //当被设置了就不稳定,当它被访问了一次就是稳定
            this.collect();

            if (this.shouldCompute()) {
                this.trackAndCompute();
                // console.log('computed 2 分支')
                this.updateVersion();
                //  this.reportChanged()
            }

            //下面这一行好像没用
            return this.value;
        };
        return Computed;
    }(Mutation);

    /**
     * 这里放置ViewModel模块的共用方法
     * avalon.define: 全框架最重要的方法,生成用户VM
     * IProxy, 基本用户数据产生的一个数据对象,基于$model与vmodel之间的形态
     * modelFactory: 生成用户VM
     * canHijack: 判定此属性是否该被劫持,加入数据监听与分发的的逻辑
     * createProxy: listFactory与modelFactory的封装
     * createAccessor: 实现数据监听与分发的重要对象
     * itemFactory: ms-for循环中产生的代理VM的生成工厂
     * fuseFactory: 两个ms-controller间产生的代理VM的生成工厂
     */

    avalon.define = function (definition) {
        var $id = definition.$id;
        if (!$id) {
            avalon.error('vm.$id must be specified');
        }
        if (avalon.vmodels[$id]) {
            avalon.warn('error:[' + $id + '] had defined!');
        }
        var vm = platform.modelFactory(definition);
        return avalon.vmodels[$id] = vm;
    };

    /**
     * 在未来的版本,avalon改用Proxy来创建VM,因此
     */

    function IProxy(definition, dd) {
        avalon.mix(this, definition);
        avalon.mix(this, $$skipArray);
        this.$hashcode = avalon.makeHashCode('$');
        this.$id = this.$id || this.$hashcode;
        this.$events = {
            __dep__: dd || new Mutation(this.$id)
        };
        if (avalon.config.inProxyMode) {
            delete this.$mutations;
            this.$accessors = {};
            this.$computed = {};
            this.$track = '';
        } else {
            this.$accessors = {
                $model: modelAccessor
            };
        }
        if (dd === void 0) {
            this.$watch = platform.watchFactory(this.$events);
            this.$fire = platform.fireFactory(this.$events);
        } else {
            delete this.$watch;
            delete this.$fire;
        }
    }

    platform.modelFactory = function modelFactory(definition, dd) {
        var $computed = definition.$computed || {};
        delete definition.$computed;
        var core = new IProxy(definition, dd);
        var $accessors = core.$accessors;
        var keys = [];

        platform.hideProperty(core, '$mutations', {});

        for (var key in definition) {
            if (key in $$skipArray) continue;
            var val = definition[key];
            keys.push(key);
            if (canHijack(key, val)) {
                $accessors[key] = createAccessor(key, val);
            }
        }
        for (var _key in $computed) {
            if (_key in $$skipArray) continue;
            var val = $computed[_key];
            if (typeof val === 'function') {
                val = {
                    get: val
                };
            }
            if (val && val.get) {
                val.getter = val.get;
                val.setter = val.set;
                avalon.Array.ensure(keys, _key);
                $accessors[_key] = createAccessor(_key, val, true);
            }
        }
        //将系统API以unenumerable形式加入vm,
        //添加用户的其他不可监听属性或方法
        //重写$track
        //并在IE6-8中增添加不存在的hasOwnPropert方法
        var vm = platform.createViewModel(core, $accessors, core);
        platform.afterCreate(vm, core, keys, !dd);
        return vm;
    };
    var $proxyItemBackdoorMap = {};

    function canHijack(key, val, $proxyItemBackdoor) {
        if (key in $$skipArray) return false;
        if (key.charAt(0) === '$') {
            if ($proxyItemBackdoor) {
                if (!$proxyItemBackdoorMap[key]) {
                    $proxyItemBackdoorMap[key] = 1;
                    avalon.warn('ms-for\u4E2D\u7684\u53D8\u91CF' + key + '\u4E0D\u518D\u5EFA\u8BAE\u4EE5$\u4E3A\u524D\u7F00');
                }
                return true;
            }
            return false;
        }
        if (val == null) {
            avalon.warn('定义vmodel时' + key + '的属性值不能为null undefine');
            return true;
        }
        if (/error|date|function|regexp/.test(avalon.type(val))) {
            return false;
        }
        return !(val && val.nodeName && val.nodeType);
    }

    function createProxy(target, dd) {
        if (target && target.$events) {
            return target;
        }
        var vm;
        if (Array.isArray(target)) {
            vm = platform.listFactory(target, false, dd);
        } else if (isObject(target)) {
            vm = platform.modelFactory(target, dd);
        }
        return vm;
    }

    platform.createProxy = createProxy;

    platform.itemFactory = function itemFactory(before, after) {
        var keyMap = before.$model;
        var core = new IProxy(keyMap);
        var state = avalon.shadowCopy(core.$accessors, before.$accessors); //防止互相污染
        var data = after.data;
        //core是包含系统属性的对象
        //keyMap是不包含系统属性的对象, keys
        for (var key in data) {
            var val = keyMap[key] = core[key] = data[key];
            state[key] = createAccessor(key, val);
        }
        var keys = Object.keys(keyMap);
        var vm = platform.createViewModel(core, state, core);
        platform.afterCreate(vm, core, keys);
        return vm;
    };

    function createAccessor(key, val, isComputed) {
        var mutation = null;
        var Accessor = isComputed ? Computed : Mutation;
        return {
            get: function Getter() {
                if (!mutation) {
                    mutation = new Accessor(key, val, this);
                }
                return mutation.get();
            },
            set: function Setter(newValue) {
                if (!mutation) {
                    mutation = new Accessor(key, val, this);
                }
                mutation.set(newValue);
            },
            enumerable: true,
            configurable: true
        };
    }

    platform.fuseFactory = function fuseFactory(before, after) {
        var keyMap = avalon.mix(before.$model, after.$model);
        var core = new IProxy(avalon.mix(keyMap, {
            $id: before.$id + after.$id
        }));
        var state = avalon.mix(core.$accessors, before.$accessors, after.$accessors); //防止互相污染

        var keys = Object.keys(keyMap);
        //将系统API以unenumerable形式加入vm,并在IE6-8中添加hasOwnPropert方法
        var vm = platform.createViewModel(core, state, core);
        platform.afterCreate(vm, core, keys, false);
        return vm;
    };

    function toJson(val) {
        var xtype = avalon.type(val);
        if (xtype === 'array') {
            var array = [];
            for (var i = 0; i < val.length; i++) {
                array[i] = toJson(val[i]);
            }
            return array;
        } else if (xtype === 'object') {
            if (typeof val.$track === 'string') {
                var obj = {};
                var arr = val.$track.match(/[^☥]+/g) || [];
                arr.forEach(function (i) {
                    var value = val[i];
                    obj[i] = value && value.$events ? toJson(value) : value;
                });
                return obj;
            }
        }
        return val;
    }

    var modelAccessor = {
        get: function get() {
            return toJson(this);
        },
        set: avalon.noop,
        enumerable: false,
        configurable: true
    };

    platform.toJson = toJson;
    platform.modelAccessor = modelAccessor;

    var _splice = ap.splice;
    var __array__ = {
        set: function set(index, val) {
            if (index >>> 0 === index && this[index] !== val) {
                if (index > this.length) {
                    throw Error(index + 'set方法的第一个参数不能大于原数组长度');
                }
                this.splice(index, 1, val);
            }
        },
        toJSON: function toJSON() {
            //为了解决IE6-8的解决,通过此方法显式地求取数组的$model
            return this.$model = platform.toJson(this);
        },
        contains: function contains(el) {
            //判定是否包含
            return this.indexOf(el) !== -1;
        },
        ensure: function ensure(el) {
            if (!this.contains(el)) {
                //只有不存在才push
                this.push(el);
                return true;
            }
            return false;
        },
        pushArray: function pushArray(arr) {
            return this.push.apply(this, arr);
        },
        remove: function remove(el) {
            //移除第一个等于给定值的元素
            return this.removeAt(this.indexOf(el));
        },
        removeAt: function removeAt(index) {
            //移除指定索引上的元素
            if (index >>> 0 === index) {
                return this.splice(index, 1);
            }
            return [];
        },
        clear: function clear() {
            this.removeAll();
            return this;
        },
        removeAll: function removeAll(all) {
            //移除N个元素
            var size = this.length;
            var eliminate = Array.isArray(all) ? function (el) {
                return all.indexOf(el) !== -1;
            } : typeof all === 'function' ? all : false;

            if (eliminate) {
                for (var i = this.length - 1; i >= 0; i--) {
                    if (eliminate(this[i], i)) {
                        _splice.call(this, i, 1);
                    }
                }
            } else {
                _splice.call(this, 0, this.length);
            }
            this.toJSON();
            this.$events.__dep__.notify();
        }
    };
    function hijackMethods(array) {
        for (var i in __array__) {
            platform.hideProperty(array, i, __array__[i]);
        }
    }
    var __method__ = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

    __method__.forEach(function (method) {
        var original = ap[method];
        __array__[method] = function () {
            // 继续尝试劫持数组元素的属性
            var core = this.$events;

            var args = platform.listFactory(arguments, true, core.__dep__);
            var result = original.apply(this, args);

            this.toJSON();
            core.__dep__.notify(method);
            return result;
        };
    });

    function listFactory(array, stop, dd) {
        if (!stop) {
            hijackMethods(array);
            if (modern) {
                Object.defineProperty(array, '$model', platform.modelAccessor);
            }
            platform.hideProperty(array, '$hashcode', avalon.makeHashCode('$'));
            platform.hideProperty(array, '$events', { __dep__: dd || new Mutation() });
        }
        var _dd = array.$events && array.$events.__dep__;
        for (var i = 0, n = array.length; i < n; i++) {
            var item = array[i];
            if (isObject(item)) {
                array[i] = platform.createProxy(item, _dd);
            }
        }
        return array;
    }

    platform.listFactory = listFactory;

    //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8
    //标准浏览器使用__defineGetter__, __defineSetter__实现
    var canHideProperty = true;
    try {
        Object.defineProperty({}, '_', {
            value: 'x'
        });
        delete $$skipArray.$vbsetter;
        delete $$skipArray.$vbthis;
    } catch (e) {
        /* istanbul ignore next*/
        canHideProperty = false;
    }

    var protectedVB = { $vbthis: 1, $vbsetter: 1 };
    /* istanbul ignore next */
    function hideProperty(host, name, value) {
        if (canHideProperty) {
            Object.defineProperty(host, name, {
                value: value,
                writable: true,
                enumerable: false,
                configurable: true
            });
        } else if (!protectedVB[name]) {
            /* istanbul ignore next */
            host[name] = value;
        }
    }

    function watchFactory(core) {
        return function $watch(expr, callback, deep) {
            var w = new Action(core.__proxy__, {
                deep: deep,
                type: 'user',
                expr: expr
            }, callback);
            if (!core[expr]) {
                core[expr] = [w];
            } else {
                core[expr].push(w);
            }

            return function () {
                w.dispose();
                avalon.Array.remove(core[expr], w);
                if (core[expr].length === 0) {
                    delete core[expr];
                }
            };
        };
    }

    function fireFactory(core) {
        return function $fire(expr, a) {
            var list = core[expr];
            if (Array.isArray(list)) {
                for (var i = 0, w; w = list[i++];) {
                    w.callback.call(w.vm, a, w.value, w.expr);
                }
            }
        };
    }

    function wrapIt(str) {
        return '☥' + str + '☥';
    }

    function afterCreate(vm, core, keys, bindThis) {
        var ac = vm.$accessors;
        //隐藏系统属性
        for (var key in $$skipArray) {
            if (avalon.msie < 9 && core[key] === void 0) continue;
            hideProperty(vm, key, core[key]);
        }
        //为不可监听的属性或方法赋值
        for (var i = 0; i < keys.length; i++) {
            var _key2 = keys[i];
            if (!(_key2 in ac)) {
                if (bindThis && typeof core[_key2] === 'function') {
                    vm[_key2] = core[_key2].bind(vm);
                    continue;
                }
                vm[_key2] = core[_key2];
            }
        }
        vm.$track = keys.join('☥');

        function hasOwnKey(key) {
            return wrapIt(vm.$track).indexOf(wrapIt(key)) > -1;
        }
        if (avalon.msie < 9) {
            vm.hasOwnProperty = hasOwnKey;
        }
        vm.$events.__proxy__ = vm;
    }

    platform.hideProperty = hideProperty;
    platform.fireFactory = fireFactory;
    platform.watchFactory = watchFactory;
    platform.afterCreate = afterCreate;

    var createViewModel = Object.defineProperties;
    var defineProperty;

    var timeBucket = new Date() - 0;
    /* istanbul ignore if*/
    if (!canHideProperty) {
        if ('__defineGetter__' in avalon) {
            defineProperty = function defineProperty(obj, prop, desc) {
                if ('value' in desc) {
                    obj[prop] = desc.value;
                }
                if ('get' in desc) {
                    obj.__defineGetter__(prop, desc.get);
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set);
                }
                return obj;
            };
            createViewModel = function createViewModel(obj, descs) {
                for (var prop in descs) {
                    if (descs.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, descs[prop]);
                    }
                }
                return obj;
            };
        }
        /* istanbul ignore if*/
        if (msie < 9) {
            var VBClassPool = {};
            window.execScript([// jshint ignore:line
            'Function parseVB(code)', '\tExecuteGlobal(code)', 'End Function' //转换一段文本为VB代码
            ].join('\n'), 'VBScript');

            var VBMediator = function VBMediator(instance, accessors, name, value) {
                // jshint ignore:line
                var accessor = accessors[name];
                if (arguments.length === 4) {
                    accessor.set.call(instance, value);
                } else {
                    return accessor.get.call(instance);
                }
            };
            createViewModel = function createViewModel(name, accessors, properties) {
                // jshint ignore:line
                var buffer = [];
                buffer.push('\tPrivate [$vbsetter]', '\tPublic  [$accessors]', '\tPublic Default Function [$vbthis](ac' + timeBucket + ', s' + timeBucket + ')', '\t\tSet  [$accessors] = ac' + timeBucket + ': set [$vbsetter] = s' + timeBucket, '\t\tSet  [$vbthis]    = Me', //链式调用
                '\tEnd Function');
                //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
                var uniq = {
                    $vbthis: true,
                    $vbsetter: true,
                    $accessors: true
                };
                for (name in $$skipArray) {
                    if (!uniq[name]) {
                        buffer.push('\tPublic [' + name + ']');
                        uniq[name] = true;
                    }
                }
                //添加访问器属性 
                for (name in accessors) {
                    if (uniq[name]) {
                        continue;
                    }
                    uniq[name] = true;
                    buffer.push(
                    //由于不知对方会传入什么,因此set, let都用上
                    '\tPublic Property Let [' + name + '](val' + timeBucket + ')', //setter
                    '\t\tCall [$vbsetter](Me, [$accessors], "' + name + '", val' + timeBucket + ')', '\tEnd Property', '\tPublic Property Set [' + name + '](val' + timeBucket + ')', //setter
                    '\t\tCall [$vbsetter](Me, [$accessors], "' + name + '", val' + timeBucket + ')', '\tEnd Property', '\tPublic Property Get [' + name + ']', //getter
                    '\tOn Error Resume Next', //必须优先使用set语句,否则它会误将数组当字符串返回
                    '\t\tSet[' + name + '] = [$vbsetter](Me, [$accessors],"' + name + '")', '\tIf Err.Number <> 0 Then', '\t\t[' + name + '] = [$vbsetter](Me, [$accessors],"' + name + '")', '\tEnd If', '\tOn Error Goto 0', '\tEnd Property');
                }

                for (name in properties) {
                    if (!uniq[name]) {
                        uniq[name] = true;
                        buffer.push('\tPublic [' + name + ']');
                    }
                }

                buffer.push('\tPublic [hasOwnProperty]');
                buffer.push('End Class');
                var body = buffer.join('\r\n');
                var className = VBClassPool[body];
                if (!className) {
                    className = avalon.makeHashCode('VBClass');
                    window.parseVB('Class ' + className + body);
                    window.parseVB(['Function ' + className + 'Factory(acc, vbm)', //创建实例并传入两个关键的参数
                    '\tDim o', '\tSet o = (New ' + className + ')(acc, vbm)', '\tSet ' + className + 'Factory = o', 'End Function'].join('\r\n'));
                    VBClassPool[body] = className;
                }
                var ret = window[className + 'Factory'](accessors, VBMediator); //得到其产品
                return ret; //得到其产品
            };
        }
    }

    platform.createViewModel = createViewModel;

    var impDir = avalon.directive('important', {
        priority: 1,
        getScope: function getScope(name, scope) {
            var v = avalon.vmodels[name];
            if (v) return v;
            throw 'error! no vmodel called ' + name;
        },
        update: function update(node, attrName, $id) {
            if (!avalon.inBrowser) return;
            var dom = avalon.vdom(node, 'toDOM');
            if (dom.nodeType === 1) {
                dom.removeAttribute(attrName);
                avalon(dom).removeClass('ms-controller');
            }
            var vm = avalon.vmodels[$id];
            if (vm) {
                vm.$element = dom;
                vm.$render = this;
                vm.$fire('onReady');
                delete vm.$events.onReady;
            }
        }
    });

    var impCb = impDir.update;

    avalon.directive('controller', {
        priority: 2,
        getScope: function getScope(name, scope) {
            var v = avalon.vmodels[name];
            if (v) {
                v.$render = this;
                if (scope && scope !== v) {
                    return platform.fuseFactory(scope, v);
                }
                return v;
            }
            return scope;
        },
        update: impCb
    });

    avalon.directive('skip', {
        delay: true
    });

    var arrayWarn = {};
    var cssDir = avalon.directive('css', {
        diff: function diff(newVal, oldVal) {
            if (Object(newVal) === newVal) {
                newVal = platform.toJson(newVal); //安全的遍历VBscript
                if (Array.isArray(newVal)) {
                    //转换成对象
                    var b = {};
                    newVal.forEach(function (el) {
                        el && avalon.shadowCopy(b, el);
                    });
                    newVal = b;
                    if (!arrayWarn[this.type]) {
                        avalon.warn('ms-' + this.type + '指令的值不建议使用数组形式了！');
                        arrayWarn[this.type] = 1;
                    }
                }

                var hasChange = false;
                var patch = {};
                if (!oldVal) {
                    //如果一开始为空
                    patch = newVal;
                    hasChange = true;
                } else {
                    if (this.deep) {
                        var deep = typeof this.deep === 'number' ? this.deep : 6;
                        for (var i in newVal) {
                            //diff差异点  
                            if (!deepEquals(newVal[i], oldVal[i], 4)) {
                                this.value = newVal;
                                return true;
                            }
                            patch[i] = newVal[i];
                        }
                    } else {
                        for (var _i3 in newVal) {
                            //diff差异点
                            if (newVal[_i3] !== oldVal[_i3]) {
                                hasChange = true;
                            }
                            patch[_i3] = newVal[_i3];
                        }
                    }

                    for (var _i4 in oldVal) {
                        if (!(_i4 in patch)) {
                            hasChange = true;
                            patch[_i4] = '';
                        }
                    }
                }
                if (hasChange) {
                    this.value = patch;
                    return true;
                }
            }
            return false;
        },
        update: function update(vdom, value) {

            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                var wrap = avalon(dom);
                for (var name in value) {
                    wrap.css(name, value[name]);
                }
            }
        }
    });

    var cssDiff = cssDir.diff;

    function getEnumerableKeys(obj) {
        var res = [];
        for (var key in obj) {
            res.push(key);
        }return res;
    }

    function deepEquals(a, b, level) {
        if (level === 0) return a === b;
        if (a === null && b === null) return true;
        if (a === undefined && b === undefined) return true;
        var aIsArray = Array.isArray(a);
        if (aIsArray !== Array.isArray(b)) {
            return false;
        }
        if (aIsArray) {
            return equalArray(a, b, level);
        } else if (typeof a === "object" && typeof b === "object") {
            return equalObject(a, b, level);
        }
        return a === b;
    }

    function equalArray(a, b, level) {
        if (a.length !== b.length) {
            return false;
        }
        for (var i = a.length - 1; i >= 0; i--) {
            try {
                if (!deepEquals(a[i], b[i], level - 1)) {
                    return false;
                }
            } catch (noThisPropError) {
                return false;
            }
        }
        return true;
    }

    function equalObject(a, b, level) {
        if (a === null || b === null) return false;
        if (getEnumerableKeys(a).length !== getEnumerableKeys(b).length) return false;
        for (var prop in a) {
            if (!(prop in b)) return false;
            try {
                if (!deepEquals(a[prop], b[prop], level - 1)) {
                    return false;
                }
            } catch (noThisPropError) {
                return false;
            }
        }
        return true;
    }

    /**
     * ------------------------------------------------------------
     * 检测浏览器对CSS动画的支持与API名
     * ------------------------------------------------------------
     */

    var checker = {
        TransitionEvent: 'transitionend',
        WebKitTransitionEvent: 'webkitTransitionEnd',
        OTransitionEvent: 'oTransitionEnd',
        otransitionEvent: 'otransitionEnd'
    };
    var css3 = void 0;
    var tran = void 0;
    var ani = void 0;
    var name$2 = void 0;
    var animationEndEvent = void 0;
    var transitionEndEvent = void 0;
    var transition = false;
    var animation = false;
    //有的浏览器同时支持私有实现与标准写法，比如webkit支持前两种，Opera支持1、3、4
    for (name$2 in checker) {
        if (window$1[name$2]) {
            tran = checker[name$2];
            break;
        }
        /* istanbul ignore next */
        try {
            var a = document.createEvent(name$2);
            tran = checker[name$2];
            break;
        } catch (e) {}
    }
    if (typeof tran === 'string') {
        transition = css3 = true;
        transitionEndEvent = tran;
    }

    //animationend有两个可用形态
    //IE10+, Firefox 16+ & Opera 12.1+: animationend
    //Chrome/Safari: webkitAnimationEnd
    //http://blogs.msdn.com/b/davrous/archive/2011/12/06/introduction-to-css3-animat ions.aspx
    //IE10也可以使用MSAnimationEnd监听，但是回调里的事件 type依然为animationend
    //  el.addEventListener('MSAnimationEnd', function(e) {
    //     alert(e.type)// animationend！！！
    // })
    checker = {
        'AnimationEvent': 'animationend',
        'WebKitAnimationEvent': 'webkitAnimationEnd'
    };
    for (name$2 in checker) {
        if (window$1[name$2]) {
            ani = checker[name$2];
            break;
        }
    }
    if (typeof ani === 'string') {
        animation = css3 = true;
        animationEndEvent = ani;
    }

    var effectDir = avalon.directive('effect', {
        priority: 5,
        diff: function diff(effect) {
            var vdom = this.node;
            if (typeof effect === 'string') {
                this.value = effect = {
                    is: effect
                };
                avalon.warn('ms-effect的指令值不再支持字符串,必须是一个对象');
            }
            this.value = vdom.effect = effect;
            var ok = cssDiff.call(this, effect, this.oldValue);
            var me = this;
            if (ok) {
                setTimeout(function () {
                    vdom.animating = true;
                    effectDir.update.call(me, vdom, vdom.effect);
                });
                vdom.animating = false;
                return true;
            }
            return false;
        },

        update: function update(vdom, change, opts) {
            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                //要求配置对象必须指定is属性，action必须是布尔或enter,leave,move
                var option = change || opts;
                var is = option.is;

                var globalOption = avalon.effects[is];
                if (!globalOption) {
                    //如果没有定义特效
                    avalon.warn(is + ' effect is undefined');
                    return;
                }
                var finalOption = {};
                var action = actionMaps[option.action];
                if (typeof Effect.prototype[action] !== 'function') {
                    avalon.warn('action is undefined');
                    return;
                }
                //必须预定义特效

                var effect = new avalon.Effect(dom);
                avalon.mix(finalOption, globalOption, option, { action: action });

                if (finalOption.queue) {
                    animationQueue.push(function () {
                        effect[action](finalOption);
                    });
                    callNextAnimation();
                } else {

                    effect[action](finalOption);
                }
                return true;
            }
        }
    });

    var move = 'move';
    var leave = 'leave';
    var enter = 'enter';
    var actionMaps = {
        'true': enter,
        'false': leave,
        enter: enter,
        leave: leave,
        move: move,
        'undefined': enter
    };

    var animationQueue = [];
    function callNextAnimation() {
        var fn = animationQueue[0];
        if (fn) {
            fn();
        }
    }

    avalon.effects = {};
    avalon.effect = function (name, opts) {
        var definition = avalon.effects[name] = opts || {};
        if (css3 && definition.css !== false) {
            patchObject(definition, 'enterClass', name + '-enter');
            patchObject(definition, 'enterActiveClass', definition.enterClass + '-active');
            patchObject(definition, 'leaveClass', name + '-leave');
            patchObject(definition, 'leaveActiveClass', definition.leaveClass + '-active');
        }
        return definition;
    };

    function patchObject(obj, name, value) {
        if (!obj[name]) {
            obj[name] = value;
        }
    }

    var Effect = function Effect(dom) {
        this.dom = dom;
    };

    avalon.Effect = Effect;

    Effect.prototype = {
        enter: createAction('Enter'),
        leave: createAction('Leave'),
        move: createAction('Move')
    };

    function execHooks(options, name, el) {
        var fns = [].concat(options[name]);
        for (var i = 0, fn; fn = fns[i++];) {
            if (typeof fn === 'function') {
                fn(el);
            }
        }
    }
    var staggerCache = new Cache(128);

    function createAction(action) {
        var lower = action.toLowerCase();
        return function (option) {
            var dom = this.dom;
            var elem = avalon(dom);
            //处理与ms-for指令相关的stagger
            //========BEGIN=====
            var staggerTime = isFinite(option.stagger) ? option.stagger * 1000 : 0;
            if (staggerTime) {
                if (option.staggerKey) {
                    var stagger = staggerCache.get(option.staggerKey) || staggerCache.put(option.staggerKey, {
                        count: 0,
                        items: 0
                    });
                    stagger.count++;
                    stagger.items++;
                }
            }
            var staggerIndex = stagger && stagger.count || 0;
            //=======END==========
            var stopAnimationID;
            var animationDone = function animationDone(e) {
                var isOk = e !== false;
                if (--dom.__ms_effect_ === 0) {
                    avalon.unbind(dom, transitionEndEvent);
                    avalon.unbind(dom, animationEndEvent);
                }
                clearTimeout(stopAnimationID);
                var dirWord = isOk ? 'Done' : 'Abort';
                execHooks(option, 'on' + action + dirWord, dom);
                if (stagger) {
                    if (--stagger.items === 0) {
                        stagger.count = 0;
                    }
                }
                if (option.queue) {
                    animationQueue.shift();
                    callNextAnimation();
                }
            };
            //执行开始前的钩子
            execHooks(option, 'onBefore' + action, dom);

            if (option[lower]) {
                //使用JS方式执行动画
                option[lower](dom, function (ok) {
                    animationDone(ok !== false);
                });
            } else if (css3) {
                //使用CSS3方式执行动画
                elem.addClass(option[lower + 'Class']);
                elem.removeClass(getNeedRemoved(option, lower));

                if (!dom.__ms_effect_) {
                    //绑定动画结束事件
                    elem.bind(transitionEndEvent, animationDone);
                    elem.bind(animationEndEvent, animationDone);
                    dom.__ms_effect_ = 1;
                } else {
                    dom.__ms_effect_++;
                }
                setTimeout(function () {
                    //用xxx-active代替xxx类名的方式 触发CSS3动画
                    var time = avalon.root.offsetWidth === NaN;
                    elem.addClass(option[lower + 'ActiveClass']);
                    //计算动画时长
                    time = getAnimationTime(dom);
                    if (!time === 0) {
                        //立即结束动画
                        animationDone(false);
                    } else if (!staggerTime) {
                        //如果动画超出时长还没有调用结束事件,这可能是元素被移除了
                        //如果强制结束动画
                        stopAnimationID = setTimeout(function () {
                            animationDone(false);
                        }, time + 32);
                    }
                }, 17 + staggerTime * staggerIndex); // = 1000/60
            }
        };
    }

    avalon.applyEffect = function (dom, vdom, opts) {
        var cb = opts.cb;
        var curEffect = vdom.effect;
        if (curEffect && dom && dom.nodeType === 1) {
            var hook = opts.hook;
            var old = curEffect[hook];
            if (cb) {
                if (Array.isArray(old)) {
                    old.push(cb);
                } else if (old) {
                    curEffect[hook] = [old, cb];
                } else {
                    curEffect[hook] = [cb];
                }
            }
            getAction(opts);
            avalon.directives.effect.update(vdom, curEffect, avalon.shadowCopy({}, opts));
        } else if (cb) {
            cb(dom);
        }
    };
    /**
     * 获取方向
     */
    function getAction(opts) {
        if (!opts.action) {
            return opts.action = opts.hook.replace(/^on/, '').replace(/Done$/, '').toLowerCase();
        }
    }
    /**
     * 需要移除的类名
     */
    function getNeedRemoved(options, name) {
        var name = name === 'leave' ? 'enter' : 'leave';
        return Array(name + 'Class', name + 'ActiveClass').map(function (cls) {
            return options[cls];
        }).join(' ');
    }
    /**
     * 计算动画长度
     */
    var transitionDuration = avalon.cssName('transition-duration');
    var animationDuration = avalon.cssName('animation-duration');
    var rsecond = /\d+s$/;
    function toMillisecond(str) {
        var ratio = rsecond.test(str) ? 1000 : 1;
        return parseFloat(str) * ratio;
    }

    function getAnimationTime(dom) {
        var computedStyles = window$1.getComputedStyle(dom, null);
        var tranDuration = computedStyles[transitionDuration];
        var animDuration = computedStyles[animationDuration];
        return toMillisecond(tranDuration) || toMillisecond(animDuration);
    }
    /**
     * 
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="dist/avalon.js"></script>
            <script>
                avalon.effect('animate')
                var vm = avalon.define({
                    $id: 'ani',
                    a: true
                })
            </script>
            <style>
                .animate-enter, .animate-leave{
                    width:100px;
                    height:100px;
                    background: #29b6f6;
                    transition:all 2s;
                    -moz-transition: all 2s; 
                    -webkit-transition: all 2s;
                    -o-transition:all 2s;
                }  
                .animate-enter-active, .animate-leave{
                    width:300px;
                    height:300px;
                }
                .animate-leave-active{
                    width:100px;
                    height:100px;
                }
            </style>
        </head>
        <body>
            <div :controller='ani' >
                <p><input type='button' value='click' :click='@a =!@a'></p>
                <div :effect="{is:'animate',action:@a}"></div>
            </div>
    </body>
    </html>
     * 
     */

    var none = 'none';
    function parseDisplay(elem, val) {
        //用于取得此类标签的默认display值
        var doc = elem.ownerDocument;
        var nodeName = elem.nodeName;
        var key = '_' + nodeName;
        if (!parseDisplay[key]) {
            var temp = doc.body.appendChild(doc.createElement(nodeName));
            val = avalon.css(temp, 'display');
            doc.body.removeChild(temp);
            if (val === none) {
                val = 'block';
            }
            parseDisplay[key] = val;
        }
        return parseDisplay[key];
    }

    avalon.parseDisplay = parseDisplay;
    avalon.directive('visible', {
        diff: function diff(newVal, oldVal) {
            var n = !!newVal;
            if (oldVal === void 0 || n !== oldVal) {
                this.value = n;
                return true;
            }
        },
        ready: true,
        update: function update(vdom, show) {
            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                var display = dom.style.display;
                var value;
                if (show) {
                    if (display === none) {
                        value = vdom.displayValue;
                        if (!value) {
                            dom.style.display = '';
                            if (dom.style.cssText === '') {
                                dom.removeAttribute('style');
                            }
                        }
                    }
                    if (dom.style.display === '' && avalon(dom).css('display') === none &&
                    // fix firefox BUG,必须挂到页面上
                    avalon.contains(dom.ownerDocument, dom)) {
                        value = parseDisplay(dom);
                    }
                } else {

                    if (display !== none) {
                        value = none;
                        vdom.displayValue = display;
                    }
                }
                var cb = function cb() {
                    if (value !== void 0) {
                        dom.style.display = value;
                    }
                };

                avalon.applyEffect(dom, vdom, {
                    hook: show ? 'onEnterDone' : 'onLeaveDone',
                    cb: cb
                });
            }
        }
    });

    avalon.directive('text', {
        delay: true,
        init: function init() {

            var node = this.node;
            if (node.isVoidTag) {
                avalon.error('自闭合元素不能使用ms-text');
            }
            var child = { nodeName: '#text', nodeValue: this.getValue() };
            node.children.splice(0, node.children.length, child);
            if (inBrowser) {
                avalon.clearHTML(node.dom);
                node.dom.appendChild(avalon.vdom(child, 'toDOM'));
            }
            this.node = child;
            var type = 'expr';
            this.type = this.name = type;
            var directive$$1 = avalon.directives[type];
            var me = this;
            this.callback = function (value) {
                directive$$1.update.call(me, me.node, value);
            };
        }
    });

    avalon.directive('expr', {
        update: function update(vdom, value) {
            value = value == null || value === '' ? '\u200B' : value;
            vdom.nodeValue = value;
            //https://github.com/RubyLouvre/avalon/issues/1834
            if (vdom.dom) vdom.dom.data = value;
        }
    });

    avalon.directive('attr', {
        diff: cssDiff,
        update: function update(vdom, value) {
            var props = vdom.props;
            for (var i in value) {
                if (!!value[i] === false) {
                    delete props[i];
                } else {
                    props[i] = value[i];
                }
            }
            var dom = vdom.dom;
            if (dom && dom.nodeType === 1) {
                updateAttrs(dom, value);
            }
        }
    });

    avalon.directive('html', {

        update: function update(vdom, value) {
            this.beforeDispose();

            this.innerRender = avalon.scan('<div class="ms-html-container">' + value + '</div>', this.vm, function () {
                var oldRoot = this.root;
                if (vdom.children) vdom.children.length = 0;
                vdom.children = oldRoot.children;
                this.root = vdom;
                if (vdom.dom) avalon.clearHTML(vdom.dom);
            });
        },
        beforeDispose: function beforeDispose() {
            if (this.innerRender) {
                this.innerRender.dispose();
            }
        },
        delay: true
    });

    avalon.directive('if', {
        delay: true,
        priority: 5,
        init: function init() {
            this.placeholder = createAnchor('if');
            var props = this.node.props;
            delete props['ms-if'];
            delete props[':if'];
            this.fragment = avalon.vdom(this.node, 'toHTML');
        },
        diff: function diff(newVal, oldVal) {
            var n = !!newVal;
            if (oldVal === void 0 || n !== oldVal) {
                this.value = n;
                return true;
            }
        },
        update: function update(vdom, value) {
            if (this.isShow === void 0 && value) {
                continueScan(this, vdom);
                return;
            }
            this.isShow = value;
            var placeholder = this.placeholder;

            if (value) {
                var p = placeholder.parentNode;
                continueScan(this, vdom);
                p && p.replaceChild(vdom.dom, placeholder);
            } else {
                //移除DOM
                this.beforeDispose();
                vdom.nodeValue = 'if';
                vdom.nodeName = '#comment';
                delete vdom.children;
                var dom = vdom.dom;
                var p = dom && dom.parentNode;
                vdom.dom = placeholder;
                if (p) {
                    p.replaceChild(placeholder, dom);
                }
            }
        },
        beforeDispose: function beforeDispose() {
            if (this.innerRender) {
                this.innerRender.dispose();
            }
        }
    });

    function continueScan(instance, vdom) {
        var innerRender = instance.innerRender = avalon.scan(instance.fragment, instance.vm);
        avalon.shadowCopy(vdom, innerRender.root);
        delete vdom.nodeValue;
    }

    avalon.directive('on', {
        beforeInit: function beforeInit() {
            this.getter = avalon.noop;
        },
        init: function init() {
            var vdom = this.node;
            var underline = this.name.replace('ms-on-', 'e').replace('-', '_');
            var uuid = underline + '_' + this.expr.replace(/\s/g, '').replace(/[^$a-z]/ig, function (e) {
                return e.charCodeAt(0);
            });
            var fn = avalon.eventListeners[uuid];
            if (!fn) {
                var arr = addScope(this.expr);
                var body = arr[0],
                    filters = arr[1];
                body = makeHandle(body);

                if (filters) {
                    filters = filters.replace(/__value__/g, '$event');
                    filters += '\nif($event.$return){\n\treturn;\n}';
                }
                var ret = ['try{', '\tvar __vmodel__ = this;', '\t' + filters, '\treturn ' + body, '}catch(e){avalon.log(e, "in on dir")}'].filter(function (el) {
                    return (/\S/.test(el)
                    );
                });
                fn = new Function('$event', ret.join('\n'));
                fn.uuid = uuid;
                avalon.eventListeners[uuid] = fn;
            }

            var dom = avalon.vdom(vdom, 'toDOM');
            dom._ms_context_ = this.vm;

            this.eventType = this.param.replace(/\-(\d)$/, '');
            delete this.param;
            avalon(dom).bind(this.eventType, fn);
        },

        beforeDispose: function beforeDispose() {
            avalon(this.node.dom).unbind(this.eventType);
        }
    });

    var rforAs = /\s+as\s+([$\w]+)/;
    var rident = /^[$a-zA-Z_][$a-zA-Z0-9_]*$/;
    var rinvalid = /^(null|undefined|NaN|window|this|\$index|\$id)$/;
    var rargs = /[$\w_]+/g;
    avalon.directive('for', {
        delay: true,
        priority: 3,
        beforeInit: function beforeInit() {
            var str = this.expr,
                asName;
            str = str.replace(rforAs, function (a, b) {
                /* istanbul ignore if */
                if (!rident.test(b) || rinvalid.test(b)) {
                    avalon.error('alias ' + b + ' is invalid --- must be a valid JS identifier which is not a reserved name.');
                } else {
                    asName = b;
                }
                return '';
            });

            var arr = str.split(' in ');
            var kv = arr[0].match(rargs);
            if (kv.length === 1) {
                //确保avalon._each的回调有三个参数
                kv.unshift('$key');
            }
            this.expr = arr[1];
            this.keyName = kv[0];
            this.valName = kv[1];
            this.signature = avalon.makeHashCode('for');
            if (asName) {
                this.asName = asName;
            }

            delete this.param;
        },
        init: function init() {
            var cb = this.userCb;
            if (typeof cb === 'string' && cb) {
                var arr = addScope(cb, 'for');
                var body = makeHandle(arr[0]);
                this.userCb = new Function('$event', 'var __vmodel__ = this\nreturn ' + body);
            }
            this.node.forDir = this; //暴露给component/index.js中的resetParentChildren方法使用
            this.fragment = ['<div>', this.fragment, '<!--', this.signature, '--></div>'].join('');
            this.cache = {};
        },
        diff: function diff(newVal, oldVal) {
            /* istanbul ignore if */
            if (this.updating) {
                return;
            }
            this.updating = true;
            var traceIds = createFragments(this, newVal);

            if (this.oldTrackIds === void 0) return true;

            if (this.oldTrackIds !== traceIds) {
                this.oldTrackIds = traceIds;
                return true;
            }
        },
        update: function update() {

            if (!this.preFragments) {
                this.fragments = this.fragments || [];
                mountList(this);
            } else {
                diffList(this);
                updateList(this);
            }

            if (this.userCb) {
                var me = this;
                setTimeout(function () {
                    me.userCb.call(me.vm, {
                        type: 'rendered',
                        target: me.begin.dom,
                        signature: me.signature
                    });
                }, 0);
            }
            delete this.updating;
        },
        beforeDispose: function beforeDispose() {
            this.fragments.forEach(function (el) {
                el.dispose();
            });
        }
    });

    function getTraceKey(item) {
        var type = typeof item;
        return item && type === 'object' ? item.$hashcode : type + ':' + item;
    }

    //创建一组fragment的虚拟DOM
    function createFragments(instance, obj) {
        if (isObject(obj)) {
            var array = Array.isArray(obj);
            var ids = [];
            var fragments = [],
                i = 0;

            instance.isArray = array;
            if (instance.fragments) {
                instance.preFragments = instance.fragments;
                avalon.each(obj, function (key, value) {
                    var k = array ? getTraceKey(value) : key;

                    fragments.push({
                        key: k,
                        val: value,
                        index: i++
                    });
                    ids.push(k);
                });
                instance.fragments = fragments;
            } else {
                avalon.each(obj, function (key, value) {
                    if (!(key in $$skipArray)) {
                        var k = array ? getTraceKey(value) : key;
                        fragments.push(new VFragment([], k, value, i++));
                        ids.push(k);
                    }
                });
                instance.fragments = fragments;
            }
            return ids.join(';;');
        } else {
            return NaN;
        }
    }

    function mountList(instance) {
        var args = instance.fragments.map(function (fragment, index) {
            FragmentDecorator(fragment, instance, index);
            saveInCache(instance.cache, fragment);
            return fragment;
        });
        var list = instance.parentChildren;
        var i = list.indexOf(instance.begin);
        list.splice.apply(list, [i + 1, 0].concat(args));
    }

    function diffList(instance) {
        var cache = instance.cache;
        var newCache = {};
        var fuzzy = [];
        var list = instance.preFragments;

        list.forEach(function (el) {
            el._dispose = true;
        });

        instance.fragments.forEach(function (c, index) {
            var fragment = isInCache(cache, c.key);
            //取出之前的文档碎片
            if (fragment) {
                delete fragment._dispose;
                fragment.oldIndex = fragment.index;
                fragment.index = index; // 相当于 c.index

                resetVM(fragment.vm, instance.keyName);
                fragment.vm[instance.valName] = c.val;
                fragment.vm[instance.keyName] = instance.isArray ? index : fragment.key;
                saveInCache(newCache, fragment);
            } else {
                //如果找不到就进行模糊搜索
                fuzzy.push(c);
            }
        });
        fuzzy.forEach(function (c) {
            var fragment = fuzzyMatchCache(cache, c.key);
            if (fragment) {
                //重复利用
                fragment.oldIndex = fragment.index;
                fragment.key = c.key;
                var val = fragment.val = c.val;
                var index = fragment.index = c.index;

                fragment.vm[instance.valName] = val;
                fragment.vm[instance.keyName] = instance.isArray ? index : fragment.key;
                delete fragment._dispose;
            } else {

                c = new VFragment([], c.key, c.val, c.index);
                fragment = FragmentDecorator(c, instance, c.index);
                list.push(fragment);
            }
            saveInCache(newCache, fragment);
        });

        instance.fragments = list;
        list.sort(function (a, b) {
            return a.index - b.index;
        });
        instance.cache = newCache;
    }

    function resetVM(vm, a, b) {
        if (avalon.config.inProxyMode) {
            vm.$accessors[a].value = NaN;
        } else {
            vm.$accessors[a].set(NaN);
        }
    }

    function updateList(instance) {
        var before = instance.begin.dom;
        var parent = before.parentNode;
        var list = instance.fragments;
        var end = instance.end.dom;
        for (var i = 0, item; item = list[i]; i++) {
            if (item._dispose) {
                list.splice(i, 1);
                i--;
                item.dispose();
                continue;
            }
            if (item.oldIndex !== item.index) {
                var f = item.toFragment();
                var isEnd = before.nextSibling === null;
                parent.insertBefore(f, before.nextSibling);
                if (isEnd && !parent.contains(end)) {
                    parent.insertBefore(end, before.nextSibling);
                }
            }
            before = item.split;
        }
        var ch = instance.parentChildren;
        var startIndex = ch.indexOf(instance.begin);
        var endIndex = ch.indexOf(instance.end);

        list.splice.apply(ch, [startIndex + 1, endIndex - startIndex].concat(list));
    }

    /**
     * 
     * @param {type} fragment
     * @param {type} this
     * @param {type} index
     * @returns { key, val, index, oldIndex, this, dom, split, vm}
     */
    function FragmentDecorator(fragment, instance, index) {
        var data = {};
        data[instance.keyName] = instance.isArray ? index : fragment.key;
        data[instance.valName] = fragment.val;
        if (instance.asName) {
            data[instance.asName] = instance.value;
        }
        var vm = fragment.vm = platform.itemFactory(instance.vm, {
            data: data
        });
        if (instance.isArray) {
            vm.$watch(instance.valName, function (a) {
                if (instance.value && instance.value.set) {
                    instance.value.set(vm[instance.keyName], a);
                }
            });
        } else {
            vm.$watch(instance.valName, function (a) {
                instance.value[fragment.key] = a;
            });
        }

        fragment.index = index;
        fragment.innerRender = avalon.scan(instance.fragment, vm, function () {
            var oldRoot = this.root;
            ap.push.apply(fragment.children, oldRoot.children);
            this.root = fragment;
        });
        return fragment;
    }
    // 新位置: 旧位置
    function isInCache(cache, id) {
        var c = cache[id];
        if (c) {
            var arr = c.arr;
            /* istanbul ignore if*/
            if (arr) {
                var r = arr.pop();
                if (!arr.length) {
                    c.arr = 0;
                }
                return r;
            }
            delete cache[id];
            return c;
        }
    }
    //[1,1,1] number1 number1_ number1__
    function saveInCache(cache, component) {
        var trackId = component.key;
        if (!cache[trackId]) {
            cache[trackId] = component;
        } else {
            var c = cache[trackId];
            var arr = c.arr || (c.arr = []);
            arr.push(component);
        }
    }

    function fuzzyMatchCache(cache) {
        var key;
        for (var id in cache) {
            var key = id;
            break;
        }
        if (key) {
            return isInCache(cache, key);
        }
    }

    //根据VM的属性值或表达式的值切换类名，ms-class='xxx yyy zzz:flag'
    //http://www.cnblogs.com/rubylouvre/archive/2012/12/17/2818540.html
    function classNames() {
        var classes = [];
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            var argType = typeof arg;
            if (argType === 'string' || argType === 'number' || arg === true) {
                classes.push(arg);
            } else if (Array.isArray(arg)) {
                classes.push(classNames.apply(null, arg));
            } else if (argType === 'object') {
                for (var key in arg) {
                    if (arg.hasOwnProperty(key) && arg[key]) {
                        classes.push(key);
                    }
                }
            }
        }

        return classes.join(' ');
    }

    avalon.directive('class', {
        diff: function diff(newVal, oldVal) {
            var type = this.type;
            var vdom = this.node;
            var classEvent = vdom.classEvent || {};
            if (type === 'hover') {
                //在移出移入时切换类名
                classEvent.mouseenter = activateClass;
                classEvent.mouseleave = abandonClass;
            } else if (type === 'active') {
                //在获得焦点时切换类名
                classEvent.tabIndex = vdom.props.tabindex || -1;
                classEvent.mousedown = activateClass;
                classEvent.mouseup = abandonClass;
                classEvent.mouseleave = abandonClass;
            }
            vdom.classEvent = classEvent;

            var className = classNames(newVal);

            if (typeof oldVal === void 0 || oldVal !== className) {
                this.value = className;

                vdom['change-' + type] = className;
                return true;
            }
        },
        update: function update(vdom, value) {
            var dom = vdom.dom;
            if (dom && dom.nodeType == 1) {

                var dirType = this.type;
                var change = 'change-' + dirType;
                var classEvent = vdom.classEvent;
                if (classEvent) {
                    for (var i in classEvent) {
                        if (i === 'tabIndex') {
                            dom[i] = classEvent[i];
                        } else {
                            avalon.bind(dom, i, classEvent[i]);
                        }
                    }
                    vdom.classEvent = {};
                }
                var names = ['class', 'hover', 'active'];
                names.forEach(function (type) {
                    if (dirType !== type) return;
                    if (type === 'class') {
                        dom && setClass(dom, value);
                    } else {
                        var oldClass = dom.getAttribute(change);
                        if (oldClass) {
                            avalon(dom).removeClass(oldClass);
                        }
                        var name = 'change-' + type;
                        dom.setAttribute(name, value);
                    }
                });
            }
        }
    });

    directives.active = directives.hover = directives['class'];

    var classMap = {
        mouseenter: 'change-hover',
        mouseleave: 'change-hover',
        mousedown: 'change-active',
        mouseup: 'change-active'
    };

    function activateClass(e) {
        var elem = e.target;
        avalon(elem).addClass(elem.getAttribute(classMap[e.type]) || '');
    }

    function abandonClass(e) {
        var elem = e.target;
        var name = classMap[e.type];
        avalon(elem).removeClass(elem.getAttribute(name) || '');
        if (name !== 'change-active') {
            avalon(elem).removeClass(elem.getAttribute('change-active') || '');
        }
    }

    function setClass(dom, neo) {
        var old = dom.getAttribute('change-class');
        if (old !== neo) {
            avalon(dom).removeClass(old).addClass(neo);
            dom.setAttribute('change-class', neo);
        }
    }

    getLongID(activateClass);
    getLongID(abandonClass);

    function lookupOption(vdom, values) {
        vdom.children && vdom.children.forEach(function (el) {
            if (el.nodeName === 'option') {
                setOption(el, values);
            } else {
                lookupOption(el, values);
            }
        });
    }

    function setOption(vdom, values) {
        var props = vdom.props;
        if (!('disabled' in props)) {
            var value = getOptionValue(vdom, props);
            value = String(value || '').trim();
            props.selected = values.indexOf(value) !== -1;

            if (vdom.dom) {
                vdom.dom.selected = props.selected;
                var v = vdom.dom.selected; //必须加上这个,防止移出节点selected失效
            }
        }
    }

    function getOptionValue(vdom, props) {
        if (props && 'value' in props) {
            return props.value + '';
        }
        var arr = [];
        vdom.children.forEach(function (el) {
            if (el.nodeName === '#text') {
                arr.push(el.nodeValue);
            } else if (el.nodeName === '#document-fragment') {
                arr.push(getOptionValue(el));
            }
        });
        return arr.join('');
    }

    function getSelectedValue(vdom, arr) {
        vdom.children.forEach(function (el) {
            if (el.nodeName === 'option') {
                if (el.props.selected === true) arr.push(getOptionValue(el, el.props));
            } else if (el.children) {
                getSelectedValue(el, arr);
            }
        });
        return arr;
    }

    var updateDataActions = {
        input: function input(prop) {
            //处理单个value值处理
            var field = this;
            prop = prop || 'value';
            var dom = field.dom;
            var rawValue = dom[prop];
            var parsedValue = field.parseValue(rawValue);

            //有时候parse后一致,vm不会改变,但input里面的值
            field.value = rawValue;
            field.setValue(parsedValue);
            duplexCb(field);
            var pos = field.pos;
            /* istanbul ignore if */
            if (dom.caret) {
                field.setCaret(dom, pos);
            }
            //vm.aaa = '1234567890'
            //处理 <input ms-duplex='@aaa|limitBy(8)'/>{{@aaa}} 这种格式化同步不一致的情况 
        },
        radio: function radio() {
            var field = this;
            if (field.isChecked) {
                var val = !field.value;
                field.setValue(val);
                duplexCb(field);
            } else {
                updateDataActions.input.call(field);
                field.value = NaN;
            }
        },
        checkbox: function checkbox() {
            var field = this;
            var array = field.value;
            if (!Array.isArray(array)) {
                avalon.warn('ms-duplex应用于checkbox上要对应一个数组');
                array = [array];
            }
            var method = field.dom.checked ? 'ensure' : 'remove';
            if (array[method]) {
                var val = field.parseValue(field.dom.value);
                array[method](val);
                duplexCb(field);
            }
            this.__test__ = array;
        },
        select: function select() {
            var field = this;
            var val = avalon(field.dom).val(); //字符串或字符串数组
            if (val + '' !== this.value + '') {
                if (Array.isArray(val)) {
                    //转换布尔数组或其他
                    val = val.map(function (v) {
                        return field.parseValue(v);
                    });
                } else {
                    val = field.parseValue(val);
                }
                field.setValue(val);
                duplexCb(field);
            }
        },
        contenteditable: function contenteditable() {
            updateDataActions.input.call(this, 'innerHTML');
        }
    };

    function duplexCb(field) {
        if (field.userCb) {
            field.userCb.call(field.vm, {
                type: 'changed',
                target: field.dom
            });
        }
    }

    function updateDataHandle(event) {
        var elem = this;
        var field = elem._ms_duplex_;
        if (elem.composing) {
            //防止onpropertychange引发爆栈
            return;
        }
        if (elem.value === field.value) {
            return;
        }
        /* istanbul ignore if*/
        if (elem.caret) {
            try {
                var pos = field.getCaret(elem);
                field.pos = pos;
            } catch (e) {}
        }
        /* istanbul ignore if*/
        if (field.debounceTime > 4) {
            var timestamp = new Date();
            var left = timestamp - field.time || 0;
            field.time = timestamp;
            /* istanbul ignore if*/
            if (left >= field.debounceTime) {
                updateDataActions[field.dtype].call(field);
                /* istanbul ignore else*/
            } else {
                clearTimeout(field.debounceID);
                field.debounceID = setTimeout(function () {
                    updateDataActions[field.dtype].call(field);
                }, left);
            }
        } else {
            updateDataActions[field.dtype].call(field);
        }
    }

    var rchangeFilter = /\|\s*change\b/;
    var rdebounceFilter = /\|\s*debounce(?:\(([^)]+)\))?/;
    function duplexBeforeInit() {
        var expr = this.expr;
        if (rchangeFilter.test(expr)) {
            this.isChanged = true;
            expr = expr.replace(rchangeFilter, '');
        }
        var match = expr.match(rdebounceFilter);
        if (match) {
            expr = expr.replace(rdebounceFilter, '');
            if (!this.isChanged) {
                this.debounceTime = parseInt(match[1], 10) || 300;
            }
        }
        this.expr = expr;
    }
    function duplexInit() {
        var expr = this.expr;
        var node = this.node;
        var etype = node.props.type;
        this.parseValue = parseValue;
        //处理数据转换器
        var parsers = this.param,
            dtype;
        var isChecked = false;
        parsers = parsers ? parsers.split('-').map(function (a) {
            if (a === 'checked') {
                isChecked = true;
            }
            return a;
        }) : [];
        node.duplex = this;
        if (rcheckedType.test(etype) && isChecked) {
            //如果是radio, checkbox,判定用户使用了checked格式函数没有
            parsers = [];
            dtype = 'radio';
            this.isChecked = isChecked;
        }
        this.parsers = parsers;
        if (!/input|textarea|select/.test(node.nodeName)) {
            if ('contenteditable' in node.props) {
                dtype = 'contenteditable';
            }
        } else if (!dtype) {
            dtype = node.nodeName === 'select' ? 'select' : etype === 'checkbox' ? 'checkbox' : etype === 'radio' ? 'radio' : 'input';
        }
        this.dtype = dtype;

        //判定是否使用了 change debounce 过滤器
        // this.isChecked = /boolean/.test(parsers)
        if (dtype !== 'input' && dtype !== 'contenteditable') {
            delete this.isChange;
            delete this.debounceTime;
        } else if (!this.isChecked) {
            this.isString = true;
        }

        var cb = node.props['data-duplex-changed'];
        if (cb) {
            var arr = addScope(cb, 'xx');
            var body = makeHandle(arr[0]);
            this.userCb = new Function('$event', 'var __vmodel__ = this\nreturn ' + body);
        }
    }
    function duplexDiff(newVal, oldVal) {
        if (Array.isArray(newVal)) {
            if (newVal + '' !== this.compareVal) {
                this.compareVal = newVal + '';
                return true;
            }
        } else {
            newVal = this.parseValue(newVal);
            if (!this.isChecked) {
                this.value = newVal += '';
            }
            if (newVal !== this.compareVal) {
                this.compareVal = newVal;
                return true;
            }
        }
    }

    function duplexBind(vdom, addEvent) {
        var dom = vdom.dom;
        this.dom = dom;
        this.vdom = vdom;
        this.duplexCb = updateDataHandle;
        dom._ms_duplex_ = this;
        //绑定事件
        addEvent(dom, this);
    }

    var valueHijack = true;
    try {
        //#272 IE9-IE11, firefox
        var setters = {};
        var aproto = HTMLInputElement.prototype;
        var bproto = HTMLTextAreaElement.prototype;
        var newSetter = function newSetter(value) {
            // jshint ignore:line
            setters[this.tagName].call(this, value);
            var data = this._ms_duplex_;
            if (!this.caret && data && data.isString) {
                data.duplexCb.call(this, { type: 'setter' });
            }
        };
        var inputProto = HTMLInputElement.prototype;
        Object.getOwnPropertyNames(inputProto); //故意引发IE6-8等浏览器报错
        setters['INPUT'] = Object.getOwnPropertyDescriptor(aproto, 'value').set;

        Object.defineProperty(aproto, 'value', {
            set: newSetter
        });
        setters['TEXTAREA'] = Object.getOwnPropertyDescriptor(bproto, 'value').set;
        Object.defineProperty(bproto, 'value', {
            set: newSetter
        });
        valueHijack = false;
    } catch (e) {
        //在chrome 43中 ms-duplex终于不需要使用定时器实现双向绑定了
        // http://updates.html5rocks.com/2015/04/DOM-attributes-now-on-the-prototype
        // https://docs.google.com/document/d/1jwA8mtClwxI-QJuHT7872Z0pxpZz8PBkf2bGAbsUtqs/edit?pli=1
    }

    function parseValue(val) {
        for (var i = 0, k; k = this.parsers[i++];) {
            var fn = avalon.parsers[k];
            if (fn) {
                val = fn.call(this, val);
            }
        }
        return val;
    }

    var updateView = {
        input: function input() {
            //处理单个value值处理
            var vdom = this.node;
            var value = this.value + '';
            vdom.dom.value = vdom.props.value = value;
        },
        updateChecked: function updateChecked(vdom, checked) {
            if (vdom.dom) {
                vdom.dom.defaultChecked = vdom.dom.checked = checked;
            }
        },
        radio: function radio() {
            //处理单个checked属性
            var node = this.node;
            var nodeValue = node.props.value;
            var checked;
            if (this.isChecked) {
                checked = !!this.value;
            } else {
                checked = this.value + '' === nodeValue;
            }
            node.props.checked = checked;
            updateView.updateChecked(node, checked);
        },
        checkbox: function checkbox() {
            //处理多个checked属性
            var node = this.node;
            var props = node.props;
            var value = props.value + '';
            var values = [].concat(this.value);
            var checked = values.some(function (el) {
                return el + '' === value;
            });

            props.defaultChecked = props.checked = checked;
            updateView.updateChecked(node, checked);
        },
        select: function select() {
            //处理子级的selected属性
            var a = Array.isArray(this.value) ? this.value.map(String) : this.value + '';
            lookupOption(this.node, a);
        },
        contenteditable: function contenteditable() {
            //处理单个innerHTML 

            var vnodes = fromString(this.value);
            var fragment = createFragment();
            for (var i = 0, el; el = vnodes[i++];) {
                var child = avalon.vdom(el, 'toDOM');
                fragment.appendChild(child);
            }
            avalon.clearHTML(this.dom).appendChild(fragment);
            var list = this.node.children;
            list.length = 0;
            Array.prototype.push.apply(list, vnodes);

            this.duplexCb.call(this.dom);
        }
    };

    /* 
     * 通过绑定事件同步vmodel
     * 总共有三种方式同步视图
     * 1. 各种事件 input, change, click, propertychange, keydown...
     * 2. value属性重写
     * 3. 定时器轮询
     */

    function updateDataEvents(dom, data) {
        var events = {};
        //添加需要监听的事件
        switch (data.dtype) {
            case 'radio':
            case 'checkbox':
                events.click = updateDataHandle;
                break;
            case 'select':
                events.change = updateDataHandle;
                break;
            case 'contenteditable':
                /* istanbul ignore if */
                if (data.isChanged) {
                    events.blur = updateDataHandle;
                    /* istanbul ignore else */
                } else {
                    /* istanbul ignore if*/

                    if (avalon.modern) {
                        if (window$1.webkitURL) {
                            // http://code.metager.de/source/xref/WebKit/LayoutTests/fast/events/
                            // https://bugs.webkit.org/show_bug.cgi?id=110742
                            events.webkitEditableContentChanged = updateDataHandle;
                        } else if (window$1.MutationEvent) {
                            events.DOMCharacterDataModified = updateDataHandle;
                        }
                        events.input = updateDataHandle;
                        /* istanbul ignore else */
                    } else {
                        events.keydown = updateModelKeyDown;
                        events.paste = updateModelDelay;
                        events.cut = updateModelDelay;
                        events.focus = closeComposition;
                        events.blur = openComposition;
                    }
                }
                break;
            case 'input':
                /* istanbul ignore if */
                if (data.isChanged) {
                    events.change = updateDataHandle;
                    /* istanbul ignore else */
                } else {
                    //http://www.cnblogs.com/rubylouvre/archive/2013/02/17/2914604.html
                    //http://www.matts411.com/post/internet-explorer-9-oninput/
                    if (msie < 10) {
                        //IE6-8的propertychange有问题,第一次用JS修改值时不会触发,而且你是全部清空value也不会触发
                        //IE9的propertychange不支持自动完成,退格,删除,复制,贴粘,剪切或点击右边的小X的清空操作
                        events.propertychange = updateModelHack;
                        events.paste = updateModelDelay;
                        events.cut = updateModelDelay;
                        //IE9在第一次删除字符时不会触发oninput
                        events.keyup = updateModelKeyDown;
                    } else {
                        events.input = updateDataHandle;
                        events.compositionstart = openComposition;
                        //微软拼音输入法的问题需要在compositionend事件中处理
                        events.compositionend = closeComposition;
                        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray
                        //处理低版本的标准浏览器,通过Int8Array进行区分
                        if (!/\[native code\]/.test(window$1.Int8Array)) {
                            events.keydown = updateModelKeyDown; //safari < 5 opera < 11
                            events.paste = updateModelDelay; //safari < 5
                            events.cut = updateModelDelay; //safari < 5 
                            if (window$1.netscape) {
                                // Firefox <= 3.6 doesn't fire the 'input' event when text is filled in through autocomplete
                                events.DOMAutoComplete = updateDataHandle;
                            }
                        }
                    }
                }
                break;
        }

        if (/password|text/.test(dom.type)) {
            events.focus = openCaret; //判定是否使用光标修正功能 
            events.blur = closeCaret;
            data.getCaret = getCaret;
            data.setCaret = setCaret;
        }

        for (var name in events) {
            avalon.bind(dom, name, events[name]);
        }
    }

    function updateModelHack(e) {
        if (e.propertyName === 'value') {
            updateDataHandle.call(this, e);
        }
    }

    function updateModelDelay(e) {
        var elem = this;
        setTimeout(function () {
            updateDataHandle.call(elem, e);
        }, 0);
    }

    function openCaret() {
        this.caret = true;
    }
    /* istanbul ignore next */
    function closeCaret() {
        this.caret = false;
    }
    /* istanbul ignore next */
    function openComposition() {
        this.composing = true;
    }
    /* istanbul ignore next */
    function closeComposition(e) {
        this.composing = false;
        updateModelDelay.call(this, e);
    }
    /* istanbul ignore next */
    function updateModelKeyDown(e) {
        var key = e.keyCode;
        // ignore
        //    command            modifiers                   arrows
        if (key === 91 || 15 < key && key < 19 || 37 <= key && key <= 40) return;
        updateDataHandle.call(this, e);
    }

    getShortID(openCaret);
    getShortID(closeCaret);
    getShortID(openComposition);
    getShortID(closeComposition);
    getShortID(updateDataHandle);
    getShortID(updateModelHack);
    getShortID(updateModelDelay);
    getShortID(updateModelKeyDown);

    //IE6-8要处理光标时需要异步
    var mayBeAsync = function mayBeAsync(fn) {
        setTimeout(fn, 0);
    };
    /* istanbul ignore next */
    function setCaret(target, cursorPosition) {
        var range$$1;
        if (target.createTextRange) {
            mayBeAsync(function () {
                target.focus();
                range$$1 = target.createTextRange();
                range$$1.collapse(true);
                range$$1.moveEnd('character', cursorPosition);
                range$$1.moveStart('character', cursorPosition);
                range$$1.select();
            });
        } else {
            target.focus();
            if (target.selectionStart !== undefined) {
                target.setSelectionRange(cursorPosition, cursorPosition);
            }
        }
    }
    /* istanbul ignore next*/
    function getCaret(target) {
        var start = 0;
        var normalizedValue;
        var range$$1;
        var textInputRange;
        var len;
        var endRange;

        if (target.selectionStart + target.selectionEnd > -1) {
            start = target.selectionStart;
        } else {
            range$$1 = document$1.selection.createRange();

            if (range$$1 && range$$1.parentElement() === target) {
                len = target.value.length;
                normalizedValue = target.value.replace(/\r\n/g, '\n');

                textInputRange = target.createTextRange();
                textInputRange.moveToBookmark(range$$1.getBookmark());

                endRange = target.createTextRange();
                endRange.collapse(false);

                if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                    start = len;
                } else {
                    start = -textInputRange.moveStart('character', -len);
                    start += normalizedValue.slice(0, start).split('\n').length - 1;
                }
            }
        }

        return start;
    }

    avalon.directive('duplex', {
        priority: 9999999,
        beforeInit: duplexBeforeInit,
        init: duplexInit,
        diff: duplexDiff,
        update: function update(vdom, value) {
            if (!this.dom) {
                duplexBind.call(this, vdom, updateDataEvents);
            }
            //如果不支持input.value的Object.defineProperty的属性支持,
            //需要通过轮询同步, chrome 42及以下版本需要这个hack
            pollValue.call(this, avalon.msie, valueHijack);
            //更新视图

            updateView[this.dtype].call(this);
        }
    });

    function pollValue(isIE, valueHijack$$1) {
        var dom = this.dom;
        if (this.isString && valueHijack$$1 && !isIE && !dom.valueHijack) {
            dom.valueHijack = updateDataHandle;
            var intervalID = setInterval(function () {
                if (!avalon.contains(avalon.root, dom)) {
                    clearInterval(intervalID);
                } else {
                    dom.valueHijack({ type: 'poll' });
                }
            }, 30);
            return intervalID;
        }
    }
    avalon.__pollValue = pollValue; //export to test
    /* istanbul ignore if */
    if (avalon.msie < 8) {
        var oldUpdate = updateView.updateChecked;
        updateView.updateChecked = function (vdom, checked) {
            var dom = vdom.dom;
            if (dom) {
                setTimeout(function () {
                    oldUpdate(vdom, checked);
                    dom.firstCheckedIt = 1;
                }, dom.firstCheckedIt ? 31 : 16);
                //IE6,7 checkbox, radio是使用defaultChecked控制选中状态，
                //并且要先设置defaultChecked后设置checked
                //并且必须设置延迟(因为必须插入DOM树才生效)
            }
        };
    }

    avalon.directive('rules', {
        diff: function diff(rules) {
            if (isObject(rules)) {
                var vdom = this.node;
                vdom.rules = platform.toJson(rules);
                return true;
            }
        }
    });
    function isRegExp(value) {
        return avalon.type(value) === 'regexp';
    }
    var rmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/i;
    var rurl = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/;
    function isCorrectDate(value) {
        if (typeof value === "string" && value) {
            //是字符串但不能是空字符
            var arr = value.split("-"); //可以被-切成3份，并且第1个是4个字符
            if (arr.length === 3 && arr[0].length === 4) {
                var year = ~~arr[0]; //全部转换为非负整数
                var month = ~~arr[1] - 1;
                var date = ~~arr[2];
                var d = new Date(year, month, date);
                return d.getFullYear() === year && d.getMonth() === month && d.getDate() === date;
            }
        }
        return false;
    }
    //https://github.com/adform/validator.js/blob/master/validator.js
    avalon.shadowCopy(avalon.validators, {
        pattern: {
            message: '必须匹配{{pattern}}这样的格式',
            get: function get(value, field, next) {
                var elem = field.dom;
                var data = field.data;
                if (!isRegExp(data.pattern)) {
                    var h5pattern = elem.getAttribute("pattern");
                    data.pattern = new RegExp('^(?:' + h5pattern + ')$');
                }
                next(data.pattern.test(value));
                return value;
            }
        },
        digits: {
            message: '必须整数',
            get: function get(value, field, next) {
                //整数
                next(/^\-?\d+$/.test(value));
                return value;
            }
        },
        number: {
            message: '必须数字',
            get: function get(value, field, next) {
                //数值
                next(!!value && isFinite(value)); // isFinite('') --> true
                return value;
            }
        },
        norequired: {
            message: '',
            get: function get(value, field, next) {
                next(true);
                return value;
            }
        },
        required: {
            message: '必须填写',
            get: function get(value, field, next) {
                next(value !== '');
                return value;
            }
        },
        equalto: {
            message: '密码输入不一致',
            get: function get(value, field, next) {
                var id = String(field.data.equalto);
                var other = avalon(document.getElementById(id)).val() || "";
                next(value === other);
                return value;
            }
        },
        date: {
            message: '日期格式不正确',
            get: function get(value, field, next) {
                var data = field.data;
                if (isRegExp(data.date)) {
                    next(data.date.test(value));
                } else {
                    next(isCorrectDate(value));
                }
                return value;
            }
        },
        url: {
            message: 'URL格式不正确',
            get: function get(value, field, next) {
                next(rurl.test(value));
                return value;
            }
        },
        email: {
            message: 'email格式不正确',
            get: function get(value, field, next) {
                next(rmail.test(value));
                return value;
            }
        },
        minlength: {
            message: '最少输入{{minlength}}个字',
            get: function get(value, field, next) {
                var num = parseInt(field.data.minlength, 10);
                next(value.length >= num);
                return value;
            }
        },
        maxlength: {
            message: '最多输入{{maxlength}}个字',
            get: function get(value, field, next) {
                var num = parseInt(field.data.maxlength, 10);
                next(value.length <= num);
                return value;
            }
        },
        min: {
            message: '输入值不能小于{{min}}',
            get: function get(value, field, next) {
                var num = parseInt(field.data.min, 10);
                next(parseFloat(value) >= num);
                return value;
            }
        },
        max: {
            message: '输入值不能大于{{max}}',
            get: function get(value, field, next) {
                var num = parseInt(field.data.max, 10);
                next(parseFloat(value) <= num);
                return value;
            }
        },
        chs: {
            message: '必须是中文字符',
            get: function get(value, field, next) {
                next(/^[\u4e00-\u9fa5]+$/.test(value));
                return value;
            }
        }
    });

    var valiDir = avalon.directive('validate', {
        diff: function diff(validator) {
            var vdom = this.node;
            if (vdom.validator) {
                return;
            }
            if (isObject(validator)) {
                //注意，这个Form标签的虚拟DOM有两个验证对象
                //一个是vmValidator，它是用户VM上的那个原始子对象，也是一个VM
                //一个是validator，它是vmValidator.$model， 这是为了防止IE6－8添加子属性时添加的hack
                //也可以称之为safeValidate
                vdom.vmValidator = validator;
                validator = platform.toJson(validator);
                validator.vdom = vdom;
                vdom.validator = validator;
                for (var name in valiDir.defaults) {
                    if (!validator.hasOwnProperty(name)) {
                        validator[name] = valiDir.defaults[name];
                    }
                }
                validator.fields = validator.fields || [];
                return true;
            }
        },
        update: function update(vdom) {

            var validator = vdom.validator;
            var dom = validator.dom = vdom.dom;
            dom._ms_validate_ = validator;
            var fields = validator.fields;
            collectFeild(vdom.children, fields, validator);
            avalon.bind(document, 'focusin', function (e) {
                var dom = e.target;
                var duplex = dom._ms_duplex_;
                var vdom = (duplex || {}).vdom;
                if (duplex && vdom.rules && !duplex.validator) {
                    if (avalon.Array.ensure(fields, duplex)) {
                        bindValidateEvent(duplex, validator);
                    }
                }
            });

            //为了方便用户手动执行验证，我们需要为原始vmValidate上添加一个onManual方法
            var v = vdom.vmValidator;
            try {
                v.onManual = onManual;
            } catch (e) {}
            delete vdom.vmValidator;

            dom.setAttribute('novalidate', 'novalidate');

            function onManual() {
                valiDir.validateAll.call(validator, validator.onValidateAll);
            }
            /* istanbul ignore if */
            if (validator.validateAllInSubmit) {
                avalon.bind(dom, 'submit', function (e) {
                    e.preventDefault();
                    onManual();
                });
            }
        },
        validateAll: function validateAll(callback) {
            var validator = this;
            var vdom = this.vdom;
            var fields = validator.fields = [];
            collectFeild(vdom.children, fields, validator);
            var fn = typeof callback === 'function' ? callback : validator.onValidateAll;
            var promises = validator.fields.filter(function (field) {
                var el = field.dom;
                return el && !el.disabled && validator.dom.contains(el);
            }).map(function (field) {
                return valiDir.validate(field, true);
            });
            var uniq = {};
            return Promise.all(promises).then(function (array) {
                var reasons = array.concat.apply([], array);
                if (validator.deduplicateInValidateAll) {

                    reasons = reasons.filter(function (reason) {
                        var el = reason.element;
                        var uuid = el.uniqueID || (el.uniqueID = setTimeout('1'));

                        if (uniq[uuid]) {
                            return false;
                        } else {
                            return uniq[uuid] = true;
                        }
                    });
                }
                fn.call(validator.dom, reasons); //这里只放置未通过验证的组件
            });
        },

        validate: function validate(field, isValidateAll, event) {
            var promises = [];
            var value = field.value;
            var elem = field.dom;

            /* istanbul ignore if */
            if (typeof Promise !== 'function') {
                //avalon-promise不支持phantomjs
                avalon.warn('浏览器不支持原生Promise,请下载并<script src=url>引入\nhttps://github.com/RubyLouvre/avalon/blob/master/test/promise.js');
            }
            /* istanbul ignore if */
            if (elem.disabled) return;
            var rules = field.vdom.rules;
            var ngs = [],
                isOk = true;
            if (!(rules.norequired && value === '')) {
                for (var ruleName in rules) {
                    var ruleValue = rules[ruleName];
                    if (ruleValue === false) continue;
                    var hook = avalon.validators[ruleName];
                    var resolve;
                    promises.push(new Promise(function (a, b) {
                        resolve = a;
                    }));
                    var next = function next(a) {
                        var reason = {
                            element: elem,
                            data: field.data,
                            message: elem.getAttribute('data-' + ruleName + '-message') || elem.getAttribute('data-message') || hook.message,
                            validateRule: ruleName,
                            getMessage: getMessage
                        };
                        if (a) {
                            resolve(true);
                        } else {
                            isOk = false;
                            ngs.push(reason);
                            resolve(false);
                        }
                    };
                    field.data = {};
                    field.data[ruleName] = ruleValue;
                    hook.get(value, field, next);
                }
            }

            //如果promises不为空，说明经过验证拦截器
            return Promise.all(promises).then(function (array) {
                if (!isValidateAll) {
                    var validator = field.validator;
                    if (isOk) {
                        validator.onSuccess.call(elem, [{
                            data: field.data,
                            element: elem
                        }], event);
                    } else {
                        validator.onError.call(elem, ngs, event);
                    }
                    validator.onComplete.call(elem, ngs, event);
                }
                return ngs;
            });
        }
    });

    function collectFeild(nodes, fields, validator) {
        for (var i = 0, vdom; vdom = nodes[i++];) {
            var duplex = vdom.rules && vdom.duplex;
            if (duplex) {
                fields.push(duplex);
                bindValidateEvent(duplex, validator);
            } else if (vdom.children) {
                collectFeild(vdom.children, fields, validator);
            } else if (Array.isArray(vdom)) {
                collectFeild(vdom, fields, validator);
            }
        }
    }

    function bindValidateEvent(field, validator) {

        var node = field.dom;
        if (field.validator) {
            return;
        }
        field.validator = validator;
        /* istanbul ignore if */
        if (validator.validateInKeyup && !field.isChanged && !field.debounceTime) {
            avalon.bind(node, 'keyup', function (e) {
                validator.validate(field, 0, e);
            });
        }
        /* istanbul ignore if */
        if (validator.validateInBlur) {
            avalon.bind(node, 'blur', function (e) {
                validator.validate(field, 0, e);
            });
        }
        /* istanbul ignore if */
        if (validator.resetInFocus) {
            avalon.bind(node, 'focus', function (e) {
                validator.onReset.call(node, e, field);
            });
        }
    }
    var rformat = /\\?{{([^{}]+)\}}/gm;

    function getMessage() {
        var data = this.data || {};
        return this.message.replace(rformat, function (_, name) {
            return data[name] == null ? '' : data[name];
        });
    }
    valiDir.defaults = {
        validate: valiDir.validate,
        onError: avalon.noop,
        onSuccess: avalon.noop,
        onComplete: avalon.noop,
        onManual: avalon.noop,
        onReset: avalon.noop,
        onValidateAll: avalon.noop,
        validateInBlur: true, //@config {Boolean} true，在blur事件中进行验证,触发onSuccess, onError, onComplete回调
        validateInKeyup: true, //@config {Boolean} true，在keyup事件中进行验证,触发onSuccess, onError, onComplete回调
        validateAllInSubmit: true, //@config {Boolean} true，在submit事件中执行onValidateAll回调
        resetInFocus: true, //@config {Boolean} true，在focus事件中执行onReset回调,
        deduplicateInValidateAll: false //@config {Boolean} false，在validateAll回调中对reason数组根据元素节点进行去重
    };

    /**
     * 一个directive装饰器
     * @returns {directive}
     */
    // DirectiveDecorator(scope, binding, vdom, this)
    // Decorator(vm, options, callback)
    function Directive(vm, binding, vdom, render) {
        var type = binding.type;
        var decorator = avalon.directives[type];
        if (inBrowser) {
            var dom = avalon.vdom(vdom, 'toDOM');
            if (dom.nodeType === 1) {
                dom.removeAttribute(binding.attrName);
            }
            vdom.dom = dom;
        }
        var callback = decorator.update ? function (value) {
            if (!render.mount && /css|visible|duplex/.test(type)) {
                render.callbacks.push(function () {
                    decorator.update.call(directive$$1, directive$$1.node, value);
                });
            } else {
                decorator.update.call(directive$$1, directive$$1.node, value);
            }
        } : avalon.noop;
        for (var key in decorator) {
            binding[key] = decorator[key];
        }
        binding.node = vdom;
        var directive$$1 = new Action(vm, binding, callback);
        if (directive$$1.init) {
            //这里可能会重写node, callback, type, name
            directive$$1.init();
        }
        directive$$1.update();
        return directive$$1;
    }

    var eventMap = avalon.oneObject('animationend,blur,change,input,' + 'click,dblclick,focus,keydown,keypress,keyup,mousedown,mouseenter,' + 'mouseleave,mousemove,mouseout,mouseover,mouseup,scan,scroll,submit', 'on');
    function parseAttributes(dirs, tuple) {
        var node = tuple[0],
            uniq = {},
            bindings = [];
        var hasIf = false;
        for (var name in dirs) {
            var value = dirs[name];
            var arr = name.split('-');
            // ms-click
            if (name in node.props) {
                var attrName = name;
            } else {
                attrName = ':' + name.slice(3);
            }
            if (eventMap[arr[1]]) {
                arr.splice(1, 0, 'on');
            }
            //ms-on-click
            if (arr[1] === 'on') {
                arr[3] = parseFloat(arr[3]) || 0;
            }

            var type = arr[1];
            if (type === 'controller' || type === 'important') continue;
            if (directives[type]) {

                var binding = {
                    type: type,
                    param: arr[2],
                    attrName: attrName,
                    name: arr.join('-'),
                    expr: value,
                    priority: directives[type].priority || type.charCodeAt(0) * 100
                };
                if (type === 'if') {
                    hasIf = true;
                }
                if (type === 'on') {
                    binding.priority += arr[3];
                }
                if (!uniq[binding.name]) {
                    uniq[binding.name] = value;
                    bindings.push(binding);
                    if (type === 'for') {
                        return [avalon.mix(binding, tuple[3])];
                    }
                }
            }
        }
        bindings.sort(byPriority);

        if (hasIf) {
            var ret = [];
            for (var i = 0, el; el = bindings[i++];) {
                ret.push(el);
                if (el.type === 'if') {
                    return ret;
                }
            }
        }
        return bindings;
    }
    function byPriority(a, b) {
        return a.priority - b.priority;
    }

    var rimprovePriority = /[+-\?]/;
    var rinnerValue = /__value__\)$/;
    function parseInterpolate(dir) {
        var rlineSp = /\n\r?/g;
        var str = dir.nodeValue.trim().replace(rlineSp, '');
        var tokens = [];
        do {
            //aaa{{@bbb}}ccc
            var index = str.indexOf(config.openTag);
            index = index === -1 ? str.length : index;
            var value = str.slice(0, index);
            if (/\S/.test(value)) {
                tokens.push(avalon.quote(avalon._decode(value)));
            }
            str = str.slice(index + config.openTag.length);
            if (str) {
                index = str.indexOf(config.closeTag);
                var value = str.slice(0, index);
                var expr = avalon.unescapeHTML(value);
                if (/\|\s*\w/.test(expr)) {
                    //如果存在过滤器，优化干掉
                    var arr = addScope(expr, 'expr');
                    if (arr[1]) {
                        expr = arr[1].replace(rinnerValue, arr[0] + ')');
                    }
                }
                if (rimprovePriority) {
                    expr = '(' + expr + ')';
                }
                tokens.push(expr);

                str = str.slice(index + config.closeTag.length);
            }
        } while (str.length);
        return [{
            expr: tokens.join('+'),
            name: 'expr',
            type: 'expr'
        }];
    }

    function getChildren(arr) {
        var count = 0;
        for (var i = 0, el; el = arr[i++];) {
            if (el.nodeName === '#document-fragment') {
                count += getChildren(el.children);
            } else {
                count += 1;
            }
        }
        return count;
    }
    function groupTree(parent, children) {
        children && children.forEach(function (vdom) {
            if (!vdom) return;
            var vlength = vdom.children && getChildren(vdom.children);
            if (vdom.nodeName === '#document-fragment') {
                var dom = createFragment();
            } else {
                dom = avalon.vdom(vdom, 'toDOM');
                var domlength = dom.childNodes && dom.childNodes.length;
                if (domlength && vlength && domlength > vlength) {
                    if (!appendChildMayThrowError[dom.nodeName]) {
                        avalon.clearHTML(dom);
                    }
                }
            }
            if (vlength) {
                groupTree(dom, vdom.children);
                if (vdom.nodeName === 'select') {
                    var values = [];
                    getSelectedValue(vdom, values);
                    lookupOption(vdom, values);
                }
            }
            //高级版本可以尝试 querySelectorAll

            try {
                if (!appendChildMayThrowError[parent.nodeName]) {
                    parent.appendChild(dom);
                }
            } catch (e) {}
        });
    }

    function dumpTree(elem) {
        var firstChild;
        while (firstChild = elem.firstChild) {
            if (firstChild.nodeType === 1) {
                dumpTree(firstChild);
            }
            elem.removeChild(firstChild);
        }
    }

    function getRange(childNodes, node) {
        var i = childNodes.indexOf(node) + 1;
        var deep = 1,
            nodes = [],
            end;
        nodes.start = i;
        while (node = childNodes[i++]) {
            nodes.push(node);
            if (node.nodeName === '#comment') {
                if (startWith(node.nodeValue, 'ms-for:')) {
                    deep++;
                } else if (node.nodeValue === 'ms-for-end:') {
                    deep--;
                    if (deep === 0) {
                        end = node;
                        nodes.pop();
                        break;
                    }
                }
            }
        }
        nodes.end = end;
        return nodes;
    }

    function startWith(long, short) {
        return long.indexOf(short) === 0;
    }

    var appendChildMayThrowError = {
        '#text': 1,
        '#comment': 1,
        script: 1,
        style: 1,
        noscript: 1
    };

    /**
     * 生成一个渲染器,并作为它第一个遇到的ms-controller对应的VM的$render属性
     * @param {String|DOM} node
     * @param {ViewModel|Undefined} vm
     * @param {Function|Undefined} beforeReady
     * @returns {Render}
     */
    avalon.scan = function (node, vm, beforeReady) {
        return new Render(node, vm, beforeReady || avalon.noop);
    };

    /**
     * avalon.scan 的内部实现
     */
    function Render(node, vm, beforeReady) {
        this.root = node; //如果传入的字符串,确保只有一个标签作为根节点
        this.vm = vm;
        this.beforeReady = beforeReady;
        this.bindings = []; //收集待加工的绑定属性
        this.callbacks = [];
        this.directives = [];
        this.init();
    }

    Render.prototype = {
        /**
         * 开始扫描指定区域
         * 收集绑定属性
         * 生成指令并建立与VM的关联
         */
        init: function init() {
            var vnodes;
            if (this.root && this.root.nodeType > 0) {
                vnodes = fromDOM(this.root); //转换虚拟DOM
                //将扫描区域的每一个节点与其父节点分离,更少指令对DOM操作时,对首屏输出造成的频繁重绘
                dumpTree(this.root);
            } else if (typeof this.root === 'string') {
                vnodes = fromString(this.root); //转换虚拟DOM
            } else {
                return avalon.warn('avalon.scan first argument must element or HTML string');
            }

            this.root = vnodes[0];
            this.vnodes = vnodes;
            this.scanChildren(vnodes, this.vm, true);
        },
        scanChildren: function scanChildren(children, scope, isRoot) {
            for (var i = 0; i < children.length; i++) {
                var vdom = children[i];
                switch (vdom.nodeName) {
                    case '#text':
                        scope && this.scanText(vdom, scope);
                        break;
                    case '#comment':
                        scope && this.scanComment(vdom, scope, children);
                        break;
                    case '#document-fragment':
                        this.scanChildren(vdom.children, scope, false);
                        break;
                    default:
                        this.scanTag(vdom, scope, children, false);
                        break;
                }
            }
            if (isRoot) {
                this.complete();
            }
        },


        /**
         * 从文本节点获取指令
         * @param {type} vdom 
         * @param {type} scope
         * @returns {undefined}
         */
        scanText: function scanText(vdom, scope) {
            if (config.rexpr.test(vdom.nodeValue)) {
                this.bindings.push([vdom, scope, {
                    nodeValue: vdom.nodeValue
                }]);
            }
        },


        /**
         * 从注释节点获取指令
         * @param {type} vdom 
         * @param {type} scope
         * @param {type} parentChildren
         * @returns {undefined}
         */
        scanComment: function scanComment(vdom, scope, parentChildren) {
            if (startWith(vdom.nodeValue, 'ms-for:')) {
                this.getForBinding(vdom, scope, parentChildren);
            }
        },


        /**
         * 从元素节点的nodeName与属性中获取指令
         * @param {type} vdom 
         * @param {type} scope
         * @param {type} parentChildren
         * @param {type} isRoot 用于执行complete方法
         * @returns {undefined}
         */
        scanTag: function scanTag(vdom, scope, parentChildren, isRoot) {
            var dirs = {},
                attrs = vdom.props,
                hasDir,
                hasFor;
            for (var attr in attrs) {
                var value = attrs[attr];
                var oldName = attr;
                if (attr.charAt(0) === ':') {
                    attr = 'ms-' + attr.slice(1);
                }
                if (startWith(attr, 'ms-')) {
                    dirs[attr] = value;
                    var type = attr.match(/\w+/g)[1];
                    type = eventMap[type] || type;
                    if (!directives[type]) {
                        avalon.warn(attr + ' has not registered!');
                    }
                    hasDir = true;
                }
                if (attr === 'ms-for') {
                    hasFor = value;
                    delete attrs[oldName];
                }
            }
            var $id = dirs['ms-important'] || dirs['ms-controller'];
            if ($id) {
                /**
                 * 后端渲染
                 * serverTemplates后端给avalon添加的对象,里面都是模板,
                 * 将原来后端渲染好的区域再还原成原始样子,再被扫描
                 */
                var templateCaches = avalon.serverTemplates;
                var temp = templateCaches && templateCaches[$id];
                if (temp) {
                    avalon.log('前端再次渲染后端传过来的模板');
                    var node = fromString(tmpl)[0];
                    for (var i in node) {
                        vdom[i] = node[i];
                    }
                    delete templateCaches[$id];
                    this.scanTag(vdom, scope, parentChildren, isRoot);
                    return;
                }
                //推算出指令类型
                var type = dirs['ms-important'] === $id ? 'important' : 'controller';
                //推算出用户定义时属性名,是使用ms-属性还是:属性
                var attrName = 'ms-' + type in attrs ? 'ms-' + type : ':' + type;

                if (inBrowser) {
                    delete attrs[attrName];
                }
                var dir = directives[type];
                scope = dir.getScope.call(this, $id, scope);
                if (!scope) {
                    return;
                } else {
                    var clazz = attrs['class'];
                    if (clazz) {
                        attrs['class'] = (' ' + clazz + ' ').replace(' ms-controller ', '').trim();
                    }
                }
                var render = this;
                scope.$render = render;
                this.callbacks.push(function () {
                    //用于删除ms-controller
                    dir.update.call(render, vdom, attrName, $id);
                });
            }
            if (hasFor) {
                if (vdom.dom) {
                    vdom.dom.removeAttribute(oldName);
                }
                return this.getForBindingByElement(vdom, scope, parentChildren, hasFor);
            }

            if (/^ms\-/.test(vdom.nodeName)) {
                attrs.is = vdom.nodeName;
            }

            if (attrs['is']) {
                if (!dirs['ms-widget']) {
                    dirs['ms-widget'] = '{}';
                }
                hasDir = true;
            }
            if (hasDir) {
                this.bindings.push([vdom, scope, dirs]);
            }
            var children = vdom.children;
            //如果存在子节点,并且不是容器元素(script, stype, textarea, xmp...)
            if (!orphanTag[vdom.nodeName] && children && children.length && !delayCompileNodes(dirs)) {
                this.scanChildren(children, scope, false);
            }
        },


        /**
         * 将绑定属性转换为指令
         * 执行各种回调与优化指令
         * @returns {undefined}
         */
        complete: function complete() {
            this.yieldDirectives();
            this.beforeReady();
            if (inBrowser) {
                var root$$1 = this.root;
                if (inBrowser) {
                    var rootDom = avalon.vdom(root$$1, 'toDOM');
                    groupTree(rootDom, root$$1.children);
                }
            }

            this.mount = true;
            var fn;
            while (fn = this.callbacks.pop()) {
                fn();
            }
            this.optimizeDirectives();
        },


        /**
         * 将收集到的绑定属性进行深加工,最后转换指令
         * @returns {Array<tuple>}
         */
        yieldDirectives: function yieldDirectives() {
            var tuple;
            while (tuple = this.bindings.shift()) {
                var vdom = tuple[0],
                    scope = tuple[1],
                    dirs = tuple[2],
                    bindings = [];
                if ('nodeValue' in dirs) {
                    bindings = parseInterpolate(dirs);
                } else if (!('ms-skip' in dirs)) {
                    bindings = parseAttributes(dirs, tuple);
                }
                for (var i = 0, binding; binding = bindings[i++];) {
                    var dir = directives[binding.type];
                    if (!inBrowser && /on|duplex|active|hover/.test(binding.type)) {
                        continue;
                    }
                    if (dir.beforeInit) {
                        dir.beforeInit.call(binding);
                    }

                    var directive$$1 = new Directive(scope, binding, vdom, this);
                    this.directives.push(directive$$1);
                }
            }
        },


        /**
         * 修改指令的update与callback方法,让它们以后执行时更加高效
         * @returns {undefined}
         */
        optimizeDirectives: function optimizeDirectives() {
            for (var i = 0, el; el = this.directives[i++];) {
                el.callback = directives[el.type].update;
                el.update = newUpdate;
                el._isScheduled = false;
            }
        },

        update: function update() {
            for (var i = 0, el; el = this.directives[i++];) {
                el.update();
            }
        },

        /**
         * 销毁所有指令
         * @returns {undefined}
         */
        dispose: function dispose() {
            var list = this.directives || [];
            for (var i = 0, el; el = list[i++];) {
                el.dispose();
            }
            //防止其他地方的this.innerRender && this.innerRender.dispose报错
            for (var _i5 in this) {
                if (_i5 !== 'dispose') delete this[_i5];
            }
        },


        /**
         * 将循环区域转换为for指令
         * @param {type} begin 注释节点
         * @param {type} scope
         * @param {type} parentChildren
         * @param {type} userCb 循环结束回调
         * @returns {undefined}
         */
        getForBinding: function getForBinding(begin, scope, parentChildren, userCb) {
            var expr = begin.nodeValue.replace('ms-for:', '').trim();
            begin.nodeValue = 'ms-for:' + expr;
            var nodes = getRange(parentChildren, begin);
            var end = nodes.end;
            var fragment = avalon.vdom(nodes, 'toHTML');
            parentChildren.splice(nodes.start, nodes.length);
            begin.props = {};
            this.bindings.push([begin, scope, {
                'ms-for': expr
            }, {
                begin: begin,
                end: end,
                expr: expr,
                userCb: userCb,
                fragment: fragment,
                parentChildren: parentChildren
            }]);
        },


        /**
         * 在带ms-for元素节点旁添加两个注释节点,组成循环区域
         * @param {type} vdom
         * @param {type} scope
         * @param {type} parentChildren
         * @param {type} expr
         * @returns {undefined}
         */
        getForBindingByElement: function getForBindingByElement(vdom, scope, parentChildren, expr) {
            var index = parentChildren.indexOf(vdom); //原来带ms-for的元素节点
            var props = vdom.props;
            var begin = {
                nodeName: '#comment',
                nodeValue: 'ms-for:' + expr
            };
            if (props.slot) {
                begin.slot = props.slot;
                delete props.slot;
            }
            var end = {
                nodeName: '#comment',
                nodeValue: 'ms-for-end:'
            };
            parentChildren.splice(index, 1, begin, vdom, end);
            this.getForBinding(begin, scope, parentChildren, props['data-for-rendered']);
        }
    };
    var viewID;

    function newUpdate() {
        var oldVal = this.beforeUpdate();
        var newVal = this.value = this.get();
        if (this.callback && this.diff(newVal, oldVal)) {
            this.callback(this.node, this.value);
            var vm = this.vm;
            var $render = vm.$render;
            var list = vm.$events['onViewChange'];
            /* istanbul ignore if */
            if (list && $render && $render.root && !avalon.viewChanging) {
                if (viewID) {
                    clearTimeout(viewID);
                    viewID = null;
                }
                viewID = setTimeout(function () {
                    list.forEach(function (el) {
                        el.callback.call(vm, {
                            type: 'viewchange',
                            target: $render.root,
                            vmodel: vm
                        });
                    });
                });
            }
        }
        this._isScheduled = false;
    }

    var events = 'onInit,onReady,onViewChange,onDispose,onEnter,onLeave';
    var componentEvents = avalon.oneObject(events);

    function toObject(value) {
        var value = platform.toJson(value);
        if (Array.isArray(value)) {
            var v = {};
            value.forEach(function (el) {
                el && avalon.shadowCopy(v, el);
            });
            return v;
        }
        return value;
    }
    var componentQueue = [];
    avalon.directive('widget', {
        delay: true,
        priority: 4,
        deep: true,
        init: function init() {
            //cached属性必须定义在组件容器里面,不是template中
            var vdom = this.node;
            this.cacheVm = !!vdom.props.cached;
            if (vdom.dom && vdom.nodeName === '#comment') {
                var comment = vdom.dom;
            }
            var oldValue = this.getValue();
            var value = toObject(oldValue);
            //外部VM与内部VM
            // ＝＝＝创建组件的VM＝＝BEGIN＝＝＝
            var is = vdom.props.is || value.is;
            this.is = is;
            var component = avalon.components[is];
            //外部传入的总大于内部
            if (!('fragment' in this)) {
                if (!vdom.isVoidTag) {
                    //提取组件容器内部的东西作为模板
                    var text = vdom.children[0];
                    if (text && text.nodeValue) {
                        this.fragment = text.nodeValue;
                    } else {
                        this.fragment = avalon.vdom(vdom.children, 'toHTML');
                    }
                } else {
                    this.fragment = false;
                }
            }
            //如果组件还没有注册，那么将原元素变成一个占位用的注释节点
            if (!component) {
                this.readyState = 0;
                vdom.nodeName = '#comment';
                vdom.nodeValue = 'unresolved component placeholder';
                delete vdom.dom;
                avalon.Array.ensure(componentQueue, this);
                return;
            }

            //如果是非空元素，比如说xmp, ms-*, template
            var id = value.id || value.$id;
            var hasCache = avalon.vmodels[id];
            var fromCache = false;
            // this.readyState = 1
            if (hasCache) {
                comVm = hasCache;
                this.comVm = comVm;
                replaceRoot(this, comVm.$render);
                fromCache = true;
            } else {
                if (typeof component === 'function') {
                    component = new component(value);
                }
                var comVm = createComponentVm(component, value, is);
                this.readyState = 1;
                fireComponentHook(comVm, vdom, 'Init');
                this.comVm = comVm;

                // ＝＝＝创建组件的VM＝＝END＝＝＝
                var innerRender = avalon.scan(component.template, comVm);
                comVm.$render = innerRender;
                replaceRoot(this, innerRender);
                var nodesWithSlot = [];
                var directives$$1 = [];
                if (this.fragment || component.soleSlot) {
                    var curVM = this.fragment ? this.vm : comVm;
                    var curText = this.fragment || '{{##' + component.soleSlot + '}}';
                    var childBoss = avalon.scan('<div>' + curText + '</div>', curVM, function () {
                        nodesWithSlot = this.root.children;
                    });
                    directives$$1 = childBoss.directives;
                    this.childBoss = childBoss;
                    for (var i in childBoss) {
                        delete childBoss[i];
                    }
                }
                Array.prototype.push.apply(innerRender.directives, directives$$1);

                var arraySlot = [],
                    objectSlot = {};
                //从用户写的元素内部 收集要移动到 新创建的组件内部的元素
                if (component.soleSlot) {
                    arraySlot = nodesWithSlot;
                } else {
                    nodesWithSlot.forEach(function (el, i) {
                        //要求带slot属性
                        if (el.slot) {
                            var nodes = getRange(nodesWithSlot, el);
                            nodes.push(nodes.end);
                            nodes.unshift(el);
                            objectSlot[el.slot] = nodes;
                        } else if (el.props) {
                            var name = el.props.slot;
                            if (name) {
                                delete el.props.slot;
                                if (Array.isArray(objectSlot[name])) {
                                    objectSlot[name].push(el);
                                } else {
                                    objectSlot[name] = [el];
                                }
                            }
                        }
                    });
                }
                //将原来元素的所有孩子，全部移动新的元素的第一个slot的位置上
                if (component.soleSlot) {
                    insertArraySlot(innerRender.vnodes, arraySlot);
                } else {
                    insertObjectSlot(innerRender.vnodes, objectSlot);
                }
            }

            if (comment) {
                var dom = avalon.vdom(vdom, 'toDOM');
                comment.parentNode.replaceChild(dom, comment);
                comVm.$element = innerRender.root.dom = dom;
                delete this.reInit;
            }

            //处理DOM节点

            dumpTree(vdom.dom);
            comVm.$element = vdom.dom;
            groupTree(vdom.dom, vdom.children);
            if (fromCache) {
                fireComponentHook(comVm, vdom, 'Enter');
            } else {
                fireComponentHook(comVm, vdom, 'Ready');
            }
        },
        diff: function diff(newVal, oldVal) {
            if (cssDiff.call(this, newVal, oldVal)) {
                return true;
            }
        },

        update: function update(vdom, value) {
            //this.oldValue = value //★★防止递归

            switch (this.readyState) {
                case 0:
                    if (this.reInit) {
                        this.init();
                        this.readyState++;
                    }
                    break;
                case 1:
                    this.readyState++;
                    break;
                default:
                    this.readyState++;
                    var comVm = this.comVm;
                    avalon.viewChanging = true;
                    avalon.transaction(function () {
                        for (var i in value) {
                            if (comVm.hasOwnProperty(i)) {
                                if (Array.isArray(value[i])) {
                                    comVm[i] = value[i].concat();
                                } else {
                                    comVm[i] = value[i];
                                }
                            }
                        }
                    });

                    //要保证要先触发孩子的ViewChange 然后再到它自己的ViewChange
                    fireComponentHook(comVm, vdom, 'ViewChange');
                    delete avalon.viewChanging;
                    break;
            }
            this.value = avalon.mix(true, {}, value);
        },
        beforeDispose: function beforeDispose() {
            var comVm = this.comVm;
            if (!this.cacheVm) {
                fireComponentHook(comVm, this.node, 'Dispose');
                comVm.$hashcode = false;
                delete avalon.vmodels[comVm.$id];
                this.innerRender && this.innerRender.dispose();
            } else {
                fireComponentHook(comVm, this.node, 'Leave');
            }
        }
    });

    function replaceRoot(instance, innerRender) {
        instance.innerRender = innerRender;
        var root$$1 = innerRender.root;
        var vdom = instance.node;
        var slot = vdom.props.slot;
        for (var i in root$$1) {
            vdom[i] = root$$1[i];
        }
        if (vdom.props && slot) {
            vdom.props.slot = slot;
        }
        innerRender.root = vdom;
        innerRender.vnodes[0] = vdom;
    }

    function fireComponentHook(vm, vdom, name) {
        var list = vm.$events['on' + name];
        if (list) {
            list.forEach(function (el) {
                setTimeout(function () {
                    el.callback.call(vm, {
                        type: name.toLowerCase(),
                        target: vdom.dom,
                        vmodel: vm
                    });
                }, 0);
            });
        }
    }

    function createComponentVm(component, value, is) {
        var hooks = [];
        var defaults = component.defaults;
        collectHooks(defaults, hooks);
        collectHooks(value, hooks);
        var obj = {};
        for (var i in defaults) {
            var val = value[i];
            if (val == null) {
                obj[i] = defaults[i];
            } else {
                obj[i] = val;
            }
        }
        obj.$id = value.id || value.$id || avalon.makeHashCode(is);
        delete obj.id;
        var def = avalon.mix(true, {}, obj);
        var vm = avalon.define(def);
        hooks.forEach(function (el) {
            vm.$watch(el.type, el.cb);
        });
        return vm;
    }

    function collectHooks(a, list) {
        for (var i in a) {
            if (componentEvents[i]) {
                if (typeof a[i] === 'function' && i.indexOf('on') === 0) {
                    list.unshift({
                        type: i,
                        cb: a[i]
                    });
                }
                //delete a[i] 这里不能删除,会导致再次切换时没有onReady
            }
        }
    }

    function resetParentChildren(nodes, arr) {
        var dir = arr && arr[0] && arr[0].forDir;
        if (dir) {
            dir.parentChildren = nodes;
        }
    }

    function insertArraySlot(nodes, arr) {
        for (var i = 0, el; el = nodes[i]; i++) {
            if (el.nodeName === 'slot') {
                resetParentChildren(nodes, arr);
                nodes.splice.apply(nodes, [i, 1].concat(arr));
                break;
            } else if (el.children) {
                insertArraySlot(el.children, arr);
            }
        }
    }

    function insertObjectSlot(nodes, obj) {
        for (var i = 0, el; el = nodes[i]; i++) {
            if (el.nodeName === 'slot') {
                var name = el.props.name;
                resetParentChildren(nodes, obj[name]);
                nodes.splice.apply(nodes, [i, 1].concat(obj[name]));
                continue;
            } else if (el.children) {
                insertObjectSlot(el.children, obj);
            }
        }
    }

    avalon.components = {};
    avalon.component = function (name, component) {

        component.extend = componentExtend;
        return addToQueue(name, component);
    };
    function addToQueue(name, component) {
        avalon.components[name] = component;
        for (var el, i = 0; el = componentQueue[i]; i++) {
            if (el.is === name) {
                componentQueue.splice(i, 1);
                el.reInit = true;
                delete el.value;
                el.update();
                i--;
            }
        }
        return component;
    }

    function componentExtend(child) {
        var name = child.displayName;
        delete child.displayName;
        var obj = { defaults: avalon.mix(true, {}, this.defaults, child.defaults) };
        if (child.soleSlot) {
            obj.soleSlot = child.soleSlot;
        }
        obj.template = child.template || this.template;
        return avalon.component(name, obj);
    }

    return avalon;
});
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ }),
/* 1 */
/***/ (function(module, exports) {

/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * 
	 * version 1.0
	 * built in 2015.11.19
	 * 
	 * v0.9.6
	 * 修正gasAttribute typo
	 * 修正mmHistory document.write BUG
	 * 
	 * 
	 */

	var mmHistory = __webpack_require__(6)
	var storage = __webpack_require__(7)

	function Router() {
	    this.rules = []
	}


	var placeholder = /([:*])(\w+)|\{(\w+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g
	Router.prototype = storage
	avalon.mix(storage, {
	    error: function (callback) {
	        this.errorback = callback
	    },
	    _pathToRegExp: function (pattern, opts) {
	        var keys = opts.keys = [],
	                //      segments = opts.segments = [],
	                compiled = '^', last = 0, m, name, regexp, segment;

	        while ((m = placeholder.exec(pattern))) {
	            name = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
	            regexp = m[4] || (m[1] == '*' ? '.*' : 'string')
	            segment = pattern.substring(last, m.index);
	            var type = this.$types[regexp]
	            var key = {
	                name: name
	            }
	            if (type) {
	                regexp = type.pattern
	                key.decode = type.decode
	            }
	            keys.push(key)
	            compiled += quoteRegExp(segment, regexp, false)
	            //  segments.push(segment)
	            last = placeholder.lastIndex
	        }
	        segment = pattern.substring(last);
	        compiled += quoteRegExp(segment) + (opts.strict ? opts.last : "\/?") + '$';
	        var sensitive = typeof opts.caseInsensitive === "boolean" ? opts.caseInsensitive : true
	        //  segments.push(segment);
	        opts.regexp = new RegExp(compiled, sensitive ? 'i' : undefined);
	        return opts

	    },
	    //添加一个路由规则
	    add: function (path, callback, opts) {
	        var array = this.rules
	        if (path.charAt(0) !== "/") {
	            avalon.error("avalon.router.add的第一个参数必须以/开头")
	        }
	        opts = opts || {}
	        opts.callback = callback
	        if (path.length > 2 && path.charAt(path.length - 1) === "/") {
	            path = path.slice(0, -1)
	            opts.last = "/"
	        }
	        avalon.Array.ensure(array, this._pathToRegExp(path, opts))
	    },
	    //判定当前URL与已有状态对象的路由规则是否符合
	    route: function (path, query) {
	        path = path.trim()
	        var rules = this.rules
	        for (var i = 0, el; el = rules[i++]; ) {
	            var args = path.match(el.regexp)
	            if (args) {
	                el.query = query || {}
	                el.path = path
	                el.params = {}
	                var keys = el.keys
	                args.shift()
	                if (keys.length) {
	                    this._parseArgs(args, el)
	                }
	                return  el.callback.apply(el, args)
	            }
	        }
	        if (this.errorback) {
	            this.errorback()
	        }
	    },
	    _parseArgs: function (match, stateObj) {
	        var keys = stateObj.keys
	        for (var j = 0, jn = keys.length; j < jn; j++) {
	            var key = keys[j]
	            var value = match[j] || ''
	            if (typeof key.decode === 'function') {//在这里尝试转换参数的类型
	                var val = key.decode(value)
	            } else {
	                try {
	                    val = JSON.parse(value)
	                } catch (e) {
	                    val = value
	                }
	            }
	            match[j] = stateObj.params[key.name] = val
	        }
	    },
	    /*
	     *  @interface avalon.router.navigate 设置历史(改变URL)
	     *  @param hash 访问的url hash   
	     */
	    navigate: function (hash, mode) {
	        var parsed = parseQuery(hash)
	        var newHash = this.route(parsed.path, parsed.query)
	        if(isLegalPath(newHash)){
	            hash = newHash
	        }
	        //保存到本地储存或cookie
	        avalon.router.setLastPath(hash)
	        // 模式0, 不改变URL, 不产生历史实体, 执行回调
	        // 模式1, 改变URL, 不产生历史实体,   执行回调
	        // 模式2, 改变URL, 产生历史实体,    执行回调
	        if (mode === 1) {
	          
	            avalon.history.setHash(hash, true)
	        } else if (mode === 2) {
	            avalon.history.setHash(hash)
	        }
	        return hash
	    },
	    /*
	     *  @interface avalon.router.when 配置重定向规则
	     *  @param path 被重定向的表达式，可以是字符串或者数组
	     *  @param redirect 重定向的表示式或者url
	     */
	    when: function (path, redirect) {
	        var me = this,
	                path = path instanceof Array ? path : [path]
	        avalon.each(path, function (index, p) {
	            me.add(p, function () {
	                var info = me.urlFormate(redirect, this.params, this.query)
	                me.navigate(info.path + info.query)
	            })
	        })
	        return this
	    },
	    urlFormate: function (url, params, query) {
	        var query = query ? queryToString(query) : "",
	                hash = url.replace(placeholder, function (mat) {
	                    var key = mat.replace(/[\{\}]/g, '').split(":")
	                    key = key[0] ? key[0] : key[1]
	                    return params[key] !== undefined ? params[key] : ''
	                }).replace(/^\//g, '')
	        return {
	            path: hash,
	            query: query
	        }
	    },
	    /* *
	     `'/hello/'` - 匹配'/hello/'或'/hello'
	     `'/user/:id'` - 匹配 '/user/bob' 或 '/user/1234!!!' 或 '/user/' 但不匹配 '/user' 与 '/user/bob/details'
	     `'/user/{id}'` - 同上
	     `'/user/{id:[^/]*}'` - 同上
	     `'/user/{id:[0-9a-fA-F]{1,8}}'` - 要求ID匹配/[0-9a-fA-F]{1,8}/这个子正则
	     `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
	     path into the parameter 'path'.
	     `'/files/*path'` - ditto.
	     */
	    // avalon.router.get("/ddd/:dddID/",callback)
	    // avalon.router.get("/ddd/{dddID}/",callback)
	    // avalon.router.get("/ddd/{dddID:[0-9]{4}}/",callback)
	    // avalon.router.get("/ddd/{dddID:int}/",callback)
	    // 我们甚至可以在这里添加新的类型，avalon.router.$type.d4 = { pattern: '[0-9]{4}', decode: Number}
	    // avalon.router.get("/ddd/{dddID:d4}/",callback)
	    $types: {
	        date: {
	            pattern: "[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])",
	            decode: function (val) {
	                return new Date(val.replace(/\-/g, "/"))
	            }
	        },
	        string: {
	            pattern: "[^\\/]*",
	            decode: function (val) {
	                return val;
	            }
	        },
	        bool: {
	            decode: function (val) {
	                return parseInt(val, 10) === 0 ? false : true;
	            },
	            pattern: "0|1"
	        },
	        'int': {
	            decode: function (val) {
	                return parseInt(val, 10);
	            },
	            pattern: "\\d+"
	        }
	    }
	})


	module.exports = avalon.router = new Router


	function parseQuery(url) {
	    var array = url.split("?"), query = {}, path = array[0], querystring = array[1]
	    if (querystring) {
	        var seg = querystring.split("&"),
	                len = seg.length, i = 0, s;
	        for (; i < len; i++) {
	            if (!seg[i]) {
	                continue
	            }
	            s = seg[i].split("=")
	            query[decodeURIComponent(s[0])] = decodeURIComponent(s[1])
	        }
	    }
	    return {
	        path: path,
	        query: query
	    }
	}
	function isLegalPath(path){
	    if(path === '/')
	        return true
	    if(typeof path === 'string' && path.length > 1 && path.charAt(0) === '/'){
	        return true
	    }
	}

	function queryToString(obj) {
	    if (typeof obj === 'string')
	        return obj
	    var str = []
	    for (var i in obj) {
	        if (i === "query")
	            continue
	        str.push(i + '=' + encodeURIComponent(obj[i]))
	    }
	    return str.length ? '?' + str.join("&") : ''
	}


	function quoteRegExp(string, pattern, isOptional) {
	    var result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
	    if (!pattern)
	        return result;
	    var flag = isOptional ? '?' : '';
	    return result + flag + '(' + pattern + ')' + flag;
	}


/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ function(module, exports) {

	/*!
	 * mmHistory
	 * 用于监听地址栏的变化
	 * https://github.com/flatiron/director/blob/master/lib/director/browser.js
	 * https://github.com/visionmedia/page.js/blob/master/page.js
	 */

	var location = document.location
	var oldIE = avalon.msie <= 7
	var supportPushState = !!(window.history.pushState)
	var supportHashChange = !!("onhashchange" in window && (!window.VBArray || !oldIE))
	var defaults = {
	    root: "/",
	    html5: false,
	    hashPrefix: "!",
	    iframeID: null, //IE6-7，如果有在页面写死了一个iframe，这样似乎刷新的时候不会丢掉之前的历史
	    interval: 50, //IE6-7,使用轮询，这是其时间时隔,
	    autoScroll: false
	}
	var mmHistory = {
	    hash: getHash(location.href),
	    check: function() {
	        var h = getHash(location.href)
	        if (h !== this.hash) {
	            this.hash = h
	            this.onHashChanged()
	        }
	    },
	    start: function(options) {
	        if (this.started)
	            throw new Error('avalon.history has already been started')
	        this.started = true
	            //监听模式
	        if (typeof options === 'boolean') {
	            options = {
	                html5: options
	            }
	        }

	        options = avalon.mix({}, defaults, options || {})
	        if (options.fireAnchor) {
	            options.autoScroll = true
	        }
	        var rootPath = options.root
	        if (!/^\//.test(rootPath)) {
	            avalon.error('root配置项必须以/字符开始, 以非/字符结束')
	        }
	        if (rootPath.length > 1) {
	            options.root = rootPath.replace(/\/$/, '')
	        }
	        var html5Mode = options.html5
	        this.options = options
	        this.mode = html5Mode ? "popstate" : "hashchange"
	        if (!supportPushState) {
	            if (html5Mode) {
	                avalon.warn("浏览器不支持HTML5 pushState，平稳退化到onhashchange!")
	            }
	            this.mode = "hashchange"
	        }
	        if (!supportHashChange) {
	            this.mode = "iframepoll"
	        }
	        avalon.log('avalon run mmHistory in the ', this.mode, 'mode')
	            // 支持popstate 就监听popstate
	            // 支持hashchange 就监听hashchange(IE8,IE9,FF3)
	            // 否则的话只能每隔一段时间进行检测了(IE6, IE7)
	        switch (this.mode) {
	            case "popstate":
	                // At least for now HTML5 history is available for 'modern' browsers only
	                // There is an old bug in Chrome that causes onpopstate to fire even
	                // upon initial page load. Since the handler is run manually in init(),
	                // this would cause Chrome to run it twise. Currently the only
	                // workaround seems to be to set the handler after the initial page load
	                // http://code.google.com/p/chromium/issues/detail?id=63040
	                setTimeout(function() {
	                    window.onpopstate = mmHistory.onHashChanged
	                }, 500)
	                break
	            case "hashchange":
	                window.onhashchange = mmHistory.onHashChanged
	                break
	            case "iframepoll":
	                //也有人这样玩 http://www.cnblogs.com/meteoric_cry/archive/2011/01/11/1933164.html
	                avalon.ready(function() {
	                    var iframe = document.createElement('iframe')
	                    iframe.id = options.iframeID
	                    iframe.style.display = 'none'
	                    document.body.appendChild(iframe)
	                    mmHistory.iframe = iframe
	                    mmHistory.writeFrame('')
	                    if (avalon.msie) {
	                        function onPropertyChange() {
	                            if (event.propertyName === 'location') {
	                                mmHistory.check()
	                            }
	                        }
	                        document.attachEvent('onpropertychange', onPropertyChange)
	                        mmHistory.onPropertyChange = onPropertyChange
	                    }

	                    mmHistory.intervalID = window.setInterval(function() {
	                        mmHistory.check()
	                    }, options.interval)

	                })
	                break
	        }
	        //页面加载时触发onHashChanged
	        this.onHashChanged()
	    },
	    stop: function() {
	        switch (this.mode) {
	            case "popstate":
	                window.onpopstate = avalon.noop
	                break
	            case "hashchange":
	                window.onhashchange = avalon.noop
	                break
	            case "iframepoll":
	                if (this.iframe) {
	                    document.body.removeChild(this.iframe)
	                    this.iframe = null
	                }
	                if (this.onPropertyChange) {
	                    document.detachEvent('onpropertychange', this.onPropertyChange)
	                }
	                clearInterval(this.intervalID)
	                break
	        }
	        this.started = false
	    },
	    setHash: function(s, replace) {
	        switch (this.mode) {
	            case 'iframepoll':
	                if (replace) {
	                    var iframe = this.iframe
	                    if (iframe) {
	                        //contentWindow 兼容各个浏览器，可取得子窗口的 window 对象。
	                        //contentDocument Firefox 支持，> ie8 的ie支持。可取得子窗口的 document 对象。
	                        iframe.contentWindow._hash = s
	                    }
	                } else {
	                    this.writeFrame(s)
	                }
	                break
	            case 'popstate':
	                var path = (this.options.root + '/' + s).replace(/\/+/g, '/')
	                var method = replace ? 'replaceState' : 'pushState'
	                history[method]({}, document.title, path)
	                    // 手动触发onpopstate event
	                this.onHashChanged()
	                break
	            default:
	                //http://stackoverflow.com/questions/9235304/how-to-replace-the-location-hash-and-only-keep-the-last-history-entry
	                var newHash = this.options.hashPrefix + s
	                if (replace && location.hash !== newHash) {
	                    history.back()
	                }
	                location.hash = newHash
	                break
	        }
	    },
	    writeFrame: function(s) {
	        // IE support...
	        var f = mmHistory.iframe
	        var d = f.contentDocument || f.contentWindow.document
	        d.open()
	        var end ="/script"
	        d.write("<script>_hash = '" + s + "'; onload = parent.avalon.history.syncHash;<"+end+">")
	        d.close()
	    },
	    syncHash: function() {
	        // IE support...
	        var s = this._hash
	        if (s !== getHash(location.href)) {
	            location.hash = s
	        }
	        return this
	    },

	    getPath: function() {
	        var path = location.pathname.replace(this.options.root, '')
	        if (path.charAt(0) !== '/') {
	            path = '/' + path
	        }
	        return path
	    },
	    onHashChanged: function(hash, clickMode) {
	        if (!clickMode) {
	            hash = mmHistory.mode === 'popstate' ? mmHistory.getPath() :
	                location.href.replace(/.*#!?/, '')
	        }
	        hash = decodeURIComponent(hash)
	        hash = hash.charAt(0) === '/' ? hash : '/' + hash
	        if (hash !== mmHistory.hash) {
	            mmHistory.hash = hash

	            if (avalon.router) { //即mmRouter
	                hash = avalon.router.navigate(hash, 0)
	            }

	            if (clickMode) {
	                mmHistory.setHash(hash)
	            }
	            if (clickMode && mmHistory.options.autoScroll) {
	                autoScroll(hash.slice(1))
	            }
	        }

	    }
	}

	function getHash(path) {
	    // IE6直接用location.hash取hash，可能会取少一部分内容
	    // 比如 http://www.cnblogs.com/rubylouvre#stream/xxxxx?lang=zh_c
	    // ie6 => location.hash = #stream/xxxxx
	    // 其他浏览器 => location.hash = #stream/xxxxx?lang=zh_c
	    // firefox 会自作多情对hash进行decodeURIComponent
	    // 又比如 http://www.cnblogs.com/rubylouvre/#!/home/q={%22thedate%22:%2220121010~20121010%22}
	    // firefox 15 => #!/home/q={"thedate":"20121010~20121010"}
	    // 其他浏览器 => #!/home/q={%22thedate%22:%2220121010~20121010%22}
	    var index = path.indexOf("#")
	    if (index === -1) {
	        return ''
	    }
	    return decodeURI(path.slice(index))
	}



	//劫持页面上所有点击事件，如果事件源来自链接或其内部，
	//并且它不会跳出本页，并且以"#/"或"#!/"开头，那么触发updateLocation方法
	avalon.bind(document, "click", function(e) {
	    //https://github.com/asual/jquery-address/blob/master/src/jquery.address.js
	    //https://github.com/angular/angular.js/blob/master/src/ng/location.js
	    //下面十种情况将阻止进入路由系列
	    //1. 路由器没有启动
	    if (!mmHistory.started) {
	        return
	    }
	    //2. 不是左键点击或使用组合键
	    if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2 ) {
	        return
	    }
	    //3. 此事件已经被阻止
	    if (e.returnValue === false) {
	        return
	    }
	    //4. 目标元素不A标签,或不在A标签之内
	    var el = e.path ? e.path[0] : (e.target || e.srcElement || {})
	    while (el.nodeName !== "A") {
	        el = el.parentNode
	        if (!el || el.tagName === "BODY") {
	            return
	        }
	    }
	    //5. 没有定义href属性或在hash模式下,只有一个#
	    //IE6/7直接用getAttribute返回完整路径
	    var href = el.getAttribute('href', 2) || el.getAttribute("xlink:href") || ''
	    if (href.slice(0, 2) !== '#!') {
	        return
	    }

	    //6. 目标链接是用于下载资源或指向外部
	    if (el.getAttribute('download') != null || el.getAttribute('rel') === 'external')
	        return

	    //7. 只是邮箱地址
	    if (href.indexOf('mailto:') > -1) {
	        return
	    }
	    //8. 目标链接要新开窗口
	    if (el.target && el.target !== '_self') {
	        return
	    }

	    e.preventDefault()
	        //终于达到目的地
	    mmHistory.onHashChanged(href.replace('#!', ''), true)

	})

	//得到页面第一个符合条件的A标签
	function getFirstAnchor(name) {
	    var list = document.getElementsByTagName('A')
	    for (var i = 0, el; el = list[i++];) {
	        if (el.name === name) {
	            return el
	        }
	    }
	}

	function getOffset(elem) {
	    var position = avalon(elem).css('position'),
	        offset
	    if (position !== 'fixed') {
	        offset = 0
	    } else {
	        offset = elem.getBoundingClientRect().bottom
	    }

	    return offset
	}

	function autoScroll(hash) {
	    //取得页面拥有相同ID的元素
	    var elem = document.getElementById(hash)
	    if (!elem) {
	        //取得页面拥有相同name的A元素
	        elem = getFirstAnchor(hash)
	    }
	    if (elem) {
	        elem.scrollIntoView()
	        var offset = getOffset(elem)
	        if (offset) {
	            var elemTop = elem.getBoundingClientRect().top
	            window.scrollBy(0, elemTop - offset.top)
	        }
	    } else {
	        window.scrollTo(0, 0)
	    }
	}


	module.exports = avalon.history = mmHistory


/***/ },
/* 7 */
/***/ function(module, exports) {

	
	function supportLocalStorage() {
	    try {//看是否支持localStorage
	        localStorage.setItem("avalon", 1)
	        localStorage.removeItem("avalon")
	        return true
	    } catch (e) {
	        return false
	    }
	}
	function escapeCookie(value) {
	    return String(value).replace(/[,;"\\=\s%]/g, function (character) {
	        return encodeURIComponent(character)
	    });
	}
	var ret = {}
	if (supportLocalStorage()) {
	    ret.getLastPath = function () {
	        return localStorage.getItem('msLastPath')
	    }
	    var cookieID
	    ret.setLastPath = function (path) {
	        if (cookieID) {
	            clearTimeout(cookieID)
	            cookieID = null
	        }
	        localStorage.setItem("msLastPath", path)
	        cookieID = setTimeout(function () {//模拟过期时间
	            localStorage.removItem("msLastPath")
	        }, 1000 * 60 * 60 * 24)
	    }
	} else {

	    ret.getLastPath = function () {
	        return getCookie.getItem('msLastPath')
	    }
	    ret.setLastPath = function (path) {
	        setCookie('msLastPath', path)
	    }
	    function setCookie(key, value) {
	        var date = new Date()//将date设置为1天以后的时间 
	        date.setTime(date.getTime() + 1000 * 60 * 60 * 24)
	        document.cookie = escapeCookie(key) + '=' + escapeCookie(value) + ';expires=' + date.toGMTString()
	    }
	    function getCookie(name) {
	        var m = String(document.cookie).match(new RegExp('(?:^| )' + name + '(?:(?:=([^;]*))|;|$)')) || ["", ""]
	        return decodeURIComponent(m[1])
	    }
	}

	module.exports = ret

/***/ }
/******/ ]);

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var avalon = __webpack_require__(0)
__webpack_require__(1)
let vm = avalon.define({
    $id: "app",
    age: 18,
    html: "<h1>hello world</h1>",
    showLog: function() {
        vm.age += 10;
        console.log("this is log");

    }
});
// console.log(avalon, avalon.router, avalon.router.add)
avalon.router.add("/aaa", function(a) {
    vm.currPath = this.path
        // this里面能拿到如下东西:
        // path: 路径
        // query: 一个对象，就是？后面的东西转换成的对象
        // params: 一个对象， 我们在定义路由规则时，那些以冒号开始的参数组成的对象
});
avalon.router.add("/tab1", function() {
    // vm.html = require("./js/tab1/tab1.html");
    vm.html = __webpack_require__(5);
});
avalon.router.add("/tab2", function() {
    vm.html = "<h1>tab2</h1>"
});
avalon.router.add("/tab3", function() {
    vm.html = "<h1>tab3</h1>"
});
//启动路由监听
avalon.history.start({
    root: "/avalonTest/"
});
// debugger;/
avalon.scan();

/***/ }),
/* 3 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 4 */,
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
    __webpack_require__,
    __webpack_require__(0)
], __WEBPACK_AMD_DEFINE_RESULT__ = function(require, avalon2) {
    'use strict';
    let vm = avalon2.define({
        $id: "tab1",
        name: "富强、民主、文明、和谐、自由、平等、公正、法治、爱国、敬业、诚信、友善1",
    });

    function getHtml() {
        return "<div ms-controller='tab1'>" +
            "<div>{{@name}}</div>" +
            "</div>";
    }
    return getHtml();
}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgYWU4NTgwMmUzN2Q2MGRhYjY2Y2UiLCJ3ZWJwYWNrOi8vLy4vfi9hdmFsb24yL2Rpc3QvYXZhbG9uLmpzIiwid2VicGFjazovLy8uL34vbW1Sb3V0ZXIvZGlzdC9tbVJvdXRlci5qcyIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyIsIndlYnBhY2s6Ly8vKHdlYnBhY2spL2J1aWxkaW4vZ2xvYmFsLmpzIiwid2VicGFjazovLy8uL2pzL3RhYjEvdGFiMS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ2hFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsQ0FBQztBQUNEOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtB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RUFBRTtBQUM5UTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLEVBQUU7QUFDOUM7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQ0FBa0MsV0FBVztBQUM3QyxrQ0FBa0M7QUFDbEMsNENBQTRDO0FBQzVDLDRCQUE0QixxQkFBcUI7QUFDakQsNEJBQTRCLHFCQUFxQjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakYscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQSw0REFBNEQ7QUFDNUQsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtREFBbUQ7QUFDbkQsdURBQXVEO0FBQ3ZELG1EQUFtRDtBQUNuRDtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUMsNENBQTRDO0FBQzVDLDRDQUE0QztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCOztBQUVqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixPQUFPO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBLHlDQUF5QyxPQUFPO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLGlCQUFpQjtBQUNoRDtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QjtBQUN2QjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEJBQTBCO0FBQzFCO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGtCQUFrQjtBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDJDQUEyQyx1QkFBdUIsdUJBQXVCLHNCQUFzQix1QkFBdUI7QUFDdEk7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLG9DQUFvQztBQUNwQztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQztBQUNsQyxTQUFTO0FBQ1Q7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSx1Q0FBdUMsMkJBQTJCO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLE9BQU87QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7OztBQUdUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxTQUFTOzs7QUFHVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw2QkFBNkI7O0FBRTdCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7OztBQUdUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOzs7QUFHVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQjtBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QixxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxrREFBa0QsNkJBQTZCO0FBQy9FO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7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LGVBQWU7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixpQkFBaUI7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrRUFBK0U7QUFDL0UsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaURBQWlEO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLFFBQVE7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwrREFBK0QsaUJBQWlCOztBQUVoRjtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxpQkFBaUI7O0FBRWpCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSwyQkFBMkIsZUFBZTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakIsYUFBYTtBQUNiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQSxpQkFBaUIsbUNBQW1DO0FBQ3BEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRkFBaUY7QUFDakYsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNEM7QUFDQTtBQUNBO0FBQ0EsaUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQix1QkFBdUI7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFD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Q2pCO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxpQkFBaUI7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsK0NBQStDO0FBQy9DOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMEJBQTBCLHVCQUF1QjtBQUNqRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7O0FBRXJCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEM7QUFDNUMsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckIsaUJBQWlCO0FBQ2pCLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQ0FBcUM7QUFDckM7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwyQkFBMkIsZUFBZTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJCQUEyQixlQUFl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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQztBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsOENBQThDLHlDQUF5QztBQUN2RjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07O0FBRU47QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxpQ0FBaUM7QUFDakM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlEQUF5RDtBQUN6RCxpQ0FBaUM7QUFDakMsNEJBQTRCO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0JBQWdCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7OztBQUdBOzs7QUFHQSxPQUFPO0FBQ1A7QUFDQTs7O0FBR0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsRUFBRTs7QUFFRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkU7QUFDN0U7QUFDQTtBQUNBLHlGQUF5RixNQUFNO0FBQy9GO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBLFk7Ozs7OztBQ3ZyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRDtBQUNBO0FBQ0EsQ0FBQztBQUNEO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELFlBQVk7QUFDWixjOzs7Ozs7QUNuQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRDQUE0Qzs7QUFFNUM7Ozs7Ozs7O2dFQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSzs7QUFFTDtBQUNBO0FBQ0Esb0JBQW9CLE9BQU87QUFDM0I7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUFBLHFHIiwiZmlsZSI6ImJvdW5kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMik7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgYWU4NTgwMmUzN2Q2MGRhYjY2Y2UiLCIvKiFcbmJ1aWx0IGluIDIwMTctMS00OjEzOjQgdmVyc2lvbiAyLjIuNCBieSDlj7jlvpLmraPnvo5cbmh0dHBzOi8vZ2l0aHViLmNvbS9SdWJ5TG91dnJlL2F2YWxvbi90cmVlLzIuMi4zXG5cbuS/ruato0lF5LiLIG9yZGVyQnkgQlVHXG7mm7TmlLnkuIvovb1Qcm9taXNl55qE5o+Q56S6XG7kv67lpI1hdmFsb24ubW9kZXJuIOWcqFByb3h5IOaooeW8j+S4i+S9v+eUqG1zLWZvciDlvqrnjq/lr7nosaHml7blh7rplJnnmoRCVUdcbuS/ruWkjWVmZmVjdOWGhemDqOS8oOWPgiBCVUdcbumHjeaehG1zLXZhbGlkYXRl55qE57uR5a6a5LqL5Lu255qE5py65Yi2XG5cbiovKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6IHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6IGdsb2JhbC5hdmFsb24gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIHdpbiA9IHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnID8gd2luZG93IDogdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgPyBnbG9iYWwgOiB7fTtcblxuICAgIHZhciBpbkJyb3dzZXIgPSAhIXdpbi5sb2NhdGlvbiAmJiB3aW4ubmF2aWdhdG9yO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAgKi9cblxuICAgIHZhciBkb2N1bWVudCQxID0gaW5Ccm93c2VyID8gd2luLmRvY3VtZW50IDoge1xuICAgICAgICBjcmVhdGVFbGVtZW50OiBPYmplY3QsXG4gICAgICAgIGNyZWF0ZUVsZW1lbnROUzogT2JqZWN0LFxuICAgICAgICBkb2N1bWVudEVsZW1lbnQ6ICd4eCcsXG4gICAgICAgIGNvbnRhaW5zOiBCb29sZWFuXG4gICAgfTtcbiAgICB2YXIgcm9vdCA9IGluQnJvd3NlciA/IGRvY3VtZW50JDEuZG9jdW1lbnRFbGVtZW50IDoge1xuICAgICAgICBvdXRlckhUTUw6ICd4J1xuICAgIH07XG5cbiAgICB2YXIgdmVyc2lvbnMgPSB7XG4gICAgICAgIG9iamVjdG9iamVjdDogNywgLy9JRTctOFxuICAgICAgICBvYmplY3R1bmRlZmluZWQ6IDYsIC8vSUU2XG4gICAgICAgIHVuZGVmaW5lZGZ1bmN0aW9uOiBOYU4sIC8vIG90aGVyIG1vZGVybiBicm93c2Vyc1xuICAgICAgICB1bmRlZmluZWRvYmplY3Q6IE5hTiB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICAqL1xuICAgIHZhciBtc2llID0gZG9jdW1lbnQkMS5kb2N1bWVudE1vZGUgfHwgdmVyc2lvbnNbdHlwZW9mIGRvY3VtZW50JDEuYWxsICsgdHlwZW9mIFhNTEh0dHBSZXF1ZXN0XTtcblxuICAgIHZhciBtb2Rlcm4gPSAvTmFOfHVuZGVmaW5lZC8udGVzdChtc2llKSB8fCBtc2llID4gODtcblxuICAgIC8qXG4gICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9yc21zL2pzLWxydVxuICAgICBlbnRyeSAgICAgICAgICAgICBlbnRyeSAgICAgICAgICAgICBlbnRyeSAgICAgICAgICAgICBlbnRyeSAgICAgICAgXG4gICAgIF9fX19fXyAgICAgICAgICAgIF9fX19fXyAgICAgICAgICAgIF9fX19fXyAgICAgICAgICAgIF9fX19fXyAgICAgICBcbiAgICAgfCBoZWFkIHwubmV3ZXIgPT4gfCAgICAgIHwubmV3ZXIgPT4gfCAgICAgIHwubmV3ZXIgPT4gfCB0YWlsIHwgICAgICBcbiAgICAgfCAgQSAgIHwgICAgICAgICAgfCAgQiAgIHwgICAgICAgICAgfCAgQyAgIHwgICAgICAgICAgfCAgRCAgIHwgICAgICBcbiAgICAgfF9fX19fX3wgPD0gb2xkZXIufF9fX19fX3wgPD0gb2xkZXIufF9fX19fX3wgPD0gb2xkZXIufF9fX19fX3wgICAgICBcbiAgICAgXG4gICAgIHJlbW92ZWQgIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICA8LS0gIDwtLSAgPC0tICBhZGRlZCBcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBDYWNoZShtYXhMZW5ndGgpIHtcbiAgICAgICAgLy8g5qCH6K+G5b2T5YmN57yT5a2Y5pWw57uE55qE5aSn5bCPXG4gICAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICAgIC8vIOagh+ivhue8k+WtmOaVsOe7hOiDvei+vuWIsOeahOacgOWkp+mVv+W6plxuICAgICAgICB0aGlzLmxpbWl0ID0gbWF4TGVuZ3RoO1xuICAgICAgICAvLyAgaGVhZO+8iOacgOS4jeW4uOeUqOeahOmhue+8ie+8jHRhaWzvvIjmnIDluLjnlKjnmoTpobnvvInlhajpg6jliJ3lp4vljJbkuLp1bmRlZmluZWRcblxuICAgICAgICB0aGlzLmhlYWQgPSB0aGlzLnRhaWwgPSB2b2lkIDA7XG4gICAgICAgIHRoaXMuX2tleW1hcCA9IHt9O1xuICAgIH1cblxuICAgIENhY2hlLnByb3RvdHlwZSA9IHtcbiAgICAgICAgcHV0OiBmdW5jdGlvbiBwdXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGVudHJ5ID0ge1xuICAgICAgICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMuX2tleW1hcFtrZXldID0gZW50cnk7XG4gICAgICAgICAgICBpZiAodGhpcy50YWlsKSB7XG4gICAgICAgICAgICAgICAgLy8g5aaC5p6c5a2Y5ZyodGFpbO+8iOe8k+WtmOaVsOe7hOeahOmVv+W6puS4jeS4ujDvvInvvIzlsIZ0YWls5oyH5ZCR5paw55qEIGVudHJ5XG4gICAgICAgICAgICAgICAgdGhpcy50YWlsLm5ld2VyID0gZW50cnk7XG4gICAgICAgICAgICAgICAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIOWmguaenOe8k+WtmOaVsOe7hOeahOmVv+W6puS4ujDvvIzlsIZoZWFk5oyH5ZCR5paw55qEZW50cnlcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWQgPSBlbnRyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudGFpbCA9IGVudHJ5O1xuICAgICAgICAgICAgLy8g5aaC5p6c57yT5a2Y5pWw57uE6L6+5Yiw5LiK6ZmQ77yM5YiZ5YWI5Yig6ZmkIGhlYWQg5oyH5ZCR55qE57yT5a2Y5a+56LGhXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICh0aGlzLnNpemUgPT09IHRoaXMubGltaXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNoaWZ0KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc2l6ZSsrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICBzaGlmdDogZnVuY3Rpb24gc2hpZnQoKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy5oZWFkO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgICAgICAgICAvLyDliKDpmaQgaGVhZCDvvIzlubbmlLnlj5jmjIflkJFcbiAgICAgICAgICAgICAgICB0aGlzLmhlYWQgPSB0aGlzLmhlYWQubmV3ZXI7XG4gICAgICAgICAgICAgICAgLy8g5ZCM5q2l5pu05pawIF9rZXltYXAg6YeM6Z2i55qE5bGe5oCn5YC8XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkLm9sZGVyID0gZW50cnkubmV3ZXIgPSBlbnRyeS5vbGRlciA9IHRoaXMuX2tleW1hcFtlbnRyeS5rZXldID0gdm9pZCAwO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLl9rZXltYXBbZW50cnkua2V5XTsgLy8jMTAyOVxuICAgICAgICAgICAgICAgIC8vIOWQjOatpeabtOaWsCDnvJPlrZjmlbDnu4TnmoTplb/luqZcbiAgICAgICAgICAgICAgICB0aGlzLnNpemUtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoa2V5KSB7XG4gICAgICAgICAgICB2YXIgZW50cnkgPSB0aGlzLl9rZXltYXBba2V5XTtcbiAgICAgICAgICAgIC8vIOWmguaenOafpeaJvuS4jeWIsOWQq+aciWBrZXlg6L+Z5Liq5bGe5oCn55qE57yT5a2Y5a+56LGhXG4gICAgICAgICAgICBpZiAoZW50cnkgPT09IHZvaWQgMCkgcmV0dXJuO1xuICAgICAgICAgICAgLy8g5aaC5p6c5p+l5om+5Yiw55qE57yT5a2Y5a+56LGh5bey57uP5pivIHRhaWwgKOacgOi/keS9v+eUqOi/h+eahClcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGVudHJ5ID09PSB0aGlzLnRhaWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZW50cnkudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBIRUFELS0tLS0tLS0tLS0tLS1UQUlMXG4gICAgICAgICAgICAvLyAgIDwub2xkZXIgICAubmV3ZXI+XG4gICAgICAgICAgICAvLyAgPC0tLSBhZGQgZGlyZWN0aW9uIC0tXG4gICAgICAgICAgICAvLyAgIEEgIEIgIEMgIDxEPiAgRVxuICAgICAgICAgICAgaWYgKGVudHJ5Lm5ld2VyKSB7XG4gICAgICAgICAgICAgICAgLy8g5aSE55CGIG5ld2VyIOaMh+WQkVxuICAgICAgICAgICAgICAgIGlmIChlbnRyeSA9PT0gdGhpcy5oZWFkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIOWmguaenOafpeaJvuWIsOeahOe8k+WtmOWvueixoeaYryBoZWFkICjmnIDov5HmnIDlsJHkvb/nlKjov4fnmoQpXG4gICAgICAgICAgICAgICAgICAgIC8vIOWImeWwhiBoZWFkIOaMh+WQkeWOnyBoZWFkIOeahCBuZXdlciDmiYDmjIflkJHnmoTnvJPlrZjlr7nosaFcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oZWFkID0gZW50cnkubmV3ZXI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOWwhuaJgOafpeaJvueahOe8k+WtmOWvueixoeeahOS4i+S4gOe6p+eahCBvbGRlciDmjIflkJHmiYDmn6Xmib7nmoTnvJPlrZjlr7nosaHnmoRvbGRlcuaJgOaMh+WQkeeahOWAvFxuICAgICAgICAgICAgICAgIC8vIOS+i+Wmgu+8mkEgQiBDIEQgRVxuICAgICAgICAgICAgICAgIC8vIOWmguaenOafpeaJvuWIsOeahOaYr0TvvIzpgqPkuYjlsIZF5oyH5ZCRQ++8jOS4jeWGjeaMh+WQkURcbiAgICAgICAgICAgICAgICBlbnRyeS5uZXdlci5vbGRlciA9IGVudHJ5Lm9sZGVyOyAvLyBDIDwtLSBFLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVudHJ5Lm9sZGVyKSB7XG4gICAgICAgICAgICAgICAgLy8g5aSE55CGIG9sZGVyIOaMh+WQkVxuICAgICAgICAgICAgICAgIC8vIOWmguaenOafpeaJvuWIsOeahOaYr0TvvIzpgqPkuYhD5oyH5ZCRRe+8jOS4jeWGjeaMh+WQkURcbiAgICAgICAgICAgICAgICBlbnRyeS5vbGRlci5uZXdlciA9IGVudHJ5Lm5ld2VyOyAvLyBDLiAtLT4gRVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5aSE55CG5omA5p+l5om+5Yiw55qE5a+56LGh55qEIG5ld2VyIOS7peWPiiBvbGRlciDmjIflkJFcbiAgICAgICAgICAgIGVudHJ5Lm5ld2VyID0gdm9pZCAwOyAvLyBEIC0teFxuICAgICAgICAgICAgLy8gb2xkZXLmjIflkJHkuYvliY3kvb/nlKjov4fnmoTlj5jph4/vvIzljbNE5oyH5ZCRRVxuICAgICAgICAgICAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWw7IC8vIEQuIC0tPiBFXG4gICAgICAgICAgICBpZiAodGhpcy50YWlsKSB7XG4gICAgICAgICAgICAgICAgLy8g5bCGReeahG5ld2Vy5oyH5ZCRRFxuICAgICAgICAgICAgICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5OyAvLyBFLiA8LS0gRFxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5pS55Y+YIHRhaWwg5Li6RCBcbiAgICAgICAgICAgIHRoaXMudGFpbCA9IGVudHJ5O1xuICAgICAgICAgICAgcmV0dXJuIGVudHJ5LnZhbHVlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBkZWxheUNvbXBpbGUgPSB7fTtcblxuICAgIHZhciBkaXJlY3RpdmVzID0ge307XG5cbiAgICBmdW5jdGlvbiBkaXJlY3RpdmUobmFtZSwgb3B0cykge1xuICAgICAgICBpZiAoZGlyZWN0aXZlc1tuYW1lXSkge1xuICAgICAgICAgICAgYXZhbG9uLndhcm4obmFtZSwgJ2RpcmVjdGl2ZSBoYXZlIGRlZmluZWQhICcpO1xuICAgICAgICB9XG4gICAgICAgIGRpcmVjdGl2ZXNbbmFtZV0gPSBvcHRzO1xuICAgICAgICBpZiAoIW9wdHMudXBkYXRlKSB7XG4gICAgICAgICAgICBvcHRzLnVwZGF0ZSA9IGZ1bmN0aW9uICgpIHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRzLmRlbGF5KSB7XG4gICAgICAgICAgICBkZWxheUNvbXBpbGVbbmFtZV0gPSAxO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvcHRzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRlbGF5Q29tcGlsZU5vZGVzKGRpcnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBkZWxheUNvbXBpbGUpIHtcbiAgICAgICAgICAgIGlmICgnbXMtJyArIGkgaW4gZGlycykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIHdpbmRvdyQxID0gd2luO1xuICAgIGZ1bmN0aW9uIGF2YWxvbihlbCkge1xuICAgICAgICByZXR1cm4gbmV3IGF2YWxvbi5pbml0KGVsKTtcbiAgICB9XG5cbiAgICBhdmFsb24uaW5pdCA9IGZ1bmN0aW9uIChlbCkge1xuICAgICAgICB0aGlzWzBdID0gdGhpcy5lbGVtZW50ID0gZWw7XG4gICAgfTtcblxuICAgIGF2YWxvbi5mbiA9IGF2YWxvbi5wcm90b3R5cGUgPSBhdmFsb24uaW5pdC5wcm90b3R5cGU7XG5cbiAgICBmdW5jdGlvbiBzaGFkb3dDb3B5KGRlc3RpbmF0aW9uLCBzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcGVydHkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICBkZXN0aW5hdGlvbltwcm9wZXJ0eV0gPSBzb3VyY2VbcHJvcGVydHldO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZXN0aW5hdGlvbjtcbiAgICB9XG4gICAgdmFyIHJ3b3JkID0gL1teLCBdKy9nO1xuICAgIHZhciBybm93aGl0ZSA9IC9cXFMrL2c7IC8v5a2Y5Zyo6Z2e56m65a2X56ymXG4gICAgdmFyIHBsYXRmb3JtID0ge307IC8v55So5LqO5pS+572u5bmz5Y+w5beu5byC55qE5pa55rOV5LiO5bGe5oCnXG5cblxuICAgIGZ1bmN0aW9uIG9uZU9iamVjdChhcnJheSwgdmFsKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYXJyYXkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBhcnJheSA9IGFycmF5Lm1hdGNoKHJ3b3JkKSB8fCBbXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmVzdWx0ID0ge30sXG4gICAgICAgICAgICB2YWx1ZSA9IHZhbCAhPT0gdm9pZCAwID8gdmFsIDogMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcnJheS5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHJlc3VsdFthcnJheVtpXV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHZhciBvcCA9IE9iamVjdC5wcm90b3R5cGU7XG4gICAgZnVuY3Rpb24gcXVvdGUoc3RyKSB7XG4gICAgICAgIHJldHVybiBhdmFsb24uX3F1b3RlKHN0cik7XG4gICAgfVxuICAgIHZhciBpbnNwZWN0ID0gb3AudG9TdHJpbmc7XG4gICAgdmFyIG9oYXNPd24gPSBvcC5oYXNPd25Qcm9wZXJ0eTtcbiAgICB2YXIgYXAgPSBBcnJheS5wcm90b3R5cGU7XG5cbiAgICB2YXIgaGFzQ29uc29sZSA9IHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JztcbiAgICBhdmFsb24uY29uZmlnID0geyBkZWJ1ZzogdHJ1ZSB9O1xuICAgIGZ1bmN0aW9uIGxvZygpIHtcbiAgICAgICAgaWYgKGhhc0NvbnNvbGUgJiYgYXZhbG9uLmNvbmZpZy5kZWJ1Zykge1xuICAgICAgICAgICAgRnVuY3Rpb24uYXBwbHkuY2FsbChjb25zb2xlLmxvZywgY29uc29sZSwgYXJndW1lbnRzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB3YXJuKCkge1xuICAgICAgICBpZiAoaGFzQ29uc29sZSAmJiBhdmFsb24uY29uZmlnLmRlYnVnKSB7XG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gY29uc29sZS53YXJuIHx8IGNvbnNvbGUubG9nO1xuICAgICAgICAgICAgLy8gaHR0cDovL3FpYW5nMTA2Lml0ZXllLmNvbS9ibG9nLzE3MjE0MjVcbiAgICAgICAgICAgIEZ1bmN0aW9uLmFwcGx5LmNhbGwobWV0aG9kLCBjb25zb2xlLCBhcmd1bWVudHMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVycm9yKHN0ciwgZSkge1xuICAgICAgICB0aHJvdyAoZSB8fCBFcnJvcikoc3RyKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gICAgZnVuY3Rpb24gaXNPYmplY3QoYSkge1xuICAgICAgICByZXR1cm4gYSAhPT0gbnVsbCAmJiB0eXBlb2YgYSA9PT0gJ29iamVjdCc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIGVuZCwgc3RlcCkge1xuICAgICAgICAvLyDnlKjkuo7nlJ/miJDmlbTmlbDmlbDnu4RcbiAgICAgICAgc3RlcCB8fCAoc3RlcCA9IDEpO1xuICAgICAgICBpZiAoZW5kID09IG51bGwpIHtcbiAgICAgICAgICAgIGVuZCA9IHN0YXJ0IHx8IDA7XG4gICAgICAgICAgICBzdGFydCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBNYXRoLm1heCgwLCBNYXRoLmNlaWwoKGVuZCAtIHN0YXJ0KSAvIHN0ZXApKSxcbiAgICAgICAgICAgIHJlc3VsdCA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IHN0YXJ0O1xuICAgICAgICAgICAgc3RhcnQgKz0gc3RlcDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuICAgIHZhciByaHlwaGVuID0gLyhbYS16XFxkXSkoW0EtWl0rKS9nO1xuICAgIGZ1bmN0aW9uIGh5cGhlbih0YXJnZXQpIHtcbiAgICAgICAgLy/ovazmjaLkuLrov57lrZfnrKbnur/po47moLxcbiAgICAgICAgcmV0dXJuIHRhcmdldC5yZXBsYWNlKHJoeXBoZW4sICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG4gICAgfVxuXG4gICAgdmFyIHJjYW1lbGl6ZSA9IC9bLV9dW14tX10vZztcbiAgICBmdW5jdGlvbiBjYW1lbGl6ZSh0YXJnZXQpIHtcbiAgICAgICAgLy/mj5DliY3liKTmlq3vvIzmj5Dpq5hnZXRTdHlsZeetieeahOaViOeOh1xuICAgICAgICBpZiAoIXRhcmdldCB8fCB0YXJnZXQuaW5kZXhPZignLScpIDwgMCAmJiB0YXJnZXQuaW5kZXhPZignXycpIDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgICAvL+i9rOaNouS4uumpvOWzsOmjjuagvFxuICAgICAgICByZXR1cm4gdGFyZ2V0LnJlcGxhY2UocmNhbWVsaXplLCBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaC5jaGFyQXQoMSkudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIF9zbGljZSA9IGFwLnNsaWNlO1xuICAgIGZ1bmN0aW9uIHNsaWNlKG5vZGVzLCBzdGFydCwgZW5kKSB7XG4gICAgICAgIHJldHVybiBfc2xpY2UuY2FsbChub2Rlcywgc3RhcnQsIGVuZCk7XG4gICAgfVxuXG4gICAgdmFyIHJoYXNoY29kZSA9IC9cXGRcXC5cXGR7NH0vO1xuICAgIC8v55Sf5oiQVVVJRCBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkLWluLWphdmFzY3JpcHRcbiAgICBmdW5jdGlvbiBtYWtlSGFzaENvZGUocHJlZml4KSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICAgICAgcHJlZml4ID0gcHJlZml4IHx8ICdhdmFsb24nO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgICAgIHJldHVybiBTdHJpbmcoTWF0aC5yYW5kb20oKSArIE1hdGgucmFuZG9tKCkpLnJlcGxhY2Uocmhhc2hjb2RlLCBwcmVmaXgpO1xuICAgIH1cbiAgICAvL+eUn+aIkOS6i+S7tuWbnuiwg+eahFVVSUQo55So5oi36YCa6L+HbXMtb27mjIfku6QpXG4gICAgZnVuY3Rpb24gZ2V0TG9uZ0lEKGZuKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHJldHVybiBmbi51dWlkIHx8IChmbi51dWlkID0gbWFrZUhhc2hDb2RlKCdlJykpO1xuICAgIH1cbiAgICB2YXIgVVVJRCA9IDE7XG4gICAgLy/nlJ/miJDkuovku7blm57osIPnmoRVVUlEKOeUqOaIt+mAmui/h2F2YWxvbi5iaW5kKVxuICAgIGZ1bmN0aW9uIGdldFNob3J0SUQoZm4pIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgcmV0dXJuIGZuLnV1aWQgfHwgKGZuLnV1aWQgPSAnXycgKyArK1VVSUQpO1xuICAgIH1cblxuICAgIHZhciByZXNjYXBlID0gL1stLiorP14ke30oKXxbXFxdXFwvXFxcXF0vZztcbiAgICBmdW5jdGlvbiBlc2NhcGVSZWdFeHAodGFyZ2V0KSB7XG4gICAgICAgIC8vaHR0cDovL3N0ZXZlbmxldml0aGFuLmNvbS9yZWdleC94cmVnZXhwL1xuICAgICAgICAvL+WwhuWtl+espuS4suWuieWFqOagvOW8j+WMluS4uuato+WImeihqOi+vuW8j+eahOa6kOeggVxuICAgICAgICByZXR1cm4gKHRhcmdldCArICcnKS5yZXBsYWNlKHJlc2NhcGUsICdcXFxcJCYnKTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRIb29rcyA9IHt9O1xuICAgIHZhciBldmVudExpc3RlbmVycyA9IHt9O1xuICAgIHZhciB2YWxpZGF0b3JzID0ge307XG4gICAgdmFyIGNzc0hvb2tzID0ge307XG5cbiAgICB3aW5kb3ckMS5hdmFsb24gPSBhdmFsb247XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVGcmFnbWVudCgpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgICovXG4gICAgICAgIHJldHVybiBkb2N1bWVudCQxLmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICB9XG5cbiAgICB2YXIgcmVudGl0aWVzID0gLyZbYS16MC05I117MiwxMH07LztcbiAgICB2YXIgdGVtcCA9IGRvY3VtZW50JDEuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgc2hhZG93Q29weShhdmFsb24sIHtcbiAgICAgICAgQXJyYXk6IHtcbiAgICAgICAgICAgIG1lcmdlOiBmdW5jdGlvbiBtZXJnZSh0YXJnZXQsIG90aGVyKSB7XG4gICAgICAgICAgICAgICAgLy/lkIjlubbkuKTkuKrmlbDnu4QgYXZhbG9uMuaWsOWinlxuICAgICAgICAgICAgICAgIHRhcmdldC5wdXNoLmFwcGx5KHRhcmdldCwgb3RoZXIpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVuc3VyZTogZnVuY3Rpb24gZW5zdXJlKHRhcmdldCwgaXRlbSkge1xuICAgICAgICAgICAgICAgIC8v5Y+q5pyJ5b2T5YmN5pWw57uE5LiN5a2Y5Zyo5q2k5YWD57Sg5pe25Y+q5re75Yqg5a6DXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5pbmRleE9mKGl0ZW0pID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0LnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbW92ZUF0OiBmdW5jdGlvbiByZW1vdmVBdCh0YXJnZXQsIGluZGV4KSB7XG4gICAgICAgICAgICAgICAgLy/np7vpmaTmlbDnu4TkuK3mjIflrprkvY3nva7nmoTlhYPntKDvvIzov5Tlm57luIPlsJTooajnpLrmiJDlip/kuI7lkKZcbiAgICAgICAgICAgICAgICByZXR1cm4gISF0YXJnZXQuc3BsaWNlKGluZGV4LCAxKS5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiByZW1vdmUodGFyZ2V0LCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgLy/np7vpmaTmlbDnu4TkuK3nrKzkuIDkuKrljLnphY3kvKDlj4LnmoTpgqPkuKrlhYPntKDvvIzov5Tlm57luIPlsJTooajnpLrmiJDlip/kuI7lkKZcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0YXJnZXQuaW5kZXhPZihpdGVtKTtcbiAgICAgICAgICAgICAgICBpZiAofmluZGV4KSByZXR1cm4gYXZhbG9uLkFycmF5LnJlbW92ZUF0KHRhcmdldCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZhbHVhdG9yUG9vbDogbmV3IENhY2hlKDg4OCksXG4gICAgICAgIHBhcnNlcnM6IHtcbiAgICAgICAgICAgIG51bWJlcjogZnVuY3Rpb24gbnVtYmVyKGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA9PT0gJycgPyAnJyA6IHBhcnNlRmxvYXQoYSkgfHwgMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzdHJpbmc6IGZ1bmN0aW9uIHN0cmluZyhhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09IG51bGwgfHwgYSA9PT0gdm9pZCAwID8gJycgOiBhICsgJyc7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJib29sZWFuXCI6IGZ1bmN0aW9uIGJvb2xlYW4oYSkge1xuICAgICAgICAgICAgICAgIGlmIChhID09PSAnJykgcmV0dXJuIGE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEgPT09ICd0cnVlJyB8fCBhID09PSAnMSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIF9kZWNvZGU6IGZ1bmN0aW9uIF9kZWNvZGUoc3RyKSB7XG4gICAgICAgICAgICBpZiAocmVudGl0aWVzLnRlc3Qoc3RyKSkge1xuICAgICAgICAgICAgICAgIHRlbXAuaW5uZXJIVE1MID0gc3RyO1xuICAgICAgICAgICAgICAgIHJldHVybiB0ZW1wLmlubmVyVGV4dCB8fCB0ZW1wLnRleHRDb250ZW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy89PT09PT09PT09PT09PSBjb25maWcgPT09PT09PT09PT09XG4gICAgZnVuY3Rpb24gY29uZmlnKHNldHRpbmdzKSB7XG4gICAgICAgIGZvciAodmFyIHAgaW4gc2V0dGluZ3MpIHtcbiAgICAgICAgICAgIHZhciB2YWwgPSBzZXR0aW5nc1twXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLnBsdWdpbnNbcF0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBjb25maWcucGx1Z2luc1twXSh2YWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25maWdbcF0gPSB2YWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIHBsdWdpbnMgPSB7XG4gICAgICAgIGludGVycG9sYXRlOiBmdW5jdGlvbiBpbnRlcnBvbGF0ZShhcnJheSkge1xuICAgICAgICAgICAgdmFyIG9wZW5UYWcgPSBhcnJheVswXTtcbiAgICAgICAgICAgIHZhciBjbG9zZVRhZyA9IGFycmF5WzFdO1xuICAgICAgICAgICAgaWYgKG9wZW5UYWcgPT09IGNsb3NlVGFnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKCdpbnRlcnBvbGF0ZSBvcGVuVGFnIGNhbm5vdCBlcXVhbCB0byBjbG9zZVRhZycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0ciA9IG9wZW5UYWcgKyAndGVzdCcgKyBjbG9zZVRhZztcblxuICAgICAgICAgICAgaWYgKC9bPD5dLy50ZXN0KHN0cikpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ2ludGVycG9sYXRlIGNhbm5vdCBjb250YWlucyBcIjxcIiBvciBcIj5cIicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25maWcub3BlblRhZyA9IG9wZW5UYWc7XG4gICAgICAgICAgICBjb25maWcuY2xvc2VUYWcgPSBjbG9zZVRhZztcbiAgICAgICAgICAgIHZhciBvID0gZXNjYXBlUmVnRXhwKG9wZW5UYWcpO1xuICAgICAgICAgICAgdmFyIGMgPSBlc2NhcGVSZWdFeHAoY2xvc2VUYWcpO1xuXG4gICAgICAgICAgICBjb25maWcucnRleHQgPSBuZXcgUmVnRXhwKG8gKyAnKC4rPyknICsgYywgJ2cnKTtcbiAgICAgICAgICAgIGNvbmZpZy5yZXhwciA9IG5ldyBSZWdFeHAobyArICcoW1xcXFxzXFxcXFNdKiknICsgYyk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGNyZWF0ZUFuY2hvcihub2RlVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50JDEuY3JlYXRlQ29tbWVudChub2RlVmFsdWUpO1xuICAgIH1cbiAgICBjb25maWcucGx1Z2lucyA9IHBsdWdpbnM7XG4gICAgY29uZmlnKHtcbiAgICAgICAgaW50ZXJwb2xhdGU6IFsne3snLCAnfX0nXSxcbiAgICAgICAgZGVidWc6IHRydWVcbiAgICB9KTtcbiAgICAvLz09PT09PT09PT09PSAgY29uZmlnID09PT09PT09PT09PVxuXG4gICAgc2hhZG93Q29weShhdmFsb24sIHtcbiAgICAgICAgc2hhZG93Q29weTogc2hhZG93Q29weSxcblxuICAgICAgICBvbmVPYmplY3Q6IG9uZU9iamVjdCxcbiAgICAgICAgaW5zcGVjdDogaW5zcGVjdCxcbiAgICAgICAgb2hhc093bjogb2hhc093bixcbiAgICAgICAgcndvcmQ6IHJ3b3JkLFxuICAgICAgICB2ZXJzaW9uOiBcIjIuMi40XCIsXG4gICAgICAgIHZtb2RlbHM6IHt9LFxuXG4gICAgICAgIGRpcmVjdGl2ZXM6IGRpcmVjdGl2ZXMsXG4gICAgICAgIGRpcmVjdGl2ZTogZGlyZWN0aXZlLFxuXG4gICAgICAgIGV2ZW50SG9va3M6IGV2ZW50SG9va3MsXG4gICAgICAgIGV2ZW50TGlzdGVuZXJzOiBldmVudExpc3RlbmVycyxcbiAgICAgICAgdmFsaWRhdG9yczogdmFsaWRhdG9ycyxcbiAgICAgICAgY3NzSG9va3M6IGNzc0hvb2tzLFxuXG4gICAgICAgIGxvZzogbG9nLFxuICAgICAgICBub29wOiBub29wLFxuICAgICAgICB3YXJuOiB3YXJuLFxuICAgICAgICBlcnJvcjogZXJyb3IsXG4gICAgICAgIGNvbmZpZzogY29uZmlnLFxuXG4gICAgICAgIG1vZGVybjogbW9kZXJuLFxuICAgICAgICBtc2llOiBtc2llLFxuICAgICAgICByb290OiByb290LFxuICAgICAgICBkb2N1bWVudDogZG9jdW1lbnQkMSxcbiAgICAgICAgd2luZG93OiB3aW5kb3ckMSxcbiAgICAgICAgaW5Ccm93c2VyOiBpbkJyb3dzZXIsXG5cbiAgICAgICAgaXNPYmplY3Q6IGlzT2JqZWN0LFxuICAgICAgICByYW5nZTogcmFuZ2UsXG4gICAgICAgIHNsaWNlOiBzbGljZSxcbiAgICAgICAgaHlwaGVuOiBoeXBoZW4sXG4gICAgICAgIGNhbWVsaXplOiBjYW1lbGl6ZSxcbiAgICAgICAgZXNjYXBlUmVnRXhwOiBlc2NhcGVSZWdFeHAsXG4gICAgICAgIHF1b3RlOiBxdW90ZSxcblxuICAgICAgICBtYWtlSGFzaENvZGU6IG1ha2VIYXNoQ29kZVxuXG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiDmraTmqKHlnZfnlKjkuo7kv67lpI3or63oqIDnmoTlupXlsYLnvLrpmbdcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBpc05hdGl2ZShmbikge1xuICAgICAgICByZXR1cm4gKC9cXFtuYXRpdmUgY29kZVxcXS8udGVzdChmbilcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgIGlmICghaXNOYXRpdmUoJ+WPuOW+kuato+e+jicudHJpbSkpIHtcbiAgICAgICAgdmFyIHJ0cmltID0gL15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nO1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLnRyaW0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKHJ0cmltLCAnJyk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGlmICghT2JqZWN0LmNyZWF0ZSkge1xuICAgICAgICBPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gRigpIHt9XG5cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAobykge1xuICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoICE9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdPYmplY3QuY3JlYXRlIGltcGxlbWVudGF0aW9uIG9ubHkgYWNjZXB0cyBvbmUgcGFyYW1ldGVyLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBGLnByb3RvdHlwZSA9IG87XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KCk7XG4gICAgfVxuICAgIHZhciBoYXNEb250RW51bUJ1ZyA9ICF7XG4gICAgICAgICd0b1N0cmluZyc6IG51bGxcbiAgICB9LnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpO1xuICAgIHZhciBoYXNQcm90b0VudW1CdWcgPSBmdW5jdGlvbiAoKSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgncHJvdG90eXBlJyk7XG4gICAgdmFyIGRvbnRFbnVtcyA9IFsndG9TdHJpbmcnLCAndG9Mb2NhbGVTdHJpbmcnLCAndmFsdWVPZicsICdoYXNPd25Qcm9wZXJ0eScsICdpc1Byb3RvdHlwZU9mJywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2NvbnN0cnVjdG9yJ107XG4gICAgdmFyIGRvbnRFbnVtc0xlbmd0aCA9IGRvbnRFbnVtcy5sZW5ndGg7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICBpZiAoIWlzTmF0aXZlKE9iamVjdC5rZXlzKSkge1xuICAgICAgICBPYmplY3Qua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgIC8vZWNtYTI2MnY1IDE1LjIuMy4xNFxuICAgICAgICAgICAgdmFyIHRoZUtleXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBza2lwUHJvdG8gPSBoYXNQcm90b0VudW1CdWcgJiYgdHlwZW9mIG9iamVjdCA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAnc3RyaW5nJyB8fCBvYmplY3QgJiYgb2JqZWN0LmNhbGxlZSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JqZWN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoZUtleXMucHVzaChTdHJpbmcoaSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEoc2tpcFByb3RvICYmIG5hbWUgPT09ICdwcm90b3R5cGUnKSAmJiBvaGFzT3duLmNhbGwob2JqZWN0LCBuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhlS2V5cy5wdXNoKFN0cmluZyhuYW1lKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoYXNEb250RW51bUJ1Zykge1xuICAgICAgICAgICAgICAgIHZhciBjdG9yID0gb2JqZWN0LmNvbnN0cnVjdG9yLFxuICAgICAgICAgICAgICAgICAgICBza2lwQ29uc3RydWN0b3IgPSBjdG9yICYmIGN0b3IucHJvdG90eXBlID09PSBvYmplY3Q7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBkb250RW51bXNMZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZG9udEVudW0gPSBkb250RW51bXNbal07XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHNraXBDb25zdHJ1Y3RvciAmJiBkb250RW51bSA9PT0gJ2NvbnN0cnVjdG9yJykgJiYgb2hhc093bi5jYWxsKG9iamVjdCwgZG9udEVudW0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGVLZXlzLnB1c2goZG9udEVudW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoZUtleXM7XG4gICAgICAgIH07XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgaWYgKCFpc05hdGl2ZShBcnJheS5pc0FycmF5KSkge1xuICAgICAgICBBcnJheS5pc0FycmF5ID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICBpZiAoIWlzTmF0aXZlKGlzTmF0aXZlLmJpbmQpKSB7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICAgICAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMiAmJiBzY29wZSA9PT0gdm9pZCAwKSByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIHZhciBmbiA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYXJndiA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgaTtcbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgYXJndi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2goYXJndltpXSk7XG4gICAgICAgICAgICAgICAgfWZvciAoaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgICAgICAgICAgfXJldHVybiBmbi5hcHBseShzY29wZSwgYXJncyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvL2h0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL3poLUNOL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0FycmF5L3NsaWNlXG4gICAgLyoqXG4gICAgICogU2hpbSBmb3IgXCJmaXhpbmdcIiBJRSdzIGxhY2sgb2Ygc3VwcG9ydCAoSUUgPCA5KSBmb3IgYXBwbHlpbmcgc2xpY2VcbiAgICAgKiBvbiBob3N0IG9iamVjdHMgbGlrZSBOYW1lZE5vZGVNYXAsIE5vZGVMaXN0LCBhbmQgSFRNTENvbGxlY3Rpb25cbiAgICAgKiAodGVjaG5pY2FsbHksIHNpbmNlIGhvc3Qgb2JqZWN0cyBoYXZlIGJlZW4gaW1wbGVtZW50YXRpb24tZGVwZW5kZW50LFxuICAgICAqIGF0IGxlYXN0IGJlZm9yZSBFUzYsIElFIGhhc24ndCBuZWVkZWQgdG8gd29yayB0aGlzIHdheSkuXG4gICAgICogQWxzbyB3b3JrcyBvbiBzdHJpbmdzLCBmaXhlcyBJRSA8IDkgdG8gYWxsb3cgYW4gZXhwbGljaXQgdW5kZWZpbmVkXG4gICAgICogZm9yIHRoZSAybmQgYXJndW1lbnQgKGFzIGluIEZpcmVmb3gpLCBhbmQgcHJldmVudHMgZXJyb3JzIHdoZW5cbiAgICAgKiBjYWxsZWQgb24gb3RoZXIgRE9NIG9iamVjdHMuXG4gICAgICovXG5cbiAgICB0cnkge1xuICAgICAgICAvLyBDYW4ndCBiZSB1c2VkIHdpdGggRE9NIGVsZW1lbnRzIGluIElFIDwgOVxuICAgICAgICBfc2xpY2UuY2FsbChhdmFsb24uZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIEZhaWxzIGluIElFIDwgOVxuICAgICAgICAvLyBUaGlzIHdpbGwgd29yayBmb3IgZ2VudWluZSBhcnJheXMsIGFycmF5LWxpa2Ugb2JqZWN0cyxcbiAgICAgICAgLy8gTmFtZWROb2RlTWFwIChhdHRyaWJ1dGVzLCBlbnRpdGllcywgbm90YXRpb25zKSxcbiAgICAgICAgLy8gTm9kZUxpc3QgKGUuZy4sIGdldEVsZW1lbnRzQnlUYWdOYW1lKSwgSFRNTENvbGxlY3Rpb24gKGUuZy4sIGNoaWxkTm9kZXMpLFxuICAgICAgICAvLyBhbmQgd2lsbCBub3QgZmFpbCBvbiBvdGhlciBET00gb2JqZWN0cyAoYXMgZG8gRE9NIGVsZW1lbnRzIGluIElFIDwgOSlcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgICAgICBhcC5zbGljZSA9IGZ1bmN0aW9uIChiZWdpbiwgZW5kKSB7XG4gICAgICAgICAgICAvLyBJRSA8IDkgZ2V0cyB1bmhhcHB5IHdpdGggYW4gdW5kZWZpbmVkIGVuZCBhcmd1bWVudFxuICAgICAgICAgICAgZW5kID0gdHlwZW9mIGVuZCAhPT0gJ3VuZGVmaW5lZCcgPyBlbmQgOiB0aGlzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gRm9yIG5hdGl2ZSBBcnJheSBvYmplY3RzLCB3ZSB1c2UgdGhlIG5hdGl2ZSBzbGljZSBmdW5jdGlvblxuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodGhpcykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gX3NsaWNlLmNhbGwodGhpcywgYmVnaW4sIGVuZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEZvciBhcnJheSBsaWtlIG9iamVjdCB3ZSBoYW5kbGUgaXQgb3Vyc2VsdmVzLlxuICAgICAgICAgICAgdmFyIGksXG4gICAgICAgICAgICAgICAgY2xvbmVkID0gW10sXG4gICAgICAgICAgICAgICAgc2l6ZSxcbiAgICAgICAgICAgICAgICBsZW4gPSB0aGlzLmxlbmd0aDtcblxuICAgICAgICAgICAgLy8gSGFuZGxlIG5lZ2F0aXZlIHZhbHVlIGZvciBcImJlZ2luXCJcbiAgICAgICAgICAgIHZhciBzdGFydCA9IGJlZ2luIHx8IDA7XG4gICAgICAgICAgICBzdGFydCA9IHN0YXJ0ID49IDAgPyBzdGFydCA6IGxlbiArIHN0YXJ0O1xuXG4gICAgICAgICAgICAvLyBIYW5kbGUgbmVnYXRpdmUgdmFsdWUgZm9yIFwiZW5kXCJcbiAgICAgICAgICAgIHZhciB1cFRvID0gZW5kID8gZW5kIDogbGVuO1xuICAgICAgICAgICAgaWYgKGVuZCA8IDApIHtcbiAgICAgICAgICAgICAgICB1cFRvID0gbGVuICsgZW5kO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBBY3R1YWwgZXhwZWN0ZWQgc2l6ZSBvZiB0aGUgc2xpY2VcbiAgICAgICAgICAgIHNpemUgPSB1cFRvIC0gc3RhcnQ7XG5cbiAgICAgICAgICAgIGlmIChzaXplID4gMCkge1xuICAgICAgICAgICAgICAgIGNsb25lZCA9IG5ldyBBcnJheShzaXplKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jaGFyQXQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmVkW2ldID0gdGhpcy5jaGFyQXQoc3RhcnQgKyBpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lZFtpXSA9IHRoaXNbc3RhcnQgKyBpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNsb25lZDtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgIGZ1bmN0aW9uIGl0ZXJhdG9yKHZhcnMsIGJvZHksIHJldCkge1xuICAgICAgICB2YXIgZnVuID0gJ2Zvcih2YXIgJyArIHZhcnMgKyAnaT0wLG4gPSB0aGlzLmxlbmd0aDsgaSA8IG47IGkrKyl7JyArIGJvZHkucmVwbGFjZSgnXycsICcoKGkgaW4gdGhpcykgJiYgZm4uY2FsbChzY29wZSx0aGlzW2ldLGksdGhpcykpJykgKyAnfScgKyByZXQ7XG4gICAgICAgIC8qIGpzaGludCBpZ25vcmU6c3RhcnQgKi9cbiAgICAgICAgcmV0dXJuIEZ1bmN0aW9uKCdmbixzY29wZScsIGZ1bik7XG4gICAgICAgIC8qIGpzaGludCBpZ25vcmU6ZW5kICovXG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgaWYgKCFpc05hdGl2ZShhcC5tYXApKSB7XG4gICAgICAgIGF2YWxvbi5zaGFkb3dDb3B5KGFwLCB7XG4gICAgICAgICAgICAvL+WumuS9jeaTjeS9nO+8jOi/lOWbnuaVsOe7hOS4reesrOS4gOS4quetieS6jue7meWumuWPguaVsOeahOWFg+e0oOeahOe0ouW8leWAvOOAglxuICAgICAgICAgICAgaW5kZXhPZjogZnVuY3Rpb24gaW5kZXhPZihpdGVtLCBpbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBuID0gdGhpcy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgIGkgPSB+fmluZGV4O1xuICAgICAgICAgICAgICAgIGlmIChpIDwgMCkgaSArPSBuO1xuICAgICAgICAgICAgICAgIGZvciAoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW2ldID09PSBpdGVtKSByZXR1cm4gaTtcbiAgICAgICAgICAgICAgICB9cmV0dXJuIC0xO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8v5a6a5L2N5pON5L2c77yM5ZCM5LiK77yM5LiN6L+H5piv5LuO5ZCO6YGN5Y6G44CCXG4gICAgICAgICAgICBsYXN0SW5kZXhPZjogZnVuY3Rpb24gbGFzdEluZGV4T2YoaXRlbSwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IHRoaXMubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICBpID0gaW5kZXggPT0gbnVsbCA/IG4gLSAxIDogaW5kZXg7XG4gICAgICAgICAgICAgICAgaWYgKGkgPCAwKSBpID0gTWF0aC5tYXgoMCwgbiArIGkpO1xuICAgICAgICAgICAgICAgIGZvciAoOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpc1tpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgICAgICAgICAgfXJldHVybiAtMTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvL+i/reS7o+aTjeS9nO+8jOWwhuaVsOe7hOeahOWFg+e0oOaMqOS4quWEv+S8oOWFpeS4gOS4quWHveaVsOS4reaJp+ihjOOAglByb3RvdHlwZS5qc+eahOWvueW6lOWQjeWtl+S4umVhY2jjgIJcbiAgICAgICAgICAgIGZvckVhY2g6IGl0ZXJhdG9yKCcnLCAnXycsICcnKSxcbiAgICAgICAgICAgIC8v6L+t5Luj57G7IOWcqOaVsOe7hOS4reeahOavj+S4qumhueS4iui/kOihjOS4gOS4quWHveaVsO+8jOWmguaenOatpOWHveaVsOeahOWAvOS4uuecn++8jOWImeatpOWFg+e0oOS9nOS4uuaWsOaVsOe7hOeahOWFg+e0oOaUtumbhui1t+adpe+8jOW5tui/lOWbnuaWsOaVsOe7hFxuICAgICAgICAgICAgZmlsdGVyOiBpdGVyYXRvcigncj1bXSxqPTAsJywgJ2lmKF8pcltqKytdPXRoaXNbaV0nLCAncmV0dXJuIHInKSxcbiAgICAgICAgICAgIC8v5pS26ZuG5pON5L2c77yM5bCG5pWw57uE55qE5YWD57Sg5oyo5Liq5YS/5Lyg5YWl5LiA5Liq5Ye95pWw5Lit5omn6KGM77yM54S25ZCO5oqK5a6D5Lus55qE6L+U5Zue5YC857uE5oiQ5LiA5Liq5paw5pWw57uE6L+U5Zue44CCUHJvdG90eXBlLmpz55qE5a+55bqU5ZCN5a2X5Li6Y29sbGVjdOOAglxuICAgICAgICAgICAgbWFwOiBpdGVyYXRvcigncj1bXSwnLCAncltpXT1fJywgJ3JldHVybiByJyksXG4gICAgICAgICAgICAvL+WPquimgeaVsOe7hOS4reacieS4gOS4quWFg+e0oOa7oei2s+adoeS7tu+8iOaUvui/m+e7meWumuWHveaVsOi/lOWbnnRydWXvvInvvIzpgqPkuYjlroPlsLHov5Tlm550cnVl44CCUHJvdG90eXBlLmpz55qE5a+55bqU5ZCN5a2X5Li6YW5544CCXG4gICAgICAgICAgICBzb21lOiBpdGVyYXRvcignJywgJ2lmKF8pcmV0dXJuIHRydWUnLCAncmV0dXJuIGZhbHNlJyksXG4gICAgICAgICAgICAvL+WPquacieaVsOe7hOS4reeahOWFg+e0oOmDvea7oei2s+adoeS7tu+8iOaUvui/m+e7meWumuWHveaVsOi/lOWbnnRydWXvvInvvIzlroPmiY3ov5Tlm550cnVl44CCUHJvdG90eXBlLmpz55qE5a+55bqU5ZCN5a2X5Li6YWxs44CCXG4gICAgICAgICAgICBldmVyeTogaXRlcmF0b3IoJycsICdpZighXylyZXR1cm4gZmFsc2UnLCAncmV0dXJuIHRydWUnKVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvL+i/memHjOaUvue9ruWtmOWcqOW8guiurueahOaWueazlVxuICAgIHZhciBjb21wYWNlUXVvdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2Jlc3RpZWpzL2pzb24zL2Jsb2IvbWFzdGVyL2xpYi9qc29uMy5qc1xuICAgICAgICB2YXIgRXNjYXBlcyA9IHtcbiAgICAgICAgICAgIDkyOiBcIlxcXFxcXFxcXCIsXG4gICAgICAgICAgICAzNDogJ1xcXFxcIicsXG4gICAgICAgICAgICA4OiBcIlxcXFxiXCIsXG4gICAgICAgICAgICAxMjogXCJcXFxcZlwiLFxuICAgICAgICAgICAgMTA6IFwiXFxcXG5cIixcbiAgICAgICAgICAgIDEzOiBcIlxcXFxyXCIsXG4gICAgICAgICAgICA5OiBcIlxcXFx0XCJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgbGVhZGluZ1plcm9lcyA9ICcwMDAwMDAnO1xuICAgICAgICB2YXIgdG9QYWRkZWRTdHJpbmcgPSBmdW5jdGlvbiB0b1BhZGRlZFN0cmluZyh3aWR0aCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiAobGVhZGluZ1plcm9lcyArICh2YWx1ZSB8fCAwKSkuc2xpY2UoLXdpZHRoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHVuaWNvZGVQcmVmaXggPSAnXFxcXHUwMCc7XG4gICAgICAgIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24gZXNjYXBlQ2hhcihjaGFyYWN0ZXIpIHtcbiAgICAgICAgICAgIHZhciBjaGFyQ29kZSA9IGNoYXJhY3Rlci5jaGFyQ29kZUF0KDApLFxuICAgICAgICAgICAgICAgIGVzY2FwZWQgPSBFc2NhcGVzW2NoYXJDb2RlXTtcbiAgICAgICAgICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVzY2FwZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdW5pY29kZVByZWZpeCArIHRvUGFkZGVkU3RyaW5nKDIsIGNoYXJDb2RlLnRvU3RyaW5nKDE2KSk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciByZUVzY2FwZSA9IC9bXFx4MDAtXFx4MWZcXHgyMlxceDVjXS9nO1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgcmVFc2NhcGUubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gJ1wiJyArIChyZUVzY2FwZS50ZXN0KHZhbHVlKSA/IFN0cmluZyh2YWx1ZSkucmVwbGFjZShyZUVzY2FwZSwgZXNjYXBlQ2hhcikgOiB2YWx1ZSkgKyAnXCInO1xuICAgICAgICB9O1xuICAgIH0oKTtcbiAgICB0cnkge1xuICAgICAgICBhdmFsb24uX3F1b3RlID0gSlNPTi5zdHJpbmdpZnk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAgKi9cbiAgICAgICAgYXZhbG9uLl9xdW90ZSA9IGNvbXBhY2VRdW90ZTtcbiAgICB9XG5cbiAgICB2YXIgY2xhc3MydHlwZSA9IHt9O1xuICAgICdCb29sZWFuIE51bWJlciBTdHJpbmcgRnVuY3Rpb24gQXJyYXkgRGF0ZSBSZWdFeHAgT2JqZWN0IEVycm9yJy5yZXBsYWNlKGF2YWxvbi5yd29yZCwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgY2xhc3MydHlwZVsnW29iamVjdCAnICsgbmFtZSArICddJ10gPSBuYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgfSk7XG5cbiAgICBhdmFsb24udHlwZSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgLy/lj5blvpfnm67moIfnmoTnsbvlnotcbiAgICAgICAgaWYgKG9iaiA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKG9iaik7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5pep5pyf55qEd2Via2l05YaF5qC45rWP6KeI5Zmo5a6e546w5LqG5bey5bqf5byD55qEZWNtYTI2MnY05qCH5YeG77yM5Y+v5Lul5bCG5q2j5YiZ5a2X6Z2i6YeP5b2T5L2c5Ye95pWw5L2/55So77yM5Zug5q2kdHlwZW9m5Zyo5Yik5a6a5q2j5YiZ5pe25Lya6L+U5ZueZnVuY3Rpb25cbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdvYmplY3QnIHx8IHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicgPyBjbGFzczJ0eXBlW2luc3BlY3QuY2FsbChvYmopXSB8fCAnb2JqZWN0JyA6IHR5cGVvZiBvYmo7XG4gICAgfTtcblxuICAgIHZhciByZnVuY3Rpb24gPSAvXlxccypcXGJmdW5jdGlvblxcYi87XG5cbiAgICBhdmFsb24uaXNGdW5jdGlvbiA9IC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL3R5cGVvZiBhbGVydCA9PT0gJ29iamVjdCcgPyBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gcmZ1bmN0aW9uLnRlc3QoZm4gKyAnJyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9IDogZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBpbnNwZWN0LmNhbGwoZm4pID09PSAnW29iamVjdCBGdW5jdGlvbl0nO1xuICAgIH07XG5cbiAgICAvLyDliKnnlKhJRTY3OCB3aW5kb3cgPT0gZG9jdW1lbnTkuLp0cnVlLGRvY3VtZW50ID09IHdpbmRvd+ern+eEtuS4umZhbHNl55qE56We5aWH54m55oCnXG4gICAgLy8g5qCH5YeG5rWP6KeI5Zmo5Y+KSUU577yMSUUxMOetieS9v+eUqCDmraPliJnmo4DmtYtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGlzV2luZG93Q29tcGFjdChvYmopIHtcbiAgICAgICAgaWYgKCFvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb2JqID09IG9iai5kb2N1bWVudCAmJiBvYmouZG9jdW1lbnQgIT0gb2JqOyAvL2pzaGludCBpZ25vcmU6bGluZVxuICAgIH1cblxuICAgIHZhciByd2luZG93ID0gL15cXFtvYmplY3QgKD86V2luZG93fERPTVdpbmRvd3xnbG9iYWwpXFxdJC87XG5cbiAgICBmdW5jdGlvbiBpc1dpbmRvd01vZGVybihvYmopIHtcbiAgICAgICAgcmV0dXJuIHJ3aW5kb3cudGVzdChpbnNwZWN0LmNhbGwob2JqKSk7XG4gICAgfVxuXG4gICAgYXZhbG9uLmlzV2luZG93ID0gaXNXaW5kb3dNb2Rlcm4oYXZhbG9uLndpbmRvdykgPyBpc1dpbmRvd01vZGVybiA6IGlzV2luZG93Q29tcGFjdDtcblxuICAgIHZhciBlbnU7XG4gICAgdmFyIGVudW1lcmF0ZUJVRztcbiAgICBmb3IgKGVudSBpbiBhdmFsb24oe30pKSB7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGVudW1lcmF0ZUJVRyA9IGVudSAhPT0gJzAnOyAvL0lFNuS4i+S4unRydWUsIOWFtuS7luS4umZhbHNlXG5cbiAgICAvKuWIpOWumuaYr+WQpuaYr+S4gOS4quactOe0oOeahGphdmFzY3JpcHTlr7nosaHvvIhPYmplY3TvvInvvIzkuI3mmK9ET03lr7nosaHvvIzkuI3mmK9CT03lr7nosaHvvIzkuI3mmK/oh6rlrprkuYnnsbvnmoTlrp7kvosqL1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gaXNQbGFpbk9iamVjdENvbXBhY3Qob2JqLCBrZXkpIHtcbiAgICAgICAgaWYgKCFvYmogfHwgYXZhbG9uLnR5cGUob2JqKSAhPT0gJ29iamVjdCcgfHwgb2JqLm5vZGVUeXBlIHx8IGF2YWxvbi5pc1dpbmRvdyhvYmopKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vSUXlhoXnva7lr7nosaHmsqHmnIljb25zdHJ1Y3RvclxuICAgICAgICAgICAgaWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhb2hhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJykgJiYgIW9oYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGlzVkJzY3JpcHQgPSBvYmouJHZidGhpcztcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy9JRTggOeS8muWcqOi/memHjOaKm+mUmVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAoZW51bWVyYXRlQlVHKSB7XG4gICAgICAgICAgICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2hhc093bi5jYWxsKG9iaiwga2V5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKGtleSBpbiBvYmopIHt9XG4gICAgICAgIHJldHVybiBrZXkgPT09IHVuZGVmaW5lZCQxIHx8IG9oYXNPd24uY2FsbChvYmosIGtleSk7XG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBpc1BsYWluT2JqZWN0TW9kZXJuKG9iaikge1xuICAgICAgICAvLyDnroDljZXnmoQgdHlwZW9mIG9iaiA9PT0gJ29iamVjdCfmo4DmtYvvvIzkvJroh7Tkvb/nlKhpc1BsYWluT2JqZWN0KHdpbmRvdynlnKhvcGVyYeS4i+mAmuS4jei/h1xuICAgICAgICByZXR1cm4gaW5zcGVjdC5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nICYmIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopID09PSBPYmplY3QucHJvdG90eXBlO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5pc1BsYWluT2JqZWN0ID0gL1xcW25hdGl2ZSBjb2RlXFxdLy50ZXN0KE9iamVjdC5nZXRQcm90b3R5cGVPZikgPyBpc1BsYWluT2JqZWN0TW9kZXJuIDogaXNQbGFpbk9iamVjdENvbXBhY3Q7XG5cbiAgICB2YXIgcmNhbk1peCA9IC9vYmplY3R8ZnVuY3Rpb24vO1xuXG4gICAgLy/kuI5qUXVlcnkuZXh0ZW5k5pa55rOV77yM5Y+v55So5LqO5rWF5ou36LSd77yM5rex5ou36LSdXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24ubWl4ID0gYXZhbG9uLmZuLm1peCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICAgICAgaXNEZWVwID0gZmFsc2UsXG4gICAgICAgICAgICBpID0gMCxcbiAgICAgICAgICAgIGFycmF5ID0gW107XG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gPT09IHRydWUpIHtcbiAgICAgICAgICAgIGlzRGVlcCA9IHRydWU7XG4gICAgICAgICAgICBpID0gMTtcbiAgICAgICAgfVxuICAgICAgICAvL+WwhuaJgOaciemdnuepuuWvueixoeWPmOaIkOepuuWvueixoVxuICAgICAgICBmb3IgKDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgdmFyIGVsID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZWwgPSBlbCAmJiByY2FuTWl4LnRlc3QodHlwZW9mIGVsKSA/IGVsIDoge307XG4gICAgICAgICAgICBhcnJheS5wdXNoKGVsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXJyYXkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBhcnJheS51bnNoaWZ0KHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbm5lckV4dGVuZChpc0RlZXAsIGFycmF5KTtcbiAgICB9O1xuICAgIHZhciB1bmRlZmluZWQkMTtcblxuICAgIGZ1bmN0aW9uIGlubmVyRXh0ZW5kKGlzRGVlcCwgYXJyYXkpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGFycmF5WzBdLFxuICAgICAgICAgICAgY29weUlzQXJyYXksXG4gICAgICAgICAgICBjbG9uZSxcbiAgICAgICAgICAgIG5hbWU7XG4gICAgICAgIGZvciAodmFyIGkgPSAxLCBsZW5ndGggPSBhcnJheS5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy/lj6rlpITnkIbpnZ7nqbrlj4LmlbBcbiAgICAgICAgICAgIHZhciBvcHRpb25zID0gYXJyYXlbaV07XG4gICAgICAgICAgICB2YXIgbm9DbG9uZUFycmF5TWV0aG9kID0gQXJyYXkuaXNBcnJheShvcHRpb25zKTtcbiAgICAgICAgICAgIGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vQ2xvbmVBcnJheU1ldGhvZCAmJiAhb3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNyYyA9IHRhcmdldFtuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvcHkgPSBvcHRpb25zW25hbWVdOyAvL+W9k29wdGlvbnPkuLpWQlPlr7nosaHml7bmiqXplJlcbiAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOmYsuatoueOr+W8leeUqFxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQgPT09IGNvcHkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChpc0RlZXAgJiYgY29weSAmJiAoYXZhbG9uLmlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gQXJyYXkuaXNBcnJheShjb3B5KSkpKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvcHlJc0FycmF5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3B5SXNBcnJheSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUgPSBzcmMgJiYgQXJyYXkuaXNBcnJheShzcmMpID8gc3JjIDogW107XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZSA9IHNyYyAmJiBhdmFsb24uaXNQbGFpbk9iamVjdChzcmMpID8gc3JjIDoge307XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0gPSBpbm5lckV4dGVuZChpc0RlZXAsIFtjbG9uZSwgY29weV0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29weSAhPT0gdW5kZWZpbmVkJDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0W25hbWVdID0gY29weTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICB2YXIgcmFycmF5bGlrZSA9IC8oQXJyYXl8TGlzdHxDb2xsZWN0aW9ufE1hcHxBcmd1bWVudHMpXFxdJC87XG4gICAgLyrliKTlrprmmK/lkKbnsbvmlbDnu4TvvIzlpoLoioLngrnpm4blkIjvvIznuq/mlbDnu4TvvIxhcmd1bWVudHPkuI7mi6XmnInpnZ7otJ/mlbTmlbDnmoRsZW5ndGjlsZ7mgKfnmoTnuq9KU+WvueixoSovXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBpc0FycmF5TGlrZShvYmopIHtcbiAgICAgICAgaWYgKCFvYmopIHJldHVybiBmYWxzZTtcbiAgICAgICAgdmFyIG4gPSBvYmoubGVuZ3RoO1xuICAgICAgICBpZiAobiA9PT0gbiA+Pj4gMCkge1xuICAgICAgICAgICAgLy/mo4DmtYtsZW5ndGjlsZ7mgKfmmK/lkKbkuLrpnZ7otJ/mlbTmlbBcbiAgICAgICAgICAgIHZhciB0eXBlID0gaW5zcGVjdC5jYWxsKG9iaik7XG4gICAgICAgICAgICBpZiAocmFycmF5bGlrZS50ZXN0KHR5cGUpKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0eXBlICE9PSAnW29iamVjdCBPYmplY3RdJykgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoe30ucHJvcGVydHlJc0VudW1lcmFibGUuY2FsbChvYmosICdsZW5ndGgnKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzmmK/ljp/nlJ/lr7nosaFcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJmdW5jdGlvbi50ZXN0KG9iai5pdGVtIHx8IG9iai5jYWxsZWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvL0lF55qETm9kZUxpc3Tnm7TmjqXmipvplJlcbiAgICAgICAgICAgICAgICByZXR1cm4gIW9iai53aW5kb3c7IC8vSUU2LTggd2luZG93XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGF2YWxvbi5lYWNoID0gZnVuY3Rpb24gKG9iaiwgZm4pIHtcbiAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgLy/mjpLpmaRudWxsLCB1bmRlZmluZWRcbiAgICAgICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbiA9IG9iai5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZuKGksIG9ialtpXSkgPT09IGZhbHNlKSBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShpKSAmJiBmbihpLCBvYmpbaV0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3ZWxjb21lSW50cm8gPSBbXCIlY2F2YWxvbi5qcyAlY1wiICsgYXZhbG9uLnZlcnNpb24gKyBcIiAlY2luIGRlYnVnIG1vZGUsICVjbW9yZS4uLlwiLCBcImNvbG9yOiByZ2IoMTE0LCAxNTcsIDUyKTsgZm9udC13ZWlnaHQ6IG5vcm1hbDtcIiwgXCJjb2xvcjogcmdiKDg1LCA4NSwgODUpOyBmb250LXdlaWdodDogbm9ybWFsO1wiLCBcImNvbG9yOiByZ2IoODUsIDg1LCA4NSk7IGZvbnQtd2VpZ2h0OiBub3JtYWw7XCIsIFwiY29sb3I6IHJnYig4MiwgMTQwLCAyMjQpOyBmb250LXdlaWdodDogbm9ybWFsOyB0ZXh0LWRlY29yYXRpb246IHVuZGVybGluZTtcIl07XG4gICAgICAgIHZhciB3ZWxjb21lTWVzc2FnZSA9IFwiWW91J3JlIHJ1bm5pbmcgYXZhbG9uIGluIGRlYnVnIG1vZGUgLSBtZXNzYWdlcyB3aWxsIGJlIHByaW50ZWQgdG8gdGhlIGNvbnNvbGUgdG8gaGVscCB5b3UgZml4IHByb2JsZW1zIGFuZCBvcHRpbWlzZSB5b3VyIGFwcGxpY2F0aW9uLlxcblxcblwiICsgJ1RvIGRpc2FibGUgZGVidWcgbW9kZSwgYWRkIHRoaXMgbGluZSBhdCB0aGUgc3RhcnQgb2YgeW91ciBhcHA6XFxuXFxuICBhdmFsb24uY29uZmlnKHtkZWJ1ZzogZmFsc2V9KTtcXG5cXG4nICsgJ0RlYnVnIG1vZGUgYWxzbyBhdXRvbWF0aWNhbGx5IHNodXQgZG93biBhbWljYWJseSB3aGVuIHlvdXIgYXBwIGlzIG1pbmlmaWVkLlxcblxcbicgKyBcIkdldCBoZWxwIGFuZCBzdXBwb3J0OlxcbiAgaHR0cHM6Ly9zZWdtZW50ZmF1bHQuY29tL3QvYXZhbG9uXFxuICBodHRwOi8vYXZhbG9uanMuY29kaW5nLm1lL1xcbiAgaHR0cDovL3d3dy5iYWlkdS14LmNvbS8/cT1hdmFsb25qc1xcbiAgaHR0cDovL3d3dy5hdmFsb24ub3JnLmNuL1xcblxcbkZvdW5kIGEgYnVnPyBSYWlzZSBhbiBpc3N1ZTpcXG4gIGh0dHBzOi8vZ2l0aHViLmNvbS9SdWJ5TG91dnJlL2F2YWxvbi9pc3N1ZXNcXG5cXG5cIjtcbiAgICAgICAgaWYgKHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdmFyIGNvbiA9IGNvbnNvbGU7XG4gICAgICAgICAgICB2YXIgbWV0aG9kID0gY29uLmdyb3VwQ29sbGFwc2VkIHx8IGNvbi5sb2c7XG4gICAgICAgICAgICBGdW5jdGlvbi5hcHBseS5jYWxsKG1ldGhvZCwgY29uLCB3ZWxjb21lSW50cm8pO1xuICAgICAgICAgICAgY29uLmxvZyh3ZWxjb21lTWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAobWV0aG9kICE9PSBjb25zb2xlLmxvZykge1xuICAgICAgICAgICAgICAgIGNvbi5ncm91cEVuZCh3ZWxjb21lSW50cm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSkoKTtcblxuICAgIGZ1bmN0aW9uIHRvRml4ZWRGaXgobiwgcHJlYykge1xuICAgICAgICB2YXIgayA9IE1hdGgucG93KDEwLCBwcmVjKTtcbiAgICAgICAgcmV0dXJuICcnICsgKE1hdGgucm91bmQobiAqIGspIC8gaykudG9GaXhlZChwcmVjKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbnVtYmVyRmlsdGVyKG51bWJlciwgZGVjaW1hbHMsIHBvaW50LCB0aG91c2FuZHMpIHtcbiAgICAgICAgLy9odHRwczovL2dpdGh1Yi5jb20vdHhncnVwcGkvbnVtYmVyX2Zvcm1hdFxuICAgICAgICAvL2Zvcm0gaHR0cDovL3BocGpzLm9yZy9mdW5jdGlvbnMvbnVtYmVyX2Zvcm1hdC9cbiAgICAgICAgLy9udW1iZXIg5b+F6ZyA77yM6KaB5qC85byP5YyW55qE5pWw5a2XXG4gICAgICAgIC8vZGVjaW1hbHMg5Y+v6YCJ77yM6KeE5a6a5aSa5bCR5Liq5bCP5pWw5L2N44CCXG4gICAgICAgIC8vcG9pbnQg5Y+v6YCJ77yM6KeE5a6a55So5L2c5bCP5pWw54K555qE5a2X56ym5Liy77yI6buY6K6k5Li6IC4g77yJ44CCXG4gICAgICAgIC8vdGhvdXNhbmRzIOWPr+mAie+8jOinhOWumueUqOS9nOWNg+S9jeWIhumalOespueahOWtl+espuS4su+8iOm7mOiupOS4uiAsIO+8ie+8jOWmguaenOiuvue9ruS6huivpeWPguaVsO+8jOmCo+S5iOaJgOacieWFtuS7luWPguaVsOmDveaYr+W/hemcgOeahOOAglxuICAgICAgICBudW1iZXIgPSAobnVtYmVyICsgJycpLnJlcGxhY2UoL1teMC05K1xcLUVlLl0vZywgJycpO1xuICAgICAgICB2YXIgbiA9ICFpc0Zpbml0ZSgrbnVtYmVyKSA/IDAgOiArbnVtYmVyLFxuICAgICAgICAgICAgcHJlYyA9ICFpc0Zpbml0ZSgrZGVjaW1hbHMpID8gMyA6IE1hdGguYWJzKGRlY2ltYWxzKSxcbiAgICAgICAgICAgIHNlcCA9IHR5cGVvZiB0aG91c2FuZHMgPT09ICdzdHJpbmcnID8gdGhvdXNhbmRzIDogXCIsXCIsXG4gICAgICAgICAgICBkZWMgPSBwb2ludCB8fCBcIi5cIixcbiAgICAgICAgICAgIHMgPSAnJztcblxuICAgICAgICAvLyBGaXggZm9yIElFIHBhcnNlRmxvYXQoMC41NSkudG9GaXhlZCgwKSA9IDA7XG4gICAgICAgIHMgPSAocHJlYyA/IHRvRml4ZWRGaXgobiwgcHJlYykgOiAnJyArIE1hdGgucm91bmQobikpLnNwbGl0KCcuJyk7XG4gICAgICAgIGlmIChzWzBdLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIHNbMF0gPSBzWzBdLnJlcGxhY2UoL1xcQig/PSg/OlxcZHszfSkrKD8hXFxkKSkvZywgc2VwKTtcbiAgICAgICAgfVxuICAgICAgICAvKiogLy/lpb3lg4/msqHmnInnlKhcbiAgICAgICAgIHZhciBzMSA9IHNbMV0gfHwgJydcbiAgICAgICAgXG4gICAgICAgICAgaWYgKHMxLmxlbmd0aCA8IHByZWMpIHtcbiAgICAgICAgICAgICAgICAgIHMxICs9IG5ldyBBcnJheShwcmVjIC0gc1sxXS5sZW5ndGggKyAxKS5qb2luKCcwJylcbiAgICAgICAgICAgICAgICAgIHNbMV0gPSBzMVxuICAgICAgICAgIH1cbiAgICAgICAgICAqKi9cbiAgICAgICAgcmV0dXJuIHMuam9pbihkZWMpO1xuICAgIH1cblxuICAgIHZhciByc2NyaXB0cyA9IC88c2NyaXB0W14+XSo+KFtcXFNcXHNdKj8pPFxcL3NjcmlwdFxccyo+L2dpbTtcbiAgICB2YXIgcm9uID0gL1xccysob25bXj1cXHNdKykoPzo9KFwiW15cIl0qXCJ8J1teJ10qJ3xbXlxccz5dKykpPy9nO1xuICAgIHZhciByb3BlbiA9IC88XFx3K1xcYig/OihbXCInXSlbXlwiXSo/KFxcMSl8W14+XSkqPi9pZztcbiAgICB2YXIgcnNhbml0aXplID0ge1xuICAgICAgICBhOiAvXFxiKGhyZWYpXFw9KFwiamF2YXNjcmlwdFteXCJdKlwifCdqYXZhc2NyaXB0W14nXSonKS9pZyxcbiAgICAgICAgaW1nOiAvXFxiKHNyYylcXD0oXCJqYXZhc2NyaXB0W15cIl0qXCJ8J2phdmFzY3JpcHRbXiddKicpL2lnLFxuICAgICAgICBmb3JtOiAvXFxiKGFjdGlvbilcXD0oXCJqYXZhc2NyaXB0W15cIl0qXCJ8J2phdmFzY3JpcHRbXiddKicpL2lnXG4gICAgfTtcblxuICAgIC8vaHR0cHM6Ly93d3cub3dhc3Aub3JnL2luZGV4LnBocC9YU1NfRmlsdGVyX0V2YXNpb25fQ2hlYXRfU2hlZXRcbiAgICAvLyAgICA8YSBocmVmPVwiamF2YXNjJk5ld0xpbmU7cmlwdCZjb2xvbjthbGVydCgnWFNTJylcIj5jaHJvbWU8L2E+IFxuICAgIC8vICAgIDxhIGhyZWY9XCJkYXRhOnRleHQvaHRtbDtiYXNlNjQsIFBHbHRaeUJ6Y21NOWVDQnZibVZ5Y205eVBXRnNaWEowS0RFcFBnPT1cIj5jaHJvbWU8L2E+XG4gICAgLy8gICAgPGEgaHJlZj1cImphdlx0YXNjcmlwdDphbGVydCgnWFNTJyk7XCI+SUU2N2Nocm9tZTwvYT5cbiAgICAvLyAgICA8YSBocmVmPVwiamF2JiN4MDk7YXNjcmlwdDphbGVydCgnWFNTJyk7XCI+SUU2N2Nocm9tZTwvYT5cbiAgICAvLyAgICA8YSBocmVmPVwiamF2JiN4MEE7YXNjcmlwdDphbGVydCgnWFNTJyk7XCI+SUU2N2Nocm9tZTwvYT5cbiAgICBmdW5jdGlvbiBzYW5pdGl6ZUZpbHRlcihzdHIpIHtcbiAgICAgICAgcmV0dXJuIHN0ci5yZXBsYWNlKHJzY3JpcHRzLCBcIlwiKS5yZXBsYWNlKHJvcGVuLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gYS50b0xvd2VyQ2FzZSgpLm1hdGNoKC88KFxcdyspXFxzLyk7XG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAvL+WkhOeQhmHmoIfnrb7nmoRocmVm5bGe5oCn77yMaW1n5qCH562+55qEc3Jj5bGe5oCn77yMZm9ybeagh+etvueahGFjdGlvbuWxnuaAp1xuICAgICAgICAgICAgICAgIHZhciByZWcgPSByc2FuaXRpemVbbWF0Y2hbMV1dO1xuICAgICAgICAgICAgICAgIGlmIChyZWcpIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IGEucmVwbGFjZShyZWcsIGZ1bmN0aW9uIChzLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHF1b3RlID0gdmFsdWUuY2hhckF0KDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5hbWUgKyBcIj1cIiArIHF1b3RlICsgXCJqYXZhc2NyaXB0OnZvaWQoMClcIiArIHF1b3RlOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGEucmVwbGFjZShyb24sIFwiIFwiKS5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKTsgLy/np7vpmaRvblhYWOS6i+S7tlxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAneXl5eSc6IDQgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgeWVhciAoZS5nLiBBRCAxID0+IDAwMDEsIEFEIDIwMTAgPT4gMjAxMClcbiAgICAgJ3l5JzogMiBkaWdpdCByZXByZXNlbnRhdGlvbiBvZiB5ZWFyLCBwYWRkZWQgKDAwLTk5KS4gKGUuZy4gQUQgMjAwMSA9PiAwMSwgQUQgMjAxMCA9PiAxMClcbiAgICAgJ3knOiAxIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHllYXIsIGUuZy4gKEFEIDEgPT4gMSwgQUQgMTk5ID0+IDE5OSlcbiAgICAgJ01NTU0nOiBNb250aCBpbiB5ZWFyIChKYW51YXJ5LURlY2VtYmVyKVxuICAgICAnTU1NJzogTW9udGggaW4geWVhciAoSmFuLURlYylcbiAgICAgJ01NJzogTW9udGggaW4geWVhciwgcGFkZGVkICgwMS0xMilcbiAgICAgJ00nOiBNb250aCBpbiB5ZWFyICgxLTEyKVxuICAgICAnZGQnOiBEYXkgaW4gbW9udGgsIHBhZGRlZCAoMDEtMzEpXG4gICAgICdkJzogRGF5IGluIG1vbnRoICgxLTMxKVxuICAgICAnRUVFRSc6IERheSBpbiBXZWVrLChTdW5kYXktU2F0dXJkYXkpXG4gICAgICdFRUUnOiBEYXkgaW4gV2VlaywgKFN1bi1TYXQpXG4gICAgICdISCc6IEhvdXIgaW4gZGF5LCBwYWRkZWQgKDAwLTIzKVxuICAgICAnSCc6IEhvdXIgaW4gZGF5ICgwLTIzKVxuICAgICAnaGgnOiBIb3VyIGluIGFtL3BtLCBwYWRkZWQgKDAxLTEyKVxuICAgICAnaCc6IEhvdXIgaW4gYW0vcG0sICgxLTEyKVxuICAgICAnbW0nOiBNaW51dGUgaW4gaG91ciwgcGFkZGVkICgwMC01OSlcbiAgICAgJ20nOiBNaW51dGUgaW4gaG91ciAoMC01OSlcbiAgICAgJ3NzJzogU2Vjb25kIGluIG1pbnV0ZSwgcGFkZGVkICgwMC01OSlcbiAgICAgJ3MnOiBTZWNvbmQgaW4gbWludXRlICgwLTU5KVxuICAgICAnYSc6IGFtL3BtIG1hcmtlclxuICAgICAnWic6IDQgZGlnaXQgKCtzaWduKSByZXByZXNlbnRhdGlvbiBvZiB0aGUgdGltZXpvbmUgb2Zmc2V0ICgtMTIwMC0rMTIwMClcbiAgICAgZm9ybWF0IHN0cmluZyBjYW4gYWxzbyBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZyBwcmVkZWZpbmVkIGxvY2FsaXphYmxlIGZvcm1hdHM6XG4gICAgIFxuICAgICAnbWVkaXVtJzogZXF1aXZhbGVudCB0byAnTU1NIGQsIHkgaDptbTpzcyBhJyBmb3IgZW5fVVMgbG9jYWxlIChlLmcuIFNlcCAzLCAyMDEwIDEyOjA1OjA4IHBtKVxuICAgICAnc2hvcnQnOiBlcXVpdmFsZW50IHRvICdNL2QveXkgaDptbSBhJyBmb3IgZW5fVVMgbG9jYWxlIChlLmcuIDkvMy8xMCAxMjowNSBwbSlcbiAgICAgJ2Z1bGxEYXRlJzogZXF1aXZhbGVudCB0byAnRUVFRSwgTU1NTSBkLHknIGZvciBlbl9VUyBsb2NhbGUgKGUuZy4gRnJpZGF5LCBTZXB0ZW1iZXIgMywgMjAxMClcbiAgICAgJ2xvbmdEYXRlJzogZXF1aXZhbGVudCB0byAnTU1NTSBkLCB5JyBmb3IgZW5fVVMgbG9jYWxlIChlLmcuIFNlcHRlbWJlciAzLCAyMDEwXG4gICAgICdtZWRpdW1EYXRlJzogZXF1aXZhbGVudCB0byAnTU1NIGQsIHknIGZvciBlbl9VUyBsb2NhbGUgKGUuZy4gU2VwIDMsIDIwMTApXG4gICAgICdzaG9ydERhdGUnOiBlcXVpdmFsZW50IHRvICdNL2QveXknIGZvciBlbl9VUyBsb2NhbGUgKGUuZy4gOS8zLzEwKVxuICAgICAnbWVkaXVtVGltZSc6IGVxdWl2YWxlbnQgdG8gJ2g6bW06c3MgYScgZm9yIGVuX1VTIGxvY2FsZSAoZS5nLiAxMjowNTowOCBwbSlcbiAgICAgJ3Nob3J0VGltZSc6IGVxdWl2YWxlbnQgdG8gJ2g6bW0gYScgZm9yIGVuX1VTIGxvY2FsZSAoZS5nLiAxMjowNSBwbSlcbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIHRvSW50KHN0cikge1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQoc3RyLCAxMCkgfHwgMDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYWROdW1iZXIobnVtLCBkaWdpdHMsIHRyaW0pIHtcbiAgICAgICAgdmFyIG5lZyA9ICcnO1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgbmVnID0gJy0nO1xuICAgICAgICAgICAgbnVtID0gLW51bTtcbiAgICAgICAgfVxuICAgICAgICBudW0gPSAnJyArIG51bTtcbiAgICAgICAgd2hpbGUgKG51bS5sZW5ndGggPCBkaWdpdHMpIHtcbiAgICAgICAgICAgIG51bSA9ICcwJyArIG51bTtcbiAgICAgICAgfWlmICh0cmltKSBudW0gPSBudW0uc3Vic3RyKG51bS5sZW5ndGggLSBkaWdpdHMpO1xuICAgICAgICByZXR1cm4gbmVnICsgbnVtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRhdGVHZXR0ZXIobmFtZSwgc2l6ZSwgb2Zmc2V0LCB0cmltKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZGF0ZSkge1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gZGF0ZVtcImdldFwiICsgbmFtZV0oKTtcbiAgICAgICAgICAgIGlmIChvZmZzZXQgPiAwIHx8IHZhbHVlID4gLW9mZnNldCkgdmFsdWUgKz0gb2Zmc2V0O1xuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAwICYmIG9mZnNldCA9PT0gLTEyKSB7XG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgICAgICAgICAgICAgIHZhbHVlID0gMTI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcGFkTnVtYmVyKHZhbHVlLCBzaXplLCB0cmltKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkYXRlU3RyR2V0dGVyKG5hbWUsIHNob3J0Rm9ybSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRhdGUsIGZvcm1hdHMpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRhdGVbXCJnZXRcIiArIG5hbWVdKCk7XG4gICAgICAgICAgICB2YXIgZ2V0ID0gKHNob3J0Rm9ybSA/IFwiU0hPUlRcIiArIG5hbWUgOiBuYW1lKS50b1VwcGVyQ2FzZSgpO1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdHNbZ2V0XVt2YWx1ZV07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGltZVpvbmVHZXR0ZXIoZGF0ZSkge1xuICAgICAgICB2YXIgem9uZSA9IC0xICogZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICAgICAgICB2YXIgcGFkZGVkWm9uZSA9IHpvbmUgPj0gMCA/IFwiK1wiIDogXCJcIjtcbiAgICAgICAgcGFkZGVkWm9uZSArPSBwYWROdW1iZXIoTWF0aFt6b25lID4gMCA/IFwiZmxvb3JcIiA6IFwiY2VpbFwiXSh6b25lIC8gNjApLCAyKSArIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyKTtcbiAgICAgICAgcmV0dXJuIHBhZGRlZFpvbmU7XG4gICAgfVxuICAgIC8v5Y+W5b6X5LiK5Y2I5LiL5Y2IXG4gICAgZnVuY3Rpb24gYW1wbUdldHRlcihkYXRlLCBmb3JtYXRzKSB7XG4gICAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCkgPCAxMiA/IGZvcm1hdHMuQU1QTVNbMF0gOiBmb3JtYXRzLkFNUE1TWzFdO1xuICAgIH1cbiAgICB2YXIgREFURV9GT1JNQVRTID0ge1xuICAgICAgICB5eXl5OiBkYXRlR2V0dGVyKFwiRnVsbFllYXJcIiwgNCksXG4gICAgICAgIHl5OiBkYXRlR2V0dGVyKFwiRnVsbFllYXJcIiwgMiwgMCwgdHJ1ZSksXG4gICAgICAgIHk6IGRhdGVHZXR0ZXIoXCJGdWxsWWVhclwiLCAxKSxcbiAgICAgICAgTU1NTTogZGF0ZVN0ckdldHRlcihcIk1vbnRoXCIpLFxuICAgICAgICBNTU06IGRhdGVTdHJHZXR0ZXIoXCJNb250aFwiLCB0cnVlKSxcbiAgICAgICAgTU06IGRhdGVHZXR0ZXIoXCJNb250aFwiLCAyLCAxKSxcbiAgICAgICAgTTogZGF0ZUdldHRlcihcIk1vbnRoXCIsIDEsIDEpLFxuICAgICAgICBkZDogZGF0ZUdldHRlcihcIkRhdGVcIiwgMiksXG4gICAgICAgIGQ6IGRhdGVHZXR0ZXIoXCJEYXRlXCIsIDEpLFxuICAgICAgICBISDogZGF0ZUdldHRlcihcIkhvdXJzXCIsIDIpLFxuICAgICAgICBIOiBkYXRlR2V0dGVyKFwiSG91cnNcIiwgMSksXG4gICAgICAgIGhoOiBkYXRlR2V0dGVyKFwiSG91cnNcIiwgMiwgLTEyKSxcbiAgICAgICAgaDogZGF0ZUdldHRlcihcIkhvdXJzXCIsIDEsIC0xMiksXG4gICAgICAgIG1tOiBkYXRlR2V0dGVyKFwiTWludXRlc1wiLCAyKSxcbiAgICAgICAgbTogZGF0ZUdldHRlcihcIk1pbnV0ZXNcIiwgMSksXG4gICAgICAgIHNzOiBkYXRlR2V0dGVyKFwiU2Vjb25kc1wiLCAyKSxcbiAgICAgICAgczogZGF0ZUdldHRlcihcIlNlY29uZHNcIiwgMSksXG4gICAgICAgIHNzczogZGF0ZUdldHRlcihcIk1pbGxpc2Vjb25kc1wiLCAzKSxcbiAgICAgICAgRUVFRTogZGF0ZVN0ckdldHRlcihcIkRheVwiKSxcbiAgICAgICAgRUVFOiBkYXRlU3RyR2V0dGVyKFwiRGF5XCIsIHRydWUpLFxuICAgICAgICBhOiBhbXBtR2V0dGVyLFxuICAgICAgICBaOiB0aW1lWm9uZUdldHRlclxuICAgIH07XG4gICAgdmFyIHJkYXRlRm9ybWF0ID0gLygoPzpbXnlNZEhobXNhWkUnXSspfCg/OicoPzpbXiddfCcnKSonKXwoPzpFK3x5K3xNK3xkK3xIK3xoK3xtK3xzK3xhfFopKSguKikvO1xuICAgIHZhciByYXNwbmV0anNvbiA9IC9eXFwvRGF0ZVxcKChcXGQrKVxcKVxcLyQvO1xuICAgIGZ1bmN0aW9uIGRhdGVGaWx0ZXIoZGF0ZSwgZm9ybWF0KSB7XG4gICAgICAgIHZhciBsb2NhdGUgPSBkYXRlRmlsdGVyLmxvY2F0ZSxcbiAgICAgICAgICAgIHRleHQgPSBcIlwiLFxuICAgICAgICAgICAgcGFydHMgPSBbXSxcbiAgICAgICAgICAgIGZuLFxuICAgICAgICAgICAgbWF0Y2g7XG4gICAgICAgIGZvcm1hdCA9IGZvcm1hdCB8fCBcIm1lZGl1bURhdGVcIjtcbiAgICAgICAgZm9ybWF0ID0gbG9jYXRlW2Zvcm1hdF0gfHwgZm9ybWF0O1xuICAgICAgICBpZiAodHlwZW9mIGRhdGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGlmICgvXlxcZCskLy50ZXN0KGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IHRvSW50KGRhdGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChyYXNwbmV0anNvbi50ZXN0KGRhdGUpKSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9ICtSZWdFeHAuJDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB0cmltRGF0ZSA9IGRhdGUudHJpbSgpO1xuICAgICAgICAgICAgICAgIHZhciBkYXRlQXJyYXkgPSBbMCwgMCwgMCwgMCwgMCwgMCwgMF07XG4gICAgICAgICAgICAgICAgdmFyIG9EYXRlID0gbmV3IERhdGUoMCk7XG4gICAgICAgICAgICAgICAgLy/lj5blvpflubTmnIjml6VcbiAgICAgICAgICAgICAgICB0cmltRGF0ZSA9IHRyaW1EYXRlLnJlcGxhY2UoL14oXFxkKylcXEQoXFxkKylcXEQoXFxkKykvLCBmdW5jdGlvbiAoXywgYSwgYiwgYykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJyYXkgPSBjLmxlbmd0aCA9PT0gNCA/IFtjLCBhLCBiXSA6IFthLCBiLCBjXTtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFycmF5WzBdID0gdG9JbnQoYXJyYXlbMF0pOyAvL+W5tFxuICAgICAgICAgICAgICAgICAgICBkYXRlQXJyYXlbMV0gPSB0b0ludChhcnJheVsxXSkgLSAxOyAvL+aciFxuICAgICAgICAgICAgICAgICAgICBkYXRlQXJyYXlbMl0gPSB0b0ludChhcnJheVsyXSk7IC8v5pelXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZhciBkYXRlU2V0dGVyID0gb0RhdGUuc2V0RnVsbFllYXI7XG4gICAgICAgICAgICAgICAgdmFyIHRpbWVTZXR0ZXIgPSBvRGF0ZS5zZXRIb3VycztcbiAgICAgICAgICAgICAgICB0cmltRGF0ZSA9IHRyaW1EYXRlLnJlcGxhY2UoL1tUXFxzXShcXGQrKTooXFxkKyk6PyhcXGQrKT9cXC4/KFxcZCk/LywgZnVuY3Rpb24gKF8sIGEsIGIsIGMsIGQpIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0ZUFycmF5WzNdID0gdG9JbnQoYSk7IC8v5bCP5pe2XG4gICAgICAgICAgICAgICAgICAgIGRhdGVBcnJheVs0XSA9IHRvSW50KGIpOyAvL+WIhumSn1xuICAgICAgICAgICAgICAgICAgICBkYXRlQXJyYXlbNV0gPSB0b0ludChjKTsgLy/np5JcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8v5q+r56eSXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRlQXJyYXlbNl0gPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoXCIwLlwiICsgZCkgKiAxMDAwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgdHpIb3VyID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgdHpNaW4gPSAwO1xuICAgICAgICAgICAgICAgIHRyaW1EYXRlID0gdHJpbURhdGUucmVwbGFjZSgvWnwoWystXSkoXFxkXFxkKTo/KFxcZFxcZCkvLCBmdW5jdGlvbiAoeiwgc3ltYm9sLCBjLCBkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGVTZXR0ZXIgPSBvRGF0ZS5zZXRVVENGdWxsWWVhcjtcbiAgICAgICAgICAgICAgICAgICAgdGltZVNldHRlciA9IG9EYXRlLnNldFVUQ0hvdXJzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ekhvdXIgPSB0b0ludChzeW1ib2wgKyBjKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR6TWluID0gdG9JbnQoc3ltYm9sICsgZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgZGF0ZUFycmF5WzNdIC09IHR6SG91cjtcbiAgICAgICAgICAgICAgICBkYXRlQXJyYXlbNF0gLT0gdHpNaW47XG4gICAgICAgICAgICAgICAgZGF0ZVNldHRlci5hcHBseShvRGF0ZSwgZGF0ZUFycmF5LnNsaWNlKDAsIDMpKTtcbiAgICAgICAgICAgICAgICB0aW1lU2V0dGVyLmFwcGx5KG9EYXRlLCBkYXRlQXJyYXkuc2xpY2UoMykpO1xuICAgICAgICAgICAgICAgIGRhdGUgPSBvRGF0ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGRhdGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBkYXRlID0gbmV3IERhdGUoZGF0ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoZm9ybWF0KSB7XG4gICAgICAgICAgICBtYXRjaCA9IHJkYXRlRm9ybWF0LmV4ZWMoZm9ybWF0KTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBwYXJ0cyA9IHBhcnRzLmNvbmNhdChtYXRjaC5zbGljZSgxKSk7XG4gICAgICAgICAgICAgICAgZm9ybWF0ID0gcGFydHMucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhcnRzLnB1c2goZm9ybWF0KTtcbiAgICAgICAgICAgICAgICBmb3JtYXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHBhcnRzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBmbiA9IERBVEVfRk9STUFUU1t2YWx1ZV07XG4gICAgICAgICAgICB0ZXh0ICs9IGZuID8gZm4oZGF0ZSwgbG9jYXRlKSA6IHZhbHVlLnJlcGxhY2UoLyheJ3wnJCkvZywgXCJcIikucmVwbGFjZSgvJycvZywgXCInXCIpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgdmFyIGxvY2F0ZSA9IHtcbiAgICAgICAgQU1QTVM6IHtcbiAgICAgICAgICAgIDA6ICfkuIrljYgnLFxuICAgICAgICAgICAgMTogJ+S4i+WNiCdcbiAgICAgICAgfSxcbiAgICAgICAgREFZOiB7XG4gICAgICAgICAgICAwOiAn5pif5pyf5pelJyxcbiAgICAgICAgICAgIDE6ICfmmJ/mnJ/kuIAnLFxuICAgICAgICAgICAgMjogJ+aYn+acn+S6jCcsXG4gICAgICAgICAgICAzOiAn5pif5pyf5LiJJyxcbiAgICAgICAgICAgIDQ6ICfmmJ/mnJ/lm5snLFxuICAgICAgICAgICAgNTogJ+aYn+acn+S6lCcsXG4gICAgICAgICAgICA2OiAn5pif5pyf5YWtJ1xuICAgICAgICB9LFxuICAgICAgICBNT05USDoge1xuICAgICAgICAgICAgMDogJzHmnIgnLFxuICAgICAgICAgICAgMTogJzLmnIgnLFxuICAgICAgICAgICAgMjogJzPmnIgnLFxuICAgICAgICAgICAgMzogJzTmnIgnLFxuICAgICAgICAgICAgNDogJzXmnIgnLFxuICAgICAgICAgICAgNTogJzbmnIgnLFxuICAgICAgICAgICAgNjogJzfmnIgnLFxuICAgICAgICAgICAgNzogJzjmnIgnLFxuICAgICAgICAgICAgODogJznmnIgnLFxuICAgICAgICAgICAgOTogJzEw5pyIJyxcbiAgICAgICAgICAgIDEwOiAnMTHmnIgnLFxuICAgICAgICAgICAgMTE6ICcxMuaciCdcbiAgICAgICAgfSxcbiAgICAgICAgU0hPUlREQVk6IHtcbiAgICAgICAgICAgICcwJzogJ+WRqOaXpScsXG4gICAgICAgICAgICAnMSc6ICflkajkuIAnLFxuICAgICAgICAgICAgJzInOiAn5ZGo5LqMJyxcbiAgICAgICAgICAgICczJzogJ+WRqOS4iScsXG4gICAgICAgICAgICAnNCc6ICflkajlm5snLFxuICAgICAgICAgICAgJzUnOiAn5ZGo5LqUJyxcbiAgICAgICAgICAgICc2JzogJ+WRqOWFrSdcbiAgICAgICAgfSxcbiAgICAgICAgZnVsbERhdGU6ICd55bm0TeaciGTml6VFRUVFJyxcbiAgICAgICAgbG9uZ0RhdGU6ICd55bm0TeaciGTml6UnLFxuICAgICAgICBtZWRpdW06ICd5eXl5LU0tZCBIOm1tOnNzJyxcbiAgICAgICAgbWVkaXVtRGF0ZTogJ3l5eXktTS1kJyxcbiAgICAgICAgbWVkaXVtVGltZTogJ0g6bW06c3MnLFxuICAgICAgICAnc2hvcnQnOiAneXktTS1kIGFoOm1tJyxcbiAgICAgICAgc2hvcnREYXRlOiAneXktTS1kJyxcbiAgICAgICAgc2hvcnRUaW1lOiAnYWg6bW0nXG4gICAgfTtcbiAgICBsb2NhdGUuU0hPUlRNT05USCA9IGxvY2F0ZS5NT05USDtcbiAgICBkYXRlRmlsdGVyLmxvY2F0ZSA9IGxvY2F0ZTtcblxuICAgIC8qKlxuICAgICQkc2tpcEFycmF5OuaYr+ezu+e7n+e6p+mAmueUqOeahOS4jeWPr+ebkeWQrOWxnuaAp1xuICAgICRza2lwQXJyYXk6IOaYr+W9k+WJjeWvueixoeeJueacieeahOS4jeWPr+ebkeWQrOWxnuaAp1xuICAgIFxuICAgICDkuI3lkIzngrnmmK9cbiAgICAgJCRza2lwQXJyYXnooqtoYXNPd25Qcm9wZXJ0eeWQjui/lOWbnmZhbHNlXG4gICAgICRza2lwQXJyYXnooqtoYXNPd25Qcm9wZXJ0eeWQjui/lOWbnnRydWVcbiAgICAgKi9cbiAgICB2YXIgZmFsc3k7XG4gICAgdmFyICQkc2tpcEFycmF5ID0ge1xuICAgICAgICAkaWQ6IGZhbHN5LFxuICAgICAgICAkcmVuZGVyOiBmYWxzeSxcbiAgICAgICAgJHRyYWNrOiBmYWxzeSxcbiAgICAgICAgJGVsZW1lbnQ6IGZhbHN5LFxuICAgICAgICAkY29tcHV0ZWQ6IGZhbHN5LFxuICAgICAgICAkd2F0Y2g6IGZhbHN5LFxuICAgICAgICAkZmlyZTogZmFsc3ksXG4gICAgICAgICRldmVudHM6IGZhbHN5LFxuICAgICAgICAkYWNjZXNzb3JzOiBmYWxzeSxcbiAgICAgICAgJGhhc2hjb2RlOiBmYWxzeSxcbiAgICAgICAgJG11dGF0aW9uczogZmFsc3ksXG4gICAgICAgICR2YnRoaXM6IGZhbHN5LFxuICAgICAgICAkdmJzZXR0ZXI6IGZhbHN5XG4gICAgfTtcblxuICAgIC8qXG4gICAgaHR0cHM6Ly9naXRodWIuY29tL2h1ZnloYW5nL29yZGVyQnkvYmxvYi9tYXN0ZXIvaW5kZXguanNcbiAgICAqL1xuXG4gICAgZnVuY3Rpb24gb3JkZXJCeShhcnJheSwgYnksIGRlY2VuZCkge1xuICAgICAgICB2YXIgdHlwZSA9IGF2YWxvbi50eXBlKGFycmF5KTtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdhcnJheScgJiYgdHlwZSAhPT0gJ29iamVjdCcpIHRocm93ICdvcmRlckJ55Y+q6IO95aSE55CG5a+56LGh5oiW5pWw57uEJztcbiAgICAgICAgdmFyIGNyaXRlcmlhID0gdHlwZW9mIGJ5ID09ICdzdHJpbmcnID8gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZWwgJiYgZWxbYnldO1xuICAgICAgICB9IDogdHlwZW9mIGJ5ID09PSAnZnVuY3Rpb24nID8gYnkgOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1hcHBpbmcgPSB7fTtcbiAgICAgICAgdmFyIHRlbXAgPSBbXTtcbiAgICAgICAgX19yZXBlYXQoYXJyYXksIEFycmF5LmlzQXJyYXkoYXJyYXkpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gYXJyYXlba2V5XTtcbiAgICAgICAgICAgIHZhciBrID0gY3JpdGVyaWEodmFsLCBrZXkpO1xuICAgICAgICAgICAgaWYgKGsgaW4gbWFwcGluZykge1xuICAgICAgICAgICAgICAgIG1hcHBpbmdba10ucHVzaChrZXkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtYXBwaW5nW2tdID0gW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0ZW1wLnB1c2goayk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRlbXAuc29ydCgpO1xuICAgICAgICBpZiAoZGVjZW5kIDwgMCkge1xuICAgICAgICAgICAgdGVtcC5yZXZlcnNlKCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIF9hcnJheSA9IHR5cGUgPT09ICdhcnJheSc7XG4gICAgICAgIHZhciB0YXJnZXQgPSBfYXJyYXkgPyBbXSA6IHt9O1xuICAgICAgICByZXR1cm4gcmVjb3ZlcnkodGFyZ2V0LCB0ZW1wLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgdmFyIGtleSA9IG1hcHBpbmdba10uc2hpZnQoKTtcbiAgICAgICAgICAgIGlmIChfYXJyYXkpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQucHVzaChhcnJheVtrZXldKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W2tleV0gPSBhcnJheVtrZXldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfX3JlcGVhdChhcnJheSwgaXNBcnJheSQkMSwgY2IpIHtcbiAgICAgICAgaWYgKGlzQXJyYXkkJDEpIHtcbiAgICAgICAgICAgIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKHZhbCwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICBjYihpbmRleCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJyYXkuJHRyYWNrID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgYXJyYXkuJHRyYWNrLnJlcGxhY2UoL1te4pilXSsvZywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICBjYihrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJheSkge1xuICAgICAgICAgICAgICAgIGlmIChhcnJheS5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICAgICAgICAgICAgICBjYihpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZmlsdGVyQnkoYXJyYXksIHNlYXJjaCkge1xuICAgICAgICB2YXIgdHlwZSA9IGF2YWxvbi50eXBlKGFycmF5KTtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdhcnJheScgJiYgdHlwZSAhPT0gJ29iamVjdCcpIHRocm93ICdmaWx0ZXJCeeWPquiDveWkhOeQhuWvueixoeaIluaVsOe7hCc7XG4gICAgICAgIHZhciBhcmdzID0gYXZhbG9uLnNsaWNlKGFyZ3VtZW50cywgMik7XG4gICAgICAgIHZhciBzdHlwZSA9IGF2YWxvbi50eXBlKHNlYXJjaCk7XG4gICAgICAgIGlmIChzdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgdmFyIGNyaXRlcmlhID0gc2VhcmNoO1xuICAgICAgICB9IGVsc2UgaWYgKHN0eXBlID09PSAnc3RyaW5nJyB8fCBzdHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2ggPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChhdmFsb24uZXNjYXBlUmVnRXhwKHNlYXJjaCksICdpJyk7XG4gICAgICAgICAgICAgICAgY3JpdGVyaWEgPSBmdW5jdGlvbiBjcml0ZXJpYShlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVnLnRlc3QoZWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIGlzQXJyYXkkJDEgPSB0eXBlID09PSAnYXJyYXknO1xuICAgICAgICB2YXIgdGFyZ2V0ID0gaXNBcnJheSQkMSA/IFtdIDoge307XG4gICAgICAgIF9fcmVwZWF0KGFycmF5LCBpc0FycmF5JCQxLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gYXJyYXlba2V5XTtcbiAgICAgICAgICAgIGlmIChjcml0ZXJpYS5hcHBseSh2YWwsIFt2YWwsIGluZGV4XS5jb25jYXQoYXJncykpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkkJDEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LnB1c2godmFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZWxlY3RCeShkYXRhLCBhcnJheSwgZGVmYXVsdHMpIHtcbiAgICAgICAgaWYgKGF2YWxvbi5pc09iamVjdChkYXRhKSAmJiAhQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IFtdO1xuICAgICAgICAgICAgcmV0dXJuIHJlY292ZXJ5KHRhcmdldCwgYXJyYXksIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnB1c2goZGF0YS5oYXNPd25Qcm9wZXJ0eShuYW1lKSA/IGRhdGFbbmFtZV0gOiBkZWZhdWx0cyA/IGRlZmF1bHRzW25hbWVdIDogJycpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxpbWl0QnkoaW5wdXQsIGxpbWl0LCBiZWdpbikge1xuICAgICAgICB2YXIgdHlwZSA9IGF2YWxvbi50eXBlKGlucHV0KTtcbiAgICAgICAgaWYgKHR5cGUgIT09ICdhcnJheScgJiYgdHlwZSAhPT0gJ29iamVjdCcpIHRocm93ICdsaW1pdEJ55Y+q6IO95aSE55CG5a+56LGh5oiW5pWw57uEJztcbiAgICAgICAgLy/lv4XpobvmmK/mlbDlgLxcbiAgICAgICAgaWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBpbnB1dDtcbiAgICAgICAgfVxuICAgICAgICAvL+S4jeiDveS4uk5hTlxuICAgICAgICBpZiAobGltaXQgIT09IGxpbWl0KSB7XG4gICAgICAgICAgICByZXR1cm4gaW5wdXQ7XG4gICAgICAgIH1cbiAgICAgICAgLy/lsIbnm67moIfovazmjaLkuLrmlbDnu4RcbiAgICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBpbnB1dCA9IGNvbnZlcnRBcnJheShpbnB1dCwgZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuID0gaW5wdXQubGVuZ3RoO1xuICAgICAgICBsaW1pdCA9IE1hdGguZmxvb3IoTWF0aC5taW4obiwgbGltaXQpKTtcbiAgICAgICAgYmVnaW4gPSB0eXBlb2YgYmVnaW4gPT09ICdudW1iZXInID8gYmVnaW4gOiAwO1xuICAgICAgICBpZiAoYmVnaW4gPCAwKSB7XG4gICAgICAgICAgICBiZWdpbiA9IE1hdGgubWF4KDAsIG4gKyBiZWdpbik7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGEgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSA9IGJlZ2luOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YS5sZW5ndGggPT09IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkYXRhLnB1c2goaW5wdXRbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpc0FycmF5JCQxID0gdHlwZSA9PT0gJ2FycmF5JztcbiAgICAgICAgaWYgKGlzQXJyYXkkJDEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0YXJnZXQgPSB7fTtcbiAgICAgICAgcmV0dXJuIHJlY292ZXJ5KHRhcmdldCwgZGF0YSwgZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICB0YXJnZXRbZWwua2V5XSA9IGVsLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZWNvdmVyeShyZXQsIGFycmF5LCBjYWxsYmFjaykge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGFycmF5Lmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgY2FsbGJhY2soYXJyYXlbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfVxuXG4gICAgLy9DaHJvbWXosLfmrYzmtY/op4jlmajkuK1qc+S7o+eggUFycmF5LnNvcnTmjpLluo/nmoRidWfkubHluo/op6PlhrPlip7ms5VcbiAgICAvL2h0dHA6Ly93d3cuY25ibG9ncy5jb20veXplbmcvcC8zOTQ5MTgyLmh0bWxcbiAgICBmdW5jdGlvbiBjb252ZXJ0QXJyYXkoYXJyYXksIGlzQXJyYXkkJDEpIHtcbiAgICAgICAgdmFyIHJldCA9IFtdLFxuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgIF9fcmVwZWF0KGFycmF5LCBpc0FycmF5JCQxLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICByZXRbaV0gPSB7XG4gICAgICAgICAgICAgICAgb2xkSW5kZXg6IGksXG4gICAgICAgICAgICAgICAgdmFsdWU6IGFycmF5W2tleV0sXG4gICAgICAgICAgICAgICAga2V5OiBrZXlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHZhciBldmVudEZpbHRlcnMgPSB7XG4gICAgICAgIHN0b3A6IGZ1bmN0aW9uIHN0b3AoZSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9LFxuICAgICAgICBwcmV2ZW50OiBmdW5jdGlvbiBwcmV2ZW50KGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybiBlO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIga2V5cyA9IHtcbiAgICAgICAgZXNjOiAyNyxcbiAgICAgICAgdGFiOiA5LFxuICAgICAgICBlbnRlcjogMTMsXG4gICAgICAgIHNwYWNlOiAzMixcbiAgICAgICAgZGVsOiA0NixcbiAgICAgICAgdXA6IDM4LFxuICAgICAgICBsZWZ0OiAzNyxcbiAgICAgICAgcmlnaHQ6IDM5LFxuICAgICAgICBkb3duOiA0MFxuICAgIH07XG4gICAgZm9yICh2YXIgbmFtZSQxIGluIGtleXMpIHtcbiAgICAgICAgKGZ1bmN0aW9uIChmaWx0ZXIsIGtleSkge1xuICAgICAgICAgICAgZXZlbnRGaWx0ZXJzW2ZpbHRlcl0gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmIChlLndoaWNoICE9PSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgZS4kcmV0dXJuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGU7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9KShuYW1lJDEsIGtleXNbbmFtZSQxXSk7XG4gICAgfVxuXG4gICAgLy9odHRwczovL2dpdGh1Yi5jb20vdGVwcGVpcy9odG1sc3BlY2lhbGNoYXJzXG4gICAgZnVuY3Rpb24gZXNjYXBlRmlsdGVyKHN0cikge1xuICAgICAgICBpZiAoc3RyID09IG51bGwpIHJldHVybiAnJztcblxuICAgICAgICByZXR1cm4gU3RyaW5nKHN0cikucmVwbGFjZSgvJi9nLCAnJmFtcDsnKS5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKS5yZXBsYWNlKC8nL2csICcmIzM5OycpO1xuICAgIH1cblxuICAgIHZhciBmaWx0ZXJzID0gYXZhbG9uLmZpbHRlcnMgPSB7fTtcblxuICAgIGF2YWxvbi5jb21wb3NlRmlsdGVycyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBhcnI7IGFyciA9IGFyZ3NbaSsrXTspIHtcbiAgICAgICAgICAgICAgICB2YXIgbmFtZSA9IGFyclswXTtcbiAgICAgICAgICAgICAgICB2YXIgZmlsdGVyID0gYXZhbG9uLmZpbHRlcnNbbmFtZV07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJyWzBdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGZpbHRlci5hcHBseSgwLCBhcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfTtcbiAgICB9O1xuXG4gICAgYXZhbG9uLmVzY2FwZUh0bWwgPSBlc2NhcGVGaWx0ZXI7XG5cbiAgICBhdmFsb24ubWl4KGZpbHRlcnMsIHtcbiAgICAgICAgdXBwZXJjYXNlOiBmdW5jdGlvbiB1cHBlcmNhc2Uoc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHN0cikudG9VcHBlckNhc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbG93ZXJjYXNlOiBmdW5jdGlvbiBsb3dlcmNhc2Uoc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gU3RyaW5nKHN0cikudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1bmNhdGU6IGZ1bmN0aW9uIHRydW5jYXRlKHN0ciwgbGVuZ3RoLCBlbmQpIHtcbiAgICAgICAgICAgIC8vbGVuZ3Ro77yM5paw5a2X56ym5Liy6ZW/5bqm77yMdHJ1bmNhdGlvbu+8jOaWsOWtl+espuS4sueahOe7k+WwvueahOWtl+autSzov5Tlm57mlrDlrZfnrKbkuLJcbiAgICAgICAgICAgIGlmICghc3RyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3RyID0gU3RyaW5nKHN0cik7XG4gICAgICAgICAgICBpZiAoaXNOYU4obGVuZ3RoKSkge1xuICAgICAgICAgICAgICAgIGxlbmd0aCA9IDMwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZW5kID0gdHlwZW9mIGVuZCA9PT0gXCJzdHJpbmdcIiA/IGVuZCA6IFwiLi4uXCI7XG4gICAgICAgICAgICByZXR1cm4gc3RyLmxlbmd0aCA+IGxlbmd0aCA/IHN0ci5zbGljZSgwLCBsZW5ndGggLSBlbmQubGVuZ3RoKSArIGVuZCA6IC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlKi9cbiAgICAgICAgICAgIHN0cjtcbiAgICAgICAgfSxcblxuICAgICAgICBjYW1lbGl6ZTogYXZhbG9uLmNhbWVsaXplLFxuICAgICAgICBkYXRlOiBkYXRlRmlsdGVyLFxuICAgICAgICBlc2NhcGU6IGVzY2FwZUZpbHRlcixcbiAgICAgICAgc2FuaXRpemU6IHNhbml0aXplRmlsdGVyLFxuICAgICAgICBudW1iZXI6IG51bWJlckZpbHRlcixcbiAgICAgICAgY3VycmVuY3k6IGZ1bmN0aW9uIGN1cnJlbmN5KGFtb3VudCwgc3ltYm9sLCBmcmFjdGlvblNpemUpIHtcbiAgICAgICAgICAgIHJldHVybiAoc3ltYm9sIHx8ICdcXHhBNScpICsgbnVtYmVyRmlsdGVyKGFtb3VudCwgaXNGaW5pdGUoZnJhY3Rpb25TaXplKSA/IC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlKi9mcmFjdGlvblNpemUgOiAyKTtcbiAgICAgICAgfVxuICAgIH0sIHsgZmlsdGVyQnk6IGZpbHRlckJ5LCBvcmRlckJ5OiBvcmRlckJ5LCBzZWxlY3RCeTogc2VsZWN0QnksIGxpbWl0Qnk6IGxpbWl0QnkgfSwgZXZlbnRGaWx0ZXJzKTtcblxuICAgIHZhciByY2hlY2tlZFR5cGUgPSAvXig/OmNoZWNrYm94fHJhZGlvKSQvO1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBmaXhFbGVtZW50KGRlc3QsIHNyYykge1xuICAgICAgICBpZiAoZGVzdC5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub2RlTmFtZSA9IGRlc3Qubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICBpZiAobm9kZU5hbWUgPT09IFwic2NyaXB0XCIpIHtcbiAgICAgICAgICAgIGlmIChkZXN0LnRleHQgIT09IHNyYy50ZXh0KSB7XG4gICAgICAgICAgICAgICAgZGVzdC50eXBlID0gXCJub2V4ZWNcIjtcbiAgICAgICAgICAgICAgICBkZXN0LnRleHQgPSBzcmMudGV4dDtcbiAgICAgICAgICAgICAgICBkZXN0LnR5cGUgPSBzcmMudHlwZSB8fCBcIlwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG5vZGVOYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHNyYy5jaGlsZE5vZGVzO1xuICAgICAgICAgICAgaWYgKGRlc3QuY2hpbGROb2Rlcy5sZW5ndGggIT09IHBhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24uY2xlYXJIVE1MKGRlc3QpO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBwYXJhbXNbaSsrXTspIHtcbiAgICAgICAgICAgICAgICAgICAgZGVzdC5hcHBlbmRDaGlsZChlbC5jbG9uZU5vZGUodHJ1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChub2RlTmFtZSA9PT0gJ2lucHV0JyAmJiByY2hlY2tlZFR5cGUudGVzdChzcmMubm9kZU5hbWUpKSB7XG5cbiAgICAgICAgICAgIGRlc3QuZGVmYXVsdENoZWNrZWQgPSBkZXN0LmNoZWNrZWQgPSBzcmMuY2hlY2tlZDtcbiAgICAgICAgICAgIGlmIChkZXN0LnZhbHVlICE9PSBzcmMudmFsdWUpIHtcbiAgICAgICAgICAgICAgICBkZXN0LnZhbHVlID0gc3JjLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG5vZGVOYW1lID09PSAnb3B0aW9uJykge1xuICAgICAgICAgICAgZGVzdC5kZWZhdWx0U2VsZWN0ZWQgPSBkZXN0LnNlbGVjdGVkID0gc3JjLmRlZmF1bHRTZWxlY3RlZDtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlTmFtZSA9PT0gJ2lucHV0JyB8fCBub2RlTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICAgICAgZGVzdC5kZWZhdWx0VmFsdWUgPSBzcmMuZGVmYXVsdFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBnZXRBbGwoY29udGV4dCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIGNvbnRleHQuZ2V0RWxlbWVudHNCeVRhZ05hbWUgIT09ICd1bmRlZmluZWQnID8gY29udGV4dC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnKicpIDogdHlwZW9mIGNvbnRleHQucXVlcnlTZWxlY3RvckFsbCAhPT0gJ3VuZGVmaW5lZCcgPyBjb250ZXh0LnF1ZXJ5U2VsZWN0b3JBbGwoJyonKSA6IFtdO1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gZml4Q2xvbmUoc3JjKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBzcmMuY2xvbmVOb2RlKHRydWUpO1xuICAgICAgICAvL2h0dHA6Ly93d3cubXlleGNlcHRpb24uY24vd2ViLzY2NTYxMy5odG1sXG4gICAgICAgIC8vIHRhcmdldC5leHBhbmRvID0gbnVsbFxuICAgICAgICB2YXIgdCA9IGdldEFsbCh0YXJnZXQpO1xuICAgICAgICB2YXIgcyA9IGdldEFsbChzcmMpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGZpeEVsZW1lbnQodFtpXSwgc1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGZpeENvbnRhaW5zKHJvb3QsIGVsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvL0lFNi04LOa4uOemu+S6jkRPTeagkeWklueahOaWh+acrOiKgueCue+8jOiuv+mXrnBhcmVudE5vZGXmnInml7bkvJrmipvplJlcbiAgICAgICAgICAgIHdoaWxlIChlbCA9IGVsLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwgPT09IHJvb3QpIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgYXZhbG9uLmNvbnRhaW5zID0gZml4Q29udGFpbnM7XG5cbiAgICBhdmFsb24uY2xvbmVOb2RlID0gZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgcmV0dXJuIGEuY2xvbmVOb2RlKHRydWUpO1xuICAgIH07XG5cbiAgICAvL0lFNi0xMeeahOaWh+aho+WvueixoeayoeaciWNvbnRhaW5zXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBzaGltSGFjaygpIHtcbiAgICAgICAgaWYgKG1zaWUgPCAxMCkge1xuICAgICAgICAgICAgYXZhbG9uLmNsb25lTm9kZSA9IGZpeENsb25lO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZG9jdW1lbnQkMS5jb250YWlucykge1xuICAgICAgICAgICAgZG9jdW1lbnQkMS5jb250YWlucyA9IGZ1bmN0aW9uIChiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZpeENvbnRhaW5zKGRvY3VtZW50JDEsIGIpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXZhbG9uLm1vZGVybikge1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudCQxLmNyZWF0ZVRleHROb2RlKCd4JykuY29udGFpbnMpIHtcbiAgICAgICAgICAgICAgICBOb2RlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uIChjaGlsZCkge1xuICAgICAgICAgICAgICAgICAgICAvL0lFNi045rKh5pyJTm9kZeWvueixoVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZml4Q29udGFpbnModGhpcywgY2hpbGQpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy9maXJlZm94IOWIsDEx5pe25omN5pyJb3V0ZXJIVE1MXG4gICAgICAgIGZ1bmN0aW9uIGZpeEZGKHByb3AsIGNiKSB7XG4gICAgICAgICAgICBpZiAoIShwcm9wIGluIHJvb3QpICYmIEhUTUxFbGVtZW50LnByb3RvdHlwZS5fX2RlZmluZUdldHRlcl9fKSB7XG4gICAgICAgICAgICAgICAgSFRNTEVsZW1lbnQucHJvdG90eXBlLl9fZGVmaW5lR2V0dGVyX18ocHJvcCwgY2IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZpeEZGKCdvdXRlckhUTUwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQkMS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZCh0aGlzKTtcbiAgICAgICAgICAgIHJldHVybiBkaXYuaW5uZXJIVE1MO1xuICAgICAgICB9KTtcbiAgICAgICAgZml4RkYoJ2NoaWxkcmVuJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gdGhpcy5jaGlsZE5vZGVzW2krK107KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkcmVuLnB1c2goZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjaGlsZHJlbjtcbiAgICAgICAgfSk7XG4gICAgICAgIGZpeEZGKCdpbm5lclRleHQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvL2ZpcmVmb3g0NSssIGNocm9tZTQrIGh0dHA6Ly9jYW5pdXNlLmNvbS8jZmVhdD1pbm5lcnRleHRcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRleHRDb250ZW50O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgICAgIHNoaW1IYWNrKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgICAgICAgdGhpcy5ub2RlID0gbm9kZTtcbiAgICB9XG5cbiAgICBDbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZTtcbiAgICAgICAgICAgIHZhciBjbHMgPSBub2RlLmNsYXNzTmFtZTtcbiAgICAgICAgICAgIHZhciBzdHIgPSB0eXBlb2YgY2xzID09PSAnc3RyaW5nJyA/IGNscyA6IGNscy5iYXNlVmFsO1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gc3RyLm1hdGNoKHJub3doaXRlKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaCA/IG1hdGNoLmpvaW4oJyAnKSA6ICcnO1xuICAgICAgICB9LFxuICAgICAgICBjb250YWluczogZnVuY3Rpb24gY29udGFpbnMoY2xzKSB7XG4gICAgICAgICAgICByZXR1cm4gKCcgJyArIHRoaXMgKyAnICcpLmluZGV4T2YoJyAnICsgY2xzICsgJyAnKSA+IC0xO1xuICAgICAgICB9LFxuICAgICAgICBhZGQ6IGZ1bmN0aW9uIGFkZChjbHMpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5jb250YWlucyhjbHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXQodGhpcyArICcgJyArIGNscyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHJlbW92ZTogZnVuY3Rpb24gcmVtb3ZlKGNscykge1xuICAgICAgICAgICAgdGhpcy5zZXQoKCcgJyArIHRoaXMgKyAnICcpLnJlcGxhY2UoJyAnICsgY2xzICsgJyAnLCAnICcpKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQoY2xzKSB7XG4gICAgICAgICAgICBjbHMgPSBjbHMudHJpbSgpO1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICBpZiAodHlwZW9mIG5vZGUuY2xhc3NOYW1lID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIC8vU1ZH5YWD57Sg55qEY2xhc3NOYW1l5piv5LiA5Liq5a+56LGhIFNWR0FuaW1hdGVkU3RyaW5nIHsgYmFzZVZhbD0nJywgYW5pbVZhbD0nJ33vvIzlj6rog73pgJrov4dzZXQvZ2V0QXR0cmlidXRl5pON5L2cXG4gICAgICAgICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgY2xzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbm9kZS5jbGFzc05hbWUgPSBjbHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIWNscykge1xuICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKCdjbGFzcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy90b2dnbGXlrZjlnKjniYjmnKzlt67lvILvvIzlm6DmraTkuI3kvb/nlKjlroNcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjbGFzc0xpc3RGYWN0b3J5KG5vZGUpIHtcbiAgICAgICAgaWYgKCEoJ2NsYXNzTGlzdCcgaW4gbm9kZSkpIHtcbiAgICAgICAgICAgIG5vZGUuY2xhc3NMaXN0ID0gbmV3IENsYXNzTGlzdChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZS5jbGFzc0xpc3Q7XG4gICAgfVxuXG4gICAgJ2FkZCxyZW1vdmUnLnJlcGxhY2UocndvcmQsIGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgICAgICAgYXZhbG9uLmZuW21ldGhvZCArICdDbGFzcyddID0gZnVuY3Rpb24gKGNscykge1xuICAgICAgICAgICAgdmFyIGVsID0gdGhpc1swXSB8fCB7fTtcbiAgICAgICAgICAgIC8vaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvemgtQ04vZG9jcy9Nb3ppbGxhL0ZpcmVmb3gvUmVsZWFzZXMvMjZcbiAgICAgICAgICAgIGlmIChjbHMgJiYgdHlwZW9mIGNscyA9PT0gJ3N0cmluZycgJiYgZWwubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBjbHMucmVwbGFjZShybm93aGl0ZSwgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NMaXN0RmFjdG9yeShlbClbbWV0aG9kXShjKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXZhbG9uLnNoYWRvd0NvcHkoYXZhbG9uLmZuLCB7XG4gICAgICAgIGhhc0NsYXNzOiBmdW5jdGlvbiBoYXNDbGFzcyhjbHMpIHtcbiAgICAgICAgICAgIHZhciBlbCA9IHRoaXNbMF0gfHwge307XG4gICAgICAgICAgICByZXR1cm4gZWwubm9kZVR5cGUgPT09IDEgJiYgY2xhc3NMaXN0RmFjdG9yeShlbCkuY29udGFpbnMoY2xzKTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9nZ2xlQ2xhc3M6IGZ1bmN0aW9uIHRvZ2dsZUNsYXNzKHZhbHVlLCBzdGF0ZVZhbCkge1xuICAgICAgICAgICAgdmFyIGlzQm9vbCA9IHR5cGVvZiBzdGF0ZVZhbCA9PT0gJ2Jvb2xlYW4nO1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIFN0cmluZyh2YWx1ZSkucmVwbGFjZShybm93aGl0ZSwgZnVuY3Rpb24gKGMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSBpc0Jvb2wgPyBzdGF0ZVZhbCA6ICFtZS5oYXNDbGFzcyhjKTtcbiAgICAgICAgICAgICAgICBtZVtzdGF0ZSA/ICdhZGRDbGFzcycgOiAncmVtb3ZlQ2xhc3MnXShjKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBwcm9wTWFwID0geyAvL+S4jeinhOWImeeahOWxnuaAp+WQjeaYoOWwhFxuICAgICAgICAnYWNjZXB0LWNoYXJzZXQnOiAnYWNjZXB0Q2hhcnNldCcsXG4gICAgICAgICdjaGFyJzogJ2NoJyxcbiAgICAgICAgY2hhcm9mZjogJ2NoT2ZmJyxcbiAgICAgICAgJ2NsYXNzJzogJ2NsYXNzTmFtZScsXG4gICAgICAgICdmb3InOiAnaHRtbEZvcicsXG4gICAgICAgICdodHRwLWVxdWl2JzogJ2h0dHBFcXVpdidcbiAgICB9O1xuICAgIC8qXG4gICAgY29udGVudGVkaXRhYmxl5LiN5piv5biD5bCU5bGe5oCnXG4gICAgaHR0cDovL3d3dy56aGFuZ3hpbnh1LmNvbS93b3JkcHJlc3MvMjAxNi8wMS9jb250ZW50ZWRpdGFibGUtcGxhaW50ZXh0LW9ubHkvXG4gICAgY29udGVudGVkaXRhYmxlPScnXG4gICAgY29udGVudGVkaXRhYmxlPSdldmVudHMnXG4gICAgY29udGVudGVkaXRhYmxlPSdjYXJldCdcbiAgICBjb250ZW50ZWRpdGFibGU9J3BsYWludGV4dC1vbmx5J1xuICAgIGNvbnRlbnRlZGl0YWJsZT0ndHJ1ZSdcbiAgICBjb250ZW50ZWRpdGFibGU9J2ZhbHNlJ1xuICAgICAqL1xuICAgIHZhciBib29scyA9IFsnYXV0b2ZvY3VzLGF1dG9wbGF5LGFzeW5jLGFsbG93VHJhbnNwYXJlbmN5LGNoZWNrZWQsY29udHJvbHMnLCAnZGVjbGFyZSxkaXNhYmxlZCxkZWZlcixkZWZhdWx0Q2hlY2tlZCxkZWZhdWx0U2VsZWN0ZWQsJywgJ2lzTWFwLGxvb3AsbXVsdGlwbGUsbm9IcmVmLG5vUmVzaXplLG5vU2hhZGUnLCAnb3BlbixyZWFkT25seSxzZWxlY3RlZCddLmpvaW4oJywnKTtcblxuICAgIGJvb2xzLnJlcGxhY2UoL1xcdysvZywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgcHJvcE1hcFtuYW1lLnRvTG93ZXJDYXNlKCldID0gbmFtZTtcbiAgICB9KTtcblxuICAgIHZhciBhbm9tYWx5ID0gWydhY2Nlc3NLZXksYmdDb2xvcixjZWxsUGFkZGluZyxjZWxsU3BhY2luZyxjb2RlQmFzZSxjb2RlVHlwZSxjb2xTcGFuJywgJ2RhdGVUaW1lLGRlZmF1bHRWYWx1ZSxjb250ZW50RWRpdGFibGUsZnJhbWVCb3JkZXIsbG9uZ0Rlc2MsbWF4TGVuZ3RoLCcgKyAnbWFyZ2luV2lkdGgsbWFyZ2luSGVpZ2h0LHJvd1NwYW4sdGFiSW5kZXgsdXNlTWFwLHZTcGFjZSx2YWx1ZVR5cGUsdkFsaWduJ10uam9pbignLCcpO1xuXG4gICAgYW5vbWFseS5yZXBsYWNlKC9cXHcrL2csIGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHByb3BNYXBbbmFtZS50b0xvd2VyQ2FzZSgpXSA9IG5hbWU7XG4gICAgfSk7XG5cbiAgICAvL21vZHVsZS5leHBvcnRzID0gcHJvcE1hcFxuXG4gICAgZnVuY3Rpb24gaXNWTUwoc3JjKSB7XG4gICAgICAgIHZhciBub2RlTmFtZSA9IHNyYy5ub2RlTmFtZTtcbiAgICAgICAgcmV0dXJuIG5vZGVOYW1lLnRvTG93ZXJDYXNlKCkgPT09IG5vZGVOYW1lICYmICEhc3JjLnNjb3BlTmFtZSAmJiBzcmMub3V0ZXJUZXh0ID09PSAnJztcbiAgICB9XG5cbiAgICB2YXIgcnZhbGlkY2hhcnMgPSAvXltcXF0sOnt9XFxzXSokLztcbiAgICB2YXIgcnZhbGlkYnJhY2VzID0gLyg/Ol58OnwsKSg/OlxccypcXFspKy9nO1xuICAgIHZhciBydmFsaWRlc2NhcGUgPSAvXFxcXCg/OltcIlxcXFxcXC9iZm5ydF18dVtcXGRhLWZBLUZdezR9KS9nO1xuICAgIHZhciBydmFsaWR0b2tlbnMgPSAvXCJbXlwiXFxcXFxcclxcbl0qXCJ8dHJ1ZXxmYWxzZXxudWxsfC0/KD86XFxkK1xcLnwpXFxkKyg/OltlRV1bKy1dP1xcZCt8KS9nO1xuXG4gICAgZnVuY3Rpb24gY29tcGFjdFBhcnNlSlNPTihkYXRhKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGRhdGEgPSBkYXRhLnRyaW0oKTtcbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKHJ2YWxpZGNoYXJzLnRlc3QoZGF0YS5yZXBsYWNlKHJ2YWxpZGVzY2FwZSwgJ0AnKS5yZXBsYWNlKHJ2YWxpZHRva2VucywgJ10nKS5yZXBsYWNlKHJ2YWxpZGJyYWNlcywgJycpKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdyZXR1cm4gJyArIGRhdGEpKCk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IFR5cGVFcnJvcignSW52YWxpZCBKU09OOiBbJyArIGRhdGEgKyAnXScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHZhciByc3ZnID0gL15cXFtvYmplY3QgU1ZHXFx3KkVsZW1lbnRcXF0kLztcbiAgICB2YXIgcmFtcCA9IC8mYW1wOy9nO1xuICAgIGZ1bmN0aW9uIHVwZGF0ZUF0dHJzKG5vZGUsIGF0dHJzKSB7XG4gICAgICAgIGZvciAodmFyIGF0dHJOYW1lIGluIGF0dHJzKSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBhdHRyc1thdHRyTmFtZV07XG4gICAgICAgICAgICAgICAgLy8g5aSE55CG6Lev5b6E5bGe5oCnXG4gICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cblxuICAgICAgICAgICAgICAgIC8v5aSE55CGSFRNTDUgZGF0YS0q5bGe5oCnIFNWR1xuICAgICAgICAgICAgICAgIGlmIChhdHRyTmFtZS5pbmRleE9mKCdkYXRhLScpID09PSAwIHx8IHJzdmcudGVzdChub2RlKSkge1xuICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgdmFsKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcHJvcE5hbWUgPSBwcm9wTWFwW2F0dHJOYW1lXSB8fCBhdHRyTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZVtwcm9wTmFtZV0gPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb3BOYW1lID09PSAnY2hlY2tlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2RlLmRlZmF1bHRDaGVja2VkID0gISF2YWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlW3Byb3BOYW1lXSA9ICEhdmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/luIPlsJTlsZ7mgKflv4Xpobvkvb/nlKhlbC54eHggPSB0cnVlfGZhbHNl5pa55byP6K6+5YC8XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+WmguaenOS4umZhbHNlLCBJReWFqOezu+WIl+S4i+ebuOW9k+S6jnNldEF0dHJpYnV0ZSh4eHgsJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy/kvJrlvbHlk43liLDmoLflvI8s6ZyA6KaB6L+b5LiA5q2l5aSE55CGXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAodmFsID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/np7vpmaTlsZ7mgKdcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKHByb3BOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vSUU25LitY2xhc3NOYW1tZSwgaHRtbEZvcuetieaXoOazleajgOa1i+Wug+S7rOS4uuWGheW7uuWxnuaAp+OAgFxuICAgICAgICAgICAgICAgICAgICBpZiAoYXZhbG9uLm1zaWUgPCA4ICYmIC9bQS1aXS8udGVzdChwcm9wTmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gdmFsICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL1NWR+WPquiDveS9v+eUqHNldEF0dHJpYnV0ZSh4eHgsIHl5eSksIFZNTOWPquiDveS9v+eUqG5vZGUueHh4ID0geXl5ICxcbiAgICAgICAgICAgICAgICAgICAgLy9IVE1M55qE5Zu65pyJ5bGe5oCn5b+F6aG7bm9kZS54eHggPSB5eXlcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgdmFyIGlzSW5uYXRlID0gIWF2YWxvbi5tb2Rlcm4gJiYgaXNWTUwobm9kZSkgPyB0cnVlIDogaXNJbm5hdGVQcm9wcyhub2RlLm5vZGVOYW1lLCBhdHRyTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc0lubmF0ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF0dHJOYW1lID09PSAnaHJlZicgfHwgYXR0ck5hbWUgPT09ICdzcmMnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWxvbi5tc2llIDwgOCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWwgPSBTdHJpbmcodmFsKS5yZXBsYWNlKHJhbXAsICcmJyk7IC8v5aSE55CGSUU2N+iHquWKqOi9rOS5ieeahOmXrumimFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVbcHJvcE5hbWVdID0gdmFsICsgJyc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyTmFtZSwgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAvLyDlr7nosaHkuI3mlK/mjIHmraTlsZ7mgKfmiJbmlrnms5Ugc3JjIGh0dHBzOi8vZ2l0aHViLmNvbS9lY29tZmUvenJlbmRlciBcbiAgICAgICAgICAgICAgICAvLyDmnKrnn6XlkI3np7DjgIJcXC9uXG4gICAgICAgICAgICAgICAgLy8gZS5tZXNzYWdl5aSn5qaC6L+Z5qC3LOmcgOimgXRyaW1cbiAgICAgICAgICAgICAgICAvL0lFNi04LOWFg+e0oOiKgueCueS4jeaUr+aMgeWFtuS7luWFg+e0oOiKgueCueeahOWGhee9ruWxnuaApyzlpoJzcmMsIGhyZWYsIGZvclxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgICAgICAgYXZhbG9uLmxvZyhTdHJpbmcoZS5tZXNzYWdlKS50cmltKCksIGF0dHJOYW1lLCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpbm5hdGVNYXAgPSB7fTtcblxuICAgIGZ1bmN0aW9uIGlzSW5uYXRlUHJvcHMobm9kZU5hbWUsIGF0dHJOYW1lKSB7XG4gICAgICAgIHZhciBrZXkgPSBub2RlTmFtZSArIFwiOlwiICsgYXR0ck5hbWU7XG4gICAgICAgIGlmIChrZXkgaW4gaW5uYXRlTWFwKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5uYXRlTWFwW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlubmF0ZU1hcFtrZXldID0gYXR0ck5hbWUgaW4gZG9jdW1lbnQkMS5jcmVhdGVFbGVtZW50KG5vZGVOYW1lKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgYXZhbG9uLnBhcnNlSlNPTiA9IEpTT04ucGFyc2U7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBhdmFsb24ucGFyc2VKU09OID0gY29tcGFjdFBhcnNlSlNPTjtcbiAgICB9XG5cbiAgICBhdmFsb24uZm4uYXR0ciA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgdGhpc1swXS5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpc1swXS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGNzc01hcCA9IHtcbiAgICAgICAgJ2Zsb2F0JzogJ2Nzc0Zsb2F0J1xuICAgIH07XG4gICAgYXZhbG9uLmNzc051bWJlciA9IG9uZU9iamVjdCgnYW5pbWF0aW9uSXRlcmF0aW9uQ291bnQsY29sdW1uQ291bnQsb3JkZXIsZmxleCxmbGV4R3JvdyxmbGV4U2hyaW5rLGZpbGxPcGFjaXR5LGZvbnRXZWlnaHQsbGluZUhlaWdodCxvcGFjaXR5LG9ycGhhbnMsd2lkb3dzLHpJbmRleCx6b29tJyk7XG4gICAgdmFyIHByZWZpeGVzID0gWycnLCAnLXdlYmtpdC0nLCAnLW8tJywgJy1tb3otJywgJy1tcy0nXTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5jc3NOYW1lID0gZnVuY3Rpb24gKG5hbWUsIGhvc3QsIGNhbWVsQ2FzZSkge1xuICAgICAgICBpZiAoY3NzTWFwW25hbWVdKSB7XG4gICAgICAgICAgICByZXR1cm4gY3NzTWFwW25hbWVdO1xuICAgICAgICB9XG4gICAgICAgIGhvc3QgPSBob3N0IHx8IGF2YWxvbi5yb290LnN0eWxlIHx8IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHByZWZpeGVzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgY2FtZWxDYXNlID0gYXZhbG9uLmNhbWVsaXplKHByZWZpeGVzW2ldICsgbmFtZSk7XG4gICAgICAgICAgICBpZiAoY2FtZWxDYXNlIGluIGhvc3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3NzTWFwW25hbWVdID0gY2FtZWxDYXNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uY3NzID0gZnVuY3Rpb24gKG5vZGUsIG5hbWUsIHZhbHVlLCBmbikge1xuICAgICAgICAvL+ivu+WGmeWIoOmZpOWFg+e0oOiKgueCueeahOagt+W8j1xuICAgICAgICBpZiAobm9kZSBpbnN0YW5jZW9mIGF2YWxvbikge1xuICAgICAgICAgICAgbm9kZSA9IG5vZGVbMF07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgIT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcHJvcCA9IGF2YWxvbi5jYW1lbGl6ZShuYW1lKTtcbiAgICAgICAgbmFtZSA9IGF2YWxvbi5jc3NOYW1lKHByb3ApIHx8IC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9wcm9wO1xuICAgICAgICBpZiAodmFsdWUgPT09IHZvaWQgMCB8fCB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgLy/ojrflj5bmoLflvI9cbiAgICAgICAgICAgIGZuID0gY3NzSG9va3NbcHJvcCArICc6Z2V0J10gfHwgY3NzSG9va3NbJ0A6Z2V0J107XG4gICAgICAgICAgICBpZiAobmFtZSA9PT0gJ2JhY2tncm91bmQnKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9ICdiYWNrZ3JvdW5kQ29sb3InO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHZhbCA9IGZuKG5vZGUsIG5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlID09PSB0cnVlID8gcGFyc2VGbG9hdCh2YWwpIHx8IDAgOiB2YWw7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICcnKSB7XG4gICAgICAgICAgICAvL+ivt+mZpOagt+W8j1xuICAgICAgICAgICAgbm9kZS5zdHlsZVtuYW1lXSA9ICcnO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy/orr7nva7moLflvI9cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IHZhbHVlICE9PSB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0Zpbml0ZSh2YWx1ZSkgJiYgIWF2YWxvbi5jc3NOdW1iZXJbcHJvcF0pIHtcbiAgICAgICAgICAgICAgICB2YWx1ZSArPSAncHgnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm4gPSBjc3NIb29rc1twcm9wICsgJzpzZXQnXSB8fCBjc3NIb29rc1snQDpzZXQnXTtcbiAgICAgICAgICAgIGZuKG5vZGUsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uZm4uY3NzID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChhdmFsb24uaXNQbGFpbk9iamVjdChuYW1lKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBuYW1lKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmNzcyh0aGlzLCBpLCBuYW1lW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciByZXQgPSBhdmFsb24uY3NzKHRoaXMsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0ICE9PSB2b2lkIDAgPyByZXQgOiB0aGlzO1xuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24uZm4ucG9zaXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnQsXG4gICAgICAgICAgICBvZmZzZXQsXG4gICAgICAgICAgICBlbGVtID0gdGhpc1swXSxcbiAgICAgICAgICAgIHBhcmVudE9mZnNldCA9IHtcbiAgICAgICAgICAgIHRvcDogMCxcbiAgICAgICAgICAgIGxlZnQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFlbGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gcGFyZW50T2Zmc2V0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNzcygncG9zaXRpb24nKSA9PT0gJ2ZpeGVkJykge1xuICAgICAgICAgICAgb2Zmc2V0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG9mZnNldFBhcmVudCA9IHRoaXMub2Zmc2V0UGFyZW50KCk7IC8v5b6X5Yiw55yf5q2j55qEb2Zmc2V0UGFyZW50XG4gICAgICAgICAgICBvZmZzZXQgPSB0aGlzLm9mZnNldCgpOyAvLyDlvpfliLDmraPnoa7nmoRvZmZzZXRQYXJlbnRcbiAgICAgICAgICAgIGlmIChvZmZzZXRQYXJlbnRbMF0udGFnTmFtZSAhPT0gJ0hUTUwnKSB7XG4gICAgICAgICAgICAgICAgcGFyZW50T2Zmc2V0ID0gb2Zmc2V0UGFyZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50T2Zmc2V0LnRvcCArPSBhdmFsb24uY3NzKG9mZnNldFBhcmVudFswXSwgJ2JvcmRlclRvcFdpZHRoJywgdHJ1ZSk7XG4gICAgICAgICAgICBwYXJlbnRPZmZzZXQubGVmdCArPSBhdmFsb24uY3NzKG9mZnNldFBhcmVudFswXSwgJ2JvcmRlckxlZnRXaWR0aCcsIHRydWUpO1xuXG4gICAgICAgICAgICAvLyBTdWJ0cmFjdCBvZmZzZXRQYXJlbnQgc2Nyb2xsIHBvc2l0aW9uc1xuICAgICAgICAgICAgcGFyZW50T2Zmc2V0LnRvcCAtPSBvZmZzZXRQYXJlbnQuc2Nyb2xsVG9wKCk7XG4gICAgICAgICAgICBwYXJlbnRPZmZzZXQubGVmdCAtPSBvZmZzZXRQYXJlbnQuc2Nyb2xsTGVmdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3A6IG9mZnNldC50b3AgLSBwYXJlbnRPZmZzZXQudG9wIC0gYXZhbG9uLmNzcyhlbGVtLCAnbWFyZ2luVG9wJywgdHJ1ZSksXG4gICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCAtIHBhcmVudE9mZnNldC5sZWZ0IC0gYXZhbG9uLmNzcyhlbGVtLCAnbWFyZ2luTGVmdCcsIHRydWUpXG4gICAgICAgIH07XG4gICAgfTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5mbi5vZmZzZXRQYXJlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBvZmZzZXRQYXJlbnQgPSB0aGlzWzBdLm9mZnNldFBhcmVudDtcbiAgICAgICAgd2hpbGUgKG9mZnNldFBhcmVudCAmJiBhdmFsb24uY3NzKG9mZnNldFBhcmVudCwgJ3Bvc2l0aW9uJykgPT09ICdzdGF0aWMnKSB7XG4gICAgICAgICAgICBvZmZzZXRQYXJlbnQgPSBvZmZzZXRQYXJlbnQub2Zmc2V0UGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhdmFsb24ob2Zmc2V0UGFyZW50IHx8IGF2YWxvbi5yb290KTtcbiAgICB9O1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBjc3NIb29rc1snQDpzZXQnXSA9IGZ1bmN0aW9uIChub2RlLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy9ub2RlLnN0eWxlLndpZHRoID0gTmFOO25vZGUuc3R5bGUud2lkdGggPSAneHh4eHh4eCc7XG4gICAgICAgICAgICAvL25vZGUuc3R5bGUud2lkdGggPSB1bmRlZmluZSDlnKjml6flvI9JReS4i+S8muaKm+W8guW4uFxuICAgICAgICAgICAgbm9kZS5zdHlsZVtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgIH07XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBjc3NIb29rc1snQDpnZXQnXSA9IGZ1bmN0aW9uIChub2RlLCBuYW1lKSB7XG4gICAgICAgIGlmICghbm9kZSB8fCAhbm9kZS5zdHlsZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdnZXRDb21wdXRlZFN0eWxl6KaB5rGC5Lyg5YWl5LiA5Liq6IqC54K5ICcgKyBub2RlKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0LFxuICAgICAgICAgICAgc3R5bGVzID0gd2luZG93JDEuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKTtcbiAgICAgICAgaWYgKHN0eWxlcykge1xuICAgICAgICAgICAgcmV0ID0gbmFtZSA9PT0gJ2ZpbHRlcicgPyBzdHlsZXMuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKSA6IHN0eWxlc1tuYW1lXTtcbiAgICAgICAgICAgIGlmIChyZXQgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gbm9kZS5zdHlsZVtuYW1lXTsgLy/lhbbku5bmtY/op4jlmajpnIDopoHmiJHku6zmiYvliqjlj5blhoXogZTmoLflvI9cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH07XG5cbiAgICBjc3NIb29rc1snb3BhY2l0eTpnZXQnXSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgIHZhciByZXQgPSBjc3NIb29rc1snQDpnZXQnXShub2RlLCAnb3BhY2l0eScpO1xuICAgICAgICByZXR1cm4gcmV0ID09PSAnJyA/ICcxJyA6IHJldDtcbiAgICB9O1xuXG4gICAgJ3RvcCxsZWZ0Jy5yZXBsYWNlKGF2YWxvbi5yd29yZCwgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgY3NzSG9va3NbbmFtZSArICc6Z2V0J10gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgdmFyIGNvbXB1dGVkID0gY3NzSG9va3NbJ0A6Z2V0J10obm9kZSwgbmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gKC9weCQvLnRlc3QoY29tcHV0ZWQpID8gY29tcHV0ZWQgOiBhdmFsb24obm9kZSkucG9zaXRpb24oKVtuYW1lXSArICdweCdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICB2YXIgY3NzU2hvdyA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIHZpc2liaWxpdHk6ICdoaWRkZW4nLFxuICAgICAgICBkaXNwbGF5OiAnYmxvY2snXG4gICAgfTtcblxuICAgIHZhciByZGlzcGxheXN3YXAgPSAvXihub25lfHRhYmxlKD8hLWNbZWFdKS4rKS87XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBmdW5jdGlvbiBzaG93SGlkZGVuKG5vZGUsIGFycmF5KSB7XG4gICAgICAgIC8vaHR0cDovL3d3dy5jbmJsb2dzLmNvbS9ydWJ5bG91dnJlL2FyY2hpdmUvMjAxMi8xMC8yNy8yNzQyNTI5Lmh0bWxcbiAgICAgICAgaWYgKG5vZGUub2Zmc2V0V2lkdGggPD0gMCkge1xuICAgICAgICAgICAgLy9vcGVyYS5vZmZzZXRXaWR0aOWPr+iDveWwj+S6jjBcbiAgICAgICAgICAgIGlmIChyZGlzcGxheXN3YXAudGVzdChjc3NIb29rc1snQDpnZXQnXShub2RlLCAnZGlzcGxheScpKSkge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGU6IG5vZGVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5hbWUgaW4gY3NzU2hvdykge1xuICAgICAgICAgICAgICAgICAgICBvYmpbbmFtZV0gPSBub2RlLnN0eWxlW25hbWVdO1xuICAgICAgICAgICAgICAgICAgICBub2RlLnN0eWxlW25hbWVdID0gY3NzU2hvd1tuYW1lXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXJyYXkucHVzaChvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcbiAgICAgICAgICAgIGlmIChwYXJlbnQgJiYgcGFyZW50Lm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgc2hvd0hpZGRlbihwYXJlbnQsIGFycmF5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgYXZhbG9uLmVhY2goe1xuICAgICAgICBXaWR0aDogJ3dpZHRoJyxcbiAgICAgICAgSGVpZ2h0OiAnaGVpZ2h0J1xuICAgIH0sIGZ1bmN0aW9uIChuYW1lLCBtZXRob2QpIHtcbiAgICAgICAgdmFyIGNsaWVudFByb3AgPSAnY2xpZW50JyArIG5hbWUsXG4gICAgICAgICAgICBzY3JvbGxQcm9wID0gJ3Njcm9sbCcgKyBuYW1lLFxuICAgICAgICAgICAgb2Zmc2V0UHJvcCA9ICdvZmZzZXQnICsgbmFtZTtcbiAgICAgICAgY3NzSG9va3NbbWV0aG9kICsgJzpnZXQnXSA9IGZ1bmN0aW9uIChub2RlLCB3aGljaCwgb3ZlcnJpZGUpIHtcbiAgICAgICAgICAgIHZhciBib3hTaXppbmcgPSAtNDtcbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3ZlcnJpZGUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgYm94U2l6aW5nID0gb3ZlcnJpZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB3aGljaCA9IG5hbWUgPT09ICdXaWR0aCcgPyBbJ0xlZnQnLCAnUmlnaHQnXSA6IFsnVG9wJywgJ0JvdHRvbSddO1xuICAgICAgICAgICAgdmFyIHJldCA9IG5vZGVbb2Zmc2V0UHJvcF07IC8vIGJvcmRlci1ib3ggMFxuICAgICAgICAgICAgaWYgKGJveFNpemluZyA9PT0gMikge1xuICAgICAgICAgICAgICAgIC8vIG1hcmdpbi1ib3ggMlxuICAgICAgICAgICAgICAgIHJldHVybiByZXQgKyBhdmFsb24uY3NzKG5vZGUsICdtYXJnaW4nICsgd2hpY2hbMF0sIHRydWUpICsgYXZhbG9uLmNzcyhub2RlLCAnbWFyZ2luJyArIHdoaWNoWzFdLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChib3hTaXppbmcgPCAwKSB7XG4gICAgICAgICAgICAgICAgLy8gcGFkZGluZy1ib3ggIC0yXG4gICAgICAgICAgICAgICAgcmV0ID0gcmV0IC0gYXZhbG9uLmNzcyhub2RlLCAnYm9yZGVyJyArIHdoaWNoWzBdICsgJ1dpZHRoJywgdHJ1ZSkgLSBhdmFsb24uY3NzKG5vZGUsICdib3JkZXInICsgd2hpY2hbMV0gKyAnV2lkdGgnLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChib3hTaXppbmcgPT09IC00KSB7XG4gICAgICAgICAgICAgICAgLy8gY29udGVudC1ib3ggLTRcbiAgICAgICAgICAgICAgICByZXQgPSByZXQgLSBhdmFsb24uY3NzKG5vZGUsICdwYWRkaW5nJyArIHdoaWNoWzBdLCB0cnVlKSAtIGF2YWxvbi5jc3Mobm9kZSwgJ3BhZGRpbmcnICsgd2hpY2hbMV0sIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICAgICAgY3NzSG9va3NbbWV0aG9kICsgJyZnZXQnXSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICAgICAgICB2YXIgaGlkZGVuID0gW107XG4gICAgICAgICAgICBzaG93SGlkZGVuKG5vZGUsIGhpZGRlbik7XG4gICAgICAgICAgICB2YXIgdmFsID0gY3NzSG9va3NbbWV0aG9kICsgJzpnZXQnXShub2RlKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBvYmo7IG9iaiA9IGhpZGRlbltpKytdOykge1xuICAgICAgICAgICAgICAgIG5vZGUgPSBvYmoubm9kZTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBuIGluIG9iaikge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9ialtuXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGUuc3R5bGVbbl0gPSBvYmpbbl07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsO1xuICAgICAgICB9O1xuICAgICAgICBhdmFsb24uZm5bbWV0aG9kXSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgLy/kvJrlv73op4blhbZkaXNwbGF5XG4gICAgICAgICAgICB2YXIgbm9kZSA9IHRoaXNbMF07XG4gICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnNldFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lj5blvpfnqpflj6PlsLrlr7hcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVbJ2lubmVyJyArIG5hbWVdIHx8IG5vZGUuZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50W2NsaWVudFByb3BdIHx8IG5vZGUuZG9jdW1lbnQuYm9keVtjbGllbnRQcm9wXTsgLy9JRTbkuIvliY3kuKTkuKrliIbliKvkuLp1bmRlZmluZWQsMFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlVHlwZSA9PT0gOSkge1xuICAgICAgICAgICAgICAgICAgICAvL+WPluW+l+mhtemdouWwuuWvuFxuICAgICAgICAgICAgICAgICAgICB2YXIgZG9jID0gbm9kZS5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgIC8vRkYgY2hyb21lICAgIGh0bWwuc2Nyb2xsSGVpZ2h0PCBib2R5LnNjcm9sbEhlaWdodFxuICAgICAgICAgICAgICAgICAgICAvL0lFIOagh+WHhuaooeW8jyA6IGh0bWwuc2Nyb2xsSGVpZ2h0PiBib2R5LnNjcm9sbEhlaWdodFxuICAgICAgICAgICAgICAgICAgICAvL0lFIOaAquW8guaooeW8jyA6IGh0bWwuc2Nyb2xsSGVpZ2h0IOacgOWkp+etieS6juWPr+inhueql+WPo+WkmuS4gOeCue+8n1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC5tYXgobm9kZS5ib2R5W3Njcm9sbFByb3BdLCBkb2Nbc2Nyb2xsUHJvcF0sIG5vZGUuYm9keVtvZmZzZXRQcm9wXSwgZG9jW29mZnNldFByb3BdLCBkb2NbY2xpZW50UHJvcF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY3NzSG9va3NbbWV0aG9kICsgJyZnZXQnXShub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3NzKG1ldGhvZCwgdmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBhdmFsb24uZm5bJ2lubmVyJyArIG5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGNzc0hvb2tzW21ldGhvZCArICc6Z2V0J10odGhpc1swXSwgdm9pZCAwLCAtMik7XG4gICAgICAgIH07XG4gICAgICAgIGF2YWxvbi5mblsnb3V0ZXInICsgbmFtZV0gPSBmdW5jdGlvbiAoaW5jbHVkZU1hcmdpbikge1xuICAgICAgICAgICAgcmV0dXJuIGNzc0hvb2tzW21ldGhvZCArICc6Z2V0J10odGhpc1swXSwgdm9pZCAwLCBpbmNsdWRlTWFyZ2luID09PSB0cnVlID8gMiA6IDApO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0V2luZG93KG5vZGUpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUud2luZG93IHx8IG5vZGUuZGVmYXVsdFZpZXcgfHwgbm9kZS5wYXJlbnRXaW5kb3cgfHwgZmFsc2U7XG4gICAgfVxuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKG1zaWUgPCA5KSB7XG4gICAgICAgIGNzc01hcFsnZmxvYXQnXSA9ICdzdHlsZUZsb2F0JztcbiAgICAgICAgdmFyIHJudW1ub25weCA9IC9eLT8oPzpcXGQqXFwuKT9cXGQrKD8hcHgpW15cXGRcXHNdKyQvaTtcbiAgICAgICAgdmFyIHJwb3NpdGlvbiA9IC9eKHRvcHxyaWdodHxib3R0b218bGVmdCkkLztcbiAgICAgICAgdmFyIHJhbHBoYSA9IC9hbHBoYVxcKFteKV0rXFwpL2k7XG4gICAgICAgIHZhciByb3BhY3RpeSA9IC8ob3BhY2l0eXxcXGQoXFxkfFxcLikqKS9nO1xuICAgICAgICB2YXIgaWU4ID0gbXNpZSA9PT0gODtcbiAgICAgICAgdmFyIHNhbHBoYSA9ICdEWEltYWdlVHJhbnNmb3JtLk1pY3Jvc29mdC5BbHBoYSc7XG4gICAgICAgIHZhciBib3JkZXIgPSB7XG4gICAgICAgICAgICB0aGluOiBpZTggPyAnMXB4JyA6ICcycHgnLFxuICAgICAgICAgICAgbWVkaXVtOiBpZTggPyAnM3B4JyA6ICc0cHgnLFxuICAgICAgICAgICAgdGhpY2s6IGllOCA/ICc1cHgnIDogJzZweCdcbiAgICAgICAgfTtcbiAgICAgICAgY3NzSG9va3NbJ0A6Z2V0J10gPSBmdW5jdGlvbiAobm9kZSwgbmFtZSkge1xuICAgICAgICAgICAgLy/lj5blvpfnsr7noa7lgLzvvIzkuI3ov4flroPmnInlj6/og73mmK/luKZlbSxwYyxtbSxwdCwl562J5Y2V5L2NXG4gICAgICAgICAgICB2YXIgY3VycmVudFN0eWxlID0gbm9kZS5jdXJyZW50U3R5bGU7XG4gICAgICAgICAgICB2YXIgcmV0ID0gY3VycmVudFN0eWxlW25hbWVdO1xuICAgICAgICAgICAgaWYgKHJudW1ub25weC50ZXN0KHJldCkgJiYgIXJwb3NpdGlvbi50ZXN0KHJldCkpIHtcbiAgICAgICAgICAgICAgICAvL+KRoO+8jOS/neWtmOWOn+acieeahHN0eWxlLmxlZnQsIHJ1bnRpbWVTdHlsZS5sZWZ0LFxuICAgICAgICAgICAgICAgIHZhciBzdHlsZSA9IG5vZGUuc3R5bGUsXG4gICAgICAgICAgICAgICAgICAgIGxlZnQgPSBzdHlsZS5sZWZ0LFxuICAgICAgICAgICAgICAgICAgICByc0xlZnQgPSBub2RlLnJ1bnRpbWVTdHlsZS5sZWZ0O1xuICAgICAgICAgICAgICAgIC8v4pGh55Sx5LqO4pGi5aSE55qEc3R5bGUubGVmdCA9IHh4eOS8muW9seWTjeWIsGN1cnJlbnRTdHlsZS5sZWZ077yMXG4gICAgICAgICAgICAgICAgLy/lm6DmraTmiorlroNjdXJyZW50U3R5bGUubGVmdOaUvuWIsHJ1bnRpbWVTdHlsZS5sZWZ077yMXG4gICAgICAgICAgICAgICAgLy9ydW50aW1lU3R5bGUubGVmdOaLpeacieacgOmrmOS8mOWFiOe6p++8jOS4jeS8mnN0eWxlLmxlZnTlvbHlk41cbiAgICAgICAgICAgICAgICBub2RlLnJ1bnRpbWVTdHlsZS5sZWZ0ID0gY3VycmVudFN0eWxlLmxlZnQ7XG4gICAgICAgICAgICAgICAgLy/ikaLlsIbnsr7noa7lgLzotYvnu5nliLBzdHlsZS5sZWZ077yM54S25ZCO6YCa6L+HSUXnmoTlj6bkuIDkuKrnp4HmnInlsZ7mgKcgc3R5bGUucGl4ZWxMZWZ0XG4gICAgICAgICAgICAgICAgLy/lvpfliLDljZXkvY3kuLpweOeahOe7k+aenO+8m2ZvbnRTaXpl55qE5YiG5pSv6KeBaHR0cDovL2J1Z3MuanF1ZXJ5LmNvbS90aWNrZXQvNzYwXG4gICAgICAgICAgICAgICAgc3R5bGUubGVmdCA9IG5hbWUgPT09ICdmb250U2l6ZScgPyAnMWVtJyA6IHJldCB8fCAwO1xuICAgICAgICAgICAgICAgIHJldCA9IHN0eWxlLnBpeGVsTGVmdCArICdweCc7XG4gICAgICAgICAgICAgICAgLy/ikaPov5jljp8gc3R5bGUubGVmdO+8jHJ1bnRpbWVTdHlsZS5sZWZ0XG4gICAgICAgICAgICAgICAgc3R5bGUubGVmdCA9IGxlZnQ7XG4gICAgICAgICAgICAgICAgbm9kZS5ydW50aW1lU3R5bGUubGVmdCA9IHJzTGVmdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXQgPT09ICdtZWRpdW0nKSB7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgnV2lkdGgnLCAnU3R5bGUnKTtcbiAgICAgICAgICAgICAgICAvL2JvcmRlciB3aWR0aCDpu5jorqTlgLzkuLptZWRpdW3vvIzljbPkvb/lhbbkuLowJ1xuICAgICAgICAgICAgICAgIGlmIChjdXJyZW50U3R5bGVbbmFtZV0gPT09ICdub25lJykge1xuICAgICAgICAgICAgICAgICAgICByZXQgPSAnMHB4JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0ID09PSAnJyA/ICdhdXRvJyA6IGJvcmRlcltyZXRdIHx8IHJldDtcbiAgICAgICAgfTtcbiAgICAgICAgY3NzSG9va3NbJ29wYWNpdHk6c2V0J10gPSBmdW5jdGlvbiAobm9kZSwgbmFtZSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBzdHlsZSA9IG5vZGUuc3R5bGU7XG5cbiAgICAgICAgICAgIHZhciBvcGFjaXR5ID0gTnVtYmVyKHZhbHVlKSA8PSAxID8gJ2FscGhhKG9wYWNpdHk9JyArIHZhbHVlICogMTAwICsgJyknIDogJyc7XG4gICAgICAgICAgICB2YXIgZmlsdGVyID0gc3R5bGUuZmlsdGVyIHx8ICcnO1xuICAgICAgICAgICAgc3R5bGUuem9vbSA9IDE7XG4gICAgICAgICAgICAvL+S4jeiDveS9v+eUqOS7peS4i+aWueW8j+iuvue9rumAj+aYjuW6plxuICAgICAgICAgICAgLy9ub2RlLmZpbHRlcnMuYWxwaGEub3BhY2l0eSA9IHZhbHVlICogMTAwXG4gICAgICAgICAgICBzdHlsZS5maWx0ZXIgPSAocmFscGhhLnRlc3QoZmlsdGVyKSA/IGZpbHRlci5yZXBsYWNlKHJhbHBoYSwgb3BhY2l0eSkgOiBmaWx0ZXIgKyAnICcgKyBvcGFjaXR5KS50cmltKCk7XG5cbiAgICAgICAgICAgIGlmICghc3R5bGUuZmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgc3R5bGUucmVtb3ZlQXR0cmlidXRlKCdmaWx0ZXInKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgY3NzSG9va3NbJ29wYWNpdHk6Z2V0J10gPSBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgICAgICAgdmFyIG1hdGNoID0gbm9kZS5zdHlsZS5maWx0ZXIubWF0Y2gocm9wYWN0aXkpIHx8IFtdO1xuICAgICAgICAgICAgdmFyIHJldCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IG1hdGNoW2krK107KSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsID09PSAnb3BhY2l0eScpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJldCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZWwgLyAxMDAgKyAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJzEnOyAvL+ehruS/nei/lOWbnueahOaYr+Wtl+espuS4slxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLmZuLm9mZnNldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy/lj5blvpfot53nprvpobXpnaLlt6blj7Pop5LnmoTlnZDmoIdcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzWzBdLFxuICAgICAgICAgICAgYm94ID0ge1xuICAgICAgICAgICAgbGVmdDogMCxcbiAgICAgICAgICAgIHRvcDogMFxuICAgICAgICB9O1xuICAgICAgICBpZiAoIW5vZGUgfHwgIW5vZGUudGFnTmFtZSB8fCAhbm9kZS5vd25lckRvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gYm94O1xuICAgICAgICB9XG4gICAgICAgIHZhciBkb2MgPSBub2RlLm93bmVyRG9jdW1lbnQ7XG4gICAgICAgIHZhciBib2R5ID0gZG9jLmJvZHk7XG4gICAgICAgIHZhciByb290JCQxID0gZG9jLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgdmFyIHdpbiA9IGRvYy5kZWZhdWx0VmlldyB8fCBkb2MucGFyZW50V2luZG93O1xuICAgICAgICBpZiAoIWF2YWxvbi5jb250YWlucyhyb290JCQxLCBub2RlKSkge1xuICAgICAgICAgICAgcmV0dXJuIGJveDtcbiAgICAgICAgfVxuICAgICAgICAvL2h0dHA6Ly9oa29tLmJsb2cxLmZjMi5jb20vP21vZGU9bSZubz03NTAgYm9keeeahOWBj+enu+mHj+aYr+S4jeWMheWQq21hcmdpbueahFxuICAgICAgICAvL+aIkeS7rOWPr+S7pemAmui/h2dldEJvdW5kaW5nQ2xpZW50UmVjdOadpeiOt+W+l+WFg+e0oOebuOWvueS6jmNsaWVudOeahHJlY3QuXG4gICAgICAgIC8vaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTM2NDMzLmFzcHhcbiAgICAgICAgaWYgKG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XG4gICAgICAgICAgICBib3ggPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOyAvLyBCbGFja0JlcnJ5IDUsIGlPUyAzIChvcmlnaW5hbCBpUGhvbmUpXG4gICAgICAgIH1cbiAgICAgICAgLy9jaHJvbWUvSUU2OiBib2R5LnNjcm9sbFRvcCwgZmlyZWZveC9vdGhlcjogcm9vdC5zY3JvbGxUb3BcbiAgICAgICAgdmFyIGNsaWVudFRvcCA9IHJvb3QkJDEuY2xpZW50VG9wIHx8IGJvZHkuY2xpZW50VG9wLFxuICAgICAgICAgICAgY2xpZW50TGVmdCA9IHJvb3QkJDEuY2xpZW50TGVmdCB8fCBib2R5LmNsaWVudExlZnQsXG4gICAgICAgICAgICBzY3JvbGxUb3AgPSBNYXRoLm1heCh3aW4ucGFnZVlPZmZzZXQgfHwgMCwgcm9vdCQkMS5zY3JvbGxUb3AsIGJvZHkuc2Nyb2xsVG9wKSxcbiAgICAgICAgICAgIHNjcm9sbExlZnQgPSBNYXRoLm1heCh3aW4ucGFnZVhPZmZzZXQgfHwgMCwgcm9vdCQkMS5zY3JvbGxMZWZ0LCBib2R5LnNjcm9sbExlZnQpO1xuICAgICAgICAvLyDmiormu5rliqjot53nprvliqDliLBsZWZ0LHRvcOS4reWOu+OAglxuICAgICAgICAvLyBJReS4gOS6m+eJiOacrOS4reS8muiHquWKqOS4ukhUTUzlhYPntKDliqDkuIoycHjnmoRib3JkZXLvvIzmiJHku6zpnIDopoHljrvmjonlroNcbiAgICAgICAgLy8gaHR0cDovL21zZG4ubWljcm9zb2Z0LmNvbS9lbi11cy9saWJyYXJ5L21zNTMzNTY0KFZTLjg1KS5hc3B4XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0b3A6IGJveC50b3AgKyBzY3JvbGxUb3AgLSBjbGllbnRUb3AsXG4gICAgICAgICAgICBsZWZ0OiBib3gubGVmdCArIHNjcm9sbExlZnQgLSBjbGllbnRMZWZ0XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIC8v55Sf5oiQYXZhbG9uLmZuLnNjcm9sbExlZnQsIGF2YWxvbi5mbi5zY3JvbGxUb3Dmlrnms5VcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5lYWNoKHtcbiAgICAgICAgc2Nyb2xsTGVmdDogJ3BhZ2VYT2Zmc2V0JyxcbiAgICAgICAgc2Nyb2xsVG9wOiAncGFnZVlPZmZzZXQnXG4gICAgfSwgZnVuY3Rpb24gKG1ldGhvZCwgcHJvcCkge1xuICAgICAgICBhdmFsb24uZm5bbWV0aG9kXSA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpc1swXSB8fCB7fTtcbiAgICAgICAgICAgIHZhciB3aW4gPSBnZXRXaW5kb3cobm9kZSk7XG4gICAgICAgICAgICB2YXIgcm9vdCQkMSA9IGF2YWxvbi5yb290O1xuICAgICAgICAgICAgdmFyIHRvcCA9IG1ldGhvZCA9PT0gJ3Njcm9sbFRvcCc7XG4gICAgICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd2luID8gcHJvcCBpbiB3aW4gPyB3aW5bcHJvcF0gOiByb290JCQxW21ldGhvZF0gOiBub2RlW21ldGhvZF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmICh3aW4pIHtcbiAgICAgICAgICAgICAgICAgICAgd2luLnNjcm9sbFRvKCF0b3AgPyB2YWwgOiBhdmFsb24od2luKS5zY3JvbGxMZWZ0KCksIHRvcCA/IHZhbCA6IGF2YWxvbih3aW4pLnNjcm9sbFRvcCgpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlW21ldGhvZF0gPSB2YWw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZ2V0RHVwbGV4VHlwZShlbGVtKSB7XG4gICAgICAgIHZhciByZXQgPSBlbGVtLnRhZ05hbWUudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgaWYgKHJldCA9PT0gJ2lucHV0Jykge1xuICAgICAgICAgICAgcmV0dXJuIHJjaGVja2VkVHlwZS50ZXN0KGVsZW0udHlwZSkgPyAnY2hlY2tlZCcgOiBlbGVtLnR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJRTYvNy845Lit77yM5aaC5p6cb3B0aW9u5rKh5pyJdmFsdWXlgLzvvIzpgqPkuYjlsIbov5Tlm57nqbrlrZfnrKbkuLLjgIJcbiAgICAgKiBJRTkvRmlyZWZveC9TYWZhcmkvQ2hyb21lL09wZXJhIOS4reWFiOWPlm9wdGlvbueahHZhbHVl5YC877yM5aaC5p6c5rKh5pyJdmFsdWXlsZ7mgKfvvIzliJnlj5ZvcHRpb27nmoRpbm5lclRleHTlgLzjgIJcbiAgICAgKiBJRTEx5Y+KVzND77yM5aaC5p6c5rKh5pyJ5oyH5a6admFsdWXvvIzpgqPkuYhub2RlLnZhbHVl6buY6K6k5Li6bm9kZS50ZXh077yI5a2Y5ZyodHJpbeS9nO+8ie+8jOS9hklFOS0xMOWImeaYr+WPlmlubmVySFRNTCjmsqF0cmlt5pON5L2cKVxuICAgICAqL1xuXG4gICAgZnVuY3Rpb24gZ2V0T3B0aW9uKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUuaGFzQXR0cmlidXRlICYmIG5vZGUuaGFzQXR0cmlidXRlKCd2YWx1ZScpKSB7XG4gICAgICAgICAgICByZXR1cm4gbm9kZS5nZXRBdHRyaWJ1dGUoJ3ZhbHVlJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGF0dHIgPSBub2RlLmdldEF0dHJpYnV0ZU5vZGUoJ3ZhbHVlJyk7XG4gICAgICAgIGlmIChhdHRyICYmIGF0dHIuc3BlY2lmaWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYXR0ci52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZS5pbm5lckhUTUwudHJpbSgpO1xuICAgIH1cblxuICAgIHZhciB2YWxIb29rcyA9IHtcbiAgICAgICAgJ29wdGlvbjpnZXQnOiBtc2llID8gZ2V0T3B0aW9uIDogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLnZhbHVlO1xuICAgICAgICB9LFxuICAgICAgICAnc2VsZWN0OmdldCc6IGZ1bmN0aW9uIHNlbGVjdEdldChub2RlLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG9wdGlvbixcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gbm9kZS5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGluZGV4ID0gbm9kZS5zZWxlY3RlZEluZGV4LFxuICAgICAgICAgICAgICAgIGdldHRlciA9IHZhbEhvb2tzWydvcHRpb246Z2V0J10sXG4gICAgICAgICAgICAgICAgb25lID0gbm9kZS50eXBlID09PSAnc2VsZWN0LW9uZScgfHwgaW5kZXggPCAwLFxuICAgICAgICAgICAgICAgIHZhbHVlcyA9IG9uZSA/IG51bGwgOiBbXSxcbiAgICAgICAgICAgICAgICBtYXggPSBvbmUgPyBpbmRleCArIDEgOiBvcHRpb25zLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBpID0gaW5kZXggPCAwID8gbWF4IDogb25lID8gaW5kZXggOiAwO1xuICAgICAgICAgICAgZm9yICg7IGkgPCBtYXg7IGkrKykge1xuICAgICAgICAgICAgICAgIG9wdGlvbiA9IG9wdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgLy9JRTYtOeWcqHJlc2V05ZCO5LiN5Lya5pS55Y+Yc2VsZWN0ZWTvvIzpnIDopoHmlLnnlKhpID09PSBpbmRleOWIpOWumlxuICAgICAgICAgICAgICAgIC8v5oiR5Lus6L+H5ruk5omA5pyJZGlzYWJsZWTnmoRvcHRpb27lhYPntKDvvIzkvYblnKhzYWZhcmk15LiL77yMXG4gICAgICAgICAgICAgICAgLy/lpoLmnpzorr7nva5vcHRncm91cOS4umRpc2FibGXvvIzpgqPkuYjlhbbmiYDmnInlranlrZDpg71kaXNhYmxlXG4gICAgICAgICAgICAgICAgLy/lm6DmraTlvZPkuIDkuKrlhYPntKDkuLpkaXNhYmxl77yM6ZyA6KaB5qOA5rWL5YW25piv5ZCm5pi+5byP6K6+572u5LqGZGlzYWJsZeWPiuWFtueItuiKgueCueeahGRpc2FibGXmg4XlhrVcbiAgICAgICAgICAgICAgICBpZiAoKG9wdGlvbi5zZWxlY3RlZCB8fCBpID09PSBpbmRleCkgJiYgIW9wdGlvbi5kaXNhYmxlZCAmJiAoIW9wdGlvbi5wYXJlbnROb2RlLmRpc2FibGVkIHx8IG9wdGlvbi5wYXJlbnROb2RlLnRhZ05hbWUgIT09ICdPUFRHUk9VUCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gZ2V0dGVyKG9wdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL+aUtumbhuaJgOaciXNlbGVjdGVk5YC857uE5oiQ5pWw57uE6L+U5ZueXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgICB9LFxuICAgICAgICAnc2VsZWN0OnNldCc6IGZ1bmN0aW9uIHNlbGVjdFNldChub2RlLCB2YWx1ZXMsIG9wdGlvblNldCkge1xuICAgICAgICAgICAgdmFsdWVzID0gW10uY29uY2F0KHZhbHVlcyk7IC8v5by65Yi26L2s5o2i5Li65pWw57uEXG4gICAgICAgICAgICB2YXIgZ2V0dGVyID0gdmFsSG9va3NbJ29wdGlvbjpnZXQnXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBub2RlLm9wdGlvbnNbaSsrXTspIHtcbiAgICAgICAgICAgICAgICBpZiAoZWwuc2VsZWN0ZWQgPSB2YWx1ZXMuaW5kZXhPZihnZXR0ZXIoZWwpKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvblNldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvcHRpb25TZXQpIHtcbiAgICAgICAgICAgICAgICBub2RlLnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhdmFsb24uZm4udmFsID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpc1swXTtcbiAgICAgICAgaWYgKG5vZGUgJiYgbm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgdmFyIGdldCA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDA7XG4gICAgICAgICAgICB2YXIgYWNjZXNzID0gZ2V0ID8gJzpnZXQnIDogJzpzZXQnO1xuICAgICAgICAgICAgdmFyIGZuID0gdmFsSG9va3NbZ2V0RHVwbGV4VHlwZShub2RlKSArIGFjY2Vzc107XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICB2YXIgdmFsID0gZm4obm9kZSwgdmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChnZXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKG5vZGUudmFsdWUgfHwgJycpLnJlcGxhY2UoL1xcci9nLCAnJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5vZGUudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0ID8gdmFsIDogdGhpcztcbiAgICB9O1xuXG4gICAgLyogXG4gICAgICog5bCG6KaB5qOA5rWL55qE5a2X56ym5Liy55qE5a2X56ym5Liy5pu/5o2i5oiQPz8xMjPov5nmoLfnmoTmoLzlvI9cbiAgICAgKi9cbiAgICB2YXIgc3RyaW5nTnVtID0gMDtcbiAgICB2YXIgc3RyaW5nUG9vbCA9IHtcbiAgICAgICAgbWFwOiB7fVxuICAgIH07XG4gICAgdmFyIHJmaWxsID0gL1xcP1xcP1xcZCsvZztcbiAgICBmdW5jdGlvbiBkaWcoYSkge1xuICAgICAgICB2YXIga2V5ID0gJz8/JyArIHN0cmluZ051bSsrO1xuICAgICAgICBzdHJpbmdQb29sLm1hcFtrZXldID0gYTtcbiAgICAgICAgcmV0dXJuIGtleSArICcgJztcbiAgICB9XG4gICAgZnVuY3Rpb24gZmlsbChhKSB7XG4gICAgICAgIHZhciB2YWwgPSBzdHJpbmdQb29sLm1hcFthXTtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xlYXJTdHJpbmcoc3RyKSB7XG4gICAgICAgIHZhciBhcnJheSA9IHJlYWRTdHJpbmcoc3RyKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcnJheS5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKGFycmF5W2ldLCBkaWcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVhZFN0cmluZyhzdHIpIHtcbiAgICAgICAgdmFyIGVuZCxcbiAgICAgICAgICAgIHMgPSAwO1xuICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gc3RyLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgdmFyIGMgPSBzdHIuY2hhckF0KGkpO1xuICAgICAgICAgICAgaWYgKCFlbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAoYyA9PT0gXCInXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gXCInXCI7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gJ1wiJykge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSAnXCInO1xuICAgICAgICAgICAgICAgICAgICBzID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChjID09PSBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0LnB1c2goc3RyLnNsaWNlKHMsIGkgKyAxKSk7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIHZhciB2b2lkVGFnID0ge1xuICAgICAgICBhcmVhOiAxLFxuICAgICAgICBiYXNlOiAxLFxuICAgICAgICBiYXNlZm9udDogMSxcbiAgICAgICAgYmdzb3VuZDogMSxcbiAgICAgICAgYnI6IDEsXG4gICAgICAgIGNvbDogMSxcbiAgICAgICAgY29tbWFuZDogMSxcbiAgICAgICAgZW1iZWQ6IDEsXG4gICAgICAgIGZyYW1lOiAxLFxuICAgICAgICBocjogMSxcbiAgICAgICAgaW1nOiAxLFxuICAgICAgICBpbnB1dDogMSxcbiAgICAgICAga2V5Z2VuOiAxLFxuICAgICAgICBsaW5rOiAxLFxuICAgICAgICBtZXRhOiAxLFxuICAgICAgICBwYXJhbTogMSxcbiAgICAgICAgc291cmNlOiAxLFxuICAgICAgICB0cmFjazogMSxcbiAgICAgICAgd2JyOiAxXG4gICAgfTtcblxuICAgIHZhciBvcnBoYW5UYWcgPSB7XG4gICAgICAgIHNjcmlwdDogMSxcbiAgICAgICAgc3R5bGU6IDEsXG4gICAgICAgIHRleHRhcmVhOiAxLFxuICAgICAgICB4bXA6IDEsXG4gICAgICAgIG5vc2NyaXB0OiAxLFxuICAgICAgICB0ZW1wbGF0ZTogMVxuICAgIH07XG5cbiAgICAvKiBcbiAgICAgKiAg5q2k5qih5Z2X5Y+q55So5LqO5paH5pys6L2s6Jma5oufRE9NLCBcbiAgICAgKiAg5Zug5Li65Zyo55yf5a6e5rWP6KeI5Zmo5Lya5a+55oiR5Lus55qESFRNTOWBmuabtOWkmuWkhOeQhixcbiAgICAgKiAg5aaCLCDmt7vliqDpop3lpJblsZ7mgKcsIOaUueWPmOe7k+aehFxuICAgICAqICDmraTmqKHlnZflsLHmmK/nlKjkuo7mqKHmi5/ov5nkupvooYzkuLpcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBtYWtlT3JwaGFuKG5vZGUsIG5vZGVOYW1lLCBpbm5lckhUTUwpIHtcbiAgICAgICAgc3dpdGNoIChub2RlTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnc3R5bGUnOlxuICAgICAgICAgICAgY2FzZSAnc2NyaXB0JzpcbiAgICAgICAgICAgIGNhc2UgJ25vc2NyaXB0JzpcbiAgICAgICAgICAgIGNhc2UgJ3RlbXBsYXRlJzpcbiAgICAgICAgICAgIGNhc2UgJ3htcCc6XG4gICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbiA9IFt7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiAnI3RleHQnLFxuICAgICAgICAgICAgICAgICAgICBub2RlVmFsdWU6IGlubmVySFRNTFxuICAgICAgICAgICAgICAgIH1dO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGV4dGFyZWEnOlxuICAgICAgICAgICAgICAgIHZhciBwcm9wcyA9IG5vZGUucHJvcHM7XG4gICAgICAgICAgICAgICAgcHJvcHMudHlwZSA9IG5vZGVOYW1lO1xuICAgICAgICAgICAgICAgIHByb3BzLnZhbHVlID0gaW5uZXJIVE1MO1xuICAgICAgICAgICAgICAgIG5vZGUuY2hpbGRyZW4gPSBbe1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogJyN0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVZhbHVlOiBpbm5lckhUTUxcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ29wdGlvbic6XG4gICAgICAgICAgICAgICAgbm9kZS5jaGlsZHJlbiA9IFt7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiAnI3RleHQnLFxuICAgICAgICAgICAgICAgICAgICBub2RlVmFsdWU6IHRyaW1IVE1MKGlubmVySFRNTClcbiAgICAgICAgICAgICAgICB9XTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8v5LiT6Zeo55So5LqO5aSE55CGb3B0aW9u5qCH562+6YeM6Z2i55qE5qCH562+XG4gICAgdmFyIHJ0cmltSFRNTCA9IC88XFx3KyhcXHMrKFwiW15cIl0qXCJ8J1teJ10qJ3xbXj5dKSspPz58PFxcL1xcdys+L2dpO1xuICAgIGZ1bmN0aW9uIHRyaW1IVE1MKHYpIHtcbiAgICAgICAgcmV0dXJuIFN0cmluZyh2KS5yZXBsYWNlKHJ0cmltSFRNTCwgJycpLnRyaW0oKTtcbiAgICB9XG5cbiAgICAvL3dpZGdldCBydWxlIGR1cGxleCB2YWxpZGF0ZVxuXG4gICAgLy/lpoLmnpznm7TmjqXlsIZ0cuWFg+e0oOWGmXRhYmxl5LiL6Z2iLOmCo+S5iOa1j+iniOWZqOWwhuWwhuWug+S7rCjnm7jpgrvnmoTpgqPlh6DkuKopLOaUvuWIsOS4gOS4quWKqOaAgeWIm+W7uueahHRib2R55bqV5LiLXG4gICAgZnVuY3Rpb24gbWFrZVRib2R5KG5vZGVzKSB7XG4gICAgICAgIHZhciB0Ym9keSxcbiAgICAgICAgICAgIG5lZWRBZGRUYm9keSA9IGZhbHNlLFxuICAgICAgICAgICAgY291bnQgPSAwLFxuICAgICAgICAgICAgc3RhcnQgPSAwLFxuICAgICAgICAgICAgbiA9IG5vZGVzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAoIXRib2R5KSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICd0cicpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/mlLbpm4Z0cuWPinRy5Lik5peB55qE5rOo6YeK6IqC54K5XG4gICAgICAgICAgICAgICAgICAgIHRib2R5ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6ICd0Ym9keScsXG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wczoge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHJlbjogW11cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdGJvZHkuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgbmVlZEFkZFRib2R5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJ0ID09PSAwKSBzdGFydCA9IGk7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gdGJvZHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAobm9kZS5ub2RlTmFtZSAhPT0gJ3RyJyAmJiBub2RlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRib2R5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGJvZHkuY2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgICAgICAgY291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNbaV0gPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZWVkQWRkVGJvZHkpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGVzW2ldID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgICAgICBjb3VudC0tO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVET01OZXN0aW5nKHBhcmVudCwgY2hpbGQpIHtcblxuICAgICAgICB2YXIgcGFyZW50VGFnID0gcGFyZW50Lm5vZGVOYW1lO1xuICAgICAgICB2YXIgdGFnID0gY2hpbGQubm9kZU5hbWU7XG4gICAgICAgIHZhciBwYXJlbnRDaGlsZCA9IG5lc3RPYmplY3RbcGFyZW50VGFnXTtcbiAgICAgICAgaWYgKHBhcmVudENoaWxkKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50VGFnID09PSAncCcpIHtcbiAgICAgICAgICAgICAgICBpZiAocE5lc3RDaGlsZFt0YWddKSB7XG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKCdQIGVsZW1lbnQgY2FuIG5vdCAgYWRkIHRoZXNlIGNoaWxkbHJlbjpcXG4nICsgT2JqZWN0LmtleXMocE5lc3RDaGlsZCkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmICghcGFyZW50Q2hpbGRbdGFnXSkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKHBhcmVudFRhZy50b1VwcGVyQ2FzZSgpICsgJ2VsZW1lbnQgb25seSBhZGQgdGhlc2UgY2hpbGRyZW46XFxuJyArIE9iamVjdC5rZXlzKHBhcmVudENoaWxkKSArICdcXG5idXQgeW91IGFkZCAnICsgdGFnLnRvVXBwZXJDYXNlKCkgKyAnICEhJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1ha2VPYmplY3Qoc3RyKSB7XG4gICAgICAgIHJldHVybiBvbmVPYmplY3Qoc3RyICsgJyx0ZW1wbGF0ZSwjZG9jdW1lbnQtZnJhZ21lbnQsI2NvbW1lbnQnKTtcbiAgICB9XG4gICAgdmFyIHBOZXN0Q2hpbGQgPSBvbmVPYmplY3QoJ2Rpdix1bCxvbCxkbCx0YWJsZSxoMSxoMixoMyxoNCxoNSxoNixmb3JtLGZpZWxkc2V0Jyk7XG4gICAgdmFyIHROZXN0Q2hpbGQgPSBtYWtlT2JqZWN0KCd0cixzdHlsZSxzY3JpcHQnKTtcbiAgICB2YXIgbmVzdE9iamVjdCA9IHtcbiAgICAgICAgcDogcE5lc3RDaGlsZCxcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWluc2VsZWN0XG4gICAgICAgIHNlbGVjdDogbWFrZU9iamVjdCgnb3B0aW9uLG9wdGdyb3VwLCN0ZXh0JyksXG4gICAgICAgIG9wdGdyb3VwOiBtYWtlT2JqZWN0KCdvcHRpb24sI3RleHQnKSxcbiAgICAgICAgb3B0aW9uOiBtYWtlT2JqZWN0KCcjdGV4dCcpLFxuICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW50ZFxuICAgICAgICAvLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNwYXJzaW5nLW1haW4taW5jYXB0aW9uXG4gICAgICAgIC8vIE5vIHNwZWNpYWwgYmVoYXZpb3Igc2luY2UgdGhlc2UgcnVsZXMgZmFsbCBiYWNrIHRvIFwiaW4gYm9keVwiIG1vZGUgZm9yXG4gICAgICAgIC8vIGFsbCBleGNlcHQgc3BlY2lhbCB0YWJsZSBub2RlcyB3aGljaCBjYXVzZSBiYWQgcGFyc2luZyBiZWhhdmlvciBhbnl3YXkuXG5cbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWludHJcbiAgICAgICAgdHI6IG1ha2VPYmplY3QoJ3RoLHRkLHN0eWxlLHNjcmlwdCcpLFxuXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbnRib2R5XG4gICAgICAgIHRib2R5OiB0TmVzdENoaWxkLFxuICAgICAgICB0Zm9vdDogdE5lc3RDaGlsZCxcbiAgICAgICAgdGhlYWQ6IHROZXN0Q2hpbGQsXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbmNvbGdyb3VwXG4gICAgICAgIGNvbGdyb3VwOiBtYWtlT2JqZWN0KCdjb2wnKSxcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc3ludGF4Lmh0bWwjcGFyc2luZy1tYWluLWludGFibGVcbiAgICAgICAgLy8gdGFibGU6IG9uZU9iamVjdCgnY2FwdGlvbixjb2xncm91cCx0Ym9keSx0aGVhZCx0Zm9vdCxzdHlsZSxzY3JpcHQsdGVtcGxhdGUsI2RvY3VtZW50LWZyYWdtZW50JyksXG4gICAgICAgIC8vIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL3N5bnRheC5odG1sI3BhcnNpbmctbWFpbi1pbmhlYWRcbiAgICAgICAgaGVhZDogbWFrZU9iamVjdCgnYmFzZSxiYXNlZm9udCxiZ3NvdW5kLGxpbmssc3R5bGUsc2NyaXB0LG1ldGEsdGl0bGUsbm9zY3JpcHQsbm9mcmFtZXMnKSxcbiAgICAgICAgLy8gaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2Uvc2VtYW50aWNzLmh0bWwjdGhlLWh0bWwtZWxlbWVudFxuICAgICAgICBodG1sOiBvbmVPYmplY3QoJ2hlYWQsYm9keScpXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqIGF2YWxvbjIuMS4x55qE5paw5byPbGV4ZXJcbiAgICAgKiDlsIblrZfnrKbkuLLlj5jmiJDkuIDkuKromZrmi59ET03moJEs5pa55L6/5Lul5ZCO6L+b5LiA5q2l5Y+Y5oiQ5qih5p2/5Ye95pWwXG4gICAgICog5q2k6Zi25q615Y+q5Lya55Sf5oiQVkVsZW1lbnQsVlRleHQsVkNvbW1lbnRcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBub21hbFN0cmluZyhzdHIpIHtcbiAgICAgICAgcmV0dXJuIGF2YWxvbi51bmVzY2FwZUhUTUwoc3RyLnJlcGxhY2UocmZpbGwsIGZpbGwpKTtcbiAgICB9XG4gICAgLy9odHRwczovL2dpdGh1Yi5jb20vcnZpc2NvbWkvdHJ1bms4L2Jsb2IvbWFzdGVyL3RydW5rOC5qc1xuXG4gICAgdmFyIHJvcGVuVGFnID0gL148KFstQS1aYS16MC05X10rKVxccyooW14+XSo/KShcXC8/KT4vO1xuICAgIHZhciByZW5kVGFnID0gL148XFwvKFtePl0rKT4vO1xuICAgIHZhciBydGFnU3RhcnQgPSAvW1xcIVxcL2Etel0vaTsgLy/pl63moIfnrb7nmoTnrKzkuIDkuKrlrZfnrKYs5byA5qCH562+55qE56ys5LiA5Liq6Iux5paHLOazqOmHiuiKgueCueeahCFcbiAgICB2YXIgcmxpbmVTcCA9IC9cXFxcblxccyovZztcbiAgICB2YXIgcmF0dHJzID0gLyhbXj1cXHNdKykoPzpcXHMqPVxccyooXFxTKykpPy87XG5cbiAgICB2YXIgcmNvbnRlbnQgPSAvXFxTLzsgLy/liKTlrprph4zpnaLmnInmsqHmnInlhoXlrrlcbiAgICBmdW5jdGlvbiBmcm9tU3RyaW5nKHN0cikge1xuICAgICAgICByZXR1cm4gZnJvbShzdHIpO1xuICAgIH1cbiAgICBhdmFsb24ubGV4ZXIgPSBmcm9tU3RyaW5nO1xuXG4gICAgdmFyIHN0ckNhY2hlID0gbmV3IENhY2hlKDEwMCk7XG5cbiAgICBmdW5jdGlvbiBBU1QoKSB7fVxuICAgIEFTVC5wcm90b3R5cGUgPSB7XG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoc3RyKSB7XG4gICAgICAgICAgICB0aGlzLnJldCA9IFtdO1xuICAgICAgICAgICAgdmFyIHN0YWNrID0gW107XG4gICAgICAgICAgICBzdGFjay5sYXN0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGFja1tzdGFjay5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgICAgICAgICB0aGlzLnN0ciA9IHN0cjtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuOiBmdW5jdGlvbiBnZW4oKSB7XG4gICAgICAgICAgICB2YXIgYnJlYWtJbmRleCA9IDk5OTk5OTtcbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUdlblRleHQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUdlbkNvbW1lbnQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUdlbk9wZW5UYWcoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUdlbkNsb3NlVGFnKCk7XG4gICAgICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlID0gMDtcbiAgICAgICAgICAgICAgICBpZiAoIW5vZGUgfHwgLS1icmVha0luZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobm9kZS5lbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICd0YWJsZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ha2VUYm9keShub2RlLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkZWxldGUgbm9kZS5lbmQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSB3aGlsZSAodGhpcy5zdHIubGVuZ3RoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJldDtcbiAgICAgICAgfSxcblxuICAgICAgICBmaXhQb3M6IGZ1bmN0aW9uIGZpeFBvcyhzdHIsIGkpIHtcbiAgICAgICAgICAgIHZhciB0cnlDb3VudCA9IHN0ci5sZW5ndGggLSBpO1xuICAgICAgICAgICAgd2hpbGUgKHRyeUNvdW50LS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIXJ0YWdTdGFydC50ZXN0KHN0ci5jaGFyQXQoaSArIDEpKSkge1xuICAgICAgICAgICAgICAgICAgICBpID0gc3RyLmluZGV4T2YoJzwnLCBpICsgMSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRyeUNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgaSA9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfSxcbiAgICAgICAgdHJ5R2VuVGV4dDogZnVuY3Rpb24gdHJ5R2VuVGV4dCgpIHtcbiAgICAgICAgICAgIHZhciBzdHIgPSB0aGlzLnN0cjtcbiAgICAgICAgICAgIGlmIChzdHIuY2hhckF0KDApICE9PSAnPCcpIHtcbiAgICAgICAgICAgICAgICAvL+WkhOeQhuaWh+acrOiKgueCuVxuICAgICAgICAgICAgICAgIHZhciBpID0gc3RyLmluZGV4T2YoJzwnKTtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgaSA9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghcnRhZ1N0YXJ0LnRlc3Qoc3RyLmNoYXJBdChpICsgMSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5aSE55CGYOWGheWuuTIge3sgKGlkeDEgPCA8IDwgIDEgPyAncmVkJyA6ICdibHVlJyApICsgYSB9fSBgIOeahOaDheWGtSBcbiAgICAgICAgICAgICAgICAgICAgaSA9IHRoaXMuZml4UG9zKHN0ciwgaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBub2RlVmFsdWUgPSBzdHIuc2xpY2UoMCwgaSkucmVwbGFjZShyZmlsbCwgZmlsbCk7XG4gICAgICAgICAgICAgICAgdGhpcy5zdHIgPSBzdHIuc2xpY2UoaSk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub2RlID0ge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogJyN0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgbm9kZVZhbHVlOiBub2RlVmFsdWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChyY29udGVudC50ZXN0KG5vZGVWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnlHZW5DaGlsZHJlbigpOyAvL+S4jeaUtumbhuepuueZveiKgueCuVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdHJ5R2VuQ29tbWVudDogZnVuY3Rpb24gdHJ5R2VuQ29tbWVudCgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ciA9IHRoaXMuc3RyO1xuICAgICAgICAgICAgICAgIHZhciBpID0gc3RyLmluZGV4T2YoJzwhLS0nKTsgLy/lpITnkIbms6jph4roioLngrlcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYqL1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsID0gc3RyLmluZGV4T2YoJy0tPicpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWxvbi5lcnJvcign5rOo6YeK6IqC54K55rKh5pyJ6Zet5ZCIJyArIHN0cik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVWYWx1ZSA9IHN0ci5zbGljZSg0LCBsKS5yZXBsYWNlKHJmaWxsLCBmaWxsKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHIgPSBzdHIuc2xpY2UobCArIDMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogJyNjb21tZW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogbm9kZVZhbHVlXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJ5R2VuQ2hpbGRyZW4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRyeUdlbk9wZW5UYWc6IGZ1bmN0aW9uIHRyeUdlbk9wZW5UYWcoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubm9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdHIgPSB0aGlzLnN0cjtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBzdHIubWF0Y2gocm9wZW5UYWcpOyAvL+WkhOeQhuWFg+e0oOiKgueCueW8gOWni+mDqOWIhlxuICAgICAgICAgICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZU5hbWUgPSBtYXRjaFsxXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb3BzID0ge307XG4gICAgICAgICAgICAgICAgICAgIGlmICgvXltBLVpdLy50ZXN0KG5vZGVOYW1lKSAmJiBhdmFsb24uY29tcG9uZW50c1tub2RlTmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzLmlzID0gbm9kZU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWUgPSBub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaXNWb2lkVGFnID0gISF2b2lkVGFnW25vZGVOYW1lXSB8fCBtYXRjaFszXSA9PT0gJ1xcLyc7XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6IG5vZGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcHM6IHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgY2hpbGRyZW46IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNWb2lkVGFnOiBpc1ZvaWRUYWdcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0gbWF0Y2hbMl07XG4gICAgICAgICAgICAgICAgICAgIGlmIChhdHRycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZW5Qcm9wcyhhdHRycywgbm9kZS5wcm9wcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cnlHZW5DaGlsZHJlbigpO1xuICAgICAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzVm9pZFRhZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9kZS5lbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFjay5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9ycGhhblRhZ1tub2RlTmFtZV0gfHwgbm9kZU5hbWUgPT09ICdvcHRpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGluZGV4ID0gc3RyLmluZGV4T2YoJzwvJyArIG5vZGVOYW1lICsgJz4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgaW5uZXJIVE1MID0gc3RyLnNsaWNlKDAsIGluZGV4KS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKGluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYWtlT3JwaGFuKG5vZGUsIG5vZGVOYW1lLCBub21hbFN0cmluZyhpbm5lckhUTUwpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0ciA9IHN0cjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRyeUdlbkNsb3NlVGFnOiBmdW5jdGlvbiB0cnlHZW5DbG9zZVRhZygpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ub2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ciA9IHRoaXMuc3RyO1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaCA9IHN0ci5tYXRjaChyZW5kVGFnKTsgLy/lpITnkIblhYPntKDoioLngrnnu5PmnZ/pg6jliIZcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGVOYW1lID0gbWF0Y2hbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3QgPSB0aGlzLnN0YWNrLmxhc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFsYXN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFsb24uZXJyb3IobWF0Y2hbMF0gKyAn5YmN6Z2i57y65bCRPCcgKyBub2RlTmFtZSArICc+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSovXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobGFzdC5ub2RlTmFtZSAhPT0gbm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlcnJNc2cgPSBsYXN0Lm5vZGVOYW1lICsgJ+ayoeaciemXreWQiCzor7fms6jmhI/lsZ7mgKfnmoTlvJXlj7cnO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oZXJyTXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF2YWxvbi5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5zdGFjay5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5lbmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5vZGUgPSBub2RlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0ciA9IHN0ci5zbGljZShtYXRjaFswXS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdHJ5R2VuQ2hpbGRyZW46IGZ1bmN0aW9uIHRyeUdlbkNoaWxkcmVuKCkge1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB2YXIgcCA9IHRoaXMuc3RhY2subGFzdCgpO1xuICAgICAgICAgICAgaWYgKHApIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0ZURPTU5lc3RpbmcocCwgbm9kZSk7XG4gICAgICAgICAgICAgICAgcC5jaGlsZHJlbi5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJldC5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBnZW5Qcm9wczogZnVuY3Rpb24gZ2VuUHJvcHMoYXR0cnMsIHByb3BzKSB7XG5cbiAgICAgICAgICAgIHdoaWxlIChhdHRycykge1xuICAgICAgICAgICAgICAgIHZhciBhcnIgPSByYXR0cnMuZXhlYyhhdHRycyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gYXJyWzFdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSBhcnJbMl0gfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGF0dHJzID0gYXR0cnMucmVwbGFjZShhcnJbMF0sICcnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvL2h0dHBzOi8vZ2l0aHViLmNvbS9SdWJ5TG91dnJlL2F2YWxvbi9pc3N1ZXMvMTg0NFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YoJz8/JykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IG5vbWFsU3RyaW5nKHZhbHVlKS5yZXBsYWNlKHJsaW5lU3AsICcnKS5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCEobmFtZSBpbiBwcm9wcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzW25hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHZkb21Bc3QgPSBuZXcgQVNUKCk7XG5cbiAgICBmdW5jdGlvbiBmcm9tKHN0cikge1xuICAgICAgICB2YXIgY2FjaGVLZXkgPSBzdHI7XG4gICAgICAgIHZhciBjYWNoZWQgPSBzdHJDYWNoZS5nZXQoY2FjaGVLZXkpO1xuICAgICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYXZhbG9uLm1peCh0cnVlLCBbXSwgY2FjaGVkKTtcbiAgICAgICAgfVxuICAgICAgICBzdHJpbmdQb29sLm1hcCA9IHt9O1xuICAgICAgICBzdHIgPSBjbGVhclN0cmluZyhzdHIpO1xuXG4gICAgICAgIHZkb21Bc3QuaW5pdChzdHIpO1xuICAgICAgICB2YXIgcmV0ID0gdmRvbUFzdC5nZW4oKTtcbiAgICAgICAgc3RyQ2FjaGUucHV0KGNhY2hlS2V5LCBhdmFsb24ubWl4KHRydWUsIFtdLCByZXQpKTtcbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICB2YXIgcmh0bWwgPSAvPHwmIz9cXHcrOy87XG4gICAgdmFyIGh0bWxDYWNoZSA9IG5ldyBDYWNoZSgxMjgpO1xuICAgIHZhciByeGh0bWwgPSAvPCg/IWFyZWF8YnJ8Y29sfGVtYmVkfGhyfGltZ3xpbnB1dHxsaW5rfG1ldGF8cGFyYW0pKChbXFx3Ol0rKVtePl0qKVxcLz4vaWc7XG5cbiAgICBhdmFsb24ucGFyc2VIVE1MID0gZnVuY3Rpb24gKGh0bWwpIHtcbiAgICAgICAgdmFyIGZyYWdtZW50ID0gY3JlYXRlRnJhZ21lbnQoKTtcbiAgICAgICAgLy/lpITnkIbpnZ7lrZfnrKbkuLJcbiAgICAgICAgaWYgKHR5cGVvZiBodG1sICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgICAgICB9XG4gICAgICAgIC8v5aSE55CG6Z2eSFRNTOWtl+espuS4slxuICAgICAgICBpZiAoIXJodG1sLnRlc3QoaHRtbCkpIHtcbiAgICAgICAgICAgIHJldHVybiBkb2N1bWVudCQxLmNyZWF0ZVRleHROb2RlKGh0bWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgaHRtbCA9IGh0bWwucmVwbGFjZShyeGh0bWwsICc8JDE+PC8kMj4nKS50cmltKCk7XG4gICAgICAgIHZhciBoYXNDYWNoZSA9IGh0bWxDYWNoZS5nZXQoaHRtbCk7XG4gICAgICAgIGlmIChoYXNDYWNoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGF2YWxvbi5jbG9uZU5vZGUoaGFzQ2FjaGUpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2bm9kZXMgPSBmcm9tU3RyaW5nKGh0bWwpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gdm5vZGVzW2krK107KSB7XG4gICAgICAgICAgICB2YXIgY2hpbGQgPSBhdmFsb24udmRvbShlbCwgJ3RvRE9NJyk7XG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGh0bWwubGVuZ3RoIDwgMTAyNCkge1xuICAgICAgICAgICAgaHRtbENhY2hlLnB1dChodG1sLCBmcmFnbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZyYWdtZW50O1xuICAgIH07XG5cbiAgICBhdmFsb24uaW5uZXJIVE1MID0gZnVuY3Rpb24gKG5vZGUsIGh0bWwpIHtcbiAgICAgICAgdmFyIHBhcnNlZCA9IGF2YWxvbi5wYXJzZUhUTUwoaHRtbCk7XG4gICAgICAgIHRoaXMuY2xlYXJIVE1MKG5vZGUpO1xuICAgICAgICBub2RlLmFwcGVuZENoaWxkKHBhcnNlZCk7XG4gICAgfTtcblxuICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2thcmxvZXNwaXJpdHUvZXNjYXBlaHRtbGVudC9ibG9iL21hc3Rlci9pbmRleC5qc1xuICAgIGF2YWxvbi51bmVzY2FwZUhUTUwgPSBmdW5jdGlvbiAoaHRtbCkge1xuICAgICAgICByZXR1cm4gU3RyaW5nKGh0bWwpLnJlcGxhY2UoLyZxdW90Oy9nLCAnXCInKS5yZXBsYWNlKC8mIzM5Oy9nLCAnXFwnJykucmVwbGFjZSgvJmx0Oy9nLCAnPCcpLnJlcGxhY2UoLyZndDsvZywgJz4nKS5yZXBsYWNlKC8mYW1wOy9nLCAnJicpO1xuICAgIH07XG5cbiAgICBhdmFsb24uY2xlYXJIVE1MID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgd2hpbGUgKG5vZGUubGFzdENoaWxkKSB7XG4gICAgICAgICAgICBub2RlLnJlbW92ZUNoaWxkKG5vZGUubGFzdENoaWxkKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICB9O1xuXG4gICAgLy9odHRwOi8vd3d3LmZlaWVzb2Z0LmNvbS9odG1sL2V2ZW50cy5odG1sXG4gICAgLy9odHRwOi8vc2VnbWVudGZhdWx0LmNvbS9xLzEwMTAwMDAwMDA2ODc5NzcvYS0xMDIwMDAwMDAwNjg4NzU3XG4gICAgdmFyIGNhbkJ1YmJsZVVwID0ge1xuICAgICAgICBjbGljazogdHJ1ZSxcbiAgICAgICAgZGJsY2xpY2s6IHRydWUsXG4gICAgICAgIGtleWRvd246IHRydWUsXG4gICAgICAgIGtleXByZXNzOiB0cnVlLFxuICAgICAgICBrZXl1cDogdHJ1ZSxcbiAgICAgICAgbW91c2Vkb3duOiB0cnVlLFxuICAgICAgICBtb3VzZW1vdmU6IHRydWUsXG4gICAgICAgIG1vdXNldXA6IHRydWUsXG4gICAgICAgIG1vdXNlb3ZlcjogdHJ1ZSxcbiAgICAgICAgbW91c2VvdXQ6IHRydWUsXG4gICAgICAgIHdoZWVsOiB0cnVlLFxuICAgICAgICBtb3VzZXdoZWVsOiB0cnVlLFxuICAgICAgICBpbnB1dDogdHJ1ZSxcbiAgICAgICAgY2hhbmdlOiB0cnVlLFxuICAgICAgICBiZWZvcmVpbnB1dDogdHJ1ZSxcbiAgICAgICAgY29tcG9zaXRpb25zdGFydDogdHJ1ZSxcbiAgICAgICAgY29tcG9zaXRpb251cGRhdGU6IHRydWUsXG4gICAgICAgIGNvbXBvc2l0aW9uZW5kOiB0cnVlLFxuICAgICAgICBzZWxlY3Q6IHRydWUsXG4gICAgICAgIC8vaHR0cDovL2Jsb2cuY3Nkbi5uZXQvbGVlX21hZ251bS9hcnRpY2xlL2RldGFpbHMvMTc3NjE0NDFcbiAgICAgICAgY3V0OiB0cnVlLFxuICAgICAgICBjb3B5OiB0cnVlLFxuICAgICAgICBwYXN0ZTogdHJ1ZSxcbiAgICAgICAgYmVmb3JlY3V0OiB0cnVlLFxuICAgICAgICBiZWZvcmVjb3B5OiB0cnVlLFxuICAgICAgICBiZWZvcmVwYXN0ZTogdHJ1ZSxcbiAgICAgICAgZm9jdXNpbjogdHJ1ZSxcbiAgICAgICAgZm9jdXNvdXQ6IHRydWUsXG4gICAgICAgIERPTUZvY3VzSW46IHRydWUsXG4gICAgICAgIERPTUZvY3VzT3V0OiB0cnVlLFxuICAgICAgICBET01BY3RpdmF0ZTogdHJ1ZSxcbiAgICAgICAgZHJhZ2VuZDogdHJ1ZSxcbiAgICAgICAgZGF0YXNldGNoYW5nZWQ6IHRydWVcbiAgICB9O1xuXG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgdmFyIGhhY2tTYWZhcmkgPSBhdmFsb24ubW9kZXJuICYmIGRvY3VtZW50JDEub250b3VjaHN0YXJ0O1xuXG4gICAgLy/mt7vliqBmbi5iaW5kLCBmbi51bmJpbmQsIGJpbmQsIHVuYmluZFxuICAgIGF2YWxvbi5mbi5iaW5kID0gZnVuY3Rpb24gKHR5cGUsIGZuLCBwaGFzZSkge1xuICAgICAgICBpZiAodGhpc1swXSkge1xuICAgICAgICAgICAgLy/mraTmlrnms5XkuI3kvJrpk75cbiAgICAgICAgICAgIHJldHVybiBhdmFsb24uYmluZCh0aGlzWzBdLCB0eXBlLCBmbiwgcGhhc2UpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGF2YWxvbi5mbi51bmJpbmQgPSBmdW5jdGlvbiAodHlwZSwgZm4sIHBoYXNlKSB7XG4gICAgICAgIGlmICh0aGlzWzBdKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IF9zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBhcmdzLnVuc2hpZnQodGhpc1swXSk7XG4gICAgICAgICAgICBhdmFsb24udW5iaW5kLmFwcGx5KDAsIGFyZ3MpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICAvKue7keWumuS6i+S7tiovXG4gICAgYXZhbG9uLmJpbmQgPSBmdW5jdGlvbiAoZWxlbSwgdHlwZSwgZm4pIHtcbiAgICAgICAgaWYgKGVsZW0ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGVsZW0uZ2V0QXR0cmlidXRlKCdhdmFsb24tZXZlbnRzJykgfHwgJyc7XG4gICAgICAgICAgICAvL+WmguaenOaYr+S9v+eUqG1zLW9uLSrnu5HlrprnmoTlm57osIMs5YW2dXVpZOagvOW8j+S4umUxMjEyMjMyNCxcbiAgICAgICAgICAgIC8v5aaC5p6c5piv5L2/55SoYmluZOaWueazlee7keWumueahOWbnuiwgyzlhbZ1dWlk5qC85byP5Li6XzEyXG4gICAgICAgICAgICB2YXIgdXVpZCA9IGdldFNob3J0SUQoZm4pO1xuICAgICAgICAgICAgdmFyIGhvb2sgPSBldmVudEhvb2tzW3R5cGVdO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2NsaWNrJyAmJiBoYWNrU2FmYXJpKSB7XG4gICAgICAgICAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGF2YWxvbi5ub29wKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGhvb2spIHtcbiAgICAgICAgICAgICAgICB0eXBlID0gaG9vay50eXBlIHx8IHR5cGU7XG4gICAgICAgICAgICAgICAgaWYgKGhvb2suZml4KSB7XG4gICAgICAgICAgICAgICAgICAgIGZuID0gaG9vay5maXgoZWxlbSwgZm4pO1xuICAgICAgICAgICAgICAgICAgICBmbi51dWlkID0gdXVpZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIga2V5ID0gdHlwZSArICc6JyArIHV1aWQ7XG4gICAgICAgICAgICBhdmFsb24uZXZlbnRMaXN0ZW5lcnNbZm4udXVpZF0gPSBmbjtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKHZhbHVlLmluZGV4T2YodHlwZSArICc6JykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy/lkIzkuIDnp43kuovku7blj6rnu5HlrprkuIDmrKFcbiAgICAgICAgICAgICAgICBpZiAoY2FuQnViYmxlVXBbdHlwZV0gfHwgYXZhbG9uLm1vZGVybiAmJiBmb2N1c0JsdXJbdHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZWdhdGVFdmVudCh0eXBlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24uX25hdGl2ZUJpbmQoZWxlbSwgdHlwZSwgZGlzcGF0Y2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBrZXlzID0gdmFsdWUuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGtleXNbMF0gPT09ICcnKSB7XG4gICAgICAgICAgICAgICAga2V5cy5zaGlmdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleXMuaW5kZXhPZihrZXkpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICAgICAgICAgIHNldEV2ZW50SWQoZWxlbSwga2V5cy5qb2luKCcsJykpO1xuICAgICAgICAgICAgICAgIC8v5bCG5Luk54mM5pS+6L+bYXZhbG9uLWV2ZW50c+WxnuaAp+S4rVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgIHZhciBjYiA9IGZ1bmN0aW9uIGNiKGUpIHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKGVsZW0sIG5ldyBhdkV2ZW50KGUpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGF2YWxvbi5fbmF0aXZlQmluZChlbGVtLCB0eXBlLCBjYik7XG4gICAgICAgICAgICByZXR1cm4gY2I7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2V0RXZlbnRJZChub2RlLCB2YWx1ZSkge1xuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZSgnYXZhbG9uLWV2ZW50cycsIHZhbHVlKTtcbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBhdmFsb24udW5iaW5kID0gZnVuY3Rpb24gKGVsZW0sIHR5cGUsIGZuKSB7XG4gICAgICAgIGlmIChlbGVtLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBlbGVtLmdldEF0dHJpYnV0ZSgnYXZhbG9uLWV2ZW50cycpIHx8ICcnO1xuICAgICAgICAgICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBhdmFsb24uX25hdGl2ZVVuQmluZChlbGVtLCB0eXBlLCBkaXNwYXRjaCk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW0ucmVtb3ZlQXR0cmlidXRlKCdhdmFsb24tZXZlbnRzJyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdCgnLCcpLmZpbHRlcihmdW5jdGlvbiAoc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyLmluZGV4T2YodHlwZSArICc6JykgPT09IC0xO1xuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIHNldEV2ZW50SWQoZWxlbSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICB2YXIgc2VhcmNoID0gdHlwZSArICc6JyArIGZuLnV1aWQ7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoJywnKS5maWx0ZXIoZnVuY3Rpb24gKHN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0ciAhPT0gc2VhcmNoO1xuICAgICAgICAgICAgICAgICAgICB9KS5qb2luKCcsJyk7XG4gICAgICAgICAgICAgICAgICAgIHNldEV2ZW50SWQoZWxlbSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXZhbG9uLmV2ZW50TGlzdGVuZXJzW2ZuLnV1aWRdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF2YWxvbi5fbmF0aXZlVW5CaW5kKGVsZW0sIHR5cGUsIGZuKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgdHlwZVJlZ0V4cCA9IHt9O1xuXG4gICAgZnVuY3Rpb24gY29sbGVjdEhhbmRsZXJzKGVsZW0sIHR5cGUsIGhhbmRsZXJzKSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGVsZW0uZ2V0QXR0cmlidXRlKCdhdmFsb24tZXZlbnRzJyk7XG4gICAgICAgIGlmICh2YWx1ZSAmJiAoZWxlbS5kaXNhYmxlZCAhPT0gdHJ1ZSB8fCB0eXBlICE9PSAnY2xpY2snKSkge1xuICAgICAgICAgICAgdmFyIHV1aWRzID0gW107XG4gICAgICAgICAgICB2YXIgcmVnID0gdHlwZVJlZ0V4cFt0eXBlXSB8fCAodHlwZVJlZ0V4cFt0eXBlXSA9IG5ldyBSZWdFeHAoXCJcXFxcYlwiICsgdHlwZSArICdcXFxcOihbXixcXFxcc10rKScsICdnJykpO1xuICAgICAgICAgICAgdmFsdWUucmVwbGFjZShyZWcsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgdXVpZHMucHVzaChiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHV1aWRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBlbGVtOiBlbGVtLFxuICAgICAgICAgICAgICAgICAgICB1dWlkczogdXVpZHNcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgICAgICB2YXIgZyA9IGF2YWxvbi5nZXN0dXJlRXZlbnRzIHx8IHt9O1xuICAgICAgICBpZiAoZWxlbSAmJiBlbGVtLmdldEF0dHJpYnV0ZSAmJiAoY2FuQnViYmxlVXBbdHlwZV0gfHwgZ1t0eXBlXSkpIHtcbiAgICAgICAgICAgIGNvbGxlY3RIYW5kbGVycyhlbGVtLCB0eXBlLCBoYW5kbGVycyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmhhbmRsZUhhc1ZtID0gL15lLztcblxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50ID0gbmV3IGF2RXZlbnQoZXZlbnQpO1xuICAgICAgICB2YXIgdHlwZSA9IGV2ZW50LnR5cGU7XG4gICAgICAgIHZhciBlbGVtID0gZXZlbnQudGFyZ2V0O1xuICAgICAgICB2YXIgaGFuZGxlcnMgPSBbXTtcbiAgICAgICAgY29sbGVjdEhhbmRsZXJzKGVsZW0sIHR5cGUsIGhhbmRsZXJzKTtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgaixcbiAgICAgICAgICAgIHV1aWQsXG4gICAgICAgICAgICBoYW5kbGVyO1xuICAgICAgICB3aGlsZSAoKGhhbmRsZXIgPSBoYW5kbGVyc1tpKytdKSAmJiAhZXZlbnQuY2FuY2VsQnViYmxlKSB7XG4gICAgICAgICAgICB2YXIgaG9zdCA9IGV2ZW50LmN1cnJlbnRUYXJnZXQgPSBoYW5kbGVyLmVsZW07XG4gICAgICAgICAgICBqID0gMDtcbiAgICAgICAgICAgIHdoaWxlICh1dWlkID0gaGFuZGxlci51dWlkc1tqKytdKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnN0b3BJbW1lZGlhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBmbiA9IGF2YWxvbi5ldmVudExpc3RlbmVyc1t1dWlkXTtcbiAgICAgICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZtID0gcmhhbmRsZUhhc1ZtLnRlc3QodXVpZCkgPyBoYW5kbGVyLmVsZW0uX21zX2NvbnRleHRfIDogMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZtICYmIHZtLiRoYXNoY29kZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBhdmFsb24udW5iaW5kKGVsZW0sIHR5cGUsIGZuKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgcmV0ID0gZm4uY2FsbCh2bSB8fCBlbGVtLCBldmVudCk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBmb2N1c0JsdXIgPSB7XG4gICAgICAgIGZvY3VzOiB0cnVlLFxuICAgICAgICBibHVyOiB0cnVlXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGRlbGVnYXRlRXZlbnQodHlwZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSByb290LmdldEF0dHJpYnV0ZSgnZGVsZWdhdGUtZXZlbnRzJykgfHwgJyc7XG4gICAgICAgIGlmICh2YWx1ZS5pbmRleE9mKHR5cGUpID09PSAtMSkge1xuICAgICAgICAgICAgLy9JRTYtOOS8muWkmuasoee7keWumuWQjOenjeexu+Wei+eahOWQjOS4gOS4quWHveaVsCzlhbbku5bmuLjop4jlmajkuI3kvJpcbiAgICAgICAgICAgIHZhciBhcnIgPSB2YWx1ZS5tYXRjaChhdmFsb24ucndvcmQpIHx8IFtdO1xuICAgICAgICAgICAgYXJyLnB1c2godHlwZSk7XG4gICAgICAgICAgICByb290LnNldEF0dHJpYnV0ZSgnZGVsZWdhdGUtZXZlbnRzJywgYXJyLmpvaW4oJywnKSk7XG4gICAgICAgICAgICBhdmFsb24uX25hdGl2ZUJpbmQocm9vdCwgdHlwZSwgZGlzcGF0Y2gsICEhZm9jdXNCbHVyW3R5cGVdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBldmVudFByb3RvID0ge1xuICAgICAgICB3ZWJraXRNb3ZlbWVudFk6IDEsXG4gICAgICAgIHdlYmtpdE1vdmVtZW50WDogMSxcbiAgICAgICAga2V5TG9jYXRpb246IDEsXG4gICAgICAgIGZpeEV2ZW50OiBmdW5jdGlvbiBmaXhFdmVudCgpIHt9LFxuICAgICAgICBwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24gcHJldmVudERlZmF1bHQoKSB7XG4gICAgICAgICAgICB2YXIgZSA9IHRoaXMub3JpZ2luYWxFdmVudCB8fCB7fTtcbiAgICAgICAgICAgIGUucmV0dXJuVmFsdWUgPSB0aGlzLnJldHVyblZhbHVlID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAobW9kZXJuICYmIGUucHJldmVudERlZmF1bHQpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHN0b3BQcm9wYWdhdGlvbjogZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGUgPSB0aGlzLm9yaWdpbmFsRXZlbnQgfHwge307XG4gICAgICAgICAgICBlLmNhbmNlbEJ1YmJsZSA9IHRoaXMuY2FuY2VsQnViYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChtb2Rlcm4gJiYgZS5zdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb246IGZ1bmN0aW9uIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB0aGlzLnN0b3BJbW1lZGlhdGUgPSB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICByZXR1cm4gJ1tvYmplY3QgRXZlbnRdJzsgLy8jMTYxOVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGF2RXZlbnQoZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50Lm9yaWdpbmFsRXZlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpIGluIGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoIWV2ZW50UHJvdG9baV0pIHtcbiAgICAgICAgICAgICAgICB0aGlzW2ldID0gZXZlbnRbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy50YXJnZXQgPSBldmVudC5zcmNFbGVtZW50O1xuICAgICAgICB9XG4gICAgICAgIHZhciB0YXJnZXQgPSB0aGlzLnRhcmdldDtcbiAgICAgICAgdGhpcy5maXhFdmVudCgpO1xuICAgICAgICB0aGlzLnRpbWVTdGFtcCA9IG5ldyBEYXRlKCkgLSAwO1xuICAgICAgICB0aGlzLm9yaWdpbmFsRXZlbnQgPSBldmVudDtcbiAgICB9XG4gICAgYXZFdmVudC5wcm90b3R5cGUgPSBldmVudFByb3RvO1xuICAgIC8v6ZKI5a+5ZmlyZWZveCwgY2hyb21l5L+u5q2jbW91c2VlbnRlciwgbW91c2VsZWF2ZVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghKCdvbm1vdXNlZW50ZXInIGluIHJvb3QpKSB7XG4gICAgICAgIGF2YWxvbi5lYWNoKHtcbiAgICAgICAgICAgIG1vdXNlZW50ZXI6ICdtb3VzZW92ZXInLFxuICAgICAgICAgICAgbW91c2VsZWF2ZTogJ21vdXNlb3V0J1xuICAgICAgICB9LCBmdW5jdGlvbiAob3JpZ1R5cGUsIGZpeFR5cGUpIHtcbiAgICAgICAgICAgIGV2ZW50SG9va3Nbb3JpZ1R5cGVdID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IGZpeFR5cGUsXG4gICAgICAgICAgICAgICAgZml4OiBmdW5jdGlvbiBmaXgoZWxlbSwgZm4pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdCA9IGUucmVsYXRlZFRhcmdldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdCB8fCB0ICE9PSBlbGVtICYmICEoZWxlbS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbih0KSAmIDE2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBlLnR5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50eXBlID0gb3JpZ1R5cGU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8v6ZKI5a+5SUU5KywgdzNj5L+u5q2jYW5pbWF0aW9uZW5kXG4gICAgYXZhbG9uLmVhY2goe1xuICAgICAgICBBbmltYXRpb25FdmVudDogJ2FuaW1hdGlvbmVuZCcsXG4gICAgICAgIFdlYktpdEFuaW1hdGlvbkV2ZW50OiAnd2Via2l0QW5pbWF0aW9uRW5kJ1xuICAgIH0sIGZ1bmN0aW9uIChjb25zdHJ1Y3QsIGZpeFR5cGUpIHtcbiAgICAgICAgaWYgKHdpbmRvdyQxW2NvbnN0cnVjdF0gJiYgIWV2ZW50SG9va3MuYW5pbWF0aW9uZW5kKSB7XG4gICAgICAgICAgICBldmVudEhvb2tzLmFuaW1hdGlvbmVuZCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBmaXhUeXBlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIShcIm9ubW91c2V3aGVlbFwiIGluIGRvY3VtZW50JDEpKSB7XG4gICAgICAgIC8qIElFNi0xMSBjaHJvbWUgbW91c2V3aGVlbCB3aGVlbERldGxhIOS4iyAtMTIwIOS4iiAxMjBcbiAgICAgICAgIGZpcmVmb3ggRE9NTW91c2VTY3JvbGwgZGV0YWlsIOS4izMg5LiKLTNcbiAgICAgICAgIGZpcmVmb3ggd2hlZWwgZGV0bGFZIOS4izMg5LiKLTNcbiAgICAgICAgIElFOS0xMSB3aGVlbCBkZWx0YVkg5LiLNDAg5LiKLTQwXG4gICAgICAgICBjaHJvbWUgd2hlZWwgZGVsdGFZIOS4izEwMCDkuIotMTAwICovXG4gICAgICAgIHZhciBmaXhXaGVlbFR5cGUgPSBkb2N1bWVudCQxLm9ud2hlZWwgIT09IHZvaWQgMCA/ICd3aGVlbCcgOiAnRE9NTW91c2VTY3JvbGwnO1xuICAgICAgICB2YXIgZml4V2hlZWxEZWx0YSA9IGZpeFdoZWVsVHlwZSA9PT0gJ3doZWVsJyA/ICdkZWx0YVknIDogJ2RldGFpbCc7XG4gICAgICAgIGV2ZW50SG9va3MubW91c2V3aGVlbCA9IHtcbiAgICAgICAgICAgIHR5cGU6IGZpeFdoZWVsVHlwZSxcbiAgICAgICAgICAgIGZpeDogZnVuY3Rpb24gZml4KGVsZW0sIGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkZWx0YSA9IGVbZml4V2hlZWxEZWx0YV0gPiAwID8gLTEyMCA6IDEyMDtcbiAgICAgICAgICAgICAgICAgICAgZS53aGVlbERlbHRhID0gfn5lbGVtLl9tc193aGVlbF8gKyBkZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5fbXNfd2hlZWxfID0gZS53aGVlbERlbHRhWSA9IGUud2hlZWxEZWx0YTtcbiAgICAgICAgICAgICAgICAgICAgZS53aGVlbERlbHRhWCA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGlmIChPYmplY3QuZGVmaW5lUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLCAndHlwZScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogJ21vdXNld2hlZWwnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghbW9kZXJuKSB7XG4gICAgICAgIGRlbGV0ZSBjYW5CdWJibGVVcC5jaGFuZ2U7XG4gICAgICAgIGRlbGV0ZSBjYW5CdWJibGVVcC5zZWxlY3Q7XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgYXZhbG9uLl9uYXRpdmVCaW5kID0gbW9kZXJuID8gZnVuY3Rpb24gKGVsLCB0eXBlLCBmbiwgY2FwdHVyZSkge1xuICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGZuLCAhIWNhcHR1cmUpO1xuICAgIH0gOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGZuKSB7XG4gICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmbik7XG4gICAgfTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5fbmF0aXZlVW5CaW5kID0gbW9kZXJuID8gZnVuY3Rpb24gKGVsLCB0eXBlLCBmbiwgYSkge1xuICAgICAgICBlbC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGZuLCAhIWEpO1xuICAgIH0gOiBmdW5jdGlvbiAoZWwsIHR5cGUsIGZuKSB7XG4gICAgICAgIGVsLmRldGFjaEV2ZW50KCdvbicgKyB0eXBlLCBmbik7XG4gICAgfTtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2YWxvbi5maXJlRG9tID0gZnVuY3Rpb24gKGVsZW0sIHR5cGUsIG9wdHMpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50JDEuY3JlYXRlRXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBoYWNrRXZlbnQgPSBkb2N1bWVudCQxLmNyZWF0ZUV2ZW50KCdFdmVudHMnKTtcbiAgICAgICAgICAgIGhhY2tFdmVudC5pbml0RXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgb3B0cyk7XG4gICAgICAgICAgICBhdmFsb24uc2hhZG93Q29weShoYWNrRXZlbnQsIG9wdHMpO1xuICAgICAgICAgICAgZWxlbS5kaXNwYXRjaEV2ZW50KGhhY2tFdmVudCk7XG4gICAgICAgIH0gZWxzZSBpZiAocm9vdC5jb250YWlucyhlbGVtKSkge1xuICAgICAgICAgICAgLy9JRTYtOOinpuWPkeS6i+S7tuW/hemhu+S/neivgeWcqERPTeagkeS4rSzlkKbliJnmiqUnU0NSSVBUMTYzODk6IOacquaMh+aYjueahOmUmeivrydcbiAgICAgICAgICAgIGhhY2tFdmVudCA9IGRvY3VtZW50JDEuY3JlYXRlRXZlbnRPYmplY3QoKTtcbiAgICAgICAgICAgIGlmIChvcHRzKSBhdmFsb24uc2hhZG93Q29weShoYWNrRXZlbnQsIG9wdHMpO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBlbGVtLmZpcmVFdmVudCgnb24nICsgdHlwZSwgaGFja0V2ZW50KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24ubG9nKCdmaXJlRG9tJywgdHlwZSwgJ2FyZ3MgZXJyb3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcm1vdXNlRXZlbnQgPSAvXig/Om1vdXNlfGNvbnRleHRtZW51fGRyYWcpfGNsaWNrLztcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGF2RXZlbnQucHJvdG90eXBlLmZpeEV2ZW50ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZXZlbnQgPSB0aGlzO1xuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT0gbnVsbCAmJiBldmVudC50eXBlLmluZGV4T2YoJ2tleScpID09PSAwKSB7XG4gICAgICAgICAgICBldmVudC53aGljaCA9IGV2ZW50LmNoYXJDb2RlICE9IG51bGwgPyBldmVudC5jaGFyQ29kZSA6IGV2ZW50LmtleUNvZGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJtb3VzZUV2ZW50LnRlc3QoZXZlbnQudHlwZSkgJiYgISgncGFnZVgnIGluIGV2ZW50KSkge1xuICAgICAgICAgICAgdmFyIERPQyA9IGV2ZW50LnRhcmdldC5vd25lckRvY3VtZW50IHx8IGRvY3VtZW50JDE7XG4gICAgICAgICAgICB2YXIgYm94ID0gRE9DLmNvbXBhdE1vZGUgPT09ICdCYWNrQ29tcGF0JyA/IERPQy5ib2R5IDogRE9DLmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgICAgIGV2ZW50LnBhZ2VYID0gZXZlbnQuY2xpZW50WCArIChib3guc2Nyb2xsTGVmdCA+PiAwKSAtIChib3guY2xpZW50TGVmdCA+PiAwKTtcbiAgICAgICAgICAgIGV2ZW50LnBhZ2VZID0gZXZlbnQuY2xpZW50WSArIChib3guc2Nyb2xsVG9wID4+IDApIC0gKGJveC5jbGllbnRUb3AgPj4gMCk7XG4gICAgICAgICAgICBldmVudC53aGVlbERlbHRhWSA9IH5+ZXZlbnQud2hlZWxEZWx0YTtcbiAgICAgICAgICAgIGV2ZW50LndoZWVsRGVsdGFYID0gMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL+mSiOWvuUlFNi045L+u5q2jaW5wdXRcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoISgnb25pbnB1dCcgaW4gZG9jdW1lbnQkMS5jcmVhdGVFbGVtZW50KCdpbnB1dCcpKSkge1xuICAgICAgICBldmVudEhvb2tzLmlucHV0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ3Byb3BlcnR5Y2hhbmdlJyxcbiAgICAgICAgICAgIGZpeDogZnVuY3Rpb24gZml4KGVsZW0sIGZuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlLnByb3BlcnR5TmFtZSA9PT0gJ3ZhbHVlJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50eXBlID0gJ2lucHV0JztcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgcmVhZHlMaXN0ID0gW107XG5cbiAgICBmdW5jdGlvbiBmaXJlUmVhZHkoZm4pIHtcbiAgICAgICAgYXZhbG9uLmlzUmVhZHkgPSB0cnVlO1xuICAgICAgICB3aGlsZSAoZm4gPSByZWFkeUxpc3Quc2hpZnQoKSkge1xuICAgICAgICAgICAgZm4oYXZhbG9uKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGF2YWxvbi5yZWFkeSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZWFkeUxpc3QucHVzaChmbik7XG4gICAgICAgIGlmIChhdmFsb24uaXNSZWFkeSkge1xuICAgICAgICAgICAgZmlyZVJlYWR5KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXZhbG9uLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXZhbG9uLnNjYW4gJiYgYXZhbG9uLnNjYW4oZG9jdW1lbnQkMS5ib2R5KTtcbiAgICB9KTtcblxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gYm9vdHN0cmFwKCkge1xuICAgICAgICBmdW5jdGlvbiBkb1Njcm9sbENoZWNrKCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvL0lF5LiL6YCa6L+HZG9TY3JvbGxDaGVja+ajgOa1i0RPTeagkeaYr+WQpuW7uuWujFxuICAgICAgICAgICAgICAgIHJvb3QuZG9TY3JvbGwoJ2xlZnQnKTtcbiAgICAgICAgICAgICAgICBmaXJlUmVhZHkoKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGRvU2Nyb2xsQ2hlY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChkb2N1bWVudCQxLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZmlyZVJlYWR5KTsgLy/lpoLmnpzlnKhkb21SZWFkeeS5i+WkluWKoOi9vVxuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50JDEuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgICAgICAgICAgZG9jdW1lbnQkMS5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZmlyZVJlYWR5LCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnQkMS5hdHRhY2hFdmVudCkge1xuICAgICAgICAgICAgLy/lv4XpobvkvKDlhaXkuInkuKrlj4LmlbDvvIzlkKbliJnlnKhmaXJlZm94NC0yNuS4reaKpemUmVxuICAgICAgICAgICAgLy9jYXVnaHQgZXhjZXB0aW9uOiBbRXhjZXB0aW9uLi4uIFwiTm90IGVub3VnaCBhcmd1bWVudHNcIiAgbnNyZXN1bHQ6IFwiMHhcbiAgICAgICAgICAgIGRvY3VtZW50JDEuYXR0YWNoRXZlbnQoJ29ucmVhZHlzdGF0ZWNoYW5nZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQkMS5yZWFkeVN0YXRlID09PSAnY29tcGxldGUnKSB7XG4gICAgICAgICAgICAgICAgICAgIGZpcmVSZWFkeSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgaXNUb3AgPSB3aW5kb3ckMS5mcmFtZUVsZW1lbnQgPT09IG51bGw7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgaWYgKHJvb3QuZG9TY3JvbGwgJiYgaXNUb3AgJiYgd2luZG93JDEuZXh0ZXJuYWwpIHtcbiAgICAgICAgICAgICAgICAvL2ZpeCBJRSBpZnJhbWUgQlVHXG4gICAgICAgICAgICAgICAgZG9TY3JvbGxDaGVjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgYXZhbG9uLmJpbmQod2luZG93JDEsICdsb2FkJywgZmlyZVJlYWR5KTtcbiAgICB9XG4gICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICBib290c3RyYXAoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgRE9NIEFwaVxuICAgICAqIHNoaW0sY2xhc3MsZGF0YSxjc3MsdmFsLGh0bWwsZXZlbnQscmVhZHkgIFxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqL1xuXG4gICAgZnVuY3Rpb24gZnJvbURPTShkb20pIHtcbiAgICAgICAgcmV0dXJuIFtmcm9tJDEoZG9tKV07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZnJvbSQxKG5vZGUpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBub2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAnI3RleHQnOlxuICAgICAgICAgICAgY2FzZSAnI2NvbW1lbnQnOlxuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBkb206IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogbm9kZS5ub2RlVmFsdWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB2YXIgcHJvcHMgPSBtYXJrUHJvcHMobm9kZSwgbm9kZS5hdHRyaWJ1dGVzIHx8IFtdKTtcbiAgICAgICAgICAgICAgICB2YXIgdm5vZGUgPSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVOYW1lOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICBkb206IG5vZGUsXG4gICAgICAgICAgICAgICAgICAgIGlzVm9pZFRhZzogISF2b2lkVGFnW3R5cGVdLFxuICAgICAgICAgICAgICAgICAgICBwcm9wczogcHJvcHNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnb3B0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAvL+WNs+S+v+S9oOiuvue9ruS6hm9wdGlvbi5zZWxlY3RlZCA9IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIC8vb3B0aW9uLmF0dHJpYnV0ZXPkuZ/mib7kuI3liLBzZWxlY3RlZOWxnuaAp1xuICAgICAgICAgICAgICAgICAgICBwcm9wcy5zZWxlY3RlZCA9IG5vZGUuc2VsZWN0ZWQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcnBoYW5UYWdbdHlwZV0gfHwgdHlwZSA9PT0gJ29wdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFrZU9ycGhhbih2bm9kZSwgdHlwZSwgbm9kZS50ZXh0IHx8IG5vZGUuaW5uZXJIVE1MKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZub2RlLmNoaWxkcmVuWzBdLmRvbSA9IG5vZGUuZmlyc3RDaGlsZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXZub2RlLmlzVm9pZFRhZykge1xuICAgICAgICAgICAgICAgICAgICB2bm9kZS5jaGlsZHJlbiA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gbm9kZS5jaGlsZE5vZGVzW2krK107KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGQgPSBmcm9tJDEoZWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKC9cXFMvLnRlc3QoY2hpbGQubm9kZVZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZub2RlLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB2bm9kZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZm9ybUVsZW1lbnQgPSAvaW5wdXR8dGV4dGFyZWF8c2VsZWN0L2k7XG5cbiAgICBmdW5jdGlvbiBtYXJrUHJvcHMobm9kZSwgYXR0cnMpIHtcbiAgICAgICAgdmFyIHJldCA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGF0dHJzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgdmFyIGF0dHIgPSBhdHRyc1tpXTtcbiAgICAgICAgICAgIGlmIChhdHRyLnNwZWNpZmllZCkge1xuICAgICAgICAgICAgICAgIC8vSUU2LTnkuI3kvJrlsIblsZ7mgKflkI3lj5jlsI/lhpks5q+U5aaC5a6D5Lya5bCG55So5oi355qEY29udGVudGVkaXRhYmxl5Y+Y5oiQY29udGVudEVkaXRhYmxlXG4gICAgICAgICAgICAgICAgcmV0W2F0dHIubmFtZS50b0xvd2VyQ2FzZSgpXSA9IGF0dHIudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJmb3JtRWxlbWVudC50ZXN0KG5vZGUubm9kZU5hbWUpKSB7XG4gICAgICAgICAgICByZXQudHlwZSA9IG5vZGUudHlwZTtcbiAgICAgICAgICAgIHZhciBhID0gbm9kZS5nZXRBdHRyaWJ1dGVOb2RlKCd2YWx1ZScpO1xuICAgICAgICAgICAgaWYgKGEgJiYgL1xcUy8udGVzdChhLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIC8vSUU2LDfkuK3ml6Dms5Xlj5blvpdjaGVja2JveCxyYWRpb+eahHZhbHVlXG4gICAgICAgICAgICAgICAgcmV0LnZhbHVlID0gYS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB2YXIgc3R5bGUgPSBub2RlLnN0eWxlLmNzc1RleHQ7XG4gICAgICAgIGlmIChzdHlsZSkge1xuICAgICAgICAgICAgcmV0LnN0eWxlID0gc3R5bGU7XG4gICAgICAgIH1cbiAgICAgICAgLy/nsbvlkI0gPSDljrvph40o6Z2Z5oCB57G75ZCNK+WKqOaAgeexu+WQjSsgaG92ZXLnsbvlkI0/ICsgYWN0aXZl57G75ZCNKVxuICAgICAgICBpZiAocmV0LnR5cGUgPT09ICdzZWxlY3Qtb25lJykge1xuICAgICAgICAgICAgcmV0LnNlbGVjdGVkSW5kZXggPSBub2RlLnNlbGVjdGVkSW5kZXg7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBWVGV4dCh0ZXh0KSB7XG4gICAgICAgIHRoaXMubm9kZU5hbWUgPSAnI3RleHQnO1xuICAgICAgICB0aGlzLm5vZGVWYWx1ZSA9IHRleHQ7XG4gICAgfVxuXG4gICAgVlRleHQucHJvdG90eXBlID0ge1xuICAgICAgICBjb25zdHJ1Y3RvcjogVlRleHQsXG4gICAgICAgIHRvRE9NOiBmdW5jdGlvbiB0b0RPTSgpIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgICAgICBpZiAodGhpcy5kb20pIHJldHVybiB0aGlzLmRvbTtcbiAgICAgICAgICAgIHZhciB2ID0gYXZhbG9uLl9kZWNvZGUodGhpcy5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tID0gZG9jdW1lbnQkMS5jcmVhdGVUZXh0Tm9kZSh2KTtcbiAgICAgICAgfSxcbiAgICAgICAgdG9IVE1MOiBmdW5jdGlvbiB0b0hUTUwoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ub2RlVmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gVkNvbW1lbnQodGV4dCkge1xuICAgICAgICB0aGlzLm5vZGVOYW1lID0gJyNjb21tZW50JztcbiAgICAgICAgdGhpcy5ub2RlVmFsdWUgPSB0ZXh0O1xuICAgIH1cbiAgICBWQ29tbWVudC5wcm90b3R5cGUgPSB7XG4gICAgICAgIGNvbnN0cnVjdG9yOiBWQ29tbWVudCxcbiAgICAgICAgdG9ET006IGZ1bmN0aW9uIHRvRE9NKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZG9tKSByZXR1cm4gdGhpcy5kb207XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kb20gPSBkb2N1bWVudCQxLmNyZWF0ZUNvbW1lbnQodGhpcy5ub2RlVmFsdWUpO1xuICAgICAgICB9LFxuICAgICAgICB0b0hUTUw6IGZ1bmN0aW9uIHRvSFRNTCgpIHtcbiAgICAgICAgICAgIHJldHVybiAnPCEtLScgKyB0aGlzLm5vZGVWYWx1ZSArICctLT4nO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIFZFbGVtZW50KHR5cGUsIHByb3BzLCBjaGlsZHJlbiwgaXNWb2lkVGFnKSB7XG4gICAgICAgIHRoaXMubm9kZU5hbWUgPSB0eXBlO1xuICAgICAgICB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBjaGlsZHJlbjtcbiAgICAgICAgdGhpcy5pc1ZvaWRUYWcgPSBpc1ZvaWRUYWc7XG4gICAgfVxuICAgIFZFbGVtZW50LnByb3RvdHlwZSA9IHtcbiAgICAgICAgY29uc3RydWN0b3I6IFZFbGVtZW50LFxuICAgICAgICB0b0RPTTogZnVuY3Rpb24gdG9ET00oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kb20pIHJldHVybiB0aGlzLmRvbTtcbiAgICAgICAgICAgIHZhciBkb20sXG4gICAgICAgICAgICAgICAgdGFnTmFtZSA9IHRoaXMubm9kZU5hbWU7XG4gICAgICAgICAgICBpZiAoYXZhbG9uLm1vZGVybiAmJiBzdmdUYWdzW3RhZ05hbWVdKSB7XG4gICAgICAgICAgICAgICAgZG9tID0gY3JlYXRlU1ZHKHRhZ05hbWUpO1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWF2YWxvbi5tb2Rlcm4gJiYgKFZNTFRhZ3NbdGFnTmFtZV0gfHwgcnZtbC50ZXN0KHRhZ05hbWUpKSkge1xuICAgICAgICAgICAgICAgIGRvbSA9IGNyZWF0ZVZNTCh0YWdOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZG9tID0gZG9jdW1lbnQkMS5jcmVhdGVFbGVtZW50KHRhZ05hbWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB0aGlzLnByb3BzIHx8IHt9O1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHByb3BzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IHByb3BzW2ldO1xuICAgICAgICAgICAgICAgIGlmIChza2lwRmFsc2VBbmRGdW5jdGlvbih2YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgICAgICAgICAgICAgIGlmIChzcGVjYWxBdHRyc1tpXSAmJiBhdmFsb24ubXNpZSA8IDgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNwZWNhbEF0dHJzW2ldKGRvbSwgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoaSwgdmFsICsgJycpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGMgPSB0aGlzLmNoaWxkcmVuIHx8IFtdO1xuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gY1swXSA/IGNbMF0ubm9kZVZhbHVlIDogJyc7XG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMubm9kZU5hbWUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICdzY3JpcHQnOlxuICAgICAgICAgICAgICAgICAgICBkb20udHlwZSA9ICdub2V4ZWMnO1xuICAgICAgICAgICAgICAgICAgICBkb20udGV4dCA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tLmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgICAgICAgICBkb20udHlwZSA9IHByb3BzLnR5cGUgfHwgJyc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ25vc2NyaXB0JzpcbiAgICAgICAgICAgICAgICAgICAgZG9tLnRleHRDb250ZW50ID0gdGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgY2FzZSAnc3R5bGUnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3htcCc6XG4gICAgICAgICAgICAgICAgY2FzZSAndGVtcGxhdGUnOlxuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tLmlubmVySFRNTCA9IHRlbXBsYXRlO1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCovXG4gICAgICAgICAgICAgICAgICAgICAgICBoYWNrSUUoZG9tLCB0aGlzLm5vZGVOYW1lLCB0ZW1wbGF0ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnb3B0aW9uJzpcbiAgICAgICAgICAgICAgICAgICAgLy9JRTYtOCzkuLpvcHRpb27mt7vliqDmlofmnKzlrZDoioLngrks5LiN5Lya5ZCM5q2l5YiwdGV4dOWxnuaAp+S4rVxuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgICAgICAgICBpZiAobXNpZSA8IDkpIGRvbS50ZXh0ID0gdGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzVm9pZFRhZyAmJiB0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGMgJiYgZG9tLmFwcGVuZENoaWxkKGF2YWxvbi52ZG9tKGMsICd0b0RPTScpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tID0gZG9tO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG5cbiAgICAgICAgdG9IVE1MOiBmdW5jdGlvbiB0b0hUTUwoKSB7XG4gICAgICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB0aGlzLnByb3BzIHx8IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBwcm9wcykge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSBwcm9wc1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoc2tpcEZhbHNlQW5kRnVuY3Rpb24odmFsKSkge1xuICAgICAgICAgICAgICAgICAgICBhcnIucHVzaChpICsgJz0nICsgYXZhbG9uLnF1b3RlKHByb3BzW2ldICsgJycpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhcnIgPSBhcnIubGVuZ3RoID8gJyAnICsgYXJyLmpvaW4oJyAnKSA6ICcnO1xuICAgICAgICAgICAgdmFyIHN0ciA9ICc8JyArIHRoaXMubm9kZU5hbWUgKyBhcnI7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1ZvaWRUYWcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RyICsgJy8+JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciArPSAnPic7XG4gICAgICAgICAgICBpZiAodGhpcy5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIHN0ciArPSB0aGlzLmNoaWxkcmVuLm1hcChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVsID8gYXZhbG9uLnZkb20oZWwsICd0b0hUTUwnKSA6ICcnO1xuICAgICAgICAgICAgICAgIH0pLmpvaW4oJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0ciArICc8LycgKyB0aGlzLm5vZGVOYW1lICsgJz4nO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBoYWNrSUUoZG9tLCBub2RlTmFtZSwgdGVtcGxhdGUpIHtcbiAgICAgICAgc3dpdGNoIChub2RlTmFtZSkge1xuICAgICAgICAgICAgY2FzZSAnc3R5bGUnOlxuICAgICAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICAgICAgICAgICAgICBkb20uc3R5bGVTaGVldC5jc3NUZXh0ID0gdGVtcGxhdGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd4bXAnOiAvL0lFNi04LFhNUOWFg+e0oOmHjOmdouWPquiDveacieaWh+acrOiKgueCuSzkuI3og73kvb/nlKhpbm5lckhUTUxcbiAgICAgICAgICAgIGNhc2UgJ25vc2NyaXB0JzpcbiAgICAgICAgICAgICAgICBkb20udGV4dENvbnRlbnQgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBza2lwRmFsc2VBbmRGdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiBhICE9PSBmYWxzZSAmJiBPYmplY3QoYSkgIT09IGE7XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgdmFyIHNwZWNhbEF0dHJzID0ge1xuICAgICAgICBcImNsYXNzXCI6IGZ1bmN0aW9uIF9jbGFzcyhkb20sIHZhbCkge1xuICAgICAgICAgICAgZG9tLmNsYXNzTmFtZSA9IHZhbDtcbiAgICAgICAgfSxcbiAgICAgICAgc3R5bGU6IGZ1bmN0aW9uIHN0eWxlKGRvbSwgdmFsKSB7XG4gICAgICAgICAgICBkb20uc3R5bGUuY3NzVGV4dCA9IHZhbDtcbiAgICAgICAgfSxcbiAgICAgICAgdHlwZTogZnVuY3Rpb24gdHlwZShkb20sIHZhbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvL3RleHRhcmVhLGJ1dHRvbiDlhYPntKDlnKhJRTYsN+iuvue9riB0eXBlIOWxnuaAp+S8muaKm+mUmVxuICAgICAgICAgICAgICAgIGRvbS50eXBlID0gdmFsO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICAgICAgfSxcbiAgICAgICAgJ2Zvcic6IGZ1bmN0aW9uIF9mb3IoZG9tLCB2YWwpIHtcbiAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ2ZvcicsIHZhbCk7XG4gICAgICAgICAgICBkb20uaHRtbEZvciA9IHZhbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTVkcodHlwZSkge1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQkMS5jcmVhdGVFbGVtZW50TlMoJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJywgdHlwZSk7XG4gICAgfVxuICAgIHZhciBzdmdUYWdzID0gYXZhbG9uLm9uZU9iamVjdCgnY2lyY2xlLGRlZnMsZWxsaXBzZSxpbWFnZSxsaW5lLCcgKyAncGF0aCxwb2x5Z29uLHBvbHlsaW5lLHJlY3Qsc3ltYm9sLHRleHQsdXNlLGcsc3ZnJyk7XG5cbiAgICB2YXIgcnZtbCA9IC9eXFx3K1xcOlxcdysvO1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0Ki9cbiAgICBmdW5jdGlvbiBjcmVhdGVWTUwodHlwZSkge1xuICAgICAgICBpZiAoZG9jdW1lbnQkMS5zdHlsZVNoZWV0cy5sZW5ndGggPCAzMSkge1xuICAgICAgICAgICAgZG9jdW1lbnQkMS5jcmVhdGVTdHlsZVNoZWV0KCkuYWRkUnVsZShcIi5ydm1sXCIsIFwiYmVoYXZpb3I6dXJsKCNkZWZhdWx0I1ZNTClcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBubyBtb3JlIHJvb20sIGFkZCB0byB0aGUgZXhpc3Rpbmcgb25lXG4gICAgICAgICAgICAvLyBodHRwOi8vbXNkbi5taWNyb3NvZnQuY29tL2VuLXVzL2xpYnJhcnkvbXM1MzExOTQlMjhWUy44NSUyOS5hc3B4XG4gICAgICAgICAgICBkb2N1bWVudCQxLnN0eWxlU2hlZXRzWzBdLmFkZFJ1bGUoXCIucnZtbFwiLCBcImJlaGF2aW9yOnVybCgjZGVmYXVsdCNWTUwpXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnIgPSB0eXBlLnNwbGl0KCc6Jyk7XG4gICAgICAgIGlmIChhcnIubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICBhcnIudW5zaGlmdCgndicpO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0YWcgPSBhcnJbMV07XG4gICAgICAgIHZhciBucyA9IGFyclswXTtcbiAgICAgICAgaWYgKCFkb2N1bWVudCQxLm5hbWVzcGFjZXNbbnNdKSB7XG4gICAgICAgICAgICBkb2N1bWVudCQxLm5hbWVzcGFjZXMuYWRkKG5zLCBcInVybjpzY2hlbWFzLW1pY3Jvc29mdC1jb206dm1sXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkb2N1bWVudCQxLmNyZWF0ZUVsZW1lbnQoJzwnICsgbnMgKyAnOicgKyB0YWcgKyAnIGNsYXNzPVwicnZtbFwiPicpO1xuICAgIH1cblxuICAgIHZhciBWTUxUYWdzID0gYXZhbG9uLm9uZU9iamVjdCgnc2hhcGUsbGluZSxwb2x5bGluZSxyZWN0LHJvdW5kcmVjdCxvdmFsLGFyYywnICsgJ2N1cnZlLGJhY2tncm91bmQsaW1hZ2Usc2hhcGV0eXBlLGdyb3VwLGZpbGwsJyArICdzdHJva2Usc2hhZG93LCBleHRydXNpb24sIHRleHRib3gsIGltYWdlZGF0YSwgdGV4dHBhdGgnKTtcblxuICAgIGZ1bmN0aW9uIFZGcmFnbWVudChjaGlsZHJlbiwga2V5LCB2YWwsIGluZGV4KSB7XG4gICAgICAgIHRoaXMubm9kZU5hbWUgPSAnI2RvY3VtZW50LWZyYWdtZW50JztcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IGNoaWxkcmVuO1xuICAgICAgICB0aGlzLmtleSA9IGtleTtcbiAgICAgICAgdGhpcy52YWwgPSB2YWw7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpbmRleDtcbiAgICAgICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIH1cbiAgICBWRnJhZ21lbnQucHJvdG90eXBlID0ge1xuICAgICAgICBjb25zdHJ1Y3RvcjogVkZyYWdtZW50LFxuICAgICAgICB0b0RPTTogZnVuY3Rpb24gdG9ET00oKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kb20pIHJldHVybiB0aGlzLmRvbTtcbiAgICAgICAgICAgIHZhciBmID0gdGhpcy50b0ZyYWdtZW50KCk7XG4gICAgICAgICAgICAvL0lFNi0xMSBkb2NtZW50LWZyYWdtZW506YO95rKh5pyJY2hpbGRyZW7lsZ7mgKcgXG4gICAgICAgICAgICB0aGlzLnNwbGl0ID0gZi5sYXN0Q2hpbGQ7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kb20gPSBmO1xuICAgICAgICB9LFxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdGhpcy50b0ZyYWdtZW50KCk7XG4gICAgICAgICAgICB0aGlzLmlubmVyUmVuZGVyICYmIHRoaXMuaW5uZXJSZW5kZXIuZGlzcG9zZSgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgdGhpc1tpXSA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRvRnJhZ21lbnQ6IGZ1bmN0aW9uIHRvRnJhZ21lbnQoKSB7XG4gICAgICAgICAgICB2YXIgZiA9IGNyZWF0ZUZyYWdtZW50KCk7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGYuYXBwZW5kQ2hpbGQoYXZhbG9uLnZkb20oZWwsICd0b0RPTScpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGY7XG4gICAgICAgIH0sXG4gICAgICAgIHRvSFRNTDogZnVuY3Rpb24gdG9IVE1MKCkge1xuICAgICAgICAgICAgdmFyIGMgPSB0aGlzLmNoaWxkcmVuO1xuICAgICAgICAgICAgcmV0dXJuIGMubWFwKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBhdmFsb24udmRvbShlbCwgJ3RvSFRNTCcpO1xuICAgICAgICAgICAgfSkuam9pbignJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICog6Jma5oufRE9N55qENOWkp+aehOmAoOWZqFxuICAgICAqL1xuICAgIGF2YWxvbi5taXgoYXZhbG9uLCB7XG4gICAgICAgIFZUZXh0OiBWVGV4dCxcbiAgICAgICAgVkNvbW1lbnQ6IFZDb21tZW50LFxuICAgICAgICBWRWxlbWVudDogVkVsZW1lbnQsXG4gICAgICAgIFZGcmFnbWVudDogVkZyYWdtZW50XG4gICAgfSk7XG5cbiAgICB2YXIgY29uc3ROYW1lTWFwID0ge1xuICAgICAgICAnI3RleHQnOiAnVlRleHQnLFxuICAgICAgICAnI2RvY3VtZW50LWZyYWdtZW50JzogJ1ZGcmFnbWVudCcsXG4gICAgICAgICcjY29tbWVudCc6ICdWQ29tbWVudCdcbiAgICB9O1xuXG4gICAgdmFyIHZkb20gPSBhdmFsb24udmRvbUFkYXB0b3IgPSBhdmFsb24udmRvbSA9IGZ1bmN0aW9uIChvYmosIG1ldGhvZCkge1xuICAgICAgICBpZiAoIW9iaikge1xuICAgICAgICAgICAgLy9vYmrlnKhtcy1mb3Llvqrnjq/ph4zpnaLlj6/og73mmK9udWxsXG4gICAgICAgICAgICByZXR1cm4gbWV0aG9kID09PSBcInRvSFRNTFwiID8gJycgOiBjcmVhdGVGcmFnbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBub2RlTmFtZSA9IG9iai5ub2RlTmFtZTtcbiAgICAgICAgaWYgKCFub2RlTmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBhdmFsb24uVkZyYWdtZW50KG9iailbbWV0aG9kXSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb25zdE5hbWUgPSBjb25zdE5hbWVNYXBbbm9kZU5hbWVdIHx8ICdWRWxlbWVudCc7XG4gICAgICAgIHJldHVybiBhdmFsb25bY29uc3ROYW1lXS5wcm90b3R5cGVbbWV0aG9kXS5jYWxsKG9iaik7XG4gICAgfTtcblxuICAgIGF2YWxvbi5kb21pemUgPSBmdW5jdGlvbiAoYSkge1xuICAgICAgICByZXR1cm4gYXZhbG9uLnZkb20oYSwgJ3RvRE9NJyk7XG4gICAgfTtcblxuICAgIGF2YWxvbi5wZW5kaW5nQWN0aW9ucyA9IFtdO1xuICAgIGF2YWxvbi51bmlxQWN0aW9ucyA9IHt9O1xuICAgIGF2YWxvbi5pblRyYW5zYWN0aW9uID0gMDtcbiAgICBjb25maWcudHJhY2tEZXBzID0gZmFsc2U7XG4gICAgYXZhbG9uLnRyYWNrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoY29uZmlnLnRyYWNrRGVwcykge1xuICAgICAgICAgICAgYXZhbG9uLmxvZy5hcHBseShhdmFsb24sIGFyZ3VtZW50cyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQmF0Y2ggaXMgYSBwc2V1ZG90cmFuc2FjdGlvbiwganVzdCBmb3IgcHVycG9zZXMgb2YgbWVtb2l6aW5nIENvbXB1dGVkVmFsdWVzIHdoZW4gbm90aGluZyBlbHNlIGRvZXMuXG4gICAgICogRHVyaW5nIGEgYmF0Y2ggYG9uQmVjb21lVW5vYnNlcnZlZGAgd2lsbCBiZSBjYWxsZWQgYXQgbW9zdCBvbmNlIHBlciBvYnNlcnZhYmxlLlxuICAgICAqIEF2b2lkcyB1bm5lY2Vzc2FyeSByZWNhbGN1bGF0aW9ucy5cbiAgICAgKi9cblxuICAgIGZ1bmN0aW9uIHJ1bkFjdGlvbnMoKSB7XG4gICAgICAgIGlmIChhdmFsb24uaXNSdW5uaW5nQWN0aW9ucyA9PT0gdHJ1ZSB8fCBhdmFsb24uaW5UcmFuc2FjdGlvbiA+IDApIHJldHVybjtcbiAgICAgICAgYXZhbG9uLmlzUnVubmluZ0FjdGlvbnMgPSB0cnVlO1xuICAgICAgICB2YXIgdGFza3MgPSBhdmFsb24ucGVuZGluZ0FjdGlvbnMuc3BsaWNlKDAsIGF2YWxvbi5wZW5kaW5nQWN0aW9ucy5sZW5ndGgpO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgdGFzazsgdGFzayA9IHRhc2tzW2krK107KSB7XG4gICAgICAgICAgICB0YXNrLnVwZGF0ZSgpO1xuICAgICAgICAgICAgZGVsZXRlIGF2YWxvbi51bmlxQWN0aW9uc1t0YXNrLnV1aWRdO1xuICAgICAgICB9XG4gICAgICAgIGF2YWxvbi5pc1J1bm5pbmdBY3Rpb25zID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJvcGFnYXRlQ2hhbmdlZCh0YXJnZXQpIHtcbiAgICAgICAgdmFyIGxpc3QgPSB0YXJnZXQub2JzZXJ2ZXJzO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gbGlzdFtpKytdOykge1xuICAgICAgICAgICAgZWwuc2NoZWR1bGUoKTsgLy/pgJrnn6VhY3Rpb24sIGNvbXB1dGVk5YGa5a6D5Lus6K+l5YGa55qE5LqLXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL+WwhuiHquW3seaKm+WIsOW4guWcuuS4iuWNllxuICAgIGZ1bmN0aW9uIHJlcG9ydE9ic2VydmVkKHRhcmdldCkge1xuICAgICAgICB2YXIgYWN0aW9uID0gYXZhbG9uLnRyYWNraW5nQWN0aW9uIHx8IG51bGw7XG4gICAgICAgIGlmIChhY3Rpb24gIT09IG51bGwpIHtcblxuICAgICAgICAgICAgYXZhbG9uLnRyYWNrKCflvoHmlLbliLAnLCB0YXJnZXQuZXhwcik7XG4gICAgICAgICAgICBhY3Rpb24ubWFwSURzW3RhcmdldC51dWlkXSA9IHRhcmdldDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB0YXJnZXRTdGFjayA9IFtdO1xuXG4gICAgZnVuY3Rpb24gY29sbGVjdERlcHMoYWN0aW9uLCBnZXR0ZXIpIHtcbiAgICAgICAgaWYgKCFhY3Rpb24ub2JzZXJ2ZXJzKSByZXR1cm47XG4gICAgICAgIHZhciBwcmVBY3Rpb24gPSBhdmFsb24udHJhY2tpbmdBY3Rpb247XG4gICAgICAgIGlmIChwcmVBY3Rpb24pIHtcbiAgICAgICAgICAgIHRhcmdldFN0YWNrLnB1c2gocHJlQWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBhdmFsb24udHJhY2tpbmdBY3Rpb24gPSBhY3Rpb247XG4gICAgICAgIGF2YWxvbi50cmFjaygn44CQYWN0aW9u44CRJywgYWN0aW9uLnR5cGUsIGFjdGlvbi5leHByLCAn5byA5aeL5b6B5pS25L6d6LWW6aG5Jyk7XG4gICAgICAgIC8v5aSa5Liqb2JzZXJ2ZeaMgeacieWQjOS4gOS4qmFjdGlvblxuICAgICAgICBhY3Rpb24ubWFwSURzID0ge307IC8v6YeN5paw5pS26ZuG5L6d6LWWXG4gICAgICAgIHZhciBoYXNFcnJvciA9IHRydWUsXG4gICAgICAgICAgICByZXN1bHQ7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXN1bHQgPSBnZXR0ZXIuY2FsbChhY3Rpb24pO1xuICAgICAgICAgICAgaGFzRXJyb3IgPSBmYWxzZTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIGlmIChoYXNFcnJvcikge1xuICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKCdjb2xsZWN0RGVwcyBmYWlsJywgZ2V0dGVyICsgJycpO1xuICAgICAgICAgICAgICAgIGFjdGlvbi5tYXBJRHMgPSB7fTtcbiAgICAgICAgICAgICAgICBhdmFsb24udHJhY2tpbmdBY3Rpb24gPSBwcmVBY3Rpb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vwqDnoa7kv53lroPmgLvmmK/kuLpudWxsXG4gICAgICAgICAgICAgICAgYXZhbG9uLnRyYWNraW5nQWN0aW9uID0gdGFyZ2V0U3RhY2sucG9wKCk7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzZXREZXBzKGFjdGlvbik7XG4gICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24ud2FybihlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXREZXBzKGFjdGlvbikge1xuICAgICAgICB2YXIgcHJldiA9IGFjdGlvbi5vYnNlcnZlcnMsXG4gICAgICAgICAgICBjdXJyID0gW10sXG4gICAgICAgICAgICBjaGVja2VkID0ge30sXG4gICAgICAgICAgICBpZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBhY3Rpb24ubWFwSURzKSB7XG4gICAgICAgICAgICB2YXIgZGVwID0gYWN0aW9uLm1hcElEc1tpXTtcbiAgICAgICAgICAgIGlmICghZGVwLmlzQWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkZXAub2JzZXJ2ZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v5aaC5p6c5a6D5bey57uP6KKr6ZSA5q+BXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhY3Rpb24ubWFwSURzW2ldO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWRzLnB1c2goZGVwLnV1aWQpO1xuICAgICAgICAgICAgICAgIGN1cnIucHVzaChkZXApO1xuICAgICAgICAgICAgICAgIGNoZWNrZWRbZGVwLnV1aWRdID0gMTtcbiAgICAgICAgICAgICAgICBpZiAoZGVwLmxhc3RBY2Nlc3NlZEJ5ID09PSBhY3Rpb24udXVpZCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZGVwLmxhc3RBY2Nlc3NlZEJ5ID0gYWN0aW9uLnV1aWQ7XG4gICAgICAgICAgICAgICAgYXZhbG9uLkFycmF5LmVuc3VyZShkZXAub2JzZXJ2ZXJzLCBhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBpZHMgPSBpZHMuc29ydCgpLmpvaW4oJywnKTtcbiAgICAgICAgaWYgKGlkcyA9PT0gYWN0aW9uLmlkcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGFjdGlvbi5pZHMgPSBpZHM7XG4gICAgICAgIGlmICghYWN0aW9uLmlzQ29tcHV0ZWQpIHtcbiAgICAgICAgICAgIGFjdGlvbi5vYnNlcnZlcnMgPSBjdXJyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0aW9uLmRlcHNDb3VudCA9IGN1cnIubGVuZ3RoO1xuICAgICAgICAgICAgYWN0aW9uLmRlcHMgPSBhdmFsb24ubWl4KHt9LCBhY3Rpb24ubWFwSURzKTtcbiAgICAgICAgICAgIGFjdGlvbi5kZXBzVmVyc2lvbiA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgaW4gYWN0aW9uLm1hcElEcykge1xuICAgICAgICAgICAgICAgIHZhciBfZGVwID0gYWN0aW9uLm1hcElEc1tfaV07XG4gICAgICAgICAgICAgICAgYWN0aW9uLmRlcHNWZXJzaW9uW19kZXAudXVpZF0gPSBfZGVwLnZlcnNpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBfaTIgPSAwLCBfZGVwMjsgX2RlcDIgPSBwcmV2W19pMisrXTspIHtcbiAgICAgICAgICAgIGlmICghY2hlY2tlZFtfZGVwMi51dWlkXSkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5BcnJheS5yZW1vdmUoX2RlcDIub2JzZXJ2ZXJzLCBhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdHJhbnNhY3Rpb24oYWN0aW9uLCB0aGlzQXJnLCBhcmdzKSB7XG4gICAgICAgIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAgICAgICB2YXIgbmFtZSA9ICd0cmFuc2FjdGlvbiAnICsgKGFjdGlvbi5uYW1lIHx8IGFjdGlvbi5kaXNwbGF5TmFtZSB8fCAnbm9vcCcpO1xuICAgICAgICB0cmFuc2FjdGlvblN0YXJ0KG5hbWUpO1xuICAgICAgICB2YXIgcmVzID0gYWN0aW9uLmFwcGx5KHRoaXNBcmcsIGFyZ3MpO1xuICAgICAgICB0cmFuc2FjdGlvbkVuZChuYW1lKTtcbiAgICAgICAgcmV0dXJuIHJlcztcbiAgICB9XG4gICAgYXZhbG9uLnRyYW5zYWN0aW9uID0gdHJhbnNhY3Rpb247XG5cbiAgICBmdW5jdGlvbiB0cmFuc2FjdGlvblN0YXJ0KG5hbWUpIHtcbiAgICAgICAgYXZhbG9uLmluVHJhbnNhY3Rpb24gKz0gMTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0cmFuc2FjdGlvbkVuZChuYW1lKSB7XG4gICAgICAgIGlmICgtLWF2YWxvbi5pblRyYW5zYWN0aW9uID09PSAwKSB7XG4gICAgICAgICAgICBhdmFsb24uaXNSdW5uaW5nQWN0aW9ucyA9IGZhbHNlO1xuICAgICAgICAgICAgcnVuQWN0aW9ucygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGtleU1hcCA9IGF2YWxvbi5vbmVPYmplY3QoXCJicmVhayxjYXNlLGNhdGNoLGNvbnRpbnVlLGRlYnVnZ2VyLGRlZmF1bHQsZGVsZXRlLGRvLGVsc2UsZmFsc2UsXCIgKyBcImZpbmFsbHksZm9yLGZ1bmN0aW9uLGlmLGluLGluc3RhbmNlb2YsbmV3LG51bGwscmV0dXJuLHN3aXRjaCx0aGlzLFwiICsgXCJ0aHJvdyx0cnVlLHRyeSx0eXBlb2YsdmFyLHZvaWQsd2hpbGUsd2l0aCxcIiArIC8qIOWFs+mUruWtlyovXG4gICAgXCJhYnN0cmFjdCxib29sZWFuLGJ5dGUsY2hhcixjbGFzcyxjb25zdCxkb3VibGUsZW51bSxleHBvcnQsZXh0ZW5kcyxcIiArIFwiZmluYWwsZmxvYXQsZ290byxpbXBsZW1lbnRzLGltcG9ydCxpbnQsaW50ZXJmYWNlLGxvbmcsbmF0aXZlLFwiICsgXCJwYWNrYWdlLHByaXZhdGUscHJvdGVjdGVkLHB1YmxpYyxzaG9ydCxzdGF0aWMsc3VwZXIsc3luY2hyb25pemVkLFwiICsgXCJ0aHJvd3MsdHJhbnNpZW50LHZvbGF0aWxlXCIpO1xuXG4gICAgdmFyIHNraXBNYXAgPSBhdmFsb24ubWl4KHtcbiAgICAgICAgTWF0aDogMSxcbiAgICAgICAgRGF0ZTogMSxcbiAgICAgICAgJGV2ZW50OiAxLFxuICAgICAgICB3aW5kb3c6IDEsXG4gICAgICAgIF9fdm1vZGVsX186IDEsXG4gICAgICAgIGF2YWxvbjogMVxuICAgIH0sIGtleU1hcCk7XG5cbiAgICB2YXIgcnZtS2V5ID0gLyhefFteXFx3XFx1MDBjMC1cXHVGRkZGX10pKEB8IyMpKD89WyRcXHddKS9nO1xuICAgIHZhciBydXNlbGVzc1NwID0gL1xccyooXFwufFxcfClcXHMqL2c7XG4gICAgdmFyIHJzaG9ydENpcmN1aXQgPSAvXFx8XFx8L2c7XG4gICAgdmFyIGJyYWNrZXRzID0gL1xcKChbXildKilcXCkvO1xuICAgIHZhciBycGlwZWxpbmUgPSAvXFx8KD89XFw/XFw/KS87XG4gICAgdmFyIHJyZWdleHAgPSAvKF58W14vXSlcXC8oPyFcXC8pKFxcWy4rP118XFxcXC58W14vXFxcXFxcclxcbl0pK1xcL1tnaW15dV17MCw1fSg/PVxccyooJHxbXFxyXFxuLC47fSldKSkvZztcbiAgICB2YXIgcm9iamVjdFByb3AgPSAvXFwuW1xcd1xcLlxcJF0rL2c7IC8v5a+56LGh55qE5bGe5oCnIGVsLnh4eCDkuK3nmoR4eHhcbiAgICB2YXIgcm9iamVjdEtleSA9IC8oXFx7fFxcLClcXHMqKFtcXCRcXHddKylcXHMqOi9nOyAvL+WvueixoeeahOmUruWQjeS4juWGkuWPtyB7eHh4OjEseXl5OiAyfeS4reeahHh4eCwgeXl5XG4gICAgdmFyIHJmaWx0ZXJOYW1lID0gL1xcfChcXHcrKS9nO1xuICAgIHZhciBybG9jYWxWYXIgPSAvWyRhLXpBLVpfXVskYS16QS1aMC05X10qL2c7XG5cbiAgICB2YXIgZXhwckNhY2hlID0gbmV3IENhY2hlKDMwMCk7XG5cbiAgICBmdW5jdGlvbiBhZGRTY29wZUZvckxvY2FsKHN0cikge1xuICAgICAgICByZXR1cm4gc3RyLnJlcGxhY2Uocm9iamVjdFByb3AsIGRpZykucmVwbGFjZShybG9jYWxWYXIsIGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgaWYgKCFza2lwTWFwW2VsXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIl9fdm1vZGVsX18uXCIgKyBlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBlbDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkU2NvcGUoZXhwciwgdHlwZSkge1xuICAgICAgICB2YXIgY2FjaGVLZXkgPSBleHByICsgJzonICsgdHlwZTtcbiAgICAgICAgdmFyIGNhY2hlID0gZXhwckNhY2hlLmdldChjYWNoZUtleSk7XG4gICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlLnNsaWNlKDApO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RyaW5nUG9vbC5tYXAgPSB7fTtcbiAgICAgICAgLy9odHRwczovL2dpdGh1Yi5jb20vUnVieUxvdXZyZS9hdmFsb24vaXNzdWVzLzE4NDlcbiAgICAgICAgdmFyIGlucHV0ID0gZXhwci5yZXBsYWNlKHJyZWdleHAsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYiArIGRpZyhhLnNsaWNlKGIubGVuZ3RoKSk7XG4gICAgICAgIH0pOyAvL+enu+mZpOaJgOacieato+WImVxuICAgICAgICBpbnB1dCA9IGNsZWFyU3RyaW5nKGlucHV0KTsgLy/np7vpmaTmiYDmnInlrZfnrKbkuLJcbiAgICAgICAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKHJzaG9ydENpcmN1aXQsIGRpZykuIC8v56e76Zmk5omA5pyJ55+t6Lev6L+Q566X56ymXG4gICAgICAgIHJlcGxhY2UocnVzZWxlc3NTcCwgJyQxJykuIC8v56e76ZmkLnzkuKTnq6/nqbrnmb1cblxuICAgICAgICByZXBsYWNlKHJvYmplY3RLZXksIGZ1bmN0aW9uIChfLCBhLCBiKSB7XG4gICAgICAgICAgICAvL+enu+mZpOaJgOaciemUruWQjVxuICAgICAgICAgICAgcmV0dXJuIGEgKyBkaWcoYikgKyAnOic7IC8v5q+U5aaCIG1zLXdpZGdldD1cIlt7aXM6J21zLWFkZHJlc3Mtd3JhcCcsICRpZDonYWRkcmVzcyd9XVwi6L+Z5qC35p6B56uv55qE5oOF5Ya1IFxuICAgICAgICB9KS5yZXBsYWNlKHJ2bUtleSwgJyQxX192bW9kZWxfXy4nKS4gLy/ovazmjaJA5LiOIyPkuLpfX3Ztb2RlbF9fXG4gICAgICAgIHJlcGxhY2UocmZpbHRlck5hbWUsIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAvL+enu+mZpOaJgOaciei/h+a7pOWZqOeahOWQjeWtl1xuICAgICAgICAgICAgcmV0dXJuICd8JyArIGRpZyhiKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlucHV0ID0gYWRkU2NvcGVGb3JMb2NhbChpbnB1dCk7IC8v5Zyo5pys5Zyw5Y+Y6YeP5YmN5re75YqgX192bW9kZWxfX1xuXG4gICAgICAgIHZhciBmaWx0ZXJzID0gaW5wdXQuc3BsaXQocnBpcGVsaW5lKTsgLy/moLnmja7nrqHpgZPnrKbliIflibLooajovr7lvI9cbiAgICAgICAgdmFyIGJvZHkgPSBmaWx0ZXJzLnNoaWZ0KCkucmVwbGFjZShyZmlsbCwgZmlsbCkudHJpbSgpO1xuICAgICAgICBpZiAoL1xcP1xcP1xcZC8udGVzdChib2R5KSkge1xuICAgICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZShyZmlsbCwgZmlsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZpbHRlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBmaWx0ZXJzID0gZmlsdGVycy5tYXAoZnVuY3Rpb24gKGZpbHRlcikge1xuICAgICAgICAgICAgICAgIHZhciBicmFja2V0QXJncyA9ICcnO1xuICAgICAgICAgICAgICAgIGZpbHRlciA9IGZpbHRlci5yZXBsYWNlKGJyYWNrZXRzLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoL1xcUy8udGVzdChiKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJhY2tldEFyZ3MgKz0gJywnICsgYjsgLy/ov5jljp/lrZfnrKbkuLIs5q2j5YiZLOefrei3r+i/kOeul+esplxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB2YXIgYXJnID0gJ1snICsgYXZhbG9uLnF1b3RlKGZpbHRlci50cmltKCkpICsgYnJhY2tldEFyZ3MgKyAnXSc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFyZztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZmlsdGVycyA9ICdhdmFsb24uY29tcG9zZUZpbHRlcnMoJyArIGZpbHRlcnMgKyAnKShfX3ZhbHVlX18pJztcbiAgICAgICAgICAgIGZpbHRlcnMgPSBmaWx0ZXJzLnJlcGxhY2UocmZpbGwsIGZpbGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmlsdGVycyA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBleHByQ2FjaGUucHV0KGNhY2hlS2V5LCBbYm9keSwgZmlsdGVyc10pO1xuICAgIH1cbiAgICB2YXIgcmhhbmRsZU5hbWUgPSAvXl9fdm1vZGVsX19cXC5bJFxcd1xcLl0rJC87XG4gICAgdmFyIHJmaXhJRTY3OCA9IC9fX3Ztb2RlbF9fXFwuKFteKF0rKVxcKChbXildKilcXCkvO1xuICAgIGZ1bmN0aW9uIG1ha2VIYW5kbGUoYm9keSkge1xuICAgICAgICBpZiAocmhhbmRsZU5hbWUudGVzdChib2R5KSkge1xuICAgICAgICAgICAgYm9keSA9IGJvZHkgKyAnKCRldmVudCknO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICBpZiAobXNpZSA8IDkpIHtcbiAgICAgICAgICAgIGJvZHkgPSBib2R5LnJlcGxhY2UocmZpeElFNjc4LCBmdW5jdGlvbiAoYSwgYiwgYykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnX192bW9kZWxfXy4nICsgYiArICcuY2FsbChfX3Ztb2RlbF9fJyArICgvXFxTLy50ZXN0KGMpID8gJywnICsgYyA6ICcnKSArICcpJztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib2R5O1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVHZXR0ZXIoZXhwciwgdHlwZSkge1xuICAgICAgICB2YXIgYXJyID0gYWRkU2NvcGUoZXhwciwgdHlwZSksXG4gICAgICAgICAgICBib2R5O1xuICAgICAgICBpZiAoIWFyclsxXSkge1xuICAgICAgICAgICAgYm9keSA9IGFyclswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGJvZHkgPSBhcnJbMV0ucmVwbGFjZSgvX192YWx1ZV9fXFwpJC8sIGFyclswXSArICcpJyk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ19fdm1vZGVsX18nLCAncmV0dXJuICcgKyBib2R5ICsgJzsnKTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGF2YWxvbi5sb2coJ3BhcnNlIGdldHRlcjogWycsIGV4cHIsIGJvZHksICddZXJyb3InKTtcbiAgICAgICAgICAgIHJldHVybiBhdmFsb24ubm9vcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOeUn+aIkOihqOi+vuW8j+iuvuWAvOWHveaVsFxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gIGV4cHJcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBjcmVhdGVTZXR0ZXIoZXhwciwgdHlwZSkge1xuICAgICAgICB2YXIgYXJyID0gYWRkU2NvcGUoZXhwciwgdHlwZSk7XG4gICAgICAgIHZhciBib2R5ID0gJ3RyeXsgJyArIGFyclswXSArICcgPSBfX3ZhbHVlX199Y2F0Y2goZSl7fSc7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdfX3Ztb2RlbF9fJywgJ19fdmFsdWVfXycsIGJvZHkgKyAnOycpO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgYXZhbG9uLmxvZygncGFyc2Ugc2V0dGVyOiAnLCBleHByLCAnIGVycm9yJyk7XG4gICAgICAgICAgICByZXR1cm4gYXZhbG9uLm5vb3A7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYWN0aW9uVVVJRCA9IDE7XG4gICAgLy/pnIDopoHph43mnoRcbiAgICBmdW5jdGlvbiBBY3Rpb24odm0sIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKHByb3RlY3RlZE1lbmJlcnNbaV0gIT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzW2ldID0gb3B0aW9uc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudm0gPSB2bTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBbXTtcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgICAgICB0aGlzLnV1aWQgPSArK2FjdGlvblVVSUQ7XG4gICAgICAgIHRoaXMuaWRzID0gJyc7XG4gICAgICAgIHRoaXMubWFwSURzID0ge307IC8v6L+Z5Liq55So5LqO5Y676YeNXG4gICAgICAgIHRoaXMuaXNBY3Rpb24gPSB0cnVlO1xuICAgICAgICB2YXIgZXhwciA9IHRoaXMuZXhwcjtcbiAgICAgICAgLy8g57yT5a2Y5Y+W5YC85Ye95pWwXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5nZXR0ZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0dGVyID0gY3JlYXRlR2V0dGVyKGV4cHIsIHRoaXMudHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g57yT5a2Y6K6+5YC85Ye95pWw77yI5Y+M5ZCR5pWw5o2u57uR5a6a77yJXG4gICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdkdXBsZXgnKSB7XG4gICAgICAgICAgICB0aGlzLnNldHRlciA9IGNyZWF0ZVNldHRlcihleHByLCB0aGlzLnR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOe8k+WtmOihqOi+vuW8j+aXp+WAvFxuICAgICAgICB0aGlzLnZhbHVlID0gTmFOO1xuICAgICAgICAvLyDooajovr7lvI/liJ3lp4vlgLwgJiDmj5Dlj5bkvp3otZZcbiAgICAgICAgaWYgKCF0aGlzLm5vZGUpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB0aGlzLmdldCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgQWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgICAgICAgZ2V0VmFsdWU6IGZ1bmN0aW9uIGdldFZhbHVlKCkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcy52bTtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0dGVyLmNhbGwoc2NvcGUsIHNjb3BlKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24ubG9nKHRoaXMuZ2V0dGVyICsgJyBleGVjIGVycm9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNldFZhbHVlOiBmdW5jdGlvbiBzZXRWYWx1ZSh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gdGhpcy52bTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNldHRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0dGVyLmNhbGwoc2NvcGUsIHNjb3BlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvLyBnZXQgLS0+IGdldFZhbHVlIC0tPiBnZXR0ZXJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoZm4pIHtcbiAgICAgICAgICAgIHZhciBuYW1lID0gJ2FjdGlvbiB0cmFjayAnICsgdGhpcy50eXBlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5kZWVwKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmRlZXBDb2xsZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbHVlID0gY29sbGVjdERlcHModGhpcywgdGhpcy5nZXRWYWx1ZSk7XG4gICAgICAgICAgICBpZiAodGhpcy5kZWVwICYmIGF2YWxvbi5kZWVwQ29sbGVjdCkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5kZWVwQ29sbGVjdCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5Zyo5pu05paw6KeG5Zu+5YmN5L+d5a2Y5Y6f5pyJ55qEdmFsdWVcbiAgICAgICAgICovXG4gICAgICAgIGJlZm9yZVVwZGF0ZTogZnVuY3Rpb24gYmVmb3JlVXBkYXRlKCkge1xuICAgICAgICAgICAgdmFyIHYgPSB0aGlzLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMub2xkVmFsdWUgPSB2ICYmIHYuJGV2ZW50cyA/IHYuJG1vZGVsIDogdjtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoYXJncywgdXVpZCkge1xuICAgICAgICAgICAgdmFyIG9sZFZhbCA9IHRoaXMuYmVmb3JlVXBkYXRlKCk7XG4gICAgICAgICAgICB2YXIgbmV3VmFsID0gdGhpcy52YWx1ZSA9IHRoaXMuZ2V0KCk7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSB0aGlzLmNhbGxiYWNrO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICYmIHRoaXMuZGlmZihuZXdWYWwsIG9sZFZhbCwgYXJncykpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXMudm0sIHRoaXMudmFsdWUsIG9sZFZhbCwgdGhpcy5leHByKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2lzU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbiBzY2hlZHVsZSgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNTY2hlZHVsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc1NjaGVkdWxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKCFhdmFsb24udW5pcUFjdGlvbnNbdGhpcy51dWlkXSkge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24udW5pcUFjdGlvbnNbdGhpcy51dWlkXSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi5wZW5kaW5nQWN0aW9ucy5wdXNoKHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJ1bkFjdGlvbnMoKTsgLy/ov5nph4zkvJrov5jljp9faXNTY2hlZHVsZWRcblxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZW1vdmVEZXBlbmRzOiBmdW5jdGlvbiByZW1vdmVEZXBlbmRzKCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5vYnNlcnZlcnMuZm9yRWFjaChmdW5jdGlvbiAoZGVwZW5kKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLkFycmF5LnJlbW92ZShkZXBlbmQub2JzZXJ2ZXJzLCBzZWxmKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOavlOi+g+S4pOS4quiuoeeul+WAvOaYr+WQpizkuIDoh7Qs5ZyoZm9yLCBjbGFzc+etieiDveWkjeadguaVsOaNruexu+Wei+eahOaMh+S7pOS4rSzlroPku6zkvJrph43lhplkaWZm5aSN5rOVXG4gICAgICAgICAqL1xuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhICE9PSBiO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOmUgOavgeaMh+S7pFxuICAgICAgICAgKi9cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gZGlzcG9zZSgpIHtcbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVEZXBlbmRzKCk7XG4gICAgICAgICAgICBpZiAodGhpcy5iZWZvcmVEaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iZWZvcmVEaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHRoaXMpIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgcHJvdGVjdGVkTWVuYmVycyA9IHtcbiAgICAgICAgdm06IDEsXG4gICAgICAgIGNhbGxiYWNrOiAxLFxuXG4gICAgICAgIG9ic2VydmVyczogMSxcbiAgICAgICAgb2xkVmFsdWU6IDEsXG4gICAgICAgIHZhbHVlOiAxLFxuICAgICAgICBnZXRWYWx1ZTogMSxcbiAgICAgICAgc2V0VmFsdWU6IDEsXG4gICAgICAgIGdldDogMSxcblxuICAgICAgICByZW1vdmVEZXBlbmRzOiAxLFxuICAgICAgICBiZWZvcmVVcGRhdGU6IDEsXG4gICAgICAgIHVwZGF0ZTogMSxcbiAgICAgICAgLy9kaWZmXG4gICAgICAgIC8vZ2V0dGVyXG4gICAgICAgIC8vc2V0dGVyXG4gICAgICAgIC8vZXhwclxuICAgICAgICAvL3Zkb21cbiAgICAgICAgLy90eXBlOiBcImZvclwiXG4gICAgICAgIC8vbmFtZTogXCJtcy1mb3JcIlxuICAgICAgICAvL2F0dHJOYW1lOiBcIjpmb3JcIlxuICAgICAgICAvL3BhcmFtOiBcImNsaWNrXCJcbiAgICAgICAgLy9iZWZvcmVEaXNwb3NlXG4gICAgICAgIGRpc3Bvc2U6IDFcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgKiBcbiAgICAg5LiOQ29tcHV0ZWTnrYnlhbHkuqtVVUlEXG4gICAgKi9cbiAgICB2YXIgb2JpZCA9IDE7XG4gICAgZnVuY3Rpb24gTXV0YXRpb24oZXhwciwgdmFsdWUsIHZtKSB7XG4gICAgICAgIC8v5p6E6YCg5Ye95pWwXG4gICAgICAgIHRoaXMuZXhwciA9IGV4cHI7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGNoaWxkVm0gPSBwbGF0Zm9ybS5jcmVhdGVQcm94eSh2YWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICBpZiAoY2hpbGRWbSkge1xuICAgICAgICAgICAgICAgIHZhbHVlID0gY2hpbGRWbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgICAgIHRoaXMudm0gPSB2bTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZtLiRtdXRhdGlvbnNbZXhwcl0gPSB0aGlzO1xuICAgICAgICB9IGNhdGNoIChpZ25vcmVJRSkge31cbiAgICAgICAgdGhpcy51dWlkID0gKytvYmlkO1xuICAgICAgICB0aGlzLnVwZGF0ZVZlcnNpb24oKTtcbiAgICAgICAgdGhpcy5tYXBJRHMgPSB7fTtcbiAgICAgICAgdGhpcy5vYnNlcnZlcnMgPSBbXTtcbiAgICB9XG5cbiAgICBNdXRhdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgaWYgKGF2YWxvbi50cmFja2luZ0FjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuY29sbGVjdCgpOyAvL+iiq+aUtumbhlxuICAgICAgICAgICAgICAgIHZhciBjaGlsZE9iID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRPYiAmJiBjaGlsZE9iLiRldmVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGRPYikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkT2IuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpdGVtICYmIGl0ZW0uJGV2ZW50cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLiRldmVudHMuX19kZXBfXy5jb2xsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYXZhbG9uLmRlZXBDb2xsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gY2hpbGRPYikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZE9iLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbGxlY3RJdCA9IGNoaWxkT2Jba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgY29sbGVjdDogZnVuY3Rpb24gY29sbGVjdCgpIHtcbiAgICAgICAgICAgIGF2YWxvbi50cmFjayhuYW1lLCAn6KKr5pS26ZuGJyk7XG4gICAgICAgICAgICByZXBvcnRPYnNlcnZlZCh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlVmVyc2lvbjogZnVuY3Rpb24gdXBkYXRlVmVyc2lvbigpIHtcbiAgICAgICAgICAgIHRoaXMudmVyc2lvbiA9IE1hdGgucmFuZG9tKCkgKyBNYXRoLnJhbmRvbSgpO1xuICAgICAgICB9LFxuICAgICAgICBub3RpZnk6IGZ1bmN0aW9uIG5vdGlmeSgpIHtcbiAgICAgICAgICAgIHRyYW5zYWN0aW9uU3RhcnQoKTtcbiAgICAgICAgICAgIHByb3BhZ2F0ZUNoYW5nZWQodGhpcyk7XG4gICAgICAgICAgICB0cmFuc2FjdGlvbkVuZCgpO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgICAgIGlmIChuZXdWYWx1ZSAhPT0gb2xkVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXZhbG9uLmlzT2JqZWN0KG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaGFzaCA9IG9sZFZhbHVlICYmIG9sZFZhbHVlLiRoYXNoY29kZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkVk0gPSBwbGF0Zm9ybS5jcmVhdGVQcm94eShuZXdWYWx1ZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZFZNKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzaCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoaWxkVk0uJGhhc2hjb2RlID0gaGFzaDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbHVlID0gY2hpbGRWTTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVWZXJzaW9uKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5ub3RpZnkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRCb2R5KGZuKSB7XG4gICAgICAgIHZhciBlbnRpcmUgPSBmbi50b1N0cmluZygpO1xuICAgICAgICByZXR1cm4gZW50aXJlLnN1YnN0cmluZyhlbnRpcmUuaW5kZXhPZigne30nKSArIDEsIGVudGlyZS5sYXN0SW5kZXhPZignfScpKTtcbiAgICB9XG4gICAgLy/lpoLmnpzkuI3lrZjlnKjkuInnm64saWYs5pa55rOVXG4gICAgdmFyIGluc3RhYmlsaXR5ID0gLyhcXD98aWZcXGJ8XFwoLitcXCkpLztcblxuICAgIGZ1bmN0aW9uIF9fY3JlYXRlKG8pIHtcbiAgICAgICAgdmFyIF9fID0gZnVuY3Rpb24gX18oKSB7fTtcbiAgICAgICAgX18ucHJvdG90eXBlID0gbztcbiAgICAgICAgcmV0dXJuIG5ldyBfXygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9fZXh0ZW5kcyhjaGlsZCwgcGFyZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFyZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICB2YXIgcHJvdG8gPSBjaGlsZC5wcm90b3R5cGUgPSBfX2NyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcbiAgICAgICAgICAgIHByb3RvLmNvbnN0cnVjdG9yID0gY2hpbGQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIENvbXB1dGVkID0gZnVuY3Rpb24gKF9zdXBlcikge1xuICAgICAgICBfX2V4dGVuZHMoQ29tcHV0ZWQsIF9zdXBlcik7XG5cbiAgICAgICAgZnVuY3Rpb24gQ29tcHV0ZWQobmFtZSwgb3B0aW9ucywgdm0pIHtcbiAgICAgICAgICAgIC8v5p6E6YCg5Ye95pWwXG4gICAgICAgICAgICBfc3VwZXIuY2FsbCh0aGlzLCBuYW1lLCB1bmRlZmluZWQsIHZtKTtcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLmdldDtcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRpb25zLnNldDtcblxuICAgICAgICAgICAgYXZhbG9uLm1peCh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgIHRoaXMuZGVwcyA9IHt9O1xuICAgICAgICAgICAgdGhpcy50eXBlID0gJ2NvbXB1dGVkJztcbiAgICAgICAgICAgIHRoaXMuZGVwc1ZlcnNpb24gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuaXNDb21wdXRlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnRyYWNrQW5kQ29tcHV0ZSgpO1xuICAgICAgICAgICAgaWYgKCEoJ2lzU3RhYmxlJyBpbiB0aGlzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuaXNTdGFibGUgPSAhaW5zdGFiaWxpdHkudGVzdChnZXRCb2R5KHRoaXMuZ2V0dGVyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNwID0gQ29tcHV0ZWQucHJvdG90eXBlO1xuICAgICAgICBjcC50cmFja0FuZENvbXB1dGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1N0YWJsZSAmJiB0aGlzLmRlcHNDb3VudCA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldFZhbHVlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbGxlY3REZXBzKHRoaXMsIHRoaXMuZ2V0VmFsdWUuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgY3AuZ2V0VmFsdWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZSA9IHRoaXMuZ2V0dGVyLmNhbGwodGhpcy52bSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgY3Auc2NoZWR1bGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgb2JzZXJ2ZXJzID0gdGhpcy5vYnNlcnZlcnM7XG4gICAgICAgICAgICB2YXIgaSA9IG9ic2VydmVycy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQgPSBvYnNlcnZlcnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKGQuc2NoZWR1bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgZC5zY2hlZHVsZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBjcC5zaG91bGRDb21wdXRlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNTdGFibGUpIHtcbiAgICAgICAgICAgICAgICAvL+WmguaenOWPmOWKqOWboOWtkOehruWumizpgqPkuYjlj6rmr5TovoPlj5jliqjlm6DlrZDnmoTniYjmnKxcbiAgICAgICAgICAgICAgICB2YXIgdG9Db21wdXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdGhpcy5kZXBzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmRlcHNbaV0udmVyc2lvbiAhPT0gdGhpcy5kZXBzVmVyc2lvbltpXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Db21wdXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRlcHNbaV0udmVyc2lvbiA9IHRoaXMuZGVwc1ZlcnNpb25baV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRvQ29tcHV0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgICAgY3Auc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2V0dGVyKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLnRyYW5zYWN0aW9uKHRoaXMuc2V0dGVyLCB0aGlzLnZtLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjcC5nZXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIC8v5b2T6KKr6K6+572u5LqG5bCx5LiN56iz5a6aLOW9k+Wug+iiq+iuv+mXruS6huS4gOasoeWwseaYr+eos+WumlxuICAgICAgICAgICAgdGhpcy5jb2xsZWN0KCk7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNob3VsZENvbXB1dGUoKSkge1xuICAgICAgICAgICAgICAgIHRoaXMudHJhY2tBbmRDb21wdXRlKCk7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvbXB1dGVkIDIg5YiG5pSvJylcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZVZlcnNpb24oKTtcbiAgICAgICAgICAgICAgICAvLyAgdGhpcy5yZXBvcnRDaGFuZ2VkKClcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/kuIvpnaLov5nkuIDooYzlpb3lg4/msqHnlKhcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnZhbHVlO1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gQ29tcHV0ZWQ7XG4gICAgfShNdXRhdGlvbik7XG5cbiAgICAvKipcbiAgICAgKiDov5nph4zmlL7nva5WaWV3TW9kZWzmqKHlnZfnmoTlhbHnlKjmlrnms5VcbiAgICAgKiBhdmFsb24uZGVmaW5lOiDlhajmoYbmnrbmnIDph43opoHnmoTmlrnms5Us55Sf5oiQ55So5oi3Vk1cbiAgICAgKiBJUHJveHksIOWfuuacrOeUqOaIt+aVsOaNruS6p+eUn+eahOS4gOS4quaVsOaNruWvueixoSzln7rkuo4kbW9kZWzkuI52bW9kZWzkuYvpl7TnmoTlvaLmgIFcbiAgICAgKiBtb2RlbEZhY3Rvcnk6IOeUn+aIkOeUqOaIt1ZNXG4gICAgICogY2FuSGlqYWNrOiDliKTlrprmraTlsZ7mgKfmmK/lkKbor6XooqvliqvmjIEs5Yqg5YWl5pWw5o2u55uR5ZCs5LiO5YiG5Y+R55qE55qE6YC76L6RXG4gICAgICogY3JlYXRlUHJveHk6IGxpc3RGYWN0b3J55LiObW9kZWxGYWN0b3J555qE5bCB6KOFXG4gICAgICogY3JlYXRlQWNjZXNzb3I6IOWunueOsOaVsOaNruebkeWQrOS4juWIhuWPkeeahOmHjeimgeWvueixoVxuICAgICAqIGl0ZW1GYWN0b3J5OiBtcy1mb3Llvqrnjq/kuK3kuqfnlJ/nmoTku6PnkIZWTeeahOeUn+aIkOW3peWOglxuICAgICAqIGZ1c2VGYWN0b3J5OiDkuKTkuKptcy1jb250cm9sbGVy6Ze05Lqn55Sf55qE5Luj55CGVk3nmoTnlJ/miJDlt6XljoJcbiAgICAgKi9cblxuICAgIGF2YWxvbi5kZWZpbmUgPSBmdW5jdGlvbiAoZGVmaW5pdGlvbikge1xuICAgICAgICB2YXIgJGlkID0gZGVmaW5pdGlvbi4kaWQ7XG4gICAgICAgIGlmICghJGlkKSB7XG4gICAgICAgICAgICBhdmFsb24uZXJyb3IoJ3ZtLiRpZCBtdXN0IGJlIHNwZWNpZmllZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhdmFsb24udm1vZGVsc1skaWRdKSB7XG4gICAgICAgICAgICBhdmFsb24ud2FybignZXJyb3I6WycgKyAkaWQgKyAnXSBoYWQgZGVmaW5lZCEnKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdm0gPSBwbGF0Zm9ybS5tb2RlbEZhY3RvcnkoZGVmaW5pdGlvbik7XG4gICAgICAgIHJldHVybiBhdmFsb24udm1vZGVsc1skaWRdID0gdm07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOWcqOacquadpeeahOeJiOacrCxhdmFsb27mlLnnlKhQcm94eeadpeWIm+W7ulZNLOWboOatpFxuICAgICAqL1xuXG4gICAgZnVuY3Rpb24gSVByb3h5KGRlZmluaXRpb24sIGRkKSB7XG4gICAgICAgIGF2YWxvbi5taXgodGhpcywgZGVmaW5pdGlvbik7XG4gICAgICAgIGF2YWxvbi5taXgodGhpcywgJCRza2lwQXJyYXkpO1xuICAgICAgICB0aGlzLiRoYXNoY29kZSA9IGF2YWxvbi5tYWtlSGFzaENvZGUoJyQnKTtcbiAgICAgICAgdGhpcy4kaWQgPSB0aGlzLiRpZCB8fCB0aGlzLiRoYXNoY29kZTtcbiAgICAgICAgdGhpcy4kZXZlbnRzID0ge1xuICAgICAgICAgICAgX19kZXBfXzogZGQgfHwgbmV3IE11dGF0aW9uKHRoaXMuJGlkKVxuICAgICAgICB9O1xuICAgICAgICBpZiAoYXZhbG9uLmNvbmZpZy5pblByb3h5TW9kZSkge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuJG11dGF0aW9ucztcbiAgICAgICAgICAgIHRoaXMuJGFjY2Vzc29ycyA9IHt9O1xuICAgICAgICAgICAgdGhpcy4kY29tcHV0ZWQgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuJHRyYWNrID0gJyc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLiRhY2Nlc3NvcnMgPSB7XG4gICAgICAgICAgICAgICAgJG1vZGVsOiBtb2RlbEFjY2Vzc29yXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChkZCA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgICB0aGlzLiR3YXRjaCA9IHBsYXRmb3JtLndhdGNoRmFjdG9yeSh0aGlzLiRldmVudHMpO1xuICAgICAgICAgICAgdGhpcy4kZmlyZSA9IHBsYXRmb3JtLmZpcmVGYWN0b3J5KHRoaXMuJGV2ZW50cyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy4kd2F0Y2g7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy4kZmlyZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBsYXRmb3JtLm1vZGVsRmFjdG9yeSA9IGZ1bmN0aW9uIG1vZGVsRmFjdG9yeShkZWZpbml0aW9uLCBkZCkge1xuICAgICAgICB2YXIgJGNvbXB1dGVkID0gZGVmaW5pdGlvbi4kY29tcHV0ZWQgfHwge307XG4gICAgICAgIGRlbGV0ZSBkZWZpbml0aW9uLiRjb21wdXRlZDtcbiAgICAgICAgdmFyIGNvcmUgPSBuZXcgSVByb3h5KGRlZmluaXRpb24sIGRkKTtcbiAgICAgICAgdmFyICRhY2Nlc3NvcnMgPSBjb3JlLiRhY2Nlc3NvcnM7XG4gICAgICAgIHZhciBrZXlzID0gW107XG5cbiAgICAgICAgcGxhdGZvcm0uaGlkZVByb3BlcnR5KGNvcmUsICckbXV0YXRpb25zJywge30pO1xuXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG4gICAgICAgICAgICBpZiAoa2V5IGluICQkc2tpcEFycmF5KSBjb250aW51ZTtcbiAgICAgICAgICAgIHZhciB2YWwgPSBkZWZpbml0aW9uW2tleV07XG4gICAgICAgICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIGlmIChjYW5IaWphY2soa2V5LCB2YWwpKSB7XG4gICAgICAgICAgICAgICAgJGFjY2Vzc29yc1trZXldID0gY3JlYXRlQWNjZXNzb3Ioa2V5LCB2YWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIF9rZXkgaW4gJGNvbXB1dGVkKSB7XG4gICAgICAgICAgICBpZiAoX2tleSBpbiAkJHNraXBBcnJheSkgY29udGludWU7XG4gICAgICAgICAgICB2YXIgdmFsID0gJGNvbXB1dGVkW19rZXldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB2YWwgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB2YWwgPSB7XG4gICAgICAgICAgICAgICAgICAgIGdldDogdmFsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YWwgJiYgdmFsLmdldCkge1xuICAgICAgICAgICAgICAgIHZhbC5nZXR0ZXIgPSB2YWwuZ2V0O1xuICAgICAgICAgICAgICAgIHZhbC5zZXR0ZXIgPSB2YWwuc2V0O1xuICAgICAgICAgICAgICAgIGF2YWxvbi5BcnJheS5lbnN1cmUoa2V5cywgX2tleSk7XG4gICAgICAgICAgICAgICAgJGFjY2Vzc29yc1tfa2V5XSA9IGNyZWF0ZUFjY2Vzc29yKF9rZXksIHZhbCwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy/lsIbns7vnu59BUEnku6V1bmVudW1lcmFibGXlvaLlvI/liqDlhaV2bSxcbiAgICAgICAgLy/mt7vliqDnlKjmiLfnmoTlhbbku5bkuI3lj6/nm5HlkKzlsZ7mgKfmiJbmlrnms5VcbiAgICAgICAgLy/ph43lhpkkdHJhY2tcbiAgICAgICAgLy/lubblnKhJRTYtOOS4reWinua3u+WKoOS4jeWtmOWcqOeahGhhc093blByb3BlcnTmlrnms5VcbiAgICAgICAgdmFyIHZtID0gcGxhdGZvcm0uY3JlYXRlVmlld01vZGVsKGNvcmUsICRhY2Nlc3NvcnMsIGNvcmUpO1xuICAgICAgICBwbGF0Zm9ybS5hZnRlckNyZWF0ZSh2bSwgY29yZSwga2V5cywgIWRkKTtcbiAgICAgICAgcmV0dXJuIHZtO1xuICAgIH07XG4gICAgdmFyICRwcm94eUl0ZW1CYWNrZG9vck1hcCA9IHt9O1xuXG4gICAgZnVuY3Rpb24gY2FuSGlqYWNrKGtleSwgdmFsLCAkcHJveHlJdGVtQmFja2Rvb3IpIHtcbiAgICAgICAgaWYgKGtleSBpbiAkJHNraXBBcnJheSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAoa2V5LmNoYXJBdCgwKSA9PT0gJyQnKSB7XG4gICAgICAgICAgICBpZiAoJHByb3h5SXRlbUJhY2tkb29yKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkcHJveHlJdGVtQmFja2Rvb3JNYXBba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAkcHJveHlJdGVtQmFja2Rvb3JNYXBba2V5XSA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi53YXJuKCdtcy1mb3JcXHU0RTJEXFx1NzY4NFxcdTUzRDhcXHU5MUNGJyArIGtleSArICdcXHU0RTBEXFx1NTE4RFxcdTVFRkFcXHU4QkFFXFx1NEVFNSRcXHU0RTNBXFx1NTI0RFxcdTdGMDAnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbCA9PSBudWxsKSB7XG4gICAgICAgICAgICBhdmFsb24ud2Fybign5a6a5LmJdm1vZGVs5pe2JyArIGtleSArICfnmoTlsZ7mgKflgLzkuI3og73kuLpudWxsIHVuZGVmaW5lJyk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoL2Vycm9yfGRhdGV8ZnVuY3Rpb258cmVnZXhwLy50ZXN0KGF2YWxvbi50eXBlKHZhbCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEodmFsICYmIHZhbC5ub2RlTmFtZSAmJiB2YWwubm9kZVR5cGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVByb3h5KHRhcmdldCwgZGQpIHtcbiAgICAgICAgaWYgKHRhcmdldCAmJiB0YXJnZXQuJGV2ZW50cykge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdm07XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KHRhcmdldCkpIHtcbiAgICAgICAgICAgIHZtID0gcGxhdGZvcm0ubGlzdEZhY3RvcnkodGFyZ2V0LCBmYWxzZSwgZGQpO1xuICAgICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KHRhcmdldCkpIHtcbiAgICAgICAgICAgIHZtID0gcGxhdGZvcm0ubW9kZWxGYWN0b3J5KHRhcmdldCwgZGQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2bTtcbiAgICB9XG5cbiAgICBwbGF0Zm9ybS5jcmVhdGVQcm94eSA9IGNyZWF0ZVByb3h5O1xuXG4gICAgcGxhdGZvcm0uaXRlbUZhY3RvcnkgPSBmdW5jdGlvbiBpdGVtRmFjdG9yeShiZWZvcmUsIGFmdGVyKSB7XG4gICAgICAgIHZhciBrZXlNYXAgPSBiZWZvcmUuJG1vZGVsO1xuICAgICAgICB2YXIgY29yZSA9IG5ldyBJUHJveHkoa2V5TWFwKTtcbiAgICAgICAgdmFyIHN0YXRlID0gYXZhbG9uLnNoYWRvd0NvcHkoY29yZS4kYWNjZXNzb3JzLCBiZWZvcmUuJGFjY2Vzc29ycyk7IC8v6Ziy5q2i5LqS55u45rGh5p+TXG4gICAgICAgIHZhciBkYXRhID0gYWZ0ZXIuZGF0YTtcbiAgICAgICAgLy9jb3Jl5piv5YyF5ZCr57O757uf5bGe5oCn55qE5a+56LGhXG4gICAgICAgIC8va2V5TWFw5piv5LiN5YyF5ZCr57O757uf5bGe5oCn55qE5a+56LGhLCBrZXlzXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0ga2V5TWFwW2tleV0gPSBjb3JlW2tleV0gPSBkYXRhW2tleV07XG4gICAgICAgICAgICBzdGF0ZVtrZXldID0gY3JlYXRlQWNjZXNzb3Ioa2V5LCB2YWwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoa2V5TWFwKTtcbiAgICAgICAgdmFyIHZtID0gcGxhdGZvcm0uY3JlYXRlVmlld01vZGVsKGNvcmUsIHN0YXRlLCBjb3JlKTtcbiAgICAgICAgcGxhdGZvcm0uYWZ0ZXJDcmVhdGUodm0sIGNvcmUsIGtleXMpO1xuICAgICAgICByZXR1cm4gdm07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUFjY2Vzc29yKGtleSwgdmFsLCBpc0NvbXB1dGVkKSB7XG4gICAgICAgIHZhciBtdXRhdGlvbiA9IG51bGw7XG4gICAgICAgIHZhciBBY2Nlc3NvciA9IGlzQ29tcHV0ZWQgPyBDb21wdXRlZCA6IE11dGF0aW9uO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBHZXR0ZXIoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtdXRhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICBtdXRhdGlvbiA9IG5ldyBBY2Nlc3NvcihrZXksIHZhbCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtdXRhdGlvbi5nZXQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uIFNldHRlcihuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgIGlmICghbXV0YXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgbXV0YXRpb24gPSBuZXcgQWNjZXNzb3Ioa2V5LCB2YWwsIHRoaXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtdXRhdGlvbi5zZXQobmV3VmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwbGF0Zm9ybS5mdXNlRmFjdG9yeSA9IGZ1bmN0aW9uIGZ1c2VGYWN0b3J5KGJlZm9yZSwgYWZ0ZXIpIHtcbiAgICAgICAgdmFyIGtleU1hcCA9IGF2YWxvbi5taXgoYmVmb3JlLiRtb2RlbCwgYWZ0ZXIuJG1vZGVsKTtcbiAgICAgICAgdmFyIGNvcmUgPSBuZXcgSVByb3h5KGF2YWxvbi5taXgoa2V5TWFwLCB7XG4gICAgICAgICAgICAkaWQ6IGJlZm9yZS4kaWQgKyBhZnRlci4kaWRcbiAgICAgICAgfSkpO1xuICAgICAgICB2YXIgc3RhdGUgPSBhdmFsb24ubWl4KGNvcmUuJGFjY2Vzc29ycywgYmVmb3JlLiRhY2Nlc3NvcnMsIGFmdGVyLiRhY2Nlc3NvcnMpOyAvL+mYsuatouS6kuebuOaxoeafk1xuXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoa2V5TWFwKTtcbiAgICAgICAgLy/lsIbns7vnu59BUEnku6V1bmVudW1lcmFibGXlvaLlvI/liqDlhaV2bSzlubblnKhJRTYtOOS4rea3u+WKoGhhc093blByb3BlcnTmlrnms5VcbiAgICAgICAgdmFyIHZtID0gcGxhdGZvcm0uY3JlYXRlVmlld01vZGVsKGNvcmUsIHN0YXRlLCBjb3JlKTtcbiAgICAgICAgcGxhdGZvcm0uYWZ0ZXJDcmVhdGUodm0sIGNvcmUsIGtleXMsIGZhbHNlKTtcbiAgICAgICAgcmV0dXJuIHZtO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiB0b0pzb24odmFsKSB7XG4gICAgICAgIHZhciB4dHlwZSA9IGF2YWxvbi50eXBlKHZhbCk7XG4gICAgICAgIGlmICh4dHlwZSA9PT0gJ2FycmF5Jykge1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGFycmF5W2ldID0gdG9Kc29uKHZhbFtpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYXJyYXk7XG4gICAgICAgIH0gZWxzZSBpZiAoeHR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHZhbC4kdHJhY2sgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIHZhciBhcnIgPSB2YWwuJHRyYWNrLm1hdGNoKC9bXuKYpV0rL2cpIHx8IFtdO1xuICAgICAgICAgICAgICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgb2JqW2ldID0gdmFsdWUgJiYgdmFsdWUuJGV2ZW50cyA/IHRvSnNvbih2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuXG4gICAgdmFyIG1vZGVsQWNjZXNzb3IgPSB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvSnNvbih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBhdmFsb24ubm9vcCxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH07XG5cbiAgICBwbGF0Zm9ybS50b0pzb24gPSB0b0pzb247XG4gICAgcGxhdGZvcm0ubW9kZWxBY2Nlc3NvciA9IG1vZGVsQWNjZXNzb3I7XG5cbiAgICB2YXIgX3NwbGljZSA9IGFwLnNwbGljZTtcbiAgICB2YXIgX19hcnJheV9fID0ge1xuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChpbmRleCwgdmFsKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPj4+IDAgPT09IGluZGV4ICYmIHRoaXNbaW5kZXhdICE9PSB2YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiB0aGlzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBFcnJvcihpbmRleCArICdzZXTmlrnms5XnmoTnrKzkuIDkuKrlj4LmlbDkuI3og73lpKfkuo7ljp/mlbDnu4Tplb/luqYnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5zcGxpY2UoaW5kZXgsIDEsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHRvSlNPTjogZnVuY3Rpb24gdG9KU09OKCkge1xuICAgICAgICAgICAgLy/kuLrkuobop6PlhrNJRTYtOOeahOino+WGsyzpgJrov4fmraTmlrnms5XmmL7lvI/lnLDmsYLlj5bmlbDnu4TnmoQkbW9kZWxcbiAgICAgICAgICAgIHJldHVybiB0aGlzLiRtb2RlbCA9IHBsYXRmb3JtLnRvSnNvbih0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29udGFpbnM6IGZ1bmN0aW9uIGNvbnRhaW5zKGVsKSB7XG4gICAgICAgICAgICAvL+WIpOWumuaYr+WQpuWMheWQq1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW5kZXhPZihlbCkgIT09IC0xO1xuICAgICAgICB9LFxuICAgICAgICBlbnN1cmU6IGZ1bmN0aW9uIGVuc3VyZShlbCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNvbnRhaW5zKGVsKSkge1xuICAgICAgICAgICAgICAgIC8v5Y+q5pyJ5LiN5a2Y5Zyo5omNcHVzaFxuICAgICAgICAgICAgICAgIHRoaXMucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIHB1c2hBcnJheTogZnVuY3Rpb24gcHVzaEFycmF5KGFycikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaC5hcHBseSh0aGlzLCBhcnIpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmU6IGZ1bmN0aW9uIHJlbW92ZShlbCkge1xuICAgICAgICAgICAgLy/np7vpmaTnrKzkuIDkuKrnrYnkuo7nu5nlrprlgLznmoTlhYPntKBcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUF0KHRoaXMuaW5kZXhPZihlbCkpO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmVBdDogZnVuY3Rpb24gcmVtb3ZlQXQoaW5kZXgpIHtcbiAgICAgICAgICAgIC8v56e76Zmk5oyH5a6a57Si5byV5LiK55qE5YWD57SgXG4gICAgICAgICAgICBpZiAoaW5kZXggPj4+IDAgPT09IGluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVBbGwoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuICAgICAgICByZW1vdmVBbGw6IGZ1bmN0aW9uIHJlbW92ZUFsbChhbGwpIHtcbiAgICAgICAgICAgIC8v56e76ZmkTuS4quWFg+e0oFxuICAgICAgICAgICAgdmFyIHNpemUgPSB0aGlzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBlbGltaW5hdGUgPSBBcnJheS5pc0FycmF5KGFsbCkgPyBmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWxsLmluZGV4T2YoZWwpICE9PSAtMTtcbiAgICAgICAgICAgIH0gOiB0eXBlb2YgYWxsID09PSAnZnVuY3Rpb24nID8gYWxsIDogZmFsc2U7XG5cbiAgICAgICAgICAgIGlmIChlbGltaW5hdGUpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZWxpbWluYXRlKHRoaXNbaV0sIGkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfc3BsaWNlLmNhbGwodGhpcywgaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIF9zcGxpY2UuY2FsbCh0aGlzLCAwLCB0aGlzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRvSlNPTigpO1xuICAgICAgICAgICAgdGhpcy4kZXZlbnRzLl9fZGVwX18ubm90aWZ5KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIGhpamFja01ldGhvZHMoYXJyYXkpIHtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBfX2FycmF5X18pIHtcbiAgICAgICAgICAgIHBsYXRmb3JtLmhpZGVQcm9wZXJ0eShhcnJheSwgaSwgX19hcnJheV9fW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgX19tZXRob2RfXyA9IFsncHVzaCcsICdwb3AnLCAnc2hpZnQnLCAndW5zaGlmdCcsICdzcGxpY2UnLCAnc29ydCcsICdyZXZlcnNlJ107XG5cbiAgICBfX21ldGhvZF9fLmZvckVhY2goZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgICAgICB2YXIgb3JpZ2luYWwgPSBhcFttZXRob2RdO1xuICAgICAgICBfX2FycmF5X19bbWV0aG9kXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIOe7p+e7reWwneivleWKq+aMgeaVsOe7hOWFg+e0oOeahOWxnuaAp1xuICAgICAgICAgICAgdmFyIGNvcmUgPSB0aGlzLiRldmVudHM7XG5cbiAgICAgICAgICAgIHZhciBhcmdzID0gcGxhdGZvcm0ubGlzdEZhY3RvcnkoYXJndW1lbnRzLCB0cnVlLCBjb3JlLl9fZGVwX18pO1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IG9yaWdpbmFsLmFwcGx5KHRoaXMsIGFyZ3MpO1xuXG4gICAgICAgICAgICB0aGlzLnRvSlNPTigpO1xuICAgICAgICAgICAgY29yZS5fX2RlcF9fLm5vdGlmeShtZXRob2QpO1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGxpc3RGYWN0b3J5KGFycmF5LCBzdG9wLCBkZCkge1xuICAgICAgICBpZiAoIXN0b3ApIHtcbiAgICAgICAgICAgIGhpamFja01ldGhvZHMoYXJyYXkpO1xuICAgICAgICAgICAgaWYgKG1vZGVybikge1xuICAgICAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhcnJheSwgJyRtb2RlbCcsIHBsYXRmb3JtLm1vZGVsQWNjZXNzb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGxhdGZvcm0uaGlkZVByb3BlcnR5KGFycmF5LCAnJGhhc2hjb2RlJywgYXZhbG9uLm1ha2VIYXNoQ29kZSgnJCcpKTtcbiAgICAgICAgICAgIHBsYXRmb3JtLmhpZGVQcm9wZXJ0eShhcnJheSwgJyRldmVudHMnLCB7IF9fZGVwX186IGRkIHx8IG5ldyBNdXRhdGlvbigpIH0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBfZGQgPSBhcnJheS4kZXZlbnRzICYmIGFycmF5LiRldmVudHMuX19kZXBfXztcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcnJheS5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QoaXRlbSkpIHtcbiAgICAgICAgICAgICAgICBhcnJheVtpXSA9IHBsYXRmb3JtLmNyZWF0ZVByb3h5KGl0ZW0sIF9kZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH1cblxuICAgIHBsYXRmb3JtLmxpc3RGYWN0b3J5ID0gbGlzdEZhY3Rvcnk7XG5cbiAgICAvL+WmguaenOa1j+iniOWZqOS4jeaUr+aMgWVjbWEyNjJ2NeeahE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVz5oiW6ICF5a2Y5ZyoQlVH77yM5q+U5aaCSUU4XG4gICAgLy/moIflh4bmtY/op4jlmajkvb/nlKhfX2RlZmluZUdldHRlcl9fLCBfX2RlZmluZVNldHRlcl9f5a6e546wXG4gICAgdmFyIGNhbkhpZGVQcm9wZXJ0eSA9IHRydWU7XG4gICAgdHJ5IHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnXycsIHtcbiAgICAgICAgICAgIHZhbHVlOiAneCdcbiAgICAgICAgfSk7XG4gICAgICAgIGRlbGV0ZSAkJHNraXBBcnJheS4kdmJzZXR0ZXI7XG4gICAgICAgIGRlbGV0ZSAkJHNraXBBcnJheS4kdmJ0aGlzO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgICAgICBjYW5IaWRlUHJvcGVydHkgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgcHJvdGVjdGVkVkIgPSB7ICR2YnRoaXM6IDEsICR2YnNldHRlcjogMSB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gaGlkZVByb3BlcnR5KGhvc3QsIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmIChjYW5IaWRlUHJvcGVydHkpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShob3N0LCBuYW1lLCB7XG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICAgICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXByb3RlY3RlZFZCW25hbWVdKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICAgICAgaG9zdFtuYW1lXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gd2F0Y2hGYWN0b3J5KGNvcmUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICR3YXRjaChleHByLCBjYWxsYmFjaywgZGVlcCkge1xuICAgICAgICAgICAgdmFyIHcgPSBuZXcgQWN0aW9uKGNvcmUuX19wcm94eV9fLCB7XG4gICAgICAgICAgICAgICAgZGVlcDogZGVlcCxcbiAgICAgICAgICAgICAgICB0eXBlOiAndXNlcicsXG4gICAgICAgICAgICAgICAgZXhwcjogZXhwclxuICAgICAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgaWYgKCFjb3JlW2V4cHJdKSB7XG4gICAgICAgICAgICAgICAgY29yZVtleHByXSA9IFt3XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29yZVtleHByXS5wdXNoKHcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHcuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIGF2YWxvbi5BcnJheS5yZW1vdmUoY29yZVtleHByXSwgdyk7XG4gICAgICAgICAgICAgICAgaWYgKGNvcmVbZXhwcl0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBjb3JlW2V4cHJdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmlyZUZhY3RvcnkoY29yZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gJGZpcmUoZXhwciwgYSkge1xuICAgICAgICAgICAgdmFyIGxpc3QgPSBjb3JlW2V4cHJdO1xuICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgdzsgdyA9IGxpc3RbaSsrXTspIHtcbiAgICAgICAgICAgICAgICAgICAgdy5jYWxsYmFjay5jYWxsKHcudm0sIGEsIHcudmFsdWUsIHcuZXhwcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHdyYXBJdChzdHIpIHtcbiAgICAgICAgcmV0dXJuICfimKUnICsgc3RyICsgJ+KYpSc7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWZ0ZXJDcmVhdGUodm0sIGNvcmUsIGtleXMsIGJpbmRUaGlzKSB7XG4gICAgICAgIHZhciBhYyA9IHZtLiRhY2Nlc3NvcnM7XG4gICAgICAgIC8v6ZqQ6JeP57O757uf5bGe5oCnXG4gICAgICAgIGZvciAodmFyIGtleSBpbiAkJHNraXBBcnJheSkge1xuICAgICAgICAgICAgaWYgKGF2YWxvbi5tc2llIDwgOSAmJiBjb3JlW2tleV0gPT09IHZvaWQgMCkgY29udGludWU7XG4gICAgICAgICAgICBoaWRlUHJvcGVydHkodm0sIGtleSwgY29yZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgICAvL+S4uuS4jeWPr+ebkeWQrOeahOWxnuaAp+aIluaWueazlei1i+WAvFxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBfa2V5MiA9IGtleXNbaV07XG4gICAgICAgICAgICBpZiAoIShfa2V5MiBpbiBhYykpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmluZFRoaXMgJiYgdHlwZW9mIGNvcmVbX2tleTJdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHZtW19rZXkyXSA9IGNvcmVbX2tleTJdLmJpbmQodm0pO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdm1bX2tleTJdID0gY29yZVtfa2V5Ml07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdm0uJHRyYWNrID0ga2V5cy5qb2luKCfimKUnKTtcblxuICAgICAgICBmdW5jdGlvbiBoYXNPd25LZXkoa2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gd3JhcEl0KHZtLiR0cmFjaykuaW5kZXhPZih3cmFwSXQoa2V5KSkgPiAtMTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYXZhbG9uLm1zaWUgPCA5KSB7XG4gICAgICAgICAgICB2bS5oYXNPd25Qcm9wZXJ0eSA9IGhhc093bktleTtcbiAgICAgICAgfVxuICAgICAgICB2bS4kZXZlbnRzLl9fcHJveHlfXyA9IHZtO1xuICAgIH1cblxuICAgIHBsYXRmb3JtLmhpZGVQcm9wZXJ0eSA9IGhpZGVQcm9wZXJ0eTtcbiAgICBwbGF0Zm9ybS5maXJlRmFjdG9yeSA9IGZpcmVGYWN0b3J5O1xuICAgIHBsYXRmb3JtLndhdGNoRmFjdG9yeSA9IHdhdGNoRmFjdG9yeTtcbiAgICBwbGF0Zm9ybS5hZnRlckNyZWF0ZSA9IGFmdGVyQ3JlYXRlO1xuXG4gICAgdmFyIGNyZWF0ZVZpZXdNb2RlbCA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzO1xuICAgIHZhciBkZWZpbmVQcm9wZXJ0eTtcblxuICAgIHZhciB0aW1lQnVja2V0ID0gbmV3IERhdGUoKSAtIDA7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICBpZiAoIWNhbkhpZGVQcm9wZXJ0eSkge1xuICAgICAgICBpZiAoJ19fZGVmaW5lR2V0dGVyX18nIGluIGF2YWxvbikge1xuICAgICAgICAgICAgZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShvYmosIHByb3AsIGRlc2MpIHtcbiAgICAgICAgICAgICAgICBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIG9ialtwcm9wXSA9IGRlc2MudmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICgnZ2V0JyBpbiBkZXNjKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iai5fX2RlZmluZUdldHRlcl9fKHByb3AsIGRlc2MuZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCdzZXQnIGluIGRlc2MpIHtcbiAgICAgICAgICAgICAgICAgICAgb2JqLl9fZGVmaW5lU2V0dGVyX18ocHJvcCwgZGVzYy5zZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNyZWF0ZVZpZXdNb2RlbCA9IGZ1bmN0aW9uIGNyZWF0ZVZpZXdNb2RlbChvYmosIGRlc2NzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBkZXNjcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzY3MuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlZmluZVByb3BlcnR5KG9iaiwgcHJvcCwgZGVzY3NbcHJvcF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG4gICAgICAgIGlmIChtc2llIDwgOSkge1xuICAgICAgICAgICAgdmFyIFZCQ2xhc3NQb29sID0ge307XG4gICAgICAgICAgICB3aW5kb3cuZXhlY1NjcmlwdChbLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICAnRnVuY3Rpb24gcGFyc2VWQihjb2RlKScsICdcXHRFeGVjdXRlR2xvYmFsKGNvZGUpJywgJ0VuZCBGdW5jdGlvbicgLy/ovazmjaLkuIDmrrXmlofmnKzkuLpWQuS7o+eggVxuICAgICAgICAgICAgXS5qb2luKCdcXG4nKSwgJ1ZCU2NyaXB0Jyk7XG5cbiAgICAgICAgICAgIHZhciBWQk1lZGlhdG9yID0gZnVuY3Rpb24gVkJNZWRpYXRvcihpbnN0YW5jZSwgYWNjZXNzb3JzLCBuYW1lLCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIC8vIGpzaGludCBpZ25vcmU6bGluZVxuICAgICAgICAgICAgICAgIHZhciBhY2Nlc3NvciA9IGFjY2Vzc29yc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgICAgICBhY2Nlc3Nvci5zZXQuY2FsbChpbnN0YW5jZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2Nlc3Nvci5nZXQuY2FsbChpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNyZWF0ZVZpZXdNb2RlbCA9IGZ1bmN0aW9uIGNyZWF0ZVZpZXdNb2RlbChuYW1lLCBhY2Nlc3NvcnMsIHByb3BlcnRpZXMpIHtcbiAgICAgICAgICAgICAgICAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbiAgICAgICAgICAgICAgICB2YXIgYnVmZmVyID0gW107XG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goJ1xcdFByaXZhdGUgWyR2YnNldHRlcl0nLCAnXFx0UHVibGljICBbJGFjY2Vzc29yc10nLCAnXFx0UHVibGljIERlZmF1bHQgRnVuY3Rpb24gWyR2YnRoaXNdKGFjJyArIHRpbWVCdWNrZXQgKyAnLCBzJyArIHRpbWVCdWNrZXQgKyAnKScsICdcXHRcXHRTZXQgIFskYWNjZXNzb3JzXSA9IGFjJyArIHRpbWVCdWNrZXQgKyAnOiBzZXQgWyR2YnNldHRlcl0gPSBzJyArIHRpbWVCdWNrZXQsICdcXHRcXHRTZXQgIFskdmJ0aGlzXSAgICA9IE1lJywgLy/pk77lvI/osIPnlKhcbiAgICAgICAgICAgICAgICAnXFx0RW5kIEZ1bmN0aW9uJyk7XG4gICAgICAgICAgICAgICAgLy/mt7vliqDmma7pgJrlsZ7mgKcs5Zug5Li6VkJTY3JpcHTlr7nosaHkuI3og73lg49KU+mCo+agt+maj+aEj+WinuWIoOWxnuaAp++8jOW/hemhu+WcqOi/memHjOmihOWFiOWumuS5ieWlvVxuICAgICAgICAgICAgICAgIHZhciB1bmlxID0ge1xuICAgICAgICAgICAgICAgICAgICAkdmJ0aGlzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAkdmJzZXR0ZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICRhY2Nlc3NvcnM6IHRydWVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGZvciAobmFtZSBpbiAkJHNraXBBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVuaXFbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1ZmZlci5wdXNoKCdcXHRQdWJsaWMgWycgKyBuYW1lICsgJ10nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFbbmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v5re75Yqg6K6/6Zeu5Zmo5bGe5oCnIFxuICAgICAgICAgICAgICAgIGZvciAobmFtZSBpbiBhY2Nlc3NvcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHVuaXFbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHVuaXFbbmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBidWZmZXIucHVzaChcbiAgICAgICAgICAgICAgICAgICAgLy/nlLHkuo7kuI3nn6Xlr7nmlrnkvJrkvKDlhaXku4DkuYgs5Zug5q2kc2V0LCBsZXTpg73nlKjkuIpcbiAgICAgICAgICAgICAgICAgICAgJ1xcdFB1YmxpYyBQcm9wZXJ0eSBMZXQgWycgKyBuYW1lICsgJ10odmFsJyArIHRpbWVCdWNrZXQgKyAnKScsIC8vc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICdcXHRcXHRDYWxsIFskdmJzZXR0ZXJdKE1lLCBbJGFjY2Vzc29yc10sIFwiJyArIG5hbWUgKyAnXCIsIHZhbCcgKyB0aW1lQnVja2V0ICsgJyknLCAnXFx0RW5kIFByb3BlcnR5JywgJ1xcdFB1YmxpYyBQcm9wZXJ0eSBTZXQgWycgKyBuYW1lICsgJ10odmFsJyArIHRpbWVCdWNrZXQgKyAnKScsIC8vc2V0dGVyXG4gICAgICAgICAgICAgICAgICAgICdcXHRcXHRDYWxsIFskdmJzZXR0ZXJdKE1lLCBbJGFjY2Vzc29yc10sIFwiJyArIG5hbWUgKyAnXCIsIHZhbCcgKyB0aW1lQnVja2V0ICsgJyknLCAnXFx0RW5kIFByb3BlcnR5JywgJ1xcdFB1YmxpYyBQcm9wZXJ0eSBHZXQgWycgKyBuYW1lICsgJ10nLCAvL2dldHRlclxuICAgICAgICAgICAgICAgICAgICAnXFx0T24gRXJyb3IgUmVzdW1lIE5leHQnLCAvL+W/hemhu+S8mOWFiOS9v+eUqHNldOivreWPpSzlkKbliJnlroPkvJror6/lsIbmlbDnu4TlvZPlrZfnrKbkuLLov5Tlm55cbiAgICAgICAgICAgICAgICAgICAgJ1xcdFxcdFNldFsnICsgbmFtZSArICddID0gWyR2YnNldHRlcl0oTWUsIFskYWNjZXNzb3JzXSxcIicgKyBuYW1lICsgJ1wiKScsICdcXHRJZiBFcnIuTnVtYmVyIDw+IDAgVGhlbicsICdcXHRcXHRbJyArIG5hbWUgKyAnXSA9IFskdmJzZXR0ZXJdKE1lLCBbJGFjY2Vzc29yc10sXCInICsgbmFtZSArICdcIiknLCAnXFx0RW5kIElmJywgJ1xcdE9uIEVycm9yIEdvdG8gMCcsICdcXHRFbmQgUHJvcGVydHknKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBmb3IgKG5hbWUgaW4gcHJvcGVydGllcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXVuaXFbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVuaXFbbmFtZV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goJ1xcdFB1YmxpYyBbJyArIG5hbWUgKyAnXScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goJ1xcdFB1YmxpYyBbaGFzT3duUHJvcGVydHldJyk7XG4gICAgICAgICAgICAgICAgYnVmZmVyLnB1c2goJ0VuZCBDbGFzcycpO1xuICAgICAgICAgICAgICAgIHZhciBib2R5ID0gYnVmZmVyLmpvaW4oJ1xcclxcbicpO1xuICAgICAgICAgICAgICAgIHZhciBjbGFzc05hbWUgPSBWQkNsYXNzUG9vbFtib2R5XTtcbiAgICAgICAgICAgICAgICBpZiAoIWNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBhdmFsb24ubWFrZUhhc2hDb2RlKCdWQkNsYXNzJyk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJzZVZCKCdDbGFzcyAnICsgY2xhc3NOYW1lICsgYm9keSk7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5wYXJzZVZCKFsnRnVuY3Rpb24gJyArIGNsYXNzTmFtZSArICdGYWN0b3J5KGFjYywgdmJtKScsIC8v5Yib5bu65a6e5L6L5bm25Lyg5YWl5Lik5Liq5YWz6ZSu55qE5Y+C5pWwXG4gICAgICAgICAgICAgICAgICAgICdcXHREaW0gbycsICdcXHRTZXQgbyA9IChOZXcgJyArIGNsYXNzTmFtZSArICcpKGFjYywgdmJtKScsICdcXHRTZXQgJyArIGNsYXNzTmFtZSArICdGYWN0b3J5ID0gbycsICdFbmQgRnVuY3Rpb24nXS5qb2luKCdcXHJcXG4nKSk7XG4gICAgICAgICAgICAgICAgICAgIFZCQ2xhc3NQb29sW2JvZHldID0gY2xhc3NOYW1lO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgcmV0ID0gd2luZG93W2NsYXNzTmFtZSArICdGYWN0b3J5J10oYWNjZXNzb3JzLCBWQk1lZGlhdG9yKTsgLy/lvpfliLDlhbbkuqflk4FcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0OyAvL+W+l+WIsOWFtuS6p+WTgVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBsYXRmb3JtLmNyZWF0ZVZpZXdNb2RlbCA9IGNyZWF0ZVZpZXdNb2RlbDtcblxuICAgIHZhciBpbXBEaXIgPSBhdmFsb24uZGlyZWN0aXZlKCdpbXBvcnRhbnQnLCB7XG4gICAgICAgIHByaW9yaXR5OiAxLFxuICAgICAgICBnZXRTY29wZTogZnVuY3Rpb24gZ2V0U2NvcGUobmFtZSwgc2NvcGUpIHtcbiAgICAgICAgICAgIHZhciB2ID0gYXZhbG9uLnZtb2RlbHNbbmFtZV07XG4gICAgICAgICAgICBpZiAodikgcmV0dXJuIHY7XG4gICAgICAgICAgICB0aHJvdyAnZXJyb3IhIG5vIHZtb2RlbCBjYWxsZWQgJyArIG5hbWU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKG5vZGUsIGF0dHJOYW1lLCAkaWQpIHtcbiAgICAgICAgICAgIGlmICghYXZhbG9uLmluQnJvd3NlcikgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIGRvbSA9IGF2YWxvbi52ZG9tKG5vZGUsICd0b0RPTScpO1xuICAgICAgICAgICAgaWYgKGRvbS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVBdHRyaWJ1dGUoYXR0ck5hbWUpO1xuICAgICAgICAgICAgICAgIGF2YWxvbihkb20pLnJlbW92ZUNsYXNzKCdtcy1jb250cm9sbGVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdm0gPSBhdmFsb24udm1vZGVsc1skaWRdO1xuICAgICAgICAgICAgaWYgKHZtKSB7XG4gICAgICAgICAgICAgICAgdm0uJGVsZW1lbnQgPSBkb207XG4gICAgICAgICAgICAgICAgdm0uJHJlbmRlciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdm0uJGZpcmUoJ29uUmVhZHknKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdm0uJGV2ZW50cy5vblJlYWR5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgaW1wQ2IgPSBpbXBEaXIudXBkYXRlO1xuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnY29udHJvbGxlcicsIHtcbiAgICAgICAgcHJpb3JpdHk6IDIsXG4gICAgICAgIGdldFNjb3BlOiBmdW5jdGlvbiBnZXRTY29wZShuYW1lLCBzY29wZSkge1xuICAgICAgICAgICAgdmFyIHYgPSBhdmFsb24udm1vZGVsc1tuYW1lXTtcbiAgICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgdi4kcmVuZGVyID0gdGhpcztcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUgJiYgc2NvcGUgIT09IHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHBsYXRmb3JtLmZ1c2VGYWN0b3J5KHNjb3BlLCB2KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2NvcGU7XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogaW1wQ2JcbiAgICB9KTtcblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ3NraXAnLCB7XG4gICAgICAgIGRlbGF5OiB0cnVlXG4gICAgfSk7XG5cbiAgICB2YXIgYXJyYXlXYXJuID0ge307XG4gICAgdmFyIGNzc0RpciA9IGF2YWxvbi5kaXJlY3RpdmUoJ2NzcycsIHtcbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICAgICAgaWYgKE9iamVjdChuZXdWYWwpID09PSBuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICBuZXdWYWwgPSBwbGF0Zm9ybS50b0pzb24obmV3VmFsKTsgLy/lronlhajnmoTpgY3ljoZWQnNjcmlwdFxuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/ovazmjaLmiJDlr7nosaFcbiAgICAgICAgICAgICAgICAgICAgdmFyIGIgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgbmV3VmFsLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbCAmJiBhdmFsb24uc2hhZG93Q29weShiLCBlbCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBuZXdWYWwgPSBiO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFycmF5V2Fyblt0aGlzLnR5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFsb24ud2FybignbXMtJyArIHRoaXMudHlwZSArICfmjIfku6TnmoTlgLzkuI3lu7rorq7kvb/nlKjmlbDnu4TlvaLlvI/kuobvvIEnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFycmF5V2Fyblt0aGlzLnR5cGVdID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBoYXNDaGFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgcGF0Y2ggPSB7fTtcbiAgICAgICAgICAgICAgICBpZiAoIW9sZFZhbCkge1xuICAgICAgICAgICAgICAgICAgICAvL+WmguaenOS4gOW8gOWni+S4uuepulxuICAgICAgICAgICAgICAgICAgICBwYXRjaCA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICAgICAgaGFzQ2hhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5kZWVwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGVlcCA9IHR5cGVvZiB0aGlzLmRlZXAgPT09ICdudW1iZXInID8gdGhpcy5kZWVwIDogNjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gbmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9kaWZm5beu5byC54K5ICBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWRlZXBFcXVhbHMobmV3VmFsW2ldLCBvbGRWYWxbaV0sIDQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBuZXdWYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXRjaFtpXSA9IG5ld1ZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pMyBpbiBuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RpZmblt67lvILngrlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmV3VmFsW19pM10gIT09IG9sZFZhbFtfaTNdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoW19pM10gPSBuZXdWYWxbX2kzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIF9pNCBpbiBvbGRWYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKF9pNCBpbiBwYXRjaCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBoYXNDaGFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhdGNoW19pNF0gPSAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBwYXRjaDtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tLCB2YWx1ZSkge1xuXG4gICAgICAgICAgICB2YXIgZG9tID0gdmRvbS5kb207XG4gICAgICAgICAgICBpZiAoZG9tICYmIGRvbS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHZhciB3cmFwID0gYXZhbG9uKGRvbSk7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICB3cmFwLmNzcyhuYW1lLCB2YWx1ZVtuYW1lXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgY3NzRGlmZiA9IGNzc0Rpci5kaWZmO1xuXG4gICAgZnVuY3Rpb24gZ2V0RW51bWVyYWJsZUtleXMob2JqKSB7XG4gICAgICAgIHZhciByZXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICAgICAgcmVzLnB1c2goa2V5KTtcbiAgICAgICAgfXJldHVybiByZXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZGVlcEVxdWFscyhhLCBiLCBsZXZlbCkge1xuICAgICAgICBpZiAobGV2ZWwgPT09IDApIHJldHVybiBhID09PSBiO1xuICAgICAgICBpZiAoYSA9PT0gbnVsbCAmJiBiID09PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgaWYgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpIHJldHVybiB0cnVlO1xuICAgICAgICB2YXIgYUlzQXJyYXkgPSBBcnJheS5pc0FycmF5KGEpO1xuICAgICAgICBpZiAoYUlzQXJyYXkgIT09IEFycmF5LmlzQXJyYXkoYikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYUlzQXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBlcXVhbEFycmF5KGEsIGIsIGxldmVsKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYSA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgYiA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgcmV0dXJuIGVxdWFsT2JqZWN0KGEsIGIsIGxldmVsKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlcXVhbEFycmF5KGEsIGIsIGxldmVsKSB7XG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIWRlZXBFcXVhbHMoYVtpXSwgYltpXSwgbGV2ZWwgLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAobm9UaGlzUHJvcEVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGVxdWFsT2JqZWN0KGEsIGIsIGxldmVsKSB7XG4gICAgICAgIGlmIChhID09PSBudWxsIHx8IGIgPT09IG51bGwpIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKGdldEVudW1lcmFibGVLZXlzKGEpLmxlbmd0aCAhPT0gZ2V0RW51bWVyYWJsZUtleXMoYikubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gYSkge1xuICAgICAgICAgICAgaWYgKCEocHJvcCBpbiBiKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIWRlZXBFcXVhbHMoYVtwcm9wXSwgYltwcm9wXSwgbGV2ZWwgLSAxKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAobm9UaGlzUHJvcEVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqIOajgOa1i+a1j+iniOWZqOWvuUNTU+WKqOeUu+eahOaUr+aMgeS4jkFQSeWQjVxuICAgICAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAqL1xuXG4gICAgdmFyIGNoZWNrZXIgPSB7XG4gICAgICAgIFRyYW5zaXRpb25FdmVudDogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgICBXZWJLaXRUcmFuc2l0aW9uRXZlbnQ6ICd3ZWJraXRUcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgT1RyYW5zaXRpb25FdmVudDogJ29UcmFuc2l0aW9uRW5kJyxcbiAgICAgICAgb3RyYW5zaXRpb25FdmVudDogJ290cmFuc2l0aW9uRW5kJ1xuICAgIH07XG4gICAgdmFyIGNzczMgPSB2b2lkIDA7XG4gICAgdmFyIHRyYW4gPSB2b2lkIDA7XG4gICAgdmFyIGFuaSA9IHZvaWQgMDtcbiAgICB2YXIgbmFtZSQyID0gdm9pZCAwO1xuICAgIHZhciBhbmltYXRpb25FbmRFdmVudCA9IHZvaWQgMDtcbiAgICB2YXIgdHJhbnNpdGlvbkVuZEV2ZW50ID0gdm9pZCAwO1xuICAgIHZhciB0cmFuc2l0aW9uID0gZmFsc2U7XG4gICAgdmFyIGFuaW1hdGlvbiA9IGZhbHNlO1xuICAgIC8v5pyJ55qE5rWP6KeI5Zmo5ZCM5pe25pSv5oyB56eB5pyJ5a6e546w5LiO5qCH5YeG5YaZ5rOV77yM5q+U5aaCd2Via2l05pSv5oyB5YmN5Lik56eN77yMT3BlcmHmlK/mjIEx44CBM+OAgTRcbiAgICBmb3IgKG5hbWUkMiBpbiBjaGVja2VyKSB7XG4gICAgICAgIGlmICh3aW5kb3ckMVtuYW1lJDJdKSB7XG4gICAgICAgICAgICB0cmFuID0gY2hlY2tlcltuYW1lJDJdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBhID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQobmFtZSQyKTtcbiAgICAgICAgICAgIHRyYW4gPSBjaGVja2VyW25hbWUkMl07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0cmFuID09PSAnc3RyaW5nJykge1xuICAgICAgICB0cmFuc2l0aW9uID0gY3NzMyA9IHRydWU7XG4gICAgICAgIHRyYW5zaXRpb25FbmRFdmVudCA9IHRyYW47XG4gICAgfVxuXG4gICAgLy9hbmltYXRpb25lbmTmnInkuKTkuKrlj6/nlKjlvaLmgIFcbiAgICAvL0lFMTArLCBGaXJlZm94IDE2KyAmIE9wZXJhIDEyLjErOiBhbmltYXRpb25lbmRcbiAgICAvL0Nocm9tZS9TYWZhcmk6IHdlYmtpdEFuaW1hdGlvbkVuZFxuICAgIC8vaHR0cDovL2Jsb2dzLm1zZG4uY29tL2IvZGF2cm91cy9hcmNoaXZlLzIwMTEvMTIvMDYvaW50cm9kdWN0aW9uLXRvLWNzczMtYW5pbWF0IGlvbnMuYXNweFxuICAgIC8vSUUxMOS5n+WPr+S7peS9v+eUqE1TQW5pbWF0aW9uRW5k55uR5ZCs77yM5L2G5piv5Zue6LCD6YeM55qE5LqL5Lu2IHR5cGXkvp3nhLbkuLphbmltYXRpb25lbmRcbiAgICAvLyAgZWwuYWRkRXZlbnRMaXN0ZW5lcignTVNBbmltYXRpb25FbmQnLCBmdW5jdGlvbihlKSB7XG4gICAgLy8gICAgIGFsZXJ0KGUudHlwZSkvLyBhbmltYXRpb25lbmTvvIHvvIHvvIFcbiAgICAvLyB9KVxuICAgIGNoZWNrZXIgPSB7XG4gICAgICAgICdBbmltYXRpb25FdmVudCc6ICdhbmltYXRpb25lbmQnLFxuICAgICAgICAnV2ViS2l0QW5pbWF0aW9uRXZlbnQnOiAnd2Via2l0QW5pbWF0aW9uRW5kJ1xuICAgIH07XG4gICAgZm9yIChuYW1lJDIgaW4gY2hlY2tlcikge1xuICAgICAgICBpZiAod2luZG93JDFbbmFtZSQyXSkge1xuICAgICAgICAgICAgYW5pID0gY2hlY2tlcltuYW1lJDJdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHR5cGVvZiBhbmkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGFuaW1hdGlvbiA9IGNzczMgPSB0cnVlO1xuICAgICAgICBhbmltYXRpb25FbmRFdmVudCA9IGFuaTtcbiAgICB9XG5cbiAgICB2YXIgZWZmZWN0RGlyID0gYXZhbG9uLmRpcmVjdGl2ZSgnZWZmZWN0Jywge1xuICAgICAgICBwcmlvcml0eTogNSxcbiAgICAgICAgZGlmZjogZnVuY3Rpb24gZGlmZihlZmZlY3QpIHtcbiAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlZmZlY3QgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IGVmZmVjdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgaXM6IGVmZmVjdFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oJ21zLWVmZmVjdOeahOaMh+S7pOWAvOS4jeWGjeaUr+aMgeWtl+espuS4sizlv4XpobvmmK/kuIDkuKrlr7nosaEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2ZG9tLmVmZmVjdCA9IGVmZmVjdDtcbiAgICAgICAgICAgIHZhciBvayA9IGNzc0RpZmYuY2FsbCh0aGlzLCBlZmZlY3QsIHRoaXMub2xkVmFsdWUpO1xuICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgIGlmIChvaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB2ZG9tLmFuaW1hdGluZyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGVmZmVjdERpci51cGRhdGUuY2FsbChtZSwgdmRvbSwgdmRvbS5lZmZlY3QpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHZkb20uYW5pbWF0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgY2hhbmdlLCBvcHRzKSB7XG4gICAgICAgICAgICB2YXIgZG9tID0gdmRvbS5kb207XG4gICAgICAgICAgICBpZiAoZG9tICYmIGRvbS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIC8v6KaB5rGC6YWN572u5a+56LGh5b+F6aG75oyH5a6aaXPlsZ7mgKfvvIxhY3Rpb27lv4XpobvmmK/luIPlsJTmiJZlbnRlcixsZWF2ZSxtb3ZlXG4gICAgICAgICAgICAgICAgdmFyIG9wdGlvbiA9IGNoYW5nZSB8fCBvcHRzO1xuICAgICAgICAgICAgICAgIHZhciBpcyA9IG9wdGlvbi5pcztcblxuICAgICAgICAgICAgICAgIHZhciBnbG9iYWxPcHRpb24gPSBhdmFsb24uZWZmZWN0c1tpc107XG4gICAgICAgICAgICAgICAgaWYgKCFnbG9iYWxPcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzmsqHmnInlrprkuYnnibnmlYhcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oaXMgKyAnIGVmZmVjdCBpcyB1bmRlZmluZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxPcHRpb24gPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgYWN0aW9uID0gYWN0aW9uTWFwc1tvcHRpb24uYWN0aW9uXTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIEVmZmVjdC5wcm90b3R5cGVbYWN0aW9uXSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24ud2FybignYWN0aW9uIGlzIHVuZGVmaW5lZCcpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v5b+F6aG76aKE5a6a5LmJ54m55pWIXG5cbiAgICAgICAgICAgICAgICB2YXIgZWZmZWN0ID0gbmV3IGF2YWxvbi5FZmZlY3QoZG9tKTtcbiAgICAgICAgICAgICAgICBhdmFsb24ubWl4KGZpbmFsT3B0aW9uLCBnbG9iYWxPcHRpb24sIG9wdGlvbiwgeyBhY3Rpb246IGFjdGlvbiB9KTtcblxuICAgICAgICAgICAgICAgIGlmIChmaW5hbE9wdGlvbi5xdWV1ZSkge1xuICAgICAgICAgICAgICAgICAgICBhbmltYXRpb25RdWV1ZS5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVmZmVjdFthY3Rpb25dKGZpbmFsT3B0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0QW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICBlZmZlY3RbYWN0aW9uXShmaW5hbE9wdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgbW92ZSA9ICdtb3ZlJztcbiAgICB2YXIgbGVhdmUgPSAnbGVhdmUnO1xuICAgIHZhciBlbnRlciA9ICdlbnRlcic7XG4gICAgdmFyIGFjdGlvbk1hcHMgPSB7XG4gICAgICAgICd0cnVlJzogZW50ZXIsXG4gICAgICAgICdmYWxzZSc6IGxlYXZlLFxuICAgICAgICBlbnRlcjogZW50ZXIsXG4gICAgICAgIGxlYXZlOiBsZWF2ZSxcbiAgICAgICAgbW92ZTogbW92ZSxcbiAgICAgICAgJ3VuZGVmaW5lZCc6IGVudGVyXG4gICAgfTtcblxuICAgIHZhciBhbmltYXRpb25RdWV1ZSA9IFtdO1xuICAgIGZ1bmN0aW9uIGNhbGxOZXh0QW5pbWF0aW9uKCkge1xuICAgICAgICB2YXIgZm4gPSBhbmltYXRpb25RdWV1ZVswXTtcbiAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICBmbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXZhbG9uLmVmZmVjdHMgPSB7fTtcbiAgICBhdmFsb24uZWZmZWN0ID0gZnVuY3Rpb24gKG5hbWUsIG9wdHMpIHtcbiAgICAgICAgdmFyIGRlZmluaXRpb24gPSBhdmFsb24uZWZmZWN0c1tuYW1lXSA9IG9wdHMgfHwge307XG4gICAgICAgIGlmIChjc3MzICYmIGRlZmluaXRpb24uY3NzICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgcGF0Y2hPYmplY3QoZGVmaW5pdGlvbiwgJ2VudGVyQ2xhc3MnLCBuYW1lICsgJy1lbnRlcicpO1xuICAgICAgICAgICAgcGF0Y2hPYmplY3QoZGVmaW5pdGlvbiwgJ2VudGVyQWN0aXZlQ2xhc3MnLCBkZWZpbml0aW9uLmVudGVyQ2xhc3MgKyAnLWFjdGl2ZScpO1xuICAgICAgICAgICAgcGF0Y2hPYmplY3QoZGVmaW5pdGlvbiwgJ2xlYXZlQ2xhc3MnLCBuYW1lICsgJy1sZWF2ZScpO1xuICAgICAgICAgICAgcGF0Y2hPYmplY3QoZGVmaW5pdGlvbiwgJ2xlYXZlQWN0aXZlQ2xhc3MnLCBkZWZpbml0aW9uLmxlYXZlQ2xhc3MgKyAnLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBwYXRjaE9iamVjdChvYmosIG5hbWUsIHZhbHVlKSB7XG4gICAgICAgIGlmICghb2JqW25hbWVdKSB7XG4gICAgICAgICAgICBvYmpbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciBFZmZlY3QgPSBmdW5jdGlvbiBFZmZlY3QoZG9tKSB7XG4gICAgICAgIHRoaXMuZG9tID0gZG9tO1xuICAgIH07XG5cbiAgICBhdmFsb24uRWZmZWN0ID0gRWZmZWN0O1xuXG4gICAgRWZmZWN0LnByb3RvdHlwZSA9IHtcbiAgICAgICAgZW50ZXI6IGNyZWF0ZUFjdGlvbignRW50ZXInKSxcbiAgICAgICAgbGVhdmU6IGNyZWF0ZUFjdGlvbignTGVhdmUnKSxcbiAgICAgICAgbW92ZTogY3JlYXRlQWN0aW9uKCdNb3ZlJylcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZXhlY0hvb2tzKG9wdGlvbnMsIG5hbWUsIGVsKSB7XG4gICAgICAgIHZhciBmbnMgPSBbXS5jb25jYXQob3B0aW9uc1tuYW1lXSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBmbjsgZm4gPSBmbnNbaSsrXTspIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBmbihlbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHN0YWdnZXJDYWNoZSA9IG5ldyBDYWNoZSgxMjgpO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlQWN0aW9uKGFjdGlvbikge1xuICAgICAgICB2YXIgbG93ZXIgPSBhY3Rpb24udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvcHRpb24pIHtcbiAgICAgICAgICAgIHZhciBkb20gPSB0aGlzLmRvbTtcbiAgICAgICAgICAgIHZhciBlbGVtID0gYXZhbG9uKGRvbSk7XG4gICAgICAgICAgICAvL+WkhOeQhuS4jm1zLWZvcuaMh+S7pOebuOWFs+eahHN0YWdnZXJcbiAgICAgICAgICAgIC8vPT09PT09PT1CRUdJTj09PT09XG4gICAgICAgICAgICB2YXIgc3RhZ2dlclRpbWUgPSBpc0Zpbml0ZShvcHRpb24uc3RhZ2dlcikgPyBvcHRpb24uc3RhZ2dlciAqIDEwMDAgOiAwO1xuICAgICAgICAgICAgaWYgKHN0YWdnZXJUaW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbi5zdGFnZ2VyS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzdGFnZ2VyID0gc3RhZ2dlckNhY2hlLmdldChvcHRpb24uc3RhZ2dlcktleSkgfHwgc3RhZ2dlckNhY2hlLnB1dChvcHRpb24uc3RhZ2dlcktleSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtczogMFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgc3RhZ2dlci5jb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICBzdGFnZ2VyLml0ZW1zKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHN0YWdnZXJJbmRleCA9IHN0YWdnZXIgJiYgc3RhZ2dlci5jb3VudCB8fCAwO1xuICAgICAgICAgICAgLy89PT09PT09RU5EPT09PT09PT09PVxuICAgICAgICAgICAgdmFyIHN0b3BBbmltYXRpb25JRDtcbiAgICAgICAgICAgIHZhciBhbmltYXRpb25Eb25lID0gZnVuY3Rpb24gYW5pbWF0aW9uRG9uZShlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlzT2sgPSBlICE9PSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoLS1kb20uX19tc19lZmZlY3RfID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi51bmJpbmQoZG9tLCB0cmFuc2l0aW9uRW5kRXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24udW5iaW5kKGRvbSwgYW5pbWF0aW9uRW5kRXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQoc3RvcEFuaW1hdGlvbklEKTtcbiAgICAgICAgICAgICAgICB2YXIgZGlyV29yZCA9IGlzT2sgPyAnRG9uZScgOiAnQWJvcnQnO1xuICAgICAgICAgICAgICAgIGV4ZWNIb29rcyhvcHRpb24sICdvbicgKyBhY3Rpb24gKyBkaXJXb3JkLCBkb20pO1xuICAgICAgICAgICAgICAgIGlmIChzdGFnZ2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgtLXN0YWdnZXIuaXRlbXMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YWdnZXIuY291bnQgPSAwO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvcHRpb24ucXVldWUpIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uUXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbE5leHRBbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy/miafooYzlvIDlp4vliY3nmoTpkqnlrZBcbiAgICAgICAgICAgIGV4ZWNIb29rcyhvcHRpb24sICdvbkJlZm9yZScgKyBhY3Rpb24sIGRvbSk7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25bbG93ZXJdKSB7XG4gICAgICAgICAgICAgICAgLy/kvb/nlKhKU+aWueW8j+aJp+ihjOWKqOeUu1xuICAgICAgICAgICAgICAgIG9wdGlvbltsb3dlcl0oZG9tLCBmdW5jdGlvbiAob2spIHtcbiAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRG9uZShvayAhPT0gZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjc3MzKSB7XG4gICAgICAgICAgICAgICAgLy/kvb/nlKhDU1Mz5pa55byP5omn6KGM5Yqo55S7XG4gICAgICAgICAgICAgICAgZWxlbS5hZGRDbGFzcyhvcHRpb25bbG93ZXIgKyAnQ2xhc3MnXSk7XG4gICAgICAgICAgICAgICAgZWxlbS5yZW1vdmVDbGFzcyhnZXROZWVkUmVtb3ZlZChvcHRpb24sIGxvd2VyKSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWRvbS5fX21zX2VmZmVjdF8pIHtcbiAgICAgICAgICAgICAgICAgICAgLy/nu5HlrprliqjnlLvnu5PmnZ/kuovku7ZcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5iaW5kKHRyYW5zaXRpb25FbmRFdmVudCwgYW5pbWF0aW9uRG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW0uYmluZChhbmltYXRpb25FbmRFdmVudCwgYW5pbWF0aW9uRG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIGRvbS5fX21zX2VmZmVjdF8gPSAxO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRvbS5fX21zX2VmZmVjdF8rKztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIC8v55SoeHh4LWFjdGl2ZeS7o+abv3h4eOexu+WQjeeahOaWueW8jyDop6blj5FDU1Mz5Yqo55S7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lID0gYXZhbG9uLnJvb3Qub2Zmc2V0V2lkdGggPT09IE5hTjtcbiAgICAgICAgICAgICAgICAgICAgZWxlbS5hZGRDbGFzcyhvcHRpb25bbG93ZXIgKyAnQWN0aXZlQ2xhc3MnXSk7XG4gICAgICAgICAgICAgICAgICAgIC8v6K6h566X5Yqo55S75pe26ZW/XG4gICAgICAgICAgICAgICAgICAgIHRpbWUgPSBnZXRBbmltYXRpb25UaW1lKGRvbSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdGltZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/nq4vljbPnu5PmnZ/liqjnlLtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbkRvbmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFzdGFnZ2VyVGltZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzliqjnlLvotoXlh7rml7bplb/ov5jmsqHmnInosIPnlKjnu5PmnZ/kuovku7Ys6L+Z5Y+v6IO95piv5YWD57Sg6KKr56e76Zmk5LqGXG4gICAgICAgICAgICAgICAgICAgICAgICAvL+WmguaenOW8uuWItue7k+adn+WKqOeUu1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcEFuaW1hdGlvbklEID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uRG9uZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCB0aW1lICsgMzIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgMTcgKyBzdGFnZ2VyVGltZSAqIHN0YWdnZXJJbmRleCk7IC8vID0gMTAwMC82MFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGF2YWxvbi5hcHBseUVmZmVjdCA9IGZ1bmN0aW9uIChkb20sIHZkb20sIG9wdHMpIHtcbiAgICAgICAgdmFyIGNiID0gb3B0cy5jYjtcbiAgICAgICAgdmFyIGN1ckVmZmVjdCA9IHZkb20uZWZmZWN0O1xuICAgICAgICBpZiAoY3VyRWZmZWN0ICYmIGRvbSAmJiBkb20ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIHZhciBob29rID0gb3B0cy5ob29rO1xuICAgICAgICAgICAgdmFyIG9sZCA9IGN1ckVmZmVjdFtob29rXTtcbiAgICAgICAgICAgIGlmIChjYikge1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KG9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb2xkLnB1c2goY2IpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAob2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1ckVmZmVjdFtob29rXSA9IFtvbGQsIGNiXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjdXJFZmZlY3RbaG9va10gPSBbY2JdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdldEFjdGlvbihvcHRzKTtcbiAgICAgICAgICAgIGF2YWxvbi5kaXJlY3RpdmVzLmVmZmVjdC51cGRhdGUodmRvbSwgY3VyRWZmZWN0LCBhdmFsb24uc2hhZG93Q29weSh7fSwgb3B0cykpO1xuICAgICAgICB9IGVsc2UgaWYgKGNiKSB7XG4gICAgICAgICAgICBjYihkb20pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiDojrflj5bmlrnlkJFcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBnZXRBY3Rpb24ob3B0cykge1xuICAgICAgICBpZiAoIW9wdHMuYWN0aW9uKSB7XG4gICAgICAgICAgICByZXR1cm4gb3B0cy5hY3Rpb24gPSBvcHRzLmhvb2sucmVwbGFjZSgvXm9uLywgJycpLnJlcGxhY2UoL0RvbmUkLywgJycpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICog6ZyA6KaB56e76Zmk55qE57G75ZCNXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2V0TmVlZFJlbW92ZWQob3B0aW9ucywgbmFtZSkge1xuICAgICAgICB2YXIgbmFtZSA9IG5hbWUgPT09ICdsZWF2ZScgPyAnZW50ZXInIDogJ2xlYXZlJztcbiAgICAgICAgcmV0dXJuIEFycmF5KG5hbWUgKyAnQ2xhc3MnLCBuYW1lICsgJ0FjdGl2ZUNsYXNzJykubWFwKGZ1bmN0aW9uIChjbHMpIHtcbiAgICAgICAgICAgIHJldHVybiBvcHRpb25zW2Nsc107XG4gICAgICAgIH0pLmpvaW4oJyAnKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICog6K6h566X5Yqo55S76ZW/5bqmXG4gICAgICovXG4gICAgdmFyIHRyYW5zaXRpb25EdXJhdGlvbiA9IGF2YWxvbi5jc3NOYW1lKCd0cmFuc2l0aW9uLWR1cmF0aW9uJyk7XG4gICAgdmFyIGFuaW1hdGlvbkR1cmF0aW9uID0gYXZhbG9uLmNzc05hbWUoJ2FuaW1hdGlvbi1kdXJhdGlvbicpO1xuICAgIHZhciByc2Vjb25kID0gL1xcZCtzJC87XG4gICAgZnVuY3Rpb24gdG9NaWxsaXNlY29uZChzdHIpIHtcbiAgICAgICAgdmFyIHJhdGlvID0gcnNlY29uZC50ZXN0KHN0cikgPyAxMDAwIDogMTtcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoc3RyKSAqIHJhdGlvO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEFuaW1hdGlvblRpbWUoZG9tKSB7XG4gICAgICAgIHZhciBjb21wdXRlZFN0eWxlcyA9IHdpbmRvdyQxLmdldENvbXB1dGVkU3R5bGUoZG9tLCBudWxsKTtcbiAgICAgICAgdmFyIHRyYW5EdXJhdGlvbiA9IGNvbXB1dGVkU3R5bGVzW3RyYW5zaXRpb25EdXJhdGlvbl07XG4gICAgICAgIHZhciBhbmltRHVyYXRpb24gPSBjb21wdXRlZFN0eWxlc1thbmltYXRpb25EdXJhdGlvbl07XG4gICAgICAgIHJldHVybiB0b01pbGxpc2Vjb25kKHRyYW5EdXJhdGlvbikgfHwgdG9NaWxsaXNlY29uZChhbmltRHVyYXRpb24pO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBcbiAgICA8IURPQ1RZUEUgaHRtbD5cbiAgICA8aHRtbD5cbiAgICAgICAgPGhlYWQ+XG4gICAgICAgICAgICA8bWV0YSBjaGFyc2V0PVwiVVRGLThcIj5cbiAgICAgICAgICAgIDxtZXRhIG5hbWU9XCJ2aWV3cG9ydFwiIGNvbnRlbnQ9XCJ3aWR0aD1kZXZpY2Utd2lkdGgsIGluaXRpYWwtc2NhbGU9MS4wXCI+XG4gICAgICAgICAgICA8c2NyaXB0IHNyYz1cImRpc3QvYXZhbG9uLmpzXCI+PC9zY3JpcHQ+XG4gICAgICAgICAgICA8c2NyaXB0PlxuICAgICAgICAgICAgICAgIGF2YWxvbi5lZmZlY3QoJ2FuaW1hdGUnKVxuICAgICAgICAgICAgICAgIHZhciB2bSA9IGF2YWxvbi5kZWZpbmUoe1xuICAgICAgICAgICAgICAgICAgICAkaWQ6ICdhbmknLFxuICAgICAgICAgICAgICAgICAgICBhOiB0cnVlXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDwvc2NyaXB0PlxuICAgICAgICAgICAgPHN0eWxlPlxuICAgICAgICAgICAgICAgIC5hbmltYXRlLWVudGVyLCAuYW5pbWF0ZS1sZWF2ZXtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6MTAwcHg7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDoxMDBweDtcbiAgICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogIzI5YjZmNjtcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbjphbGwgMnM7XG4gICAgICAgICAgICAgICAgICAgIC1tb3otdHJhbnNpdGlvbjogYWxsIDJzOyBcbiAgICAgICAgICAgICAgICAgICAgLXdlYmtpdC10cmFuc2l0aW9uOiBhbGwgMnM7XG4gICAgICAgICAgICAgICAgICAgIC1vLXRyYW5zaXRpb246YWxsIDJzO1xuICAgICAgICAgICAgICAgIH0gIFxuICAgICAgICAgICAgICAgIC5hbmltYXRlLWVudGVyLWFjdGl2ZSwgLmFuaW1hdGUtbGVhdmV7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOjMwMHB4O1xuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6MzAwcHg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC5hbmltYXRlLWxlYXZlLWFjdGl2ZXtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6MTAwcHg7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDoxMDBweDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA8L3N0eWxlPlxuICAgICAgICA8L2hlYWQ+XG4gICAgICAgIDxib2R5PlxuICAgICAgICAgICAgPGRpdiA6Y29udHJvbGxlcj0nYW5pJyA+XG4gICAgICAgICAgICAgICAgPHA+PGlucHV0IHR5cGU9J2J1dHRvbicgdmFsdWU9J2NsaWNrJyA6Y2xpY2s9J0BhID0hQGEnPjwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IDplZmZlY3Q9XCJ7aXM6J2FuaW1hdGUnLGFjdGlvbjpAYX1cIj48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgIDwvYm9keT5cbiAgICA8L2h0bWw+XG4gICAgICogXG4gICAgICovXG5cbiAgICB2YXIgbm9uZSA9ICdub25lJztcbiAgICBmdW5jdGlvbiBwYXJzZURpc3BsYXkoZWxlbSwgdmFsKSB7XG4gICAgICAgIC8v55So5LqO5Y+W5b6X5q2k57G75qCH562+55qE6buY6K6kZGlzcGxheeWAvFxuICAgICAgICB2YXIgZG9jID0gZWxlbS5vd25lckRvY3VtZW50O1xuICAgICAgICB2YXIgbm9kZU5hbWUgPSBlbGVtLm5vZGVOYW1lO1xuICAgICAgICB2YXIga2V5ID0gJ18nICsgbm9kZU5hbWU7XG4gICAgICAgIGlmICghcGFyc2VEaXNwbGF5W2tleV0pIHtcbiAgICAgICAgICAgIHZhciB0ZW1wID0gZG9jLmJvZHkuYXBwZW5kQ2hpbGQoZG9jLmNyZWF0ZUVsZW1lbnQobm9kZU5hbWUpKTtcbiAgICAgICAgICAgIHZhbCA9IGF2YWxvbi5jc3ModGVtcCwgJ2Rpc3BsYXknKTtcbiAgICAgICAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKHRlbXApO1xuICAgICAgICAgICAgaWYgKHZhbCA9PT0gbm9uZSkge1xuICAgICAgICAgICAgICAgIHZhbCA9ICdibG9jayc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJzZURpc3BsYXlba2V5XSA9IHZhbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGFyc2VEaXNwbGF5W2tleV07XG4gICAgfVxuXG4gICAgYXZhbG9uLnBhcnNlRGlzcGxheSA9IHBhcnNlRGlzcGxheTtcbiAgICBhdmFsb24uZGlyZWN0aXZlKCd2aXNpYmxlJywge1xuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICB2YXIgbiA9ICEhbmV3VmFsO1xuICAgICAgICAgICAgaWYgKG9sZFZhbCA9PT0gdm9pZCAwIHx8IG4gIT09IG9sZFZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBuO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZWFkeTogdHJ1ZSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgc2hvdykge1xuICAgICAgICAgICAgdmFyIGRvbSA9IHZkb20uZG9tO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiBkb20ubm9kZVR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlzcGxheSA9IGRvbS5zdHlsZS5kaXNwbGF5O1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlzcGxheSA9PT0gbm9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2ZG9tLmRpc3BsYXlWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb20uc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkb20uc3R5bGUuY3NzVGV4dCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9tLnJlbW92ZUF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRvbS5zdHlsZS5kaXNwbGF5ID09PSAnJyAmJiBhdmFsb24oZG9tKS5jc3MoJ2Rpc3BsYXknKSA9PT0gbm9uZSAmJlxuICAgICAgICAgICAgICAgICAgICAvLyBmaXggZmlyZWZveCBCVUcs5b+F6aG75oyC5Yiw6aG16Z2i5LiKXG4gICAgICAgICAgICAgICAgICAgIGF2YWxvbi5jb250YWlucyhkb20ub3duZXJEb2N1bWVudCwgZG9tKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZURpc3BsYXkoZG9tKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3BsYXkgIT09IG5vbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbm9uZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZkb20uZGlzcGxheVZhbHVlID0gZGlzcGxheTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY2IgPSBmdW5jdGlvbiBjYigpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB2b2lkIDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbS5zdHlsZS5kaXNwbGF5ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgYXZhbG9uLmFwcGx5RWZmZWN0KGRvbSwgdmRvbSwge1xuICAgICAgICAgICAgICAgICAgICBob29rOiBzaG93ID8gJ29uRW50ZXJEb25lJyA6ICdvbkxlYXZlRG9uZScsXG4gICAgICAgICAgICAgICAgICAgIGNiOiBjYlxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCd0ZXh0Jywge1xuICAgICAgICBkZWxheTogdHJ1ZSxcbiAgICAgICAgaW5pdDogZnVuY3Rpb24gaW5pdCgpIHtcblxuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICBpZiAobm9kZS5pc1ZvaWRUYWcpIHtcbiAgICAgICAgICAgICAgICBhdmFsb24uZXJyb3IoJ+iHqumXreWQiOWFg+e0oOS4jeiDveS9v+eUqG1zLXRleHQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBjaGlsZCA9IHsgbm9kZU5hbWU6ICcjdGV4dCcsIG5vZGVWYWx1ZTogdGhpcy5nZXRWYWx1ZSgpIH07XG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuLnNwbGljZSgwLCBub2RlLmNoaWxkcmVuLmxlbmd0aCwgY2hpbGQpO1xuICAgICAgICAgICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5jbGVhckhUTUwobm9kZS5kb20pO1xuICAgICAgICAgICAgICAgIG5vZGUuZG9tLmFwcGVuZENoaWxkKGF2YWxvbi52ZG9tKGNoaWxkLCAndG9ET00nKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm5vZGUgPSBjaGlsZDtcbiAgICAgICAgICAgIHZhciB0eXBlID0gJ2V4cHInO1xuICAgICAgICAgICAgdGhpcy50eXBlID0gdGhpcy5uYW1lID0gdHlwZTtcbiAgICAgICAgICAgIHZhciBkaXJlY3RpdmUkJDEgPSBhdmFsb24uZGlyZWN0aXZlc1t0eXBlXTtcbiAgICAgICAgICAgIHZhciBtZSA9IHRoaXM7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aXZlJCQxLnVwZGF0ZS5jYWxsKG1lLCBtZS5ub2RlLCB2YWx1ZSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCdleHByJywge1xuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSA9PSBudWxsIHx8IHZhbHVlID09PSAnJyA/ICdcXHUyMDBCJyA6IHZhbHVlO1xuICAgICAgICAgICAgdmRvbS5ub2RlVmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL1J1YnlMb3V2cmUvYXZhbG9uL2lzc3Vlcy8xODM0XG4gICAgICAgICAgICBpZiAodmRvbS5kb20pIHZkb20uZG9tLmRhdGEgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnYXR0cicsIHtcbiAgICAgICAgZGlmZjogY3NzRGlmZixcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHZkb20ucHJvcHM7XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEhdmFsdWVbaV0gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1tpXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwcm9wc1tpXSA9IHZhbHVlW2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkb20gPSB2ZG9tLmRvbTtcbiAgICAgICAgICAgIGlmIChkb20gJiYgZG9tLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdXBkYXRlQXR0cnMoZG9tLCB2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ2h0bWwnLCB7XG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUodmRvbSwgdmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXMuYmVmb3JlRGlzcG9zZSgpO1xuXG4gICAgICAgICAgICB0aGlzLmlubmVyUmVuZGVyID0gYXZhbG9uLnNjYW4oJzxkaXYgY2xhc3M9XCJtcy1odG1sLWNvbnRhaW5lclwiPicgKyB2YWx1ZSArICc8L2Rpdj4nLCB0aGlzLnZtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFJvb3QgPSB0aGlzLnJvb3Q7XG4gICAgICAgICAgICAgICAgaWYgKHZkb20uY2hpbGRyZW4pIHZkb20uY2hpbGRyZW4ubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICB2ZG9tLmNoaWxkcmVuID0gb2xkUm9vdC5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICB0aGlzLnJvb3QgPSB2ZG9tO1xuICAgICAgICAgICAgICAgIGlmICh2ZG9tLmRvbSkgYXZhbG9uLmNsZWFySFRNTCh2ZG9tLmRvbSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgYmVmb3JlRGlzcG9zZTogZnVuY3Rpb24gYmVmb3JlRGlzcG9zZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlubmVyUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lclJlbmRlci5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGRlbGF5OiB0cnVlXG4gICAgfSk7XG5cbiAgICBhdmFsb24uZGlyZWN0aXZlKCdpZicsIHtcbiAgICAgICAgZGVsYXk6IHRydWUsXG4gICAgICAgIHByaW9yaXR5OiA1LFxuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgdGhpcy5wbGFjZWhvbGRlciA9IGNyZWF0ZUFuY2hvcignaWYnKTtcbiAgICAgICAgICAgIHZhciBwcm9wcyA9IHRoaXMubm9kZS5wcm9wcztcbiAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1snbXMtaWYnXTtcbiAgICAgICAgICAgIGRlbGV0ZSBwcm9wc1snOmlmJ107XG4gICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gYXZhbG9uLnZkb20odGhpcy5ub2RlLCAndG9IVE1MJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uIGRpZmYobmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgIHZhciBuID0gISFuZXdWYWw7XG4gICAgICAgICAgICBpZiAob2xkVmFsID09PSB2b2lkIDAgfHwgbiAhPT0gb2xkVmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy52YWx1ZSA9IG47XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5pc1Nob3cgPT09IHZvaWQgMCAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlU2Nhbih0aGlzLCB2ZG9tKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmlzU2hvdyA9IHZhbHVlO1xuICAgICAgICAgICAgdmFyIHBsYWNlaG9sZGVyID0gdGhpcy5wbGFjZWhvbGRlcjtcblxuICAgICAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAgPSBwbGFjZWhvbGRlci5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlU2Nhbih0aGlzLCB2ZG9tKTtcbiAgICAgICAgICAgICAgICBwICYmIHAucmVwbGFjZUNoaWxkKHZkb20uZG9tLCBwbGFjZWhvbGRlcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8v56e76ZmkRE9NXG4gICAgICAgICAgICAgICAgdGhpcy5iZWZvcmVEaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgdmRvbS5ub2RlVmFsdWUgPSAnaWYnO1xuICAgICAgICAgICAgICAgIHZkb20ubm9kZU5hbWUgPSAnI2NvbW1lbnQnO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB2ZG9tLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIHZhciBkb20gPSB2ZG9tLmRvbTtcbiAgICAgICAgICAgICAgICB2YXIgcCA9IGRvbSAmJiBkb20ucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICB2ZG9tLmRvbSA9IHBsYWNlaG9sZGVyO1xuICAgICAgICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICAgICAgICAgIHAucmVwbGFjZUNoaWxkKHBsYWNlaG9sZGVyLCBkb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgYmVmb3JlRGlzcG9zZTogZnVuY3Rpb24gYmVmb3JlRGlzcG9zZSgpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmlubmVyUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbm5lclJlbmRlci5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGNvbnRpbnVlU2NhbihpbnN0YW5jZSwgdmRvbSkge1xuICAgICAgICB2YXIgaW5uZXJSZW5kZXIgPSBpbnN0YW5jZS5pbm5lclJlbmRlciA9IGF2YWxvbi5zY2FuKGluc3RhbmNlLmZyYWdtZW50LCBpbnN0YW5jZS52bSk7XG4gICAgICAgIGF2YWxvbi5zaGFkb3dDb3B5KHZkb20sIGlubmVyUmVuZGVyLnJvb3QpO1xuICAgICAgICBkZWxldGUgdmRvbS5ub2RlVmFsdWU7XG4gICAgfVxuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnb24nLCB7XG4gICAgICAgIGJlZm9yZUluaXQ6IGZ1bmN0aW9uIGJlZm9yZUluaXQoKSB7XG4gICAgICAgICAgICB0aGlzLmdldHRlciA9IGF2YWxvbi5ub29wO1xuICAgICAgICB9LFxuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgdmFyIHZkb20gPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB2YXIgdW5kZXJsaW5lID0gdGhpcy5uYW1lLnJlcGxhY2UoJ21zLW9uLScsICdlJykucmVwbGFjZSgnLScsICdfJyk7XG4gICAgICAgICAgICB2YXIgdXVpZCA9IHVuZGVybGluZSArICdfJyArIHRoaXMuZXhwci5yZXBsYWNlKC9cXHMvZywgJycpLnJlcGxhY2UoL1teJGEtel0vaWcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIGZuID0gYXZhbG9uLmV2ZW50TGlzdGVuZXJzW3V1aWRdO1xuICAgICAgICAgICAgaWYgKCFmbikge1xuICAgICAgICAgICAgICAgIHZhciBhcnIgPSBhZGRTY29wZSh0aGlzLmV4cHIpO1xuICAgICAgICAgICAgICAgIHZhciBib2R5ID0gYXJyWzBdLFxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJzID0gYXJyWzFdO1xuICAgICAgICAgICAgICAgIGJvZHkgPSBtYWtlSGFuZGxlKGJvZHkpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGZpbHRlcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycyA9IGZpbHRlcnMucmVwbGFjZSgvX192YWx1ZV9fL2csICckZXZlbnQnKTtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVycyArPSAnXFxuaWYoJGV2ZW50LiRyZXR1cm4pe1xcblxcdHJldHVybjtcXG59JztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJldCA9IFsndHJ5eycsICdcXHR2YXIgX192bW9kZWxfXyA9IHRoaXM7JywgJ1xcdCcgKyBmaWx0ZXJzLCAnXFx0cmV0dXJuICcgKyBib2R5LCAnfWNhdGNoKGUpe2F2YWxvbi5sb2coZSwgXCJpbiBvbiBkaXJcIil9J10uZmlsdGVyKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKC9cXFMvLnRlc3QoZWwpXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZm4gPSBuZXcgRnVuY3Rpb24oJyRldmVudCcsIHJldC5qb2luKCdcXG4nKSk7XG4gICAgICAgICAgICAgICAgZm4udXVpZCA9IHV1aWQ7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmV2ZW50TGlzdGVuZXJzW3V1aWRdID0gZm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkb20gPSBhdmFsb24udmRvbSh2ZG9tLCAndG9ET00nKTtcbiAgICAgICAgICAgIGRvbS5fbXNfY29udGV4dF8gPSB0aGlzLnZtO1xuXG4gICAgICAgICAgICB0aGlzLmV2ZW50VHlwZSA9IHRoaXMucGFyYW0ucmVwbGFjZSgvXFwtKFxcZCkkLywgJycpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMucGFyYW07XG4gICAgICAgICAgICBhdmFsb24oZG9tKS5iaW5kKHRoaXMuZXZlbnRUeXBlLCBmbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYmVmb3JlRGlzcG9zZTogZnVuY3Rpb24gYmVmb3JlRGlzcG9zZSgpIHtcbiAgICAgICAgICAgIGF2YWxvbih0aGlzLm5vZGUuZG9tKS51bmJpbmQodGhpcy5ldmVudFR5cGUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB2YXIgcmZvckFzID0gL1xccythc1xccysoWyRcXHddKykvO1xuICAgIHZhciByaWRlbnQgPSAvXlskYS16QS1aX11bJGEtekEtWjAtOV9dKiQvO1xuICAgIHZhciByaW52YWxpZCA9IC9eKG51bGx8dW5kZWZpbmVkfE5hTnx3aW5kb3d8dGhpc3xcXCRpbmRleHxcXCRpZCkkLztcbiAgICB2YXIgcmFyZ3MgPSAvWyRcXHdfXSsvZztcbiAgICBhdmFsb24uZGlyZWN0aXZlKCdmb3InLCB7XG4gICAgICAgIGRlbGF5OiB0cnVlLFxuICAgICAgICBwcmlvcml0eTogMyxcbiAgICAgICAgYmVmb3JlSW5pdDogZnVuY3Rpb24gYmVmb3JlSW5pdCgpIHtcbiAgICAgICAgICAgIHZhciBzdHIgPSB0aGlzLmV4cHIsXG4gICAgICAgICAgICAgICAgYXNOYW1lO1xuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UocmZvckFzLCBmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmICghcmlkZW50LnRlc3QoYikgfHwgcmludmFsaWQudGVzdChiKSkge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24uZXJyb3IoJ2FsaWFzICcgKyBiICsgJyBpcyBpbnZhbGlkIC0tLSBtdXN0IGJlIGEgdmFsaWQgSlMgaWRlbnRpZmllciB3aGljaCBpcyBub3QgYSByZXNlcnZlZCBuYW1lLicpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFzTmFtZSA9IGI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB2YXIgYXJyID0gc3RyLnNwbGl0KCcgaW4gJyk7XG4gICAgICAgICAgICB2YXIga3YgPSBhcnJbMF0ubWF0Y2gocmFyZ3MpO1xuICAgICAgICAgICAgaWYgKGt2Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIC8v56Gu5L+dYXZhbG9uLl9lYWNo55qE5Zue6LCD5pyJ5LiJ5Liq5Y+C5pWwXG4gICAgICAgICAgICAgICAga3YudW5zaGlmdCgnJGtleScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5leHByID0gYXJyWzFdO1xuICAgICAgICAgICAgdGhpcy5rZXlOYW1lID0ga3ZbMF07XG4gICAgICAgICAgICB0aGlzLnZhbE5hbWUgPSBrdlsxXTtcbiAgICAgICAgICAgIHRoaXMuc2lnbmF0dXJlID0gYXZhbG9uLm1ha2VIYXNoQ29kZSgnZm9yJyk7XG4gICAgICAgICAgICBpZiAoYXNOYW1lKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hc05hbWUgPSBhc05hbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnBhcmFtO1xuICAgICAgICB9LFxuICAgICAgICBpbml0OiBmdW5jdGlvbiBpbml0KCkge1xuICAgICAgICAgICAgdmFyIGNiID0gdGhpcy51c2VyQ2I7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNiID09PSAnc3RyaW5nJyAmJiBjYikge1xuICAgICAgICAgICAgICAgIHZhciBhcnIgPSBhZGRTY29wZShjYiwgJ2ZvcicpO1xuICAgICAgICAgICAgICAgIHZhciBib2R5ID0gbWFrZUhhbmRsZShhcnJbMF0pO1xuICAgICAgICAgICAgICAgIHRoaXMudXNlckNiID0gbmV3IEZ1bmN0aW9uKCckZXZlbnQnLCAndmFyIF9fdm1vZGVsX18gPSB0aGlzXFxucmV0dXJuICcgKyBib2R5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubm9kZS5mb3JEaXIgPSB0aGlzOyAvL+aatOmcsue7mWNvbXBvbmVudC9pbmRleC5qc+S4reeahHJlc2V0UGFyZW50Q2hpbGRyZW7mlrnms5Xkvb/nlKhcbiAgICAgICAgICAgIHRoaXMuZnJhZ21lbnQgPSBbJzxkaXY+JywgdGhpcy5mcmFnbWVudCwgJzwhLS0nLCB0aGlzLnNpZ25hdHVyZSwgJy0tPjwvZGl2PiddLmpvaW4oJycpO1xuICAgICAgICAgICAgdGhpcy5jYWNoZSA9IHt9O1xuICAgICAgICB9LFxuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy51cGRhdGluZyA9IHRydWU7XG4gICAgICAgICAgICB2YXIgdHJhY2VJZHMgPSBjcmVhdGVGcmFnbWVudHModGhpcywgbmV3VmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMub2xkVHJhY2tJZHMgPT09IHZvaWQgMCkgcmV0dXJuIHRydWU7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm9sZFRyYWNrSWRzICE9PSB0cmFjZUlkcykge1xuICAgICAgICAgICAgICAgIHRoaXMub2xkVHJhY2tJZHMgPSB0cmFjZUlkcztcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5wcmVGcmFnbWVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyYWdtZW50cyA9IHRoaXMuZnJhZ21lbnRzIHx8IFtdO1xuICAgICAgICAgICAgICAgIG1vdW50TGlzdCh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlmZkxpc3QodGhpcyk7XG4gICAgICAgICAgICAgICAgdXBkYXRlTGlzdCh0aGlzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMudXNlckNiKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lID0gdGhpcztcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbWUudXNlckNiLmNhbGwobWUudm0sIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdyZW5kZXJlZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IG1lLmJlZ2luLmRvbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hdHVyZTogbWUuc2lnbmF0dXJlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVsZXRlIHRoaXMudXBkYXRpbmc7XG4gICAgICAgIH0sXG4gICAgICAgIGJlZm9yZURpc3Bvc2U6IGZ1bmN0aW9uIGJlZm9yZURpc3Bvc2UoKSB7XG4gICAgICAgICAgICB0aGlzLmZyYWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIGVsLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBnZXRUcmFjZUtleShpdGVtKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGl0ZW07XG4gICAgICAgIHJldHVybiBpdGVtICYmIHR5cGUgPT09ICdvYmplY3QnID8gaXRlbS4kaGFzaGNvZGUgOiB0eXBlICsgJzonICsgaXRlbTtcbiAgICB9XG5cbiAgICAvL+WIm+W7uuS4gOe7hGZyYWdtZW5055qE6Jma5oufRE9NXG4gICAgZnVuY3Rpb24gY3JlYXRlRnJhZ21lbnRzKGluc3RhbmNlLCBvYmopIHtcbiAgICAgICAgaWYgKGlzT2JqZWN0KG9iaikpIHtcbiAgICAgICAgICAgIHZhciBhcnJheSA9IEFycmF5LmlzQXJyYXkob2JqKTtcbiAgICAgICAgICAgIHZhciBpZHMgPSBbXTtcbiAgICAgICAgICAgIHZhciBmcmFnbWVudHMgPSBbXSxcbiAgICAgICAgICAgICAgICBpID0gMDtcblxuICAgICAgICAgICAgaW5zdGFuY2UuaXNBcnJheSA9IGFycmF5O1xuICAgICAgICAgICAgaWYgKGluc3RhbmNlLmZyYWdtZW50cykge1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLnByZUZyYWdtZW50cyA9IGluc3RhbmNlLmZyYWdtZW50cztcbiAgICAgICAgICAgICAgICBhdmFsb24uZWFjaChvYmosIGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrID0gYXJyYXkgPyBnZXRUcmFjZUtleSh2YWx1ZSkgOiBrZXk7XG5cbiAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBrLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpKytcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlkcy5wdXNoKGspO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLmZyYWdtZW50cyA9IGZyYWdtZW50cztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLmVhY2gob2JqLCBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gJCRza2lwQXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgayA9IGFycmF5ID8gZ2V0VHJhY2VLZXkodmFsdWUpIDoga2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhZ21lbnRzLnB1c2gobmV3IFZGcmFnbWVudChbXSwgaywgdmFsdWUsIGkrKykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWRzLnB1c2goayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS5mcmFnbWVudHMgPSBmcmFnbWVudHM7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gaWRzLmpvaW4oJzs7Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTmFOO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbW91bnRMaXN0KGluc3RhbmNlKSB7XG4gICAgICAgIHZhciBhcmdzID0gaW5zdGFuY2UuZnJhZ21lbnRzLm1hcChmdW5jdGlvbiAoZnJhZ21lbnQsIGluZGV4KSB7XG4gICAgICAgICAgICBGcmFnbWVudERlY29yYXRvcihmcmFnbWVudCwgaW5zdGFuY2UsIGluZGV4KTtcbiAgICAgICAgICAgIHNhdmVJbkNhY2hlKGluc3RhbmNlLmNhY2hlLCBmcmFnbWVudCk7XG4gICAgICAgICAgICByZXR1cm4gZnJhZ21lbnQ7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgbGlzdCA9IGluc3RhbmNlLnBhcmVudENoaWxkcmVuO1xuICAgICAgICB2YXIgaSA9IGxpc3QuaW5kZXhPZihpbnN0YW5jZS5iZWdpbik7XG4gICAgICAgIGxpc3Quc3BsaWNlLmFwcGx5KGxpc3QsIFtpICsgMSwgMF0uY29uY2F0KGFyZ3MpKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaWZmTGlzdChpbnN0YW5jZSkge1xuICAgICAgICB2YXIgY2FjaGUgPSBpbnN0YW5jZS5jYWNoZTtcbiAgICAgICAgdmFyIG5ld0NhY2hlID0ge307XG4gICAgICAgIHZhciBmdXp6eSA9IFtdO1xuICAgICAgICB2YXIgbGlzdCA9IGluc3RhbmNlLnByZUZyYWdtZW50cztcblxuICAgICAgICBsaXN0LmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBlbC5fZGlzcG9zZSA9IHRydWU7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluc3RhbmNlLmZyYWdtZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChjLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gaXNJbkNhY2hlKGNhY2hlLCBjLmtleSk7XG4gICAgICAgICAgICAvL+WPluWHuuS5i+WJjeeahOaWh+aho+eijueJh1xuICAgICAgICAgICAgaWYgKGZyYWdtZW50KSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGZyYWdtZW50Ll9kaXNwb3NlO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50Lm9sZEluZGV4ID0gZnJhZ21lbnQuaW5kZXg7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQuaW5kZXggPSBpbmRleDsgLy8g55u45b2T5LqOIGMuaW5kZXhcblxuICAgICAgICAgICAgICAgIHJlc2V0Vk0oZnJhZ21lbnQudm0sIGluc3RhbmNlLmtleU5hbWUpO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50LnZtW2luc3RhbmNlLnZhbE5hbWVdID0gYy52YWw7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQudm1baW5zdGFuY2Uua2V5TmFtZV0gPSBpbnN0YW5jZS5pc0FycmF5ID8gaW5kZXggOiBmcmFnbWVudC5rZXk7XG4gICAgICAgICAgICAgICAgc2F2ZUluQ2FjaGUobmV3Q2FjaGUsIGZyYWdtZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy/lpoLmnpzmib7kuI3liLDlsLHov5vooYzmqKHns4rmkJzntKJcbiAgICAgICAgICAgICAgICBmdXp6eS5wdXNoKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZnV6enkuZm9yRWFjaChmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgdmFyIGZyYWdtZW50ID0gZnV6enlNYXRjaENhY2hlKGNhY2hlLCBjLmtleSk7XG4gICAgICAgICAgICBpZiAoZnJhZ21lbnQpIHtcbiAgICAgICAgICAgICAgICAvL+mHjeWkjeWIqeeUqFxuICAgICAgICAgICAgICAgIGZyYWdtZW50Lm9sZEluZGV4ID0gZnJhZ21lbnQuaW5kZXg7XG4gICAgICAgICAgICAgICAgZnJhZ21lbnQua2V5ID0gYy5rZXk7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IGZyYWdtZW50LnZhbCA9IGMudmFsO1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IGZyYWdtZW50LmluZGV4ID0gYy5pbmRleDtcblxuICAgICAgICAgICAgICAgIGZyYWdtZW50LnZtW2luc3RhbmNlLnZhbE5hbWVdID0gdmFsO1xuICAgICAgICAgICAgICAgIGZyYWdtZW50LnZtW2luc3RhbmNlLmtleU5hbWVdID0gaW5zdGFuY2UuaXNBcnJheSA/IGluZGV4IDogZnJhZ21lbnQua2V5O1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBmcmFnbWVudC5fZGlzcG9zZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICBjID0gbmV3IFZGcmFnbWVudChbXSwgYy5rZXksIGMudmFsLCBjLmluZGV4KTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudCA9IEZyYWdtZW50RGVjb3JhdG9yKGMsIGluc3RhbmNlLCBjLmluZGV4KTtcbiAgICAgICAgICAgICAgICBsaXN0LnB1c2goZnJhZ21lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2F2ZUluQ2FjaGUobmV3Q2FjaGUsIGZyYWdtZW50KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaW5zdGFuY2UuZnJhZ21lbnRzID0gbGlzdDtcbiAgICAgICAgbGlzdC5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgIH0pO1xuICAgICAgICBpbnN0YW5jZS5jYWNoZSA9IG5ld0NhY2hlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0Vk0odm0sIGEsIGIpIHtcbiAgICAgICAgaWYgKGF2YWxvbi5jb25maWcuaW5Qcm94eU1vZGUpIHtcbiAgICAgICAgICAgIHZtLiRhY2Nlc3NvcnNbYV0udmFsdWUgPSBOYU47XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2bS4kYWNjZXNzb3JzW2FdLnNldChOYU4pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlTGlzdChpbnN0YW5jZSkge1xuICAgICAgICB2YXIgYmVmb3JlID0gaW5zdGFuY2UuYmVnaW4uZG9tO1xuICAgICAgICB2YXIgcGFyZW50ID0gYmVmb3JlLnBhcmVudE5vZGU7XG4gICAgICAgIHZhciBsaXN0ID0gaW5zdGFuY2UuZnJhZ21lbnRzO1xuICAgICAgICB2YXIgZW5kID0gaW5zdGFuY2UuZW5kLmRvbTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGl0ZW07IGl0ZW0gPSBsaXN0W2ldOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpdGVtLl9kaXNwb3NlKSB7XG4gICAgICAgICAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgaS0tO1xuICAgICAgICAgICAgICAgIGl0ZW0uZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGl0ZW0ub2xkSW5kZXggIT09IGl0ZW0uaW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IGl0ZW0udG9GcmFnbWVudCgpO1xuICAgICAgICAgICAgICAgIHZhciBpc0VuZCA9IGJlZm9yZS5uZXh0U2libGluZyA9PT0gbnVsbDtcbiAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGYsIGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRW5kICYmICFwYXJlbnQuY29udGFpbnMoZW5kKSkge1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGVuZCwgYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBiZWZvcmUgPSBpdGVtLnNwbGl0O1xuICAgICAgICB9XG4gICAgICAgIHZhciBjaCA9IGluc3RhbmNlLnBhcmVudENoaWxkcmVuO1xuICAgICAgICB2YXIgc3RhcnRJbmRleCA9IGNoLmluZGV4T2YoaW5zdGFuY2UuYmVnaW4pO1xuICAgICAgICB2YXIgZW5kSW5kZXggPSBjaC5pbmRleE9mKGluc3RhbmNlLmVuZCk7XG5cbiAgICAgICAgbGlzdC5zcGxpY2UuYXBwbHkoY2gsIFtzdGFydEluZGV4ICsgMSwgZW5kSW5kZXggLSBzdGFydEluZGV4XS5jb25jYXQobGlzdCkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSB7dHlwZX0gZnJhZ21lbnRcbiAgICAgKiBAcGFyYW0ge3R5cGV9IHRoaXNcbiAgICAgKiBAcGFyYW0ge3R5cGV9IGluZGV4XG4gICAgICogQHJldHVybnMgeyBrZXksIHZhbCwgaW5kZXgsIG9sZEluZGV4LCB0aGlzLCBkb20sIHNwbGl0LCB2bX1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBGcmFnbWVudERlY29yYXRvcihmcmFnbWVudCwgaW5zdGFuY2UsIGluZGV4KSB7XG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIGRhdGFbaW5zdGFuY2Uua2V5TmFtZV0gPSBpbnN0YW5jZS5pc0FycmF5ID8gaW5kZXggOiBmcmFnbWVudC5rZXk7XG4gICAgICAgIGRhdGFbaW5zdGFuY2UudmFsTmFtZV0gPSBmcmFnbWVudC52YWw7XG4gICAgICAgIGlmIChpbnN0YW5jZS5hc05hbWUpIHtcbiAgICAgICAgICAgIGRhdGFbaW5zdGFuY2UuYXNOYW1lXSA9IGluc3RhbmNlLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHZhciB2bSA9IGZyYWdtZW50LnZtID0gcGxhdGZvcm0uaXRlbUZhY3RvcnkoaW5zdGFuY2Uudm0sIHtcbiAgICAgICAgICAgIGRhdGE6IGRhdGFcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChpbnN0YW5jZS5pc0FycmF5KSB7XG4gICAgICAgICAgICB2bS4kd2F0Y2goaW5zdGFuY2UudmFsTmFtZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UudmFsdWUgJiYgaW5zdGFuY2UudmFsdWUuc2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnZhbHVlLnNldCh2bVtpbnN0YW5jZS5rZXlOYW1lXSwgYSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2bS4kd2F0Y2goaW5zdGFuY2UudmFsTmFtZSwgZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZS52YWx1ZVtmcmFnbWVudC5rZXldID0gYTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnJhZ21lbnQuaW5kZXggPSBpbmRleDtcbiAgICAgICAgZnJhZ21lbnQuaW5uZXJSZW5kZXIgPSBhdmFsb24uc2NhbihpbnN0YW5jZS5mcmFnbWVudCwgdm0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBvbGRSb290ID0gdGhpcy5yb290O1xuICAgICAgICAgICAgYXAucHVzaC5hcHBseShmcmFnbWVudC5jaGlsZHJlbiwgb2xkUm9vdC5jaGlsZHJlbik7XG4gICAgICAgICAgICB0aGlzLnJvb3QgPSBmcmFnbWVudDtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBmcmFnbWVudDtcbiAgICB9XG4gICAgLy8g5paw5L2N572uOiDml6fkvY3nva5cbiAgICBmdW5jdGlvbiBpc0luQ2FjaGUoY2FjaGUsIGlkKSB7XG4gICAgICAgIHZhciBjID0gY2FjaGVbaWRdO1xuICAgICAgICBpZiAoYykge1xuICAgICAgICAgICAgdmFyIGFyciA9IGMuYXJyO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgICAgIGlmIChhcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgciA9IGFyci5wb3AoKTtcbiAgICAgICAgICAgICAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgYy5hcnIgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlbGV0ZSBjYWNoZVtpZF07XG4gICAgICAgICAgICByZXR1cm4gYztcbiAgICAgICAgfVxuICAgIH1cbiAgICAvL1sxLDEsMV0gbnVtYmVyMSBudW1iZXIxXyBudW1iZXIxX19cbiAgICBmdW5jdGlvbiBzYXZlSW5DYWNoZShjYWNoZSwgY29tcG9uZW50KSB7XG4gICAgICAgIHZhciB0cmFja0lkID0gY29tcG9uZW50LmtleTtcbiAgICAgICAgaWYgKCFjYWNoZVt0cmFja0lkXSkge1xuICAgICAgICAgICAgY2FjaGVbdHJhY2tJZF0gPSBjb21wb25lbnQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgYyA9IGNhY2hlW3RyYWNrSWRdO1xuICAgICAgICAgICAgdmFyIGFyciA9IGMuYXJyIHx8IChjLmFyciA9IFtdKTtcbiAgICAgICAgICAgIGFyci5wdXNoKGNvbXBvbmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmdXp6eU1hdGNoQ2FjaGUoY2FjaGUpIHtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgZm9yICh2YXIgaWQgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBpZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGlmIChrZXkpIHtcbiAgICAgICAgICAgIHJldHVybiBpc0luQ2FjaGUoY2FjaGUsIGtleSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL+agueaNrlZN55qE5bGe5oCn5YC85oiW6KGo6L6+5byP55qE5YC85YiH5o2i57G75ZCN77yMbXMtY2xhc3M9J3h4eCB5eXkgenp6OmZsYWcnXG4gICAgLy9odHRwOi8vd3d3LmNuYmxvZ3MuY29tL3J1Ynlsb3V2cmUvYXJjaGl2ZS8yMDEyLzEyLzE3LzI4MTg1NDAuaHRtbFxuICAgIGZ1bmN0aW9uIGNsYXNzTmFtZXMoKSB7XG4gICAgICAgIHZhciBjbGFzc2VzID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgYXJnID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgdmFyIGFyZ1R5cGUgPSB0eXBlb2YgYXJnO1xuICAgICAgICAgICAgaWYgKGFyZ1R5cGUgPT09ICdzdHJpbmcnIHx8IGFyZ1R5cGUgPT09ICdudW1iZXInIHx8IGFyZyA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaChhcmcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goY2xhc3NOYW1lcy5hcHBseShudWxsLCBhcmcpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJnVHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gYXJnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmcuaGFzT3duUHJvcGVydHkoa2V5KSAmJiBhcmdba2V5XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgfVxuXG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnY2xhc3MnLCB7XG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uIGRpZmYobmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gdGhpcy50eXBlO1xuICAgICAgICAgICAgdmFyIHZkb20gPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB2YXIgY2xhc3NFdmVudCA9IHZkb20uY2xhc3NFdmVudCB8fCB7fTtcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnaG92ZXInKSB7XG4gICAgICAgICAgICAgICAgLy/lnKjnp7vlh7rnp7vlhaXml7bliIfmjaLnsbvlkI1cbiAgICAgICAgICAgICAgICBjbGFzc0V2ZW50Lm1vdXNlZW50ZXIgPSBhY3RpdmF0ZUNsYXNzO1xuICAgICAgICAgICAgICAgIGNsYXNzRXZlbnQubW91c2VsZWF2ZSA9IGFiYW5kb25DbGFzcztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2FjdGl2ZScpIHtcbiAgICAgICAgICAgICAgICAvL+WcqOiOt+W+l+eEpueCueaXtuWIh+aNouexu+WQjVxuICAgICAgICAgICAgICAgIGNsYXNzRXZlbnQudGFiSW5kZXggPSB2ZG9tLnByb3BzLnRhYmluZGV4IHx8IC0xO1xuICAgICAgICAgICAgICAgIGNsYXNzRXZlbnQubW91c2Vkb3duID0gYWN0aXZhdGVDbGFzcztcbiAgICAgICAgICAgICAgICBjbGFzc0V2ZW50Lm1vdXNldXAgPSBhYmFuZG9uQ2xhc3M7XG4gICAgICAgICAgICAgICAgY2xhc3NFdmVudC5tb3VzZWxlYXZlID0gYWJhbmRvbkNsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmRvbS5jbGFzc0V2ZW50ID0gY2xhc3NFdmVudDtcblxuICAgICAgICAgICAgdmFyIGNsYXNzTmFtZSA9IGNsYXNzTmFtZXMobmV3VmFsKTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvbGRWYWwgPT09IHZvaWQgMCB8fCBvbGRWYWwgIT09IGNsYXNzTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSBjbGFzc05hbWU7XG5cbiAgICAgICAgICAgICAgICB2ZG9tWydjaGFuZ2UtJyArIHR5cGVdID0gY2xhc3NOYW1lO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRvbSA9IHZkb20uZG9tO1xuICAgICAgICAgICAgaWYgKGRvbSAmJiBkb20ubm9kZVR5cGUgPT0gMSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGRpclR5cGUgPSB0aGlzLnR5cGU7XG4gICAgICAgICAgICAgICAgdmFyIGNoYW5nZSA9ICdjaGFuZ2UtJyArIGRpclR5cGU7XG4gICAgICAgICAgICAgICAgdmFyIGNsYXNzRXZlbnQgPSB2ZG9tLmNsYXNzRXZlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGNsYXNzRXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBjbGFzc0V2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gJ3RhYkluZGV4Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbVtpXSA9IGNsYXNzRXZlbnRbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF2YWxvbi5iaW5kKGRvbSwgaSwgY2xhc3NFdmVudFtpXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmRvbS5jbGFzc0V2ZW50ID0ge307XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBuYW1lcyA9IFsnY2xhc3MnLCAnaG92ZXInLCAnYWN0aXZlJ107XG4gICAgICAgICAgICAgICAgbmFtZXMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlyVHlwZSAhPT0gdHlwZSkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ2NsYXNzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tICYmIHNldENsYXNzKGRvbSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9sZENsYXNzID0gZG9tLmdldEF0dHJpYnV0ZShjaGFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9sZENsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXZhbG9uKGRvbSkucmVtb3ZlQ2xhc3Mob2xkQ2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWUgPSAnY2hhbmdlLScgKyB0eXBlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9tLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGlyZWN0aXZlcy5hY3RpdmUgPSBkaXJlY3RpdmVzLmhvdmVyID0gZGlyZWN0aXZlc1snY2xhc3MnXTtcblxuICAgIHZhciBjbGFzc01hcCA9IHtcbiAgICAgICAgbW91c2VlbnRlcjogJ2NoYW5nZS1ob3ZlcicsXG4gICAgICAgIG1vdXNlbGVhdmU6ICdjaGFuZ2UtaG92ZXInLFxuICAgICAgICBtb3VzZWRvd246ICdjaGFuZ2UtYWN0aXZlJyxcbiAgICAgICAgbW91c2V1cDogJ2NoYW5nZS1hY3RpdmUnXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGFjdGl2YXRlQ2xhc3MoZSkge1xuICAgICAgICB2YXIgZWxlbSA9IGUudGFyZ2V0O1xuICAgICAgICBhdmFsb24oZWxlbSkuYWRkQ2xhc3MoZWxlbS5nZXRBdHRyaWJ1dGUoY2xhc3NNYXBbZS50eXBlXSkgfHwgJycpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFiYW5kb25DbGFzcyhlKSB7XG4gICAgICAgIHZhciBlbGVtID0gZS50YXJnZXQ7XG4gICAgICAgIHZhciBuYW1lID0gY2xhc3NNYXBbZS50eXBlXTtcbiAgICAgICAgYXZhbG9uKGVsZW0pLnJlbW92ZUNsYXNzKGVsZW0uZ2V0QXR0cmlidXRlKG5hbWUpIHx8ICcnKTtcbiAgICAgICAgaWYgKG5hbWUgIT09ICdjaGFuZ2UtYWN0aXZlJykge1xuICAgICAgICAgICAgYXZhbG9uKGVsZW0pLnJlbW92ZUNsYXNzKGVsZW0uZ2V0QXR0cmlidXRlKCdjaGFuZ2UtYWN0aXZlJykgfHwgJycpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2V0Q2xhc3MoZG9tLCBuZW8pIHtcbiAgICAgICAgdmFyIG9sZCA9IGRvbS5nZXRBdHRyaWJ1dGUoJ2NoYW5nZS1jbGFzcycpO1xuICAgICAgICBpZiAob2xkICE9PSBuZW8pIHtcbiAgICAgICAgICAgIGF2YWxvbihkb20pLnJlbW92ZUNsYXNzKG9sZCkuYWRkQ2xhc3MobmVvKTtcbiAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ2NoYW5nZS1jbGFzcycsIG5lbyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRMb25nSUQoYWN0aXZhdGVDbGFzcyk7XG4gICAgZ2V0TG9uZ0lEKGFiYW5kb25DbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBsb29rdXBPcHRpb24odmRvbSwgdmFsdWVzKSB7XG4gICAgICAgIHZkb20uY2hpbGRyZW4gJiYgdmRvbS5jaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSAnb3B0aW9uJykge1xuICAgICAgICAgICAgICAgIHNldE9wdGlvbihlbCwgdmFsdWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbG9va3VwT3B0aW9uKGVsLCB2YWx1ZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZXRPcHRpb24odmRvbSwgdmFsdWVzKSB7XG4gICAgICAgIHZhciBwcm9wcyA9IHZkb20ucHJvcHM7XG4gICAgICAgIGlmICghKCdkaXNhYmxlZCcgaW4gcHJvcHMpKSB7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBnZXRPcHRpb25WYWx1ZSh2ZG9tLCBwcm9wcyk7XG4gICAgICAgICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSB8fCAnJykudHJpbSgpO1xuICAgICAgICAgICAgcHJvcHMuc2VsZWN0ZWQgPSB2YWx1ZXMuaW5kZXhPZih2YWx1ZSkgIT09IC0xO1xuXG4gICAgICAgICAgICBpZiAodmRvbS5kb20pIHtcbiAgICAgICAgICAgICAgICB2ZG9tLmRvbS5zZWxlY3RlZCA9IHByb3BzLnNlbGVjdGVkO1xuICAgICAgICAgICAgICAgIHZhciB2ID0gdmRvbS5kb20uc2VsZWN0ZWQ7IC8v5b+F6aG75Yqg5LiK6L+Z5LiqLOmYsuatouenu+WHuuiKgueCuXNlbGVjdGVk5aSx5pWIXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRPcHRpb25WYWx1ZSh2ZG9tLCBwcm9wcykge1xuICAgICAgICBpZiAocHJvcHMgJiYgJ3ZhbHVlJyBpbiBwcm9wcykge1xuICAgICAgICAgICAgcmV0dXJuIHByb3BzLnZhbHVlICsgJyc7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICB2ZG9tLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBpZiAoZWwubm9kZU5hbWUgPT09ICcjdGV4dCcpIHtcbiAgICAgICAgICAgICAgICBhcnIucHVzaChlbC5ub2RlVmFsdWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChlbC5ub2RlTmFtZSA9PT0gJyNkb2N1bWVudC1mcmFnbWVudCcpIHtcbiAgICAgICAgICAgICAgICBhcnIucHVzaChnZXRPcHRpb25WYWx1ZShlbCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFyci5qb2luKCcnKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTZWxlY3RlZFZhbHVlKHZkb20sIGFycikge1xuICAgICAgICB2ZG9tLmNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICBpZiAoZWwubm9kZU5hbWUgPT09ICdvcHRpb24nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVsLnByb3BzLnNlbGVjdGVkID09PSB0cnVlKSBhcnIucHVzaChnZXRPcHRpb25WYWx1ZShlbCwgZWwucHJvcHMpKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWwuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBnZXRTZWxlY3RlZFZhbHVlKGVsLCBhcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICB2YXIgdXBkYXRlRGF0YUFjdGlvbnMgPSB7XG4gICAgICAgIGlucHV0OiBmdW5jdGlvbiBpbnB1dChwcm9wKSB7XG4gICAgICAgICAgICAvL+WkhOeQhuWNleS4qnZhbHVl5YC85aSE55CGXG4gICAgICAgICAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgICAgICAgICAgcHJvcCA9IHByb3AgfHwgJ3ZhbHVlJztcbiAgICAgICAgICAgIHZhciBkb20gPSBmaWVsZC5kb207XG4gICAgICAgICAgICB2YXIgcmF3VmFsdWUgPSBkb21bcHJvcF07XG4gICAgICAgICAgICB2YXIgcGFyc2VkVmFsdWUgPSBmaWVsZC5wYXJzZVZhbHVlKHJhd1ZhbHVlKTtcblxuICAgICAgICAgICAgLy/mnInml7blgJlwYXJzZeWQjuS4gOiHtCx2beS4jeS8muaUueWPmCzkvYZpbnB1dOmHjOmdoueahOWAvFxuICAgICAgICAgICAgZmllbGQudmFsdWUgPSByYXdWYWx1ZTtcbiAgICAgICAgICAgIGZpZWxkLnNldFZhbHVlKHBhcnNlZFZhbHVlKTtcbiAgICAgICAgICAgIGR1cGxleENiKGZpZWxkKTtcbiAgICAgICAgICAgIHZhciBwb3MgPSBmaWVsZC5wb3M7XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmIChkb20uY2FyZXQpIHtcbiAgICAgICAgICAgICAgICBmaWVsZC5zZXRDYXJldChkb20sIHBvcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL3ZtLmFhYSA9ICcxMjM0NTY3ODkwJ1xuICAgICAgICAgICAgLy/lpITnkIYgPGlucHV0IG1zLWR1cGxleD0nQGFhYXxsaW1pdEJ5KDgpJy8+e3tAYWFhfX0g6L+Z56eN5qC85byP5YyW5ZCM5q2l5LiN5LiA6Ie055qE5oOF5Ya1IFxuICAgICAgICB9LFxuICAgICAgICByYWRpbzogZnVuY3Rpb24gcmFkaW8oKSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGZpZWxkLmlzQ2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIHZhciB2YWwgPSAhZmllbGQudmFsdWU7XG4gICAgICAgICAgICAgICAgZmllbGQuc2V0VmFsdWUodmFsKTtcbiAgICAgICAgICAgICAgICBkdXBsZXhDYihmaWVsZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHVwZGF0ZURhdGFBY3Rpb25zLmlucHV0LmNhbGwoZmllbGQpO1xuICAgICAgICAgICAgICAgIGZpZWxkLnZhbHVlID0gTmFOO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjaGVja2JveDogZnVuY3Rpb24gY2hlY2tib3goKSB7XG4gICAgICAgICAgICB2YXIgZmllbGQgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGFycmF5ID0gZmllbGQudmFsdWU7XG4gICAgICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoYXJyYXkpKSB7XG4gICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oJ21zLWR1cGxleOW6lOeUqOS6jmNoZWNrYm945LiK6KaB5a+55bqU5LiA5Liq5pWw57uEJyk7XG4gICAgICAgICAgICAgICAgYXJyYXkgPSBbYXJyYXldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG1ldGhvZCA9IGZpZWxkLmRvbS5jaGVja2VkID8gJ2Vuc3VyZScgOiAncmVtb3ZlJztcbiAgICAgICAgICAgIGlmIChhcnJheVttZXRob2RdKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbCA9IGZpZWxkLnBhcnNlVmFsdWUoZmllbGQuZG9tLnZhbHVlKTtcbiAgICAgICAgICAgICAgICBhcnJheVttZXRob2RdKHZhbCk7XG4gICAgICAgICAgICAgICAgZHVwbGV4Q2IoZmllbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fX3Rlc3RfXyA9IGFycmF5O1xuICAgICAgICB9LFxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIHNlbGVjdCgpIHtcbiAgICAgICAgICAgIHZhciBmaWVsZCA9IHRoaXM7XG4gICAgICAgICAgICB2YXIgdmFsID0gYXZhbG9uKGZpZWxkLmRvbSkudmFsKCk7IC8v5a2X56ym5Liy5oiW5a2X56ym5Liy5pWw57uEXG4gICAgICAgICAgICBpZiAodmFsICsgJycgIT09IHRoaXMudmFsdWUgKyAnJykge1xuICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/ovazmjaLluIPlsJTmlbDnu4TmiJblhbbku5ZcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gdmFsLm1hcChmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpZWxkLnBhcnNlVmFsdWUodik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbCA9IGZpZWxkLnBhcnNlVmFsdWUodmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmllbGQuc2V0VmFsdWUodmFsKTtcbiAgICAgICAgICAgICAgICBkdXBsZXhDYihmaWVsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRlZGl0YWJsZTogZnVuY3Rpb24gY29udGVudGVkaXRhYmxlKCkge1xuICAgICAgICAgICAgdXBkYXRlRGF0YUFjdGlvbnMuaW5wdXQuY2FsbCh0aGlzLCAnaW5uZXJIVE1MJyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZHVwbGV4Q2IoZmllbGQpIHtcbiAgICAgICAgaWYgKGZpZWxkLnVzZXJDYikge1xuICAgICAgICAgICAgZmllbGQudXNlckNiLmNhbGwoZmllbGQudm0sIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2hhbmdlZCcsXG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBmaWVsZC5kb21cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlRGF0YUhhbmRsZShldmVudCkge1xuICAgICAgICB2YXIgZWxlbSA9IHRoaXM7XG4gICAgICAgIHZhciBmaWVsZCA9IGVsZW0uX21zX2R1cGxleF87XG4gICAgICAgIGlmIChlbGVtLmNvbXBvc2luZykge1xuICAgICAgICAgICAgLy/pmLLmraJvbnByb3BlcnR5Y2hhbmdl5byV5Y+R54iG5qCIXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW0udmFsdWUgPT09IGZpZWxkLnZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgaWYgKGVsZW0uY2FyZXQpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvcyA9IGZpZWxkLmdldENhcmV0KGVsZW0pO1xuICAgICAgICAgICAgICAgIGZpZWxkLnBvcyA9IHBvcztcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgaWYgKGZpZWxkLmRlYm91bmNlVGltZSA+IDQpIHtcbiAgICAgICAgICAgIHZhciB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgdmFyIGxlZnQgPSB0aW1lc3RhbXAgLSBmaWVsZC50aW1lIHx8IDA7XG4gICAgICAgICAgICBmaWVsZC50aW1lID0gdGltZXN0YW1wO1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmKi9cbiAgICAgICAgICAgIGlmIChsZWZ0ID49IGZpZWxkLmRlYm91bmNlVGltZSkge1xuICAgICAgICAgICAgICAgIHVwZGF0ZURhdGFBY3Rpb25zW2ZpZWxkLmR0eXBlXS5jYWxsKGZpZWxkKTtcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSovXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dChmaWVsZC5kZWJvdW5jZUlEKTtcbiAgICAgICAgICAgICAgICBmaWVsZC5kZWJvdW5jZUlEID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZURhdGFBY3Rpb25zW2ZpZWxkLmR0eXBlXS5jYWxsKGZpZWxkKTtcbiAgICAgICAgICAgICAgICB9LCBsZWZ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVwZGF0ZURhdGFBY3Rpb25zW2ZpZWxkLmR0eXBlXS5jYWxsKGZpZWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciByY2hhbmdlRmlsdGVyID0gL1xcfFxccypjaGFuZ2VcXGIvO1xuICAgIHZhciByZGVib3VuY2VGaWx0ZXIgPSAvXFx8XFxzKmRlYm91bmNlKD86XFwoKFteKV0rKVxcKSk/LztcbiAgICBmdW5jdGlvbiBkdXBsZXhCZWZvcmVJbml0KCkge1xuICAgICAgICB2YXIgZXhwciA9IHRoaXMuZXhwcjtcbiAgICAgICAgaWYgKHJjaGFuZ2VGaWx0ZXIudGVzdChleHByKSkge1xuICAgICAgICAgICAgdGhpcy5pc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgICAgICAgZXhwciA9IGV4cHIucmVwbGFjZShyY2hhbmdlRmlsdGVyLCAnJyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1hdGNoID0gZXhwci5tYXRjaChyZGVib3VuY2VGaWx0ZXIpO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIGV4cHIgPSBleHByLnJlcGxhY2UocmRlYm91bmNlRmlsdGVyLCAnJyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNDaGFuZ2VkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZWJvdW5jZVRpbWUgPSBwYXJzZUludChtYXRjaFsxXSwgMTApIHx8IDMwMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4cHIgPSBleHByO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkdXBsZXhJbml0KCkge1xuICAgICAgICB2YXIgZXhwciA9IHRoaXMuZXhwcjtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgIHZhciBldHlwZSA9IG5vZGUucHJvcHMudHlwZTtcbiAgICAgICAgdGhpcy5wYXJzZVZhbHVlID0gcGFyc2VWYWx1ZTtcbiAgICAgICAgLy/lpITnkIbmlbDmja7ovazmjaLlmahcbiAgICAgICAgdmFyIHBhcnNlcnMgPSB0aGlzLnBhcmFtLFxuICAgICAgICAgICAgZHR5cGU7XG4gICAgICAgIHZhciBpc0NoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgcGFyc2VycyA9IHBhcnNlcnMgPyBwYXJzZXJzLnNwbGl0KCctJykubWFwKGZ1bmN0aW9uIChhKSB7XG4gICAgICAgICAgICBpZiAoYSA9PT0gJ2NoZWNrZWQnKSB7XG4gICAgICAgICAgICAgICAgaXNDaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBhO1xuICAgICAgICB9KSA6IFtdO1xuICAgICAgICBub2RlLmR1cGxleCA9IHRoaXM7XG4gICAgICAgIGlmIChyY2hlY2tlZFR5cGUudGVzdChldHlwZSkgJiYgaXNDaGVja2VkKSB7XG4gICAgICAgICAgICAvL+WmguaenOaYr3JhZGlvLCBjaGVja2JveCzliKTlrprnlKjmiLfkvb/nlKjkuoZjaGVja2Vk5qC85byP5Ye95pWw5rKh5pyJXG4gICAgICAgICAgICBwYXJzZXJzID0gW107XG4gICAgICAgICAgICBkdHlwZSA9ICdyYWRpbyc7XG4gICAgICAgICAgICB0aGlzLmlzQ2hlY2tlZCA9IGlzQ2hlY2tlZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhcnNlcnMgPSBwYXJzZXJzO1xuICAgICAgICBpZiAoIS9pbnB1dHx0ZXh0YXJlYXxzZWxlY3QvLnRlc3Qobm9kZS5ub2RlTmFtZSkpIHtcbiAgICAgICAgICAgIGlmICgnY29udGVudGVkaXRhYmxlJyBpbiBub2RlLnByb3BzKSB7XG4gICAgICAgICAgICAgICAgZHR5cGUgPSAnY29udGVudGVkaXRhYmxlJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghZHR5cGUpIHtcbiAgICAgICAgICAgIGR0eXBlID0gbm9kZS5ub2RlTmFtZSA9PT0gJ3NlbGVjdCcgPyAnc2VsZWN0JyA6IGV0eXBlID09PSAnY2hlY2tib3gnID8gJ2NoZWNrYm94JyA6IGV0eXBlID09PSAncmFkaW8nID8gJ3JhZGlvJyA6ICdpbnB1dCc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kdHlwZSA9IGR0eXBlO1xuXG4gICAgICAgIC8v5Yik5a6a5piv5ZCm5L2/55So5LqGIGNoYW5nZSBkZWJvdW5jZSDov4fmu6TlmahcbiAgICAgICAgLy8gdGhpcy5pc0NoZWNrZWQgPSAvYm9vbGVhbi8udGVzdChwYXJzZXJzKVxuICAgICAgICBpZiAoZHR5cGUgIT09ICdpbnB1dCcgJiYgZHR5cGUgIT09ICdjb250ZW50ZWRpdGFibGUnKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5pc0NoYW5nZTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLmRlYm91bmNlVGltZTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc0NoZWNrZWQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTdHJpbmcgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNiID0gbm9kZS5wcm9wc1snZGF0YS1kdXBsZXgtY2hhbmdlZCddO1xuICAgICAgICBpZiAoY2IpIHtcbiAgICAgICAgICAgIHZhciBhcnIgPSBhZGRTY29wZShjYiwgJ3h4Jyk7XG4gICAgICAgICAgICB2YXIgYm9keSA9IG1ha2VIYW5kbGUoYXJyWzBdKTtcbiAgICAgICAgICAgIHRoaXMudXNlckNiID0gbmV3IEZ1bmN0aW9uKCckZXZlbnQnLCAndmFyIF9fdm1vZGVsX18gPSB0aGlzXFxucmV0dXJuICcgKyBib2R5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkdXBsZXhEaWZmKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KG5ld1ZhbCkpIHtcbiAgICAgICAgICAgIGlmIChuZXdWYWwgKyAnJyAhPT0gdGhpcy5jb21wYXJlVmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wYXJlVmFsID0gbmV3VmFsICsgJyc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXdWYWwgPSB0aGlzLnBhcnNlVmFsdWUobmV3VmFsKTtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0NoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZhbHVlID0gbmV3VmFsICs9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5ld1ZhbCAhPT0gdGhpcy5jb21wYXJlVmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wYXJlVmFsID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZHVwbGV4QmluZCh2ZG9tLCBhZGRFdmVudCkge1xuICAgICAgICB2YXIgZG9tID0gdmRvbS5kb207XG4gICAgICAgIHRoaXMuZG9tID0gZG9tO1xuICAgICAgICB0aGlzLnZkb20gPSB2ZG9tO1xuICAgICAgICB0aGlzLmR1cGxleENiID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgZG9tLl9tc19kdXBsZXhfID0gdGhpcztcbiAgICAgICAgLy/nu5Hlrprkuovku7ZcbiAgICAgICAgYWRkRXZlbnQoZG9tLCB0aGlzKTtcbiAgICB9XG5cbiAgICB2YXIgdmFsdWVIaWphY2sgPSB0cnVlO1xuICAgIHRyeSB7XG4gICAgICAgIC8vIzI3MiBJRTktSUUxMSwgZmlyZWZveFxuICAgICAgICB2YXIgc2V0dGVycyA9IHt9O1xuICAgICAgICB2YXIgYXByb3RvID0gSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGU7XG4gICAgICAgIHZhciBicHJvdG8gPSBIVE1MVGV4dEFyZWFFbGVtZW50LnByb3RvdHlwZTtcbiAgICAgICAgdmFyIG5ld1NldHRlciA9IGZ1bmN0aW9uIG5ld1NldHRlcih2YWx1ZSkge1xuICAgICAgICAgICAgLy8ganNoaW50IGlnbm9yZTpsaW5lXG4gICAgICAgICAgICBzZXR0ZXJzW3RoaXMudGFnTmFtZV0uY2FsbCh0aGlzLCB2YWx1ZSk7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMuX21zX2R1cGxleF87XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FyZXQgJiYgZGF0YSAmJiBkYXRhLmlzU3RyaW5nKSB7XG4gICAgICAgICAgICAgICAgZGF0YS5kdXBsZXhDYi5jYWxsKHRoaXMsIHsgdHlwZTogJ3NldHRlcicgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBpbnB1dFByb3RvID0gSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGU7XG4gICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGlucHV0UHJvdG8pOyAvL+aVheaEj+W8leWPkUlFNi04562J5rWP6KeI5Zmo5oql6ZSZXG4gICAgICAgIHNldHRlcnNbJ0lOUFVUJ10gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGFwcm90bywgJ3ZhbHVlJykuc2V0O1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShhcHJvdG8sICd2YWx1ZScsIHtcbiAgICAgICAgICAgIHNldDogbmV3U2V0dGVyXG4gICAgICAgIH0pO1xuICAgICAgICBzZXR0ZXJzWydURVhUQVJFQSddID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihicHJvdG8sICd2YWx1ZScpLnNldDtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJwcm90bywgJ3ZhbHVlJywge1xuICAgICAgICAgICAgc2V0OiBuZXdTZXR0ZXJcbiAgICAgICAgfSk7XG4gICAgICAgIHZhbHVlSGlqYWNrID0gZmFsc2U7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvL+WcqGNocm9tZSA0M+S4rSBtcy1kdXBsZXjnu4jkuo7kuI3pnIDopoHkvb/nlKjlrprml7blmajlrp7njrDlj4zlkJHnu5HlrprkuoZcbiAgICAgICAgLy8gaHR0cDovL3VwZGF0ZXMuaHRtbDVyb2Nrcy5jb20vMjAxNS8wNC9ET00tYXR0cmlidXRlcy1ub3ctb24tdGhlLXByb3RvdHlwZVxuICAgICAgICAvLyBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFqd0E4bXRDbHd4SS1RSnVIVDc4NzJaMHB4cFp6OFBCa2YyYkdBYnNVdHFzL2VkaXQ/cGxpPTFcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZVZhbHVlKHZhbCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgazsgayA9IHRoaXMucGFyc2Vyc1tpKytdOykge1xuICAgICAgICAgICAgdmFyIGZuID0gYXZhbG9uLnBhcnNlcnNba107XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICB2YWwgPSBmbi5jYWxsKHRoaXMsIHZhbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cbiAgICB2YXIgdXBkYXRlVmlldyA9IHtcbiAgICAgICAgaW5wdXQ6IGZ1bmN0aW9uIGlucHV0KCkge1xuICAgICAgICAgICAgLy/lpITnkIbljZXkuKp2YWx1ZeWAvOWkhOeQhlxuICAgICAgICAgICAgdmFyIHZkb20gPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSB0aGlzLnZhbHVlICsgJyc7XG4gICAgICAgICAgICB2ZG9tLmRvbS52YWx1ZSA9IHZkb20ucHJvcHMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgdXBkYXRlQ2hlY2tlZDogZnVuY3Rpb24gdXBkYXRlQ2hlY2tlZCh2ZG9tLCBjaGVja2VkKSB7XG4gICAgICAgICAgICBpZiAodmRvbS5kb20pIHtcbiAgICAgICAgICAgICAgICB2ZG9tLmRvbS5kZWZhdWx0Q2hlY2tlZCA9IHZkb20uZG9tLmNoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByYWRpbzogZnVuY3Rpb24gcmFkaW8oKSB7XG4gICAgICAgICAgICAvL+WkhOeQhuWNleS4qmNoZWNrZWTlsZ7mgKdcbiAgICAgICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlO1xuICAgICAgICAgICAgdmFyIG5vZGVWYWx1ZSA9IG5vZGUucHJvcHMudmFsdWU7XG4gICAgICAgICAgICB2YXIgY2hlY2tlZDtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzQ2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIGNoZWNrZWQgPSAhIXRoaXMudmFsdWU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNoZWNrZWQgPSB0aGlzLnZhbHVlICsgJycgPT09IG5vZGVWYWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5vZGUucHJvcHMuY2hlY2tlZCA9IGNoZWNrZWQ7XG4gICAgICAgICAgICB1cGRhdGVWaWV3LnVwZGF0ZUNoZWNrZWQobm9kZSwgY2hlY2tlZCk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoZWNrYm94OiBmdW5jdGlvbiBjaGVja2JveCgpIHtcbiAgICAgICAgICAgIC8v5aSE55CG5aSa5LiqY2hlY2tlZOWxnuaAp1xuICAgICAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSBub2RlLnByb3BzO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gcHJvcHMudmFsdWUgKyAnJztcbiAgICAgICAgICAgIHZhciB2YWx1ZXMgPSBbXS5jb25jYXQodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgY2hlY2tlZCA9IHZhbHVlcy5zb21lKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBlbCArICcnID09PSB2YWx1ZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBwcm9wcy5kZWZhdWx0Q2hlY2tlZCA9IHByb3BzLmNoZWNrZWQgPSBjaGVja2VkO1xuICAgICAgICAgICAgdXBkYXRlVmlldy51cGRhdGVDaGVja2VkKG5vZGUsIGNoZWNrZWQpO1xuICAgICAgICB9LFxuICAgICAgICBzZWxlY3Q6IGZ1bmN0aW9uIHNlbGVjdCgpIHtcbiAgICAgICAgICAgIC8v5aSE55CG5a2Q57qn55qEc2VsZWN0ZWTlsZ7mgKdcbiAgICAgICAgICAgIHZhciBhID0gQXJyYXkuaXNBcnJheSh0aGlzLnZhbHVlKSA/IHRoaXMudmFsdWUubWFwKFN0cmluZykgOiB0aGlzLnZhbHVlICsgJyc7XG4gICAgICAgICAgICBsb29rdXBPcHRpb24odGhpcy5ub2RlLCBhKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudGVkaXRhYmxlOiBmdW5jdGlvbiBjb250ZW50ZWRpdGFibGUoKSB7XG4gICAgICAgICAgICAvL+WkhOeQhuWNleS4qmlubmVySFRNTCBcblxuICAgICAgICAgICAgdmFyIHZub2RlcyA9IGZyb21TdHJpbmcodGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSBjcmVhdGVGcmFnbWVudCgpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IHZub2Rlc1tpKytdOykge1xuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IGF2YWxvbi52ZG9tKGVsLCAndG9ET00nKTtcbiAgICAgICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdmFsb24uY2xlYXJIVE1MKHRoaXMuZG9tKS5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgICAgICAgICB2YXIgbGlzdCA9IHRoaXMubm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KGxpc3QsIHZub2Rlcyk7XG5cbiAgICAgICAgICAgIHRoaXMuZHVwbGV4Q2IuY2FsbCh0aGlzLmRvbSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogXG4gICAgICog6YCa6L+H57uR5a6a5LqL5Lu25ZCM5q2ldm1vZGVsXG4gICAgICog5oC75YWx5pyJ5LiJ56eN5pa55byP5ZCM5q2l6KeG5Zu+XG4gICAgICogMS4g5ZCE56eN5LqL5Lu2IGlucHV0LCBjaGFuZ2UsIGNsaWNrLCBwcm9wZXJ0eWNoYW5nZSwga2V5ZG93bi4uLlxuICAgICAqIDIuIHZhbHVl5bGe5oCn6YeN5YaZXG4gICAgICogMy4g5a6a5pe25Zmo6L2u6K+iXG4gICAgICovXG5cbiAgICBmdW5jdGlvbiB1cGRhdGVEYXRhRXZlbnRzKGRvbSwgZGF0YSkge1xuICAgICAgICB2YXIgZXZlbnRzID0ge307XG4gICAgICAgIC8v5re75Yqg6ZyA6KaB55uR5ZCs55qE5LqL5Lu2XG4gICAgICAgIHN3aXRjaCAoZGF0YS5kdHlwZSkge1xuICAgICAgICAgICAgY2FzZSAncmFkaW8nOlxuICAgICAgICAgICAgY2FzZSAnY2hlY2tib3gnOlxuICAgICAgICAgICAgICAgIGV2ZW50cy5jbGljayA9IHVwZGF0ZURhdGFIYW5kbGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzZWxlY3QnOlxuICAgICAgICAgICAgICAgIGV2ZW50cy5jaGFuZ2UgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnY29udGVudGVkaXRhYmxlJzpcbiAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5pc0NoYW5nZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmJsdXIgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgZWxzZSAqL1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiovXG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF2YWxvbi5tb2Rlcm4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3ckMS53ZWJraXRVUkwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwOi8vY29kZS5tZXRhZ2VyLmRlL3NvdXJjZS94cmVmL1dlYktpdC9MYXlvdXRUZXN0cy9mYXN0L2V2ZW50cy9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTEwNzQyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLndlYmtpdEVkaXRhYmxlQ29udGVudENoYW5nZWQgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh3aW5kb3ckMS5NdXRhdGlvbkV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLkRPTUNoYXJhY3RlckRhdGFNb2RpZmllZCA9IHVwZGF0ZURhdGFIYW5kbGU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuaW5wdXQgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5rZXlkb3duID0gdXBkYXRlTW9kZWxLZXlEb3duO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnBhc3RlID0gdXBkYXRlTW9kZWxEZWxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5jdXQgPSB1cGRhdGVNb2RlbERlbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmZvY3VzID0gY2xvc2VDb21wb3NpdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5ibHVyID0gb3BlbkNvbXBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaW5wdXQnOlxuICAgICAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgICAgIGlmIChkYXRhLmlzQ2hhbmdlZCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudHMuY2hhbmdlID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGVsc2UgKi9cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvL2h0dHA6Ly93d3cuY25ibG9ncy5jb20vcnVieWxvdXZyZS9hcmNoaXZlLzIwMTMvMDIvMTcvMjkxNDYwNC5odG1sXG4gICAgICAgICAgICAgICAgICAgIC8vaHR0cDovL3d3dy5tYXR0czQxMS5jb20vcG9zdC9pbnRlcm5ldC1leHBsb3Jlci05LW9uaW5wdXQvXG4gICAgICAgICAgICAgICAgICAgIGlmIChtc2llIDwgMTApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vSUU2LTjnmoRwcm9wZXJ0eWNoYW5nZeaciemXrumimCznrKzkuIDmrKHnlKhKU+S/ruaUueWAvOaXtuS4jeS8muinpuWPkSzogIzkuJTkvaDmmK/lhajpg6jmuIXnqbp2YWx1ZeS5n+S4jeS8muinpuWPkVxuICAgICAgICAgICAgICAgICAgICAgICAgLy9JRTnnmoRwcm9wZXJ0eWNoYW5nZeS4jeaUr+aMgeiHquWKqOWujOaIkCzpgIDmoLws5Yig6ZmkLOWkjeWItizotLTnspgs5Ymq5YiH5oiW54K55Ye75Y+z6L6555qE5bCPWOeahOa4heepuuaTjeS9nFxuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnByb3BlcnR5Y2hhbmdlID0gdXBkYXRlTW9kZWxIYWNrO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLnBhc3RlID0gdXBkYXRlTW9kZWxEZWxheTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV2ZW50cy5jdXQgPSB1cGRhdGVNb2RlbERlbGF5O1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9JRTnlnKjnrKzkuIDmrKHliKDpmaTlrZfnrKbml7bkuI3kvJrop6blj5FvbmlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMua2V5dXAgPSB1cGRhdGVNb2RlbEtleURvd247XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuaW5wdXQgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnRzLmNvbXBvc2l0aW9uc3RhcnQgPSBvcGVuQ29tcG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+W+rui9r+aLvOmfs+i+k+WFpeazleeahOmXrumimOmcgOimgeWcqGNvbXBvc2l0aW9uZW5k5LqL5Lu25Lit5aSE55CGXG4gICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuY29tcG9zaXRpb25lbmQgPSBjbG9zZUNvbXBvc2l0aW9uO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9UeXBlZEFycmF5XG4gICAgICAgICAgICAgICAgICAgICAgICAvL+WkhOeQhuS9jueJiOacrOeahOagh+WHhua1j+iniOWZqCzpgJrov4dJbnQ4QXJyYXnov5vooYzljLrliIZcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghL1xcW25hdGl2ZSBjb2RlXFxdLy50ZXN0KHdpbmRvdyQxLkludDhBcnJheSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMua2V5ZG93biA9IHVwZGF0ZU1vZGVsS2V5RG93bjsgLy9zYWZhcmkgPCA1IG9wZXJhIDwgMTFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMucGFzdGUgPSB1cGRhdGVNb2RlbERlbGF5OyAvL3NhZmFyaSA8IDVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuY3V0ID0gdXBkYXRlTW9kZWxEZWxheTsgLy9zYWZhcmkgPCA1IFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3aW5kb3ckMS5uZXRzY2FwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBGaXJlZm94IDw9IDMuNiBkb2Vzbid0IGZpcmUgdGhlICdpbnB1dCcgZXZlbnQgd2hlbiB0ZXh0IGlzIGZpbGxlZCBpbiB0aHJvdWdoIGF1dG9jb21wbGV0ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldmVudHMuRE9NQXV0b0NvbXBsZXRlID0gdXBkYXRlRGF0YUhhbmRsZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoL3Bhc3N3b3JkfHRleHQvLnRlc3QoZG9tLnR5cGUpKSB7XG4gICAgICAgICAgICBldmVudHMuZm9jdXMgPSBvcGVuQ2FyZXQ7IC8v5Yik5a6a5piv5ZCm5L2/55So5YWJ5qCH5L+u5q2j5Yqf6IO9IFxuICAgICAgICAgICAgZXZlbnRzLmJsdXIgPSBjbG9zZUNhcmV0O1xuICAgICAgICAgICAgZGF0YS5nZXRDYXJldCA9IGdldENhcmV0O1xuICAgICAgICAgICAgZGF0YS5zZXRDYXJldCA9IHNldENhcmV0O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiBldmVudHMpIHtcbiAgICAgICAgICAgIGF2YWxvbi5iaW5kKGRvbSwgbmFtZSwgZXZlbnRzW25hbWVdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1vZGVsSGFjayhlKSB7XG4gICAgICAgIGlmIChlLnByb3BlcnR5TmFtZSA9PT0gJ3ZhbHVlJykge1xuICAgICAgICAgICAgdXBkYXRlRGF0YUhhbmRsZS5jYWxsKHRoaXMsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBkYXRlTW9kZWxEZWxheShlKSB7XG4gICAgICAgIHZhciBlbGVtID0gdGhpcztcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB1cGRhdGVEYXRhSGFuZGxlLmNhbGwoZWxlbSwgZSk7XG4gICAgICAgIH0sIDApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9wZW5DYXJldCgpIHtcbiAgICAgICAgdGhpcy5jYXJldCA9IHRydWU7XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gY2xvc2VDYXJldCgpIHtcbiAgICAgICAgdGhpcy5jYXJldCA9IGZhbHNlO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIG9wZW5Db21wb3NpdGlvbigpIHtcbiAgICAgICAgdGhpcy5jb21wb3NpbmcgPSB0cnVlO1xuICAgIH1cbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgIGZ1bmN0aW9uIGNsb3NlQ29tcG9zaXRpb24oZSkge1xuICAgICAgICB0aGlzLmNvbXBvc2luZyA9IGZhbHNlO1xuICAgICAgICB1cGRhdGVNb2RlbERlbGF5LmNhbGwodGhpcywgZSk7XG4gICAgfVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gdXBkYXRlTW9kZWxLZXlEb3duKGUpIHtcbiAgICAgICAgdmFyIGtleSA9IGUua2V5Q29kZTtcbiAgICAgICAgLy8gaWdub3JlXG4gICAgICAgIC8vICAgIGNvbW1hbmQgICAgICAgICAgICBtb2RpZmllcnMgICAgICAgICAgICAgICAgICAgYXJyb3dzXG4gICAgICAgIGlmIChrZXkgPT09IDkxIHx8IDE1IDwga2V5ICYmIGtleSA8IDE5IHx8IDM3IDw9IGtleSAmJiBrZXkgPD0gNDApIHJldHVybjtcbiAgICAgICAgdXBkYXRlRGF0YUhhbmRsZS5jYWxsKHRoaXMsIGUpO1xuICAgIH1cblxuICAgIGdldFNob3J0SUQob3BlbkNhcmV0KTtcbiAgICBnZXRTaG9ydElEKGNsb3NlQ2FyZXQpO1xuICAgIGdldFNob3J0SUQob3BlbkNvbXBvc2l0aW9uKTtcbiAgICBnZXRTaG9ydElEKGNsb3NlQ29tcG9zaXRpb24pO1xuICAgIGdldFNob3J0SUQodXBkYXRlRGF0YUhhbmRsZSk7XG4gICAgZ2V0U2hvcnRJRCh1cGRhdGVNb2RlbEhhY2spO1xuICAgIGdldFNob3J0SUQodXBkYXRlTW9kZWxEZWxheSk7XG4gICAgZ2V0U2hvcnRJRCh1cGRhdGVNb2RlbEtleURvd24pO1xuXG4gICAgLy9JRTYtOOimgeWkhOeQhuWFieagh+aXtumcgOimgeW8guatpVxuICAgIHZhciBtYXlCZUFzeW5jID0gZnVuY3Rpb24gbWF5QmVBc3luYyhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgZnVuY3Rpb24gc2V0Q2FyZXQodGFyZ2V0LCBjdXJzb3JQb3NpdGlvbikge1xuICAgICAgICB2YXIgcmFuZ2UkJDE7XG4gICAgICAgIGlmICh0YXJnZXQuY3JlYXRlVGV4dFJhbmdlKSB7XG4gICAgICAgICAgICBtYXlCZUFzeW5jKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICByYW5nZSQkMSA9IHRhcmdldC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZSQkMS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICByYW5nZSQkMS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCBjdXJzb3JQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgcmFuZ2UkJDEubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCBjdXJzb3JQb3NpdGlvbik7XG4gICAgICAgICAgICAgICAgcmFuZ2UkJDEuc2VsZWN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldC5mb2N1cygpO1xuICAgICAgICAgICAgaWYgKHRhcmdldC5zZWxlY3Rpb25TdGFydCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnNldFNlbGVjdGlvblJhbmdlKGN1cnNvclBvc2l0aW9uLCBjdXJzb3JQb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQqL1xuICAgIGZ1bmN0aW9uIGdldENhcmV0KHRhcmdldCkge1xuICAgICAgICB2YXIgc3RhcnQgPSAwO1xuICAgICAgICB2YXIgbm9ybWFsaXplZFZhbHVlO1xuICAgICAgICB2YXIgcmFuZ2UkJDE7XG4gICAgICAgIHZhciB0ZXh0SW5wdXRSYW5nZTtcbiAgICAgICAgdmFyIGxlbjtcbiAgICAgICAgdmFyIGVuZFJhbmdlO1xuXG4gICAgICAgIGlmICh0YXJnZXQuc2VsZWN0aW9uU3RhcnQgKyB0YXJnZXQuc2VsZWN0aW9uRW5kID4gLTEpIHtcbiAgICAgICAgICAgIHN0YXJ0ID0gdGFyZ2V0LnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmFuZ2UkJDEgPSBkb2N1bWVudCQxLnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuXG4gICAgICAgICAgICBpZiAocmFuZ2UkJDEgJiYgcmFuZ2UkJDEucGFyZW50RWxlbWVudCgpID09PSB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICBsZW4gPSB0YXJnZXQudmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG5vcm1hbGl6ZWRWYWx1ZSA9IHRhcmdldC52YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuXG4gICAgICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UgPSB0YXJnZXQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UubW92ZVRvQm9va21hcmsocmFuZ2UkJDEuZ2V0Qm9va21hcmsoKSk7XG5cbiAgICAgICAgICAgICAgICBlbmRSYW5nZSA9IHRhcmdldC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgICAgICBlbmRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0UmFuZ2UuY29tcGFyZUVuZFBvaW50cygnU3RhcnRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gbGVuO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gLXRleHRJbnB1dFJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLWxlbik7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ICs9IG5vcm1hbGl6ZWRWYWx1ZS5zbGljZSgwLCBzdGFydCkuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHN0YXJ0O1xuICAgIH1cblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ2R1cGxleCcsIHtcbiAgICAgICAgcHJpb3JpdHk6IDk5OTk5OTksXG4gICAgICAgIGJlZm9yZUluaXQ6IGR1cGxleEJlZm9yZUluaXQsXG4gICAgICAgIGluaXQ6IGR1cGxleEluaXQsXG4gICAgICAgIGRpZmY6IGR1cGxleERpZmYsXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuZG9tKSB7XG4gICAgICAgICAgICAgICAgZHVwbGV4QmluZC5jYWxsKHRoaXMsIHZkb20sIHVwZGF0ZURhdGFFdmVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy/lpoLmnpzkuI3mlK/mjIFpbnB1dC52YWx1ZeeahE9iamVjdC5kZWZpbmVQcm9wZXJ0eeeahOWxnuaAp+aUr+aMgSxcbiAgICAgICAgICAgIC8v6ZyA6KaB6YCa6L+H6L2u6K+i5ZCM5q2lLCBjaHJvbWUgNDLlj4rku6XkuIvniYjmnKzpnIDopoHov5nkuKpoYWNrXG4gICAgICAgICAgICBwb2xsVmFsdWUuY2FsbCh0aGlzLCBhdmFsb24ubXNpZSwgdmFsdWVIaWphY2spO1xuICAgICAgICAgICAgLy/mm7TmlrDop4blm75cblxuICAgICAgICAgICAgdXBkYXRlVmlld1t0aGlzLmR0eXBlXS5jYWxsKHRoaXMpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwb2xsVmFsdWUoaXNJRSwgdmFsdWVIaWphY2skJDEpIHtcbiAgICAgICAgdmFyIGRvbSA9IHRoaXMuZG9tO1xuICAgICAgICBpZiAodGhpcy5pc1N0cmluZyAmJiB2YWx1ZUhpamFjayQkMSAmJiAhaXNJRSAmJiAhZG9tLnZhbHVlSGlqYWNrKSB7XG4gICAgICAgICAgICBkb20udmFsdWVIaWphY2sgPSB1cGRhdGVEYXRhSGFuZGxlO1xuICAgICAgICAgICAgdmFyIGludGVydmFsSUQgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFhdmFsb24uY29udGFpbnMoYXZhbG9uLnJvb3QsIGRvbSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChpbnRlcnZhbElEKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkb20udmFsdWVIaWphY2soeyB0eXBlOiAncG9sbCcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSwgMzApO1xuICAgICAgICAgICAgcmV0dXJuIGludGVydmFsSUQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYXZhbG9uLl9fcG9sbFZhbHVlID0gcG9sbFZhbHVlOyAvL2V4cG9ydCB0byB0ZXN0XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGF2YWxvbi5tc2llIDwgOCkge1xuICAgICAgICB2YXIgb2xkVXBkYXRlID0gdXBkYXRlVmlldy51cGRhdGVDaGVja2VkO1xuICAgICAgICB1cGRhdGVWaWV3LnVwZGF0ZUNoZWNrZWQgPSBmdW5jdGlvbiAodmRvbSwgY2hlY2tlZCkge1xuICAgICAgICAgICAgdmFyIGRvbSA9IHZkb20uZG9tO1xuICAgICAgICAgICAgaWYgKGRvbSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBvbGRVcGRhdGUodmRvbSwgY2hlY2tlZCk7XG4gICAgICAgICAgICAgICAgICAgIGRvbS5maXJzdENoZWNrZWRJdCA9IDE7XG4gICAgICAgICAgICAgICAgfSwgZG9tLmZpcnN0Q2hlY2tlZEl0ID8gMzEgOiAxNik7XG4gICAgICAgICAgICAgICAgLy9JRTYsNyBjaGVja2JveCwgcmFkaW/mmK/kvb/nlKhkZWZhdWx0Q2hlY2tlZOaOp+WItumAieS4reeKtuaAge+8jFxuICAgICAgICAgICAgICAgIC8v5bm25LiU6KaB5YWI6K6+572uZGVmYXVsdENoZWNrZWTlkI7orr7nva5jaGVja2VkXG4gICAgICAgICAgICAgICAgLy/lubbkuJTlv4Xpobvorr7nva7lu7bov58o5Zug5Li65b+F6aG75o+S5YWlRE9N5qCR5omN55Sf5pWIKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGF2YWxvbi5kaXJlY3RpdmUoJ3J1bGVzJywge1xuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKHJ1bGVzKSB7XG4gICAgICAgICAgICBpZiAoaXNPYmplY3QocnVsZXMpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZkb20gPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICAgICAgdmRvbS5ydWxlcyA9IHBsYXRmb3JtLnRvSnNvbihydWxlcyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBmdW5jdGlvbiBpc1JlZ0V4cCh2YWx1ZSkge1xuICAgICAgICByZXR1cm4gYXZhbG9uLnR5cGUodmFsdWUpID09PSAncmVnZXhwJztcbiAgICB9XG4gICAgdmFyIHJtYWlsID0gL15cXHcrKFstKy5dXFx3KykqQFxcdysoWy0uXVxcdyspKlxcLlxcdysoWy0uXVxcdyspKiQvaTtcbiAgICB2YXIgcnVybCA9IC9eKGZ0cHxodHRwfGh0dHBzKTpcXC9cXC8oXFx3Kzp7MCwxfVxcdypAKT8oXFxTKykoOlswLTldKyk/KFxcL3xcXC8oW1xcdyMhOi4/Kz0mJUAhXFwtXFwvXSkpPyQvO1xuICAgIGZ1bmN0aW9uIGlzQ29ycmVjdERhdGUodmFsdWUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiB2YWx1ZSkge1xuICAgICAgICAgICAgLy/mmK/lrZfnrKbkuLLkvYbkuI3og73mmK/nqbrlrZfnrKZcbiAgICAgICAgICAgIHZhciBhcnIgPSB2YWx1ZS5zcGxpdChcIi1cIik7IC8v5Y+v5Lul6KKrLeWIh+aIkDPku73vvIzlubbkuJTnrKwx5Liq5pivNOS4quWtl+esplxuICAgICAgICAgICAgaWYgKGFyci5sZW5ndGggPT09IDMgJiYgYXJyWzBdLmxlbmd0aCA9PT0gNCkge1xuICAgICAgICAgICAgICAgIHZhciB5ZWFyID0gfn5hcnJbMF07IC8v5YWo6YOo6L2s5o2i5Li66Z2e6LSf5pW05pWwXG4gICAgICAgICAgICAgICAgdmFyIG1vbnRoID0gfn5hcnJbMV0gLSAxO1xuICAgICAgICAgICAgICAgIHZhciBkYXRlID0gfn5hcnJbMl07XG4gICAgICAgICAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQuZ2V0RnVsbFllYXIoKSA9PT0geWVhciAmJiBkLmdldE1vbnRoKCkgPT09IG1vbnRoICYmIGQuZ2V0RGF0ZSgpID09PSBkYXRlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgLy9odHRwczovL2dpdGh1Yi5jb20vYWRmb3JtL3ZhbGlkYXRvci5qcy9ibG9iL21hc3Rlci92YWxpZGF0b3IuanNcbiAgICBhdmFsb24uc2hhZG93Q29weShhdmFsb24udmFsaWRhdG9ycywge1xuICAgICAgICBwYXR0ZXJuOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAn5b+F6aG75Yy56YWNe3twYXR0ZXJufX3ov5nmoLfnmoTmoLzlvI8nLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW0gPSBmaWVsZC5kb207XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBmaWVsZC5kYXRhO1xuICAgICAgICAgICAgICAgIGlmICghaXNSZWdFeHAoZGF0YS5wYXR0ZXJuKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaDVwYXR0ZXJuID0gZWxlbS5nZXRBdHRyaWJ1dGUoXCJwYXR0ZXJuXCIpO1xuICAgICAgICAgICAgICAgICAgICBkYXRhLnBhdHRlcm4gPSBuZXcgUmVnRXhwKCdeKD86JyArIGg1cGF0dGVybiArICcpJCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBuZXh0KGRhdGEucGF0dGVybi50ZXN0KHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkaWdpdHM6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICflv4XpobvmlbTmlbAnLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgLy/mlbTmlbBcbiAgICAgICAgICAgICAgICBuZXh0KC9eXFwtP1xcZCskLy50ZXN0KHZhbHVlKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBudW1iZXI6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICflv4XpobvmlbDlrZcnLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgLy/mlbDlgLxcbiAgICAgICAgICAgICAgICBuZXh0KCEhdmFsdWUgJiYgaXNGaW5pdGUodmFsdWUpKTsgLy8gaXNGaW5pdGUoJycpIC0tPiB0cnVlXG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBub3JlcXVpcmVkOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAnJyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIG5leHQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZXF1aXJlZDoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+W/hemhu+Whq+WGmScsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICBuZXh0KHZhbHVlICE9PSAnJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlcXVhbHRvOiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAn5a+G56CB6L6T5YWl5LiN5LiA6Ie0JyxcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gZ2V0KHZhbHVlLCBmaWVsZCwgbmV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBpZCA9IFN0cmluZyhmaWVsZC5kYXRhLmVxdWFsdG8pO1xuICAgICAgICAgICAgICAgIHZhciBvdGhlciA9IGF2YWxvbihkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCkpLnZhbCgpIHx8IFwiXCI7XG4gICAgICAgICAgICAgICAgbmV4dCh2YWx1ZSA9PT0gb3RoZXIpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZGF0ZToge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+aXpeacn+agvOW8j+S4jeato+ehricsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IGZpZWxkLmRhdGE7XG4gICAgICAgICAgICAgICAgaWYgKGlzUmVnRXhwKGRhdGEuZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dChkYXRhLmRhdGUudGVzdCh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5leHQoaXNDb3JyZWN0RGF0ZSh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVybDoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ1VSTOagvOW8j+S4jeato+ehricsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICBuZXh0KHJ1cmwudGVzdCh2YWx1ZSkpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW1haWw6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICdlbWFpbOagvOW8j+S4jeato+ehricsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICBuZXh0KHJtYWlsLnRlc3QodmFsdWUpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1pbmxlbmd0aDoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+acgOWwkei+k+WFpXt7bWlubGVuZ3RofX3kuKrlrZcnLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGZpZWxkLmRhdGEubWlubGVuZ3RoLCAxMCk7XG4gICAgICAgICAgICAgICAgbmV4dCh2YWx1ZS5sZW5ndGggPj0gbnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1heGxlbmd0aDoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+acgOWkmui+k+WFpXt7bWF4bGVuZ3RofX3kuKrlrZcnLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGZpZWxkLmRhdGEubWF4bGVuZ3RoLCAxMCk7XG4gICAgICAgICAgICAgICAgbmV4dCh2YWx1ZS5sZW5ndGggPD0gbnVtKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1pbjoge1xuICAgICAgICAgICAgbWVzc2FnZTogJ+i+k+WFpeWAvOS4jeiDveWwj+S6jnt7bWlufX0nLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGZpZWxkLmRhdGEubWluLCAxMCk7XG4gICAgICAgICAgICAgICAgbmV4dChwYXJzZUZsb2F0KHZhbHVlKSA+PSBudW0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbWF4OiB7XG4gICAgICAgICAgICBtZXNzYWdlOiAn6L6T5YWl5YC85LiN6IO95aSn5LqOe3ttYXh9fScsXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCh2YWx1ZSwgZmllbGQsIG5leHQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQoZmllbGQuZGF0YS5tYXgsIDEwKTtcbiAgICAgICAgICAgICAgICBuZXh0KHBhcnNlRmxvYXQodmFsdWUpIDw9IG51bSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjaHM6IHtcbiAgICAgICAgICAgIG1lc3NhZ2U6ICflv4XpobvmmK/kuK3mloflrZfnrKYnLFxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIGZpZWxkLCBuZXh0KSB7XG4gICAgICAgICAgICAgICAgbmV4dCgvXltcXHU0ZTAwLVxcdTlmYTVdKyQvLnRlc3QodmFsdWUpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciB2YWxpRGlyID0gYXZhbG9uLmRpcmVjdGl2ZSgndmFsaWRhdGUnLCB7XG4gICAgICAgIGRpZmY6IGZ1bmN0aW9uIGRpZmYodmFsaWRhdG9yKSB7XG4gICAgICAgICAgICB2YXIgdmRvbSA9IHRoaXMubm9kZTtcbiAgICAgICAgICAgIGlmICh2ZG9tLnZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc09iamVjdCh2YWxpZGF0b3IpKSB7XG4gICAgICAgICAgICAgICAgLy/ms6jmhI/vvIzov5nkuKpGb3Jt5qCH562+55qE6Jma5oufRE9N5pyJ5Lik5Liq6aqM6K+B5a+56LGhXG4gICAgICAgICAgICAgICAgLy/kuIDkuKrmmK92bVZhbGlkYXRvcu+8jOWug+aYr+eUqOaIt1ZN5LiK55qE6YKj5Liq5Y6f5aeL5a2Q5a+56LGh77yM5Lmf5piv5LiA5LiqVk1cbiAgICAgICAgICAgICAgICAvL+S4gOS4quaYr3ZhbGlkYXRvcu+8jOWug+aYr3ZtVmFsaWRhdG9yLiRtb2RlbO+8jCDov5nmmK/kuLrkuobpmLLmraJJRTbvvI045re75Yqg5a2Q5bGe5oCn5pe25re75Yqg55qEaGFja1xuICAgICAgICAgICAgICAgIC8v5Lmf5Y+v5Lul56ew5LmL5Li6c2FmZVZhbGlkYXRlXG4gICAgICAgICAgICAgICAgdmRvbS52bVZhbGlkYXRvciA9IHZhbGlkYXRvcjtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IgPSBwbGF0Zm9ybS50b0pzb24odmFsaWRhdG9yKTtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IudmRvbSA9IHZkb207XG4gICAgICAgICAgICAgICAgdmRvbS52YWxpZGF0b3IgPSB2YWxpZGF0b3I7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB2YWxpRGlyLmRlZmF1bHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghdmFsaWRhdG9yLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3JbbmFtZV0gPSB2YWxpRGlyLmRlZmF1bHRzW25hbWVdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhbGlkYXRvci5maWVsZHMgPSB2YWxpZGF0b3IuZmllbGRzIHx8IFtdO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSh2ZG9tKSB7XG5cbiAgICAgICAgICAgIHZhciB2YWxpZGF0b3IgPSB2ZG9tLnZhbGlkYXRvcjtcbiAgICAgICAgICAgIHZhciBkb20gPSB2YWxpZGF0b3IuZG9tID0gdmRvbS5kb207XG4gICAgICAgICAgICBkb20uX21zX3ZhbGlkYXRlXyA9IHZhbGlkYXRvcjtcbiAgICAgICAgICAgIHZhciBmaWVsZHMgPSB2YWxpZGF0b3IuZmllbGRzO1xuICAgICAgICAgICAgY29sbGVjdEZlaWxkKHZkb20uY2hpbGRyZW4sIGZpZWxkcywgdmFsaWRhdG9yKTtcbiAgICAgICAgICAgIGF2YWxvbi5iaW5kKGRvY3VtZW50LCAnZm9jdXNpbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvbSA9IGUudGFyZ2V0O1xuICAgICAgICAgICAgICAgIHZhciBkdXBsZXggPSBkb20uX21zX2R1cGxleF87XG4gICAgICAgICAgICAgICAgdmFyIHZkb20gPSAoZHVwbGV4IHx8IHt9KS52ZG9tO1xuICAgICAgICAgICAgICAgIGlmIChkdXBsZXggJiYgdmRvbS5ydWxlcyAmJiAhZHVwbGV4LnZhbGlkYXRvcikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXZhbG9uLkFycmF5LmVuc3VyZShmaWVsZHMsIGR1cGxleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRWYWxpZGF0ZUV2ZW50KGR1cGxleCwgdmFsaWRhdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL+S4uuS6huaWueS+v+eUqOaIt+aJi+WKqOaJp+ihjOmqjOivge+8jOaIkeS7rOmcgOimgeS4uuWOn+Wni3ZtVmFsaWRhdGXkuIrmt7vliqDkuIDkuKpvbk1hbnVhbOaWueazlVxuICAgICAgICAgICAgdmFyIHYgPSB2ZG9tLnZtVmFsaWRhdG9yO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2Lm9uTWFudWFsID0gb25NYW51YWw7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgZGVsZXRlIHZkb20udm1WYWxpZGF0b3I7XG5cbiAgICAgICAgICAgIGRvbS5zZXRBdHRyaWJ1dGUoJ25vdmFsaWRhdGUnLCAnbm92YWxpZGF0ZScpO1xuXG4gICAgICAgICAgICBmdW5jdGlvbiBvbk1hbnVhbCgpIHtcbiAgICAgICAgICAgICAgICB2YWxpRGlyLnZhbGlkYXRlQWxsLmNhbGwodmFsaWRhdG9yLCB2YWxpZGF0b3Iub25WYWxpZGF0ZUFsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICh2YWxpZGF0b3IudmFsaWRhdGVBbGxJblN1Ym1pdCkge1xuICAgICAgICAgICAgICAgIGF2YWxvbi5iaW5kKGRvbSwgJ3N1Ym1pdCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgb25NYW51YWwoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdmFsaWRhdGVBbGw6IGZ1bmN0aW9uIHZhbGlkYXRlQWxsKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB2YXIgdmFsaWRhdG9yID0gdGhpcztcbiAgICAgICAgICAgIHZhciB2ZG9tID0gdGhpcy52ZG9tO1xuICAgICAgICAgICAgdmFyIGZpZWxkcyA9IHZhbGlkYXRvci5maWVsZHMgPSBbXTtcbiAgICAgICAgICAgIGNvbGxlY3RGZWlsZCh2ZG9tLmNoaWxkcmVuLCBmaWVsZHMsIHZhbGlkYXRvcik7XG4gICAgICAgICAgICB2YXIgZm4gPSB0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicgPyBjYWxsYmFjayA6IHZhbGlkYXRvci5vblZhbGlkYXRlQWxsO1xuICAgICAgICAgICAgdmFyIHByb21pc2VzID0gdmFsaWRhdG9yLmZpZWxkcy5maWx0ZXIoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsID0gZmllbGQuZG9tO1xuICAgICAgICAgICAgICAgIHJldHVybiBlbCAmJiAhZWwuZGlzYWJsZWQgJiYgdmFsaWRhdG9yLmRvbS5jb250YWlucyhlbCk7XG4gICAgICAgICAgICB9KS5tYXAoZnVuY3Rpb24gKGZpZWxkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbGlEaXIudmFsaWRhdGUoZmllbGQsIHRydWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgdW5pcSA9IHt9O1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICAgICAgICAgIHZhciByZWFzb25zID0gYXJyYXkuY29uY2F0LmFwcGx5KFtdLCBhcnJheSk7XG4gICAgICAgICAgICAgICAgaWYgKHZhbGlkYXRvci5kZWR1cGxpY2F0ZUluVmFsaWRhdGVBbGwpIHtcblxuICAgICAgICAgICAgICAgICAgICByZWFzb25zID0gcmVhc29ucy5maWx0ZXIoZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVsID0gcmVhc29uLmVsZW1lbnQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdXVpZCA9IGVsLnVuaXF1ZUlEIHx8IChlbC51bmlxdWVJRCA9IHNldFRpbWVvdXQoJzEnKSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1bmlxW3V1aWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5pcVt1dWlkXSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbi5jYWxsKHZhbGlkYXRvci5kb20sIHJlYXNvbnMpOyAvL+i/memHjOWPquaUvue9ruacqumAmui/h+mqjOivgeeahOe7hOS7tlxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGU6IGZ1bmN0aW9uIHZhbGlkYXRlKGZpZWxkLCBpc1ZhbGlkYXRlQWxsLCBldmVudCkge1xuICAgICAgICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICAgICAgICB2YXIgdmFsdWUgPSBmaWVsZC52YWx1ZTtcbiAgICAgICAgICAgIHZhciBlbGVtID0gZmllbGQuZG9tO1xuXG4gICAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICAgIGlmICh0eXBlb2YgUHJvbWlzZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIC8vYXZhbG9uLXByb21pc2XkuI3mlK/mjIFwaGFudG9tanNcbiAgICAgICAgICAgICAgICBhdmFsb24ud2Fybign5rWP6KeI5Zmo5LiN5pSv5oyB5Y6f55SfUHJvbWlzZSzor7fkuIvovb3lubY8c2NyaXB0IHNyYz11cmw+5byV5YWlXFxuaHR0cHM6Ly9naXRodWIuY29tL1J1YnlMb3V2cmUvYXZhbG9uL2Jsb2IvbWFzdGVyL3Rlc3QvcHJvbWlzZS5qcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBpZiAoZWxlbS5kaXNhYmxlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHJ1bGVzID0gZmllbGQudmRvbS5ydWxlcztcbiAgICAgICAgICAgIHZhciBuZ3MgPSBbXSxcbiAgICAgICAgICAgICAgICBpc09rID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghKHJ1bGVzLm5vcmVxdWlyZWQgJiYgdmFsdWUgPT09ICcnKSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHJ1bGVOYW1lIGluIHJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBydWxlVmFsdWUgPSBydWxlc1tydWxlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChydWxlVmFsdWUgPT09IGZhbHNlKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGhvb2sgPSBhdmFsb24udmFsaWRhdG9yc1tydWxlTmFtZV07XG4gICAgICAgICAgICAgICAgICAgIHZhciByZXNvbHZlO1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlID0gYTtcbiAgICAgICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGZ1bmN0aW9uIG5leHQoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlYXNvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IGZpZWxkLmRhdGEsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtJyArIHJ1bGVOYW1lICsgJy1tZXNzYWdlJykgfHwgZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWVzc2FnZScpIHx8IGhvb2subWVzc2FnZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWxpZGF0ZVJ1bGU6IHJ1bGVOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdldE1lc3NhZ2U6IGdldE1lc3NhZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlzT2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZ3MucHVzaChyZWFzb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBmaWVsZC5kYXRhID0ge307XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkLmRhdGFbcnVsZU5hbWVdID0gcnVsZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBob29rLmdldCh2YWx1ZSwgZmllbGQsIG5leHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy/lpoLmnpxwcm9taXNlc+S4jeS4uuepuu+8jOivtOaYjue7j+i/h+mqjOivgeaLpuaIquWZqFxuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uIChhcnJheSkge1xuICAgICAgICAgICAgICAgIGlmICghaXNWYWxpZGF0ZUFsbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsaWRhdG9yID0gZmllbGQudmFsaWRhdG9yO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNPaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yLm9uU3VjY2Vzcy5jYWxsKGVsZW0sIFt7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogZmllbGQuZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50OiBlbGVtXG4gICAgICAgICAgICAgICAgICAgICAgICB9XSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsaWRhdG9yLm9uRXJyb3IuY2FsbChlbGVtLCBuZ3MsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YWxpZGF0b3Iub25Db21wbGV0ZS5jYWxsKGVsZW0sIG5ncywgZXZlbnQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbmdzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGNvbGxlY3RGZWlsZChub2RlcywgZmllbGRzLCB2YWxpZGF0b3IpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHZkb207IHZkb20gPSBub2Rlc1tpKytdOykge1xuICAgICAgICAgICAgdmFyIGR1cGxleCA9IHZkb20ucnVsZXMgJiYgdmRvbS5kdXBsZXg7XG4gICAgICAgICAgICBpZiAoZHVwbGV4KSB7XG4gICAgICAgICAgICAgICAgZmllbGRzLnB1c2goZHVwbGV4KTtcbiAgICAgICAgICAgICAgICBiaW5kVmFsaWRhdGVFdmVudChkdXBsZXgsIHZhbGlkYXRvcik7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHZkb20uY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBjb2xsZWN0RmVpbGQodmRvbS5jaGlsZHJlbiwgZmllbGRzLCB2YWxpZGF0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHZkb20pKSB7XG4gICAgICAgICAgICAgICAgY29sbGVjdEZlaWxkKHZkb20sIGZpZWxkcywgdmFsaWRhdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJpbmRWYWxpZGF0ZUV2ZW50KGZpZWxkLCB2YWxpZGF0b3IpIHtcblxuICAgICAgICB2YXIgbm9kZSA9IGZpZWxkLmRvbTtcbiAgICAgICAgaWYgKGZpZWxkLnZhbGlkYXRvcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZpZWxkLnZhbGlkYXRvciA9IHZhbGlkYXRvcjtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICh2YWxpZGF0b3IudmFsaWRhdGVJbktleXVwICYmICFmaWVsZC5pc0NoYW5nZWQgJiYgIWZpZWxkLmRlYm91bmNlVGltZSkge1xuICAgICAgICAgICAgYXZhbG9uLmJpbmQobm9kZSwgJ2tleXVwJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IudmFsaWRhdGUoZmllbGQsIDAsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICh2YWxpZGF0b3IudmFsaWRhdGVJbkJsdXIpIHtcbiAgICAgICAgICAgIGF2YWxvbi5iaW5kKG5vZGUsICdibHVyJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3IudmFsaWRhdGUoZmllbGQsIDAsIGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgIGlmICh2YWxpZGF0b3IucmVzZXRJbkZvY3VzKSB7XG4gICAgICAgICAgICBhdmFsb24uYmluZChub2RlLCAnZm9jdXMnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRvci5vblJlc2V0LmNhbGwobm9kZSwgZSwgZmllbGQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIHJmb3JtYXQgPSAvXFxcXD97eyhbXnt9XSspXFx9fS9nbTtcblxuICAgIGZ1bmN0aW9uIGdldE1lc3NhZ2UoKSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhIHx8IHt9O1xuICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlLnJlcGxhY2UocmZvcm1hdCwgZnVuY3Rpb24gKF8sIG5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW25hbWVdID09IG51bGwgPyAnJyA6IGRhdGFbbmFtZV07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICB2YWxpRGlyLmRlZmF1bHRzID0ge1xuICAgICAgICB2YWxpZGF0ZTogdmFsaURpci52YWxpZGF0ZSxcbiAgICAgICAgb25FcnJvcjogYXZhbG9uLm5vb3AsXG4gICAgICAgIG9uU3VjY2VzczogYXZhbG9uLm5vb3AsXG4gICAgICAgIG9uQ29tcGxldGU6IGF2YWxvbi5ub29wLFxuICAgICAgICBvbk1hbnVhbDogYXZhbG9uLm5vb3AsXG4gICAgICAgIG9uUmVzZXQ6IGF2YWxvbi5ub29wLFxuICAgICAgICBvblZhbGlkYXRlQWxsOiBhdmFsb24ubm9vcCxcbiAgICAgICAgdmFsaWRhdGVJbkJsdXI6IHRydWUsIC8vQGNvbmZpZyB7Qm9vbGVhbn0gdHJ1Ze+8jOWcqGJsdXLkuovku7bkuK3ov5vooYzpqozor4Es6Kem5Y+Rb25TdWNjZXNzLCBvbkVycm9yLCBvbkNvbXBsZXRl5Zue6LCDXG4gICAgICAgIHZhbGlkYXRlSW5LZXl1cDogdHJ1ZSwgLy9AY29uZmlnIHtCb29sZWFufSB0cnVl77yM5Zyoa2V5dXDkuovku7bkuK3ov5vooYzpqozor4Es6Kem5Y+Rb25TdWNjZXNzLCBvbkVycm9yLCBvbkNvbXBsZXRl5Zue6LCDXG4gICAgICAgIHZhbGlkYXRlQWxsSW5TdWJtaXQ6IHRydWUsIC8vQGNvbmZpZyB7Qm9vbGVhbn0gdHJ1Ze+8jOWcqHN1Ym1pdOS6i+S7tuS4reaJp+ihjG9uVmFsaWRhdGVBbGzlm57osINcbiAgICAgICAgcmVzZXRJbkZvY3VzOiB0cnVlLCAvL0Bjb25maWcge0Jvb2xlYW59IHRydWXvvIzlnKhmb2N1c+S6i+S7tuS4reaJp+ihjG9uUmVzZXTlm57osIMsXG4gICAgICAgIGRlZHVwbGljYXRlSW5WYWxpZGF0ZUFsbDogZmFsc2UgLy9AY29uZmlnIHtCb29sZWFufSBmYWxzZe+8jOWcqHZhbGlkYXRlQWxs5Zue6LCD5Lit5a+5cmVhc29u5pWw57uE5qC55o2u5YWD57Sg6IqC54K56L+b6KGM5Y676YeNXG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOS4gOS4qmRpcmVjdGl2ZeijhemlsOWZqFxuICAgICAqIEByZXR1cm5zIHtkaXJlY3RpdmV9XG4gICAgICovXG4gICAgLy8gRGlyZWN0aXZlRGVjb3JhdG9yKHNjb3BlLCBiaW5kaW5nLCB2ZG9tLCB0aGlzKVxuICAgIC8vIERlY29yYXRvcih2bSwgb3B0aW9ucywgY2FsbGJhY2spXG4gICAgZnVuY3Rpb24gRGlyZWN0aXZlKHZtLCBiaW5kaW5nLCB2ZG9tLCByZW5kZXIpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBiaW5kaW5nLnR5cGU7XG4gICAgICAgIHZhciBkZWNvcmF0b3IgPSBhdmFsb24uZGlyZWN0aXZlc1t0eXBlXTtcbiAgICAgICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICAgICAgdmFyIGRvbSA9IGF2YWxvbi52ZG9tKHZkb20sICd0b0RPTScpO1xuICAgICAgICAgICAgaWYgKGRvbS5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRvbS5yZW1vdmVBdHRyaWJ1dGUoYmluZGluZy5hdHRyTmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2ZG9tLmRvbSA9IGRvbTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY2FsbGJhY2sgPSBkZWNvcmF0b3IudXBkYXRlID8gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoIXJlbmRlci5tb3VudCAmJiAvY3NzfHZpc2libGV8ZHVwbGV4Ly50ZXN0KHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgcmVuZGVyLmNhbGxiYWNrcy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVjb3JhdG9yLnVwZGF0ZS5jYWxsKGRpcmVjdGl2ZSQkMSwgZGlyZWN0aXZlJCQxLm5vZGUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVjb3JhdG9yLnVwZGF0ZS5jYWxsKGRpcmVjdGl2ZSQkMSwgZGlyZWN0aXZlJCQxLm5vZGUsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSA6IGF2YWxvbi5ub29wO1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGVjb3JhdG9yKSB7XG4gICAgICAgICAgICBiaW5kaW5nW2tleV0gPSBkZWNvcmF0b3Jba2V5XTtcbiAgICAgICAgfVxuICAgICAgICBiaW5kaW5nLm5vZGUgPSB2ZG9tO1xuICAgICAgICB2YXIgZGlyZWN0aXZlJCQxID0gbmV3IEFjdGlvbih2bSwgYmluZGluZywgY2FsbGJhY2spO1xuICAgICAgICBpZiAoZGlyZWN0aXZlJCQxLmluaXQpIHtcbiAgICAgICAgICAgIC8v6L+Z6YeM5Y+v6IO95Lya6YeN5YaZbm9kZSwgY2FsbGJhY2ssIHR5cGUsIG5hbWVcbiAgICAgICAgICAgIGRpcmVjdGl2ZSQkMS5pbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgZGlyZWN0aXZlJCQxLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gZGlyZWN0aXZlJCQxO1xuICAgIH1cblxuICAgIHZhciBldmVudE1hcCA9IGF2YWxvbi5vbmVPYmplY3QoJ2FuaW1hdGlvbmVuZCxibHVyLGNoYW5nZSxpbnB1dCwnICsgJ2NsaWNrLGRibGNsaWNrLGZvY3VzLGtleWRvd24sa2V5cHJlc3Msa2V5dXAsbW91c2Vkb3duLG1vdXNlZW50ZXIsJyArICdtb3VzZWxlYXZlLG1vdXNlbW92ZSxtb3VzZW91dCxtb3VzZW92ZXIsbW91c2V1cCxzY2FuLHNjcm9sbCxzdWJtaXQnLCAnb24nKTtcbiAgICBmdW5jdGlvbiBwYXJzZUF0dHJpYnV0ZXMoZGlycywgdHVwbGUpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0dXBsZVswXSxcbiAgICAgICAgICAgIHVuaXEgPSB7fSxcbiAgICAgICAgICAgIGJpbmRpbmdzID0gW107XG4gICAgICAgIHZhciBoYXNJZiA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIGRpcnMpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRpcnNbbmFtZV07XG4gICAgICAgICAgICB2YXIgYXJyID0gbmFtZS5zcGxpdCgnLScpO1xuICAgICAgICAgICAgLy8gbXMtY2xpY2tcbiAgICAgICAgICAgIGlmIChuYW1lIGluIG5vZGUucHJvcHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXR0ck5hbWUgPSBuYW1lO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhdHRyTmFtZSA9ICc6JyArIG5hbWUuc2xpY2UoMyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXZlbnRNYXBbYXJyWzFdXSkge1xuICAgICAgICAgICAgICAgIGFyci5zcGxpY2UoMSwgMCwgJ29uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL21zLW9uLWNsaWNrXG4gICAgICAgICAgICBpZiAoYXJyWzFdID09PSAnb24nKSB7XG4gICAgICAgICAgICAgICAgYXJyWzNdID0gcGFyc2VGbG9hdChhcnJbM10pIHx8IDA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0eXBlID0gYXJyWzFdO1xuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjb250cm9sbGVyJyB8fCB0eXBlID09PSAnaW1wb3J0YW50JykgY29udGludWU7XG4gICAgICAgICAgICBpZiAoZGlyZWN0aXZlc1t0eXBlXSkge1xuXG4gICAgICAgICAgICAgICAgdmFyIGJpbmRpbmcgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtOiBhcnJbMl0sXG4gICAgICAgICAgICAgICAgICAgIGF0dHJOYW1lOiBhdHRyTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogYXJyLmpvaW4oJy0nKSxcbiAgICAgICAgICAgICAgICAgICAgZXhwcjogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBkaXJlY3RpdmVzW3R5cGVdLnByaW9yaXR5IHx8IHR5cGUuY2hhckNvZGVBdCgwKSAqIDEwMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdpZicpIHtcbiAgICAgICAgICAgICAgICAgICAgaGFzSWYgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZSA9PT0gJ29uJykge1xuICAgICAgICAgICAgICAgICAgICBiaW5kaW5nLnByaW9yaXR5ICs9IGFyclszXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKCF1bmlxW2JpbmRpbmcubmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdW5pcVtiaW5kaW5nLm5hbWVdID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzLnB1c2goYmluZGluZyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlID09PSAnZm9yJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFthdmFsb24ubWl4KGJpbmRpbmcsIHR1cGxlWzNdKV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYmluZGluZ3Muc29ydChieVByaW9yaXR5KTtcblxuICAgICAgICBpZiAoaGFzSWYpIHtcbiAgICAgICAgICAgIHZhciByZXQgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBiaW5kaW5nc1tpKytdOykge1xuICAgICAgICAgICAgICAgIHJldC5wdXNoKGVsKTtcbiAgICAgICAgICAgICAgICBpZiAoZWwudHlwZSA9PT0gJ2lmJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYmluZGluZ3M7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGJ5UHJpb3JpdHkoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgfVxuXG4gICAgdmFyIHJpbXByb3ZlUHJpb3JpdHkgPSAvWystXFw/XS87XG4gICAgdmFyIHJpbm5lclZhbHVlID0gL19fdmFsdWVfX1xcKSQvO1xuICAgIGZ1bmN0aW9uIHBhcnNlSW50ZXJwb2xhdGUoZGlyKSB7XG4gICAgICAgIHZhciBybGluZVNwID0gL1xcblxccj8vZztcbiAgICAgICAgdmFyIHN0ciA9IGRpci5ub2RlVmFsdWUudHJpbSgpLnJlcGxhY2UocmxpbmVTcCwgJycpO1xuICAgICAgICB2YXIgdG9rZW5zID0gW107XG4gICAgICAgIGRvIHtcbiAgICAgICAgICAgIC8vYWFhe3tAYmJifX1jY2NcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHN0ci5pbmRleE9mKGNvbmZpZy5vcGVuVGFnKTtcbiAgICAgICAgICAgIGluZGV4ID0gaW5kZXggPT09IC0xID8gc3RyLmxlbmd0aCA6IGluZGV4O1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gc3RyLnNsaWNlKDAsIGluZGV4KTtcbiAgICAgICAgICAgIGlmICgvXFxTLy50ZXN0KHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRva2Vucy5wdXNoKGF2YWxvbi5xdW90ZShhdmFsb24uX2RlY29kZSh2YWx1ZSkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZShpbmRleCArIGNvbmZpZy5vcGVuVGFnLmxlbmd0aCk7XG4gICAgICAgICAgICBpZiAoc3RyKSB7XG4gICAgICAgICAgICAgICAgaW5kZXggPSBzdHIuaW5kZXhPZihjb25maWcuY2xvc2VUYWcpO1xuICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHN0ci5zbGljZSgwLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgdmFyIGV4cHIgPSBhdmFsb24udW5lc2NhcGVIVE1MKHZhbHVlKTtcbiAgICAgICAgICAgICAgICBpZiAoL1xcfFxccypcXHcvLnRlc3QoZXhwcikpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/lpoLmnpzlrZjlnKjov4fmu6TlmajvvIzkvJjljJblubLmjolcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyciA9IGFkZFNjb3BlKGV4cHIsICdleHByJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcnJbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4cHIgPSBhcnJbMV0ucmVwbGFjZShyaW5uZXJWYWx1ZSwgYXJyWzBdICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocmltcHJvdmVQcmlvcml0eSkge1xuICAgICAgICAgICAgICAgICAgICBleHByID0gJygnICsgZXhwciArICcpJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdG9rZW5zLnB1c2goZXhwcik7XG5cbiAgICAgICAgICAgICAgICBzdHIgPSBzdHIuc2xpY2UoaW5kZXggKyBjb25maWcuY2xvc2VUYWcubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSB3aGlsZSAoc3RyLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiBbe1xuICAgICAgICAgICAgZXhwcjogdG9rZW5zLmpvaW4oJysnKSxcbiAgICAgICAgICAgIG5hbWU6ICdleHByJyxcbiAgICAgICAgICAgIHR5cGU6ICdleHByJ1xuICAgICAgICB9XTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDaGlsZHJlbihhcnIpIHtcbiAgICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IGFycltpKytdOykge1xuICAgICAgICAgICAgaWYgKGVsLm5vZGVOYW1lID09PSAnI2RvY3VtZW50LWZyYWdtZW50Jykge1xuICAgICAgICAgICAgICAgIGNvdW50ICs9IGdldENoaWxkcmVuKGVsLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY291bnQgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gY291bnQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGdyb3VwVHJlZShwYXJlbnQsIGNoaWxkcmVuKSB7XG4gICAgICAgIGNoaWxkcmVuICYmIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKHZkb20pIHtcbiAgICAgICAgICAgIGlmICghdmRvbSkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHZsZW5ndGggPSB2ZG9tLmNoaWxkcmVuICYmIGdldENoaWxkcmVuKHZkb20uY2hpbGRyZW4pO1xuICAgICAgICAgICAgaWYgKHZkb20ubm9kZU5hbWUgPT09ICcjZG9jdW1lbnQtZnJhZ21lbnQnKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRvbSA9IGNyZWF0ZUZyYWdtZW50KCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRvbSA9IGF2YWxvbi52ZG9tKHZkb20sICd0b0RPTScpO1xuICAgICAgICAgICAgICAgIHZhciBkb21sZW5ndGggPSBkb20uY2hpbGROb2RlcyAmJiBkb20uY2hpbGROb2Rlcy5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWxlbmd0aCAmJiB2bGVuZ3RoICYmIGRvbWxlbmd0aCA+IHZsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhcHBlbmRDaGlsZE1heVRocm93RXJyb3JbZG9tLm5vZGVOYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhbG9uLmNsZWFySFRNTChkb20pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHZsZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBncm91cFRyZWUoZG9tLCB2ZG9tLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICBpZiAodmRvbS5ub2RlTmFtZSA9PT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBnZXRTZWxlY3RlZFZhbHVlKHZkb20sIHZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICAgIGxvb2t1cE9wdGlvbih2ZG9tLCB2YWx1ZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6auY57qn54mI5pys5Y+v5Lul5bCd6K+VIHF1ZXJ5U2VsZWN0b3JBbGxcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBpZiAoIWFwcGVuZENoaWxkTWF5VGhyb3dFcnJvcltwYXJlbnQubm9kZU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hcHBlbmRDaGlsZChkb20pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHt9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGR1bXBUcmVlKGVsZW0pIHtcbiAgICAgICAgdmFyIGZpcnN0Q2hpbGQ7XG4gICAgICAgIHdoaWxlIChmaXJzdENoaWxkID0gZWxlbS5maXJzdENoaWxkKSB7XG4gICAgICAgICAgICBpZiAoZmlyc3RDaGlsZC5ub2RlVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGR1bXBUcmVlKGZpcnN0Q2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbS5yZW1vdmVDaGlsZChmaXJzdENoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldFJhbmdlKGNoaWxkTm9kZXMsIG5vZGUpIHtcbiAgICAgICAgdmFyIGkgPSBjaGlsZE5vZGVzLmluZGV4T2Yobm9kZSkgKyAxO1xuICAgICAgICB2YXIgZGVlcCA9IDEsXG4gICAgICAgICAgICBub2RlcyA9IFtdLFxuICAgICAgICAgICAgZW5kO1xuICAgICAgICBub2Rlcy5zdGFydCA9IGk7XG4gICAgICAgIHdoaWxlIChub2RlID0gY2hpbGROb2Rlc1tpKytdKSB7XG4gICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgaWYgKG5vZGUubm9kZU5hbWUgPT09ICcjY29tbWVudCcpIHtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnRXaXRoKG5vZGUubm9kZVZhbHVlLCAnbXMtZm9yOicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZXArKztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG5vZGUubm9kZVZhbHVlID09PSAnbXMtZm9yLWVuZDonKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZXAtLTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRlZXAgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVuZCA9IG5vZGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG5vZGVzLmVuZCA9IGVuZDtcbiAgICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN0YXJ0V2l0aChsb25nLCBzaG9ydCkge1xuICAgICAgICByZXR1cm4gbG9uZy5pbmRleE9mKHNob3J0KSA9PT0gMDtcbiAgICB9XG5cbiAgICB2YXIgYXBwZW5kQ2hpbGRNYXlUaHJvd0Vycm9yID0ge1xuICAgICAgICAnI3RleHQnOiAxLFxuICAgICAgICAnI2NvbW1lbnQnOiAxLFxuICAgICAgICBzY3JpcHQ6IDEsXG4gICAgICAgIHN0eWxlOiAxLFxuICAgICAgICBub3NjcmlwdDogMVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiDnlJ/miJDkuIDkuKrmuLLmn5Plmags5bm25L2c5Li65a6D56ys5LiA5Liq6YGH5Yiw55qEbXMtY29udHJvbGxlcuWvueW6lOeahFZN55qEJHJlbmRlcuWxnuaAp1xuICAgICAqIEBwYXJhbSB7U3RyaW5nfERPTX0gbm9kZVxuICAgICAqIEBwYXJhbSB7Vmlld01vZGVsfFVuZGVmaW5lZH0gdm1cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufFVuZGVmaW5lZH0gYmVmb3JlUmVhZHlcbiAgICAgKiBAcmV0dXJucyB7UmVuZGVyfVxuICAgICAqL1xuICAgIGF2YWxvbi5zY2FuID0gZnVuY3Rpb24gKG5vZGUsIHZtLCBiZWZvcmVSZWFkeSkge1xuICAgICAgICByZXR1cm4gbmV3IFJlbmRlcihub2RlLCB2bSwgYmVmb3JlUmVhZHkgfHwgYXZhbG9uLm5vb3ApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBhdmFsb24uc2NhbiDnmoTlhoXpg6jlrp7njrBcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBSZW5kZXIobm9kZSwgdm0sIGJlZm9yZVJlYWR5KSB7XG4gICAgICAgIHRoaXMucm9vdCA9IG5vZGU7IC8v5aaC5p6c5Lyg5YWl55qE5a2X56ym5LiyLOehruS/neWPquacieS4gOS4quagh+etvuS9nOS4uuagueiKgueCuVxuICAgICAgICB0aGlzLnZtID0gdm07XG4gICAgICAgIHRoaXMuYmVmb3JlUmVhZHkgPSBiZWZvcmVSZWFkeTtcbiAgICAgICAgdGhpcy5iaW5kaW5ncyA9IFtdOyAvL+aUtumbhuW+heWKoOW3peeahOe7keWumuWxnuaAp1xuICAgICAgICB0aGlzLmNhbGxiYWNrcyA9IFtdO1xuICAgICAgICB0aGlzLmRpcmVjdGl2ZXMgPSBbXTtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgUmVuZGVyLnByb3RvdHlwZSA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOW8gOWni+aJq+aPj+aMh+WumuWMuuWfn1xuICAgICAgICAgKiDmlLbpm4bnu5HlrprlsZ7mgKdcbiAgICAgICAgICog55Sf5oiQ5oyH5Luk5bm25bu656uL5LiOVk3nmoTlhbPogZRcbiAgICAgICAgICovXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgICAgICB2YXIgdm5vZGVzO1xuICAgICAgICAgICAgaWYgKHRoaXMucm9vdCAmJiB0aGlzLnJvb3Qubm9kZVR5cGUgPiAwKSB7XG4gICAgICAgICAgICAgICAgdm5vZGVzID0gZnJvbURPTSh0aGlzLnJvb3QpOyAvL+i9rOaNouiZmuaLn0RPTVxuICAgICAgICAgICAgICAgIC8v5bCG5omr5o+P5Yy65Z+f55qE5q+P5LiA5Liq6IqC54K55LiO5YW254i26IqC54K55YiG56a7LOabtOWwkeaMh+S7pOWvuURPTeaTjeS9nOaXtizlr7npppblsY/ovpPlh7rpgKDmiJDnmoTpopHnuYHph43nu5hcbiAgICAgICAgICAgICAgICBkdW1wVHJlZSh0aGlzLnJvb3QpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5yb290ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHZub2RlcyA9IGZyb21TdHJpbmcodGhpcy5yb290KTsgLy/ovazmjaLomZrmi59ET01cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGF2YWxvbi53YXJuKCdhdmFsb24uc2NhbiBmaXJzdCBhcmd1bWVudCBtdXN0IGVsZW1lbnQgb3IgSFRNTCBzdHJpbmcnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yb290ID0gdm5vZGVzWzBdO1xuICAgICAgICAgICAgdGhpcy52bm9kZXMgPSB2bm9kZXM7XG4gICAgICAgICAgICB0aGlzLnNjYW5DaGlsZHJlbih2bm9kZXMsIHRoaXMudm0sIHRydWUpO1xuICAgICAgICB9LFxuICAgICAgICBzY2FuQ2hpbGRyZW46IGZ1bmN0aW9uIHNjYW5DaGlsZHJlbihjaGlsZHJlbiwgc2NvcGUsIGlzUm9vdCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciB2ZG9tID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICAgICAgc3dpdGNoICh2ZG9tLm5vZGVOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJyN0ZXh0JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlICYmIHRoaXMuc2NhblRleHQodmRvbSwgc2NvcGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJyNjb21tZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlICYmIHRoaXMuc2NhbkNvbW1lbnQodmRvbSwgc2NvcGUsIGNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICcjZG9jdW1lbnQtZnJhZ21lbnQnOlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FuQ2hpbGRyZW4odmRvbS5jaGlsZHJlbiwgc2NvcGUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zY2FuVGFnKHZkb20sIHNjb3BlLCBjaGlsZHJlbiwgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcGxldGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDku47mlofmnKzoioLngrnojrflj5bmjIfku6RcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSB2ZG9tIFxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHNjb3BlXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBzY2FuVGV4dDogZnVuY3Rpb24gc2NhblRleHQodmRvbSwgc2NvcGUpIHtcbiAgICAgICAgICAgIGlmIChjb25maWcucmV4cHIudGVzdCh2ZG9tLm5vZGVWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJpbmRpbmdzLnB1c2goW3Zkb20sIHNjb3BlLCB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogdmRvbS5ub2RlVmFsdWVcbiAgICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5rOo6YeK6IqC54K56I635Y+W5oyH5LukXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gdmRvbSBcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBzY29wZVxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHBhcmVudENoaWxkcmVuXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBzY2FuQ29tbWVudDogZnVuY3Rpb24gc2NhbkNvbW1lbnQodmRvbSwgc2NvcGUsIHBhcmVudENoaWxkcmVuKSB7XG4gICAgICAgICAgICBpZiAoc3RhcnRXaXRoKHZkb20ubm9kZVZhbHVlLCAnbXMtZm9yOicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRGb3JCaW5kaW5nKHZkb20sIHNjb3BlLCBwYXJlbnRDaGlsZHJlbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5LuO5YWD57Sg6IqC54K555qEbm9kZU5hbWXkuI7lsZ7mgKfkuK3ojrflj5bmjIfku6RcbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSB2ZG9tIFxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHNjb3BlXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gcGFyZW50Q2hpbGRyZW5cbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBpc1Jvb3Qg55So5LqO5omn6KGMY29tcGxldGXmlrnms5VcbiAgICAgICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgICAgICovXG4gICAgICAgIHNjYW5UYWc6IGZ1bmN0aW9uIHNjYW5UYWcodmRvbSwgc2NvcGUsIHBhcmVudENoaWxkcmVuLCBpc1Jvb3QpIHtcbiAgICAgICAgICAgIHZhciBkaXJzID0ge30sXG4gICAgICAgICAgICAgICAgYXR0cnMgPSB2ZG9tLnByb3BzLFxuICAgICAgICAgICAgICAgIGhhc0RpcixcbiAgICAgICAgICAgICAgICBoYXNGb3I7XG4gICAgICAgICAgICBmb3IgKHZhciBhdHRyIGluIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gYXR0cnNbYXR0cl07XG4gICAgICAgICAgICAgICAgdmFyIG9sZE5hbWUgPSBhdHRyO1xuICAgICAgICAgICAgICAgIGlmIChhdHRyLmNoYXJBdCgwKSA9PT0gJzonKSB7XG4gICAgICAgICAgICAgICAgICAgIGF0dHIgPSAnbXMtJyArIGF0dHIuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdGFydFdpdGgoYXR0ciwgJ21zLScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpcnNbYXR0cl0gPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBhdHRyLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgICAgICAgICAgICAgICAgICB0eXBlID0gZXZlbnRNYXBbdHlwZV0gfHwgdHlwZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFkaXJlY3RpdmVzW3R5cGVdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdmFsb24ud2FybihhdHRyICsgJyBoYXMgbm90IHJlZ2lzdGVyZWQhJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaGFzRGlyID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGF0dHIgPT09ICdtcy1mb3InKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhc0ZvciA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgYXR0cnNbb2xkTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyICRpZCA9IGRpcnNbJ21zLWltcG9ydGFudCddIHx8IGRpcnNbJ21zLWNvbnRyb2xsZXInXTtcbiAgICAgICAgICAgIGlmICgkaWQpIHtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDlkI7nq6/muLLmn5NcbiAgICAgICAgICAgICAgICAgKiBzZXJ2ZXJUZW1wbGF0ZXPlkI7nq6/nu5lhdmFsb27mt7vliqDnmoTlr7nosaEs6YeM6Z2i6YO95piv5qih5p2/LFxuICAgICAgICAgICAgICAgICAqIOWwhuWOn+adpeWQjuerr+a4suafk+WlveeahOWMuuWfn+WGjei/mOWOn+aIkOWOn+Wni+agt+WtkCzlho3ooqvmiavmj49cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICB2YXIgdGVtcGxhdGVDYWNoZXMgPSBhdmFsb24uc2VydmVyVGVtcGxhdGVzO1xuICAgICAgICAgICAgICAgIHZhciB0ZW1wID0gdGVtcGxhdGVDYWNoZXMgJiYgdGVtcGxhdGVDYWNoZXNbJGlkXTtcbiAgICAgICAgICAgICAgICBpZiAodGVtcCkge1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24ubG9nKCfliY3nq6/lho3mrKHmuLLmn5PlkI7nq6/kvKDov4fmnaXnmoTmqKHmnb8nKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5vZGUgPSBmcm9tU3RyaW5nKHRtcGwpWzBdO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIG5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZkb21baV0gPSBub2RlW2ldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB0ZW1wbGF0ZUNhY2hlc1skaWRdO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNjYW5UYWcodmRvbSwgc2NvcGUsIHBhcmVudENoaWxkcmVuLCBpc1Jvb3QpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v5o6o566X5Ye65oyH5Luk57G75Z6LXG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSBkaXJzWydtcy1pbXBvcnRhbnQnXSA9PT0gJGlkID8gJ2ltcG9ydGFudCcgOiAnY29udHJvbGxlcic7XG4gICAgICAgICAgICAgICAgLy/mjqjnrpflh7rnlKjmiLflrprkuYnml7blsZ7mgKflkI0s5piv5L2/55SobXMt5bGe5oCn6L+Y5pivOuWxnuaAp1xuICAgICAgICAgICAgICAgIHZhciBhdHRyTmFtZSA9ICdtcy0nICsgdHlwZSBpbiBhdHRycyA/ICdtcy0nICsgdHlwZSA6ICc6JyArIHR5cGU7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdHRyc1thdHRyTmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBkaXIgPSBkaXJlY3RpdmVzW3R5cGVdO1xuICAgICAgICAgICAgICAgIHNjb3BlID0gZGlyLmdldFNjb3BlLmNhbGwodGhpcywgJGlkLCBzY29wZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFzY29wZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNsYXp6ID0gYXR0cnNbJ2NsYXNzJ107XG4gICAgICAgICAgICAgICAgICAgIGlmIChjbGF6eikge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnNbJ2NsYXNzJ10gPSAoJyAnICsgY2xhenogKyAnICcpLnJlcGxhY2UoJyBtcy1jb250cm9sbGVyICcsICcnKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHJlbmRlciA9IHRoaXM7XG4gICAgICAgICAgICAgICAgc2NvcGUuJHJlbmRlciA9IHJlbmRlcjtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrcy5wdXNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgLy/nlKjkuo7liKDpmaRtcy1jb250cm9sbGVyXG4gICAgICAgICAgICAgICAgICAgIGRpci51cGRhdGUuY2FsbChyZW5kZXIsIHZkb20sIGF0dHJOYW1lLCAkaWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhhc0Zvcikge1xuICAgICAgICAgICAgICAgIGlmICh2ZG9tLmRvbSkge1xuICAgICAgICAgICAgICAgICAgICB2ZG9tLmRvbS5yZW1vdmVBdHRyaWJ1dGUob2xkTmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEZvckJpbmRpbmdCeUVsZW1lbnQodmRvbSwgc2NvcGUsIHBhcmVudENoaWxkcmVuLCBoYXNGb3IpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoL15tc1xcLS8udGVzdCh2ZG9tLm5vZGVOYW1lKSkge1xuICAgICAgICAgICAgICAgIGF0dHJzLmlzID0gdmRvbS5ub2RlTmFtZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGF0dHJzWydpcyddKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFkaXJzWydtcy13aWRnZXQnXSkge1xuICAgICAgICAgICAgICAgICAgICBkaXJzWydtcy13aWRnZXQnXSA9ICd7fSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGhhc0RpciA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaGFzRGlyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5iaW5kaW5ncy5wdXNoKFt2ZG9tLCBzY29wZSwgZGlyc10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gdmRvbS5jaGlsZHJlbjtcbiAgICAgICAgICAgIC8v5aaC5p6c5a2Y5Zyo5a2Q6IqC54K5LOW5tuS4lOS4jeaYr+WuueWZqOWFg+e0oChzY3JpcHQsIHN0eXBlLCB0ZXh0YXJlYSwgeG1wLi4uKVxuICAgICAgICAgICAgaWYgKCFvcnBoYW5UYWdbdmRvbS5ub2RlTmFtZV0gJiYgY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoICYmICFkZWxheUNvbXBpbGVOb2RlcyhkaXJzKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2NhbkNoaWxkcmVuKGNoaWxkcmVuLCBzY29wZSwgZmFsc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWwhue7keWumuWxnuaAp+i9rOaNouS4uuaMh+S7pFxuICAgICAgICAgKiDmiafooYzlkITnp43lm57osIPkuI7kvJjljJbmjIfku6RcbiAgICAgICAgICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAgICAgICAgICovXG4gICAgICAgIGNvbXBsZXRlOiBmdW5jdGlvbiBjb21wbGV0ZSgpIHtcbiAgICAgICAgICAgIHRoaXMueWllbGREaXJlY3RpdmVzKCk7XG4gICAgICAgICAgICB0aGlzLmJlZm9yZVJlYWR5KCk7XG4gICAgICAgICAgICBpZiAoaW5Ccm93c2VyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJvb3QkJDEgPSB0aGlzLnJvb3Q7XG4gICAgICAgICAgICAgICAgaWYgKGluQnJvd3Nlcikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcm9vdERvbSA9IGF2YWxvbi52ZG9tKHJvb3QkJDEsICd0b0RPTScpO1xuICAgICAgICAgICAgICAgICAgICBncm91cFRyZWUocm9vdERvbSwgcm9vdCQkMS5jaGlsZHJlbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLm1vdW50ID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBmbjtcbiAgICAgICAgICAgIHdoaWxlIChmbiA9IHRoaXMuY2FsbGJhY2tzLnBvcCgpKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMub3B0aW1pemVEaXJlY3RpdmVzKCk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5bCG5pS26ZuG5Yiw55qE57uR5a6a5bGe5oCn6L+b6KGM5rex5Yqg5belLOacgOWQjui9rOaNouaMh+S7pFxuICAgICAgICAgKiBAcmV0dXJucyB7QXJyYXk8dHVwbGU+fVxuICAgICAgICAgKi9cbiAgICAgICAgeWllbGREaXJlY3RpdmVzOiBmdW5jdGlvbiB5aWVsZERpcmVjdGl2ZXMoKSB7XG4gICAgICAgICAgICB2YXIgdHVwbGU7XG4gICAgICAgICAgICB3aGlsZSAodHVwbGUgPSB0aGlzLmJpbmRpbmdzLnNoaWZ0KCkpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmRvbSA9IHR1cGxlWzBdLFxuICAgICAgICAgICAgICAgICAgICBzY29wZSA9IHR1cGxlWzFdLFxuICAgICAgICAgICAgICAgICAgICBkaXJzID0gdHVwbGVbMl0sXG4gICAgICAgICAgICAgICAgICAgIGJpbmRpbmdzID0gW107XG4gICAgICAgICAgICAgICAgaWYgKCdub2RlVmFsdWUnIGluIGRpcnMpIHtcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ3MgPSBwYXJzZUludGVycG9sYXRlKGRpcnMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoISgnbXMtc2tpcCcgaW4gZGlycykpIHtcbiAgICAgICAgICAgICAgICAgICAgYmluZGluZ3MgPSBwYXJzZUF0dHJpYnV0ZXMoZGlycywgdHVwbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgYmluZGluZzsgYmluZGluZyA9IGJpbmRpbmdzW2krK107KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXIgPSBkaXJlY3RpdmVzW2JpbmRpbmcudHlwZV07XG4gICAgICAgICAgICAgICAgICAgIGlmICghaW5Ccm93c2VyICYmIC9vbnxkdXBsZXh8YWN0aXZlfGhvdmVyLy50ZXN0KGJpbmRpbmcudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkaXIuYmVmb3JlSW5pdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlyLmJlZm9yZUluaXQuY2FsbChiaW5kaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmUkJDEgPSBuZXcgRGlyZWN0aXZlKHNjb3BlLCBiaW5kaW5nLCB2ZG9tLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3RpdmVzLnB1c2goZGlyZWN0aXZlJCQxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5L+u5pS55oyH5Luk55qEdXBkYXRl5LiOY2FsbGJhY2vmlrnms5Us6K6p5a6D5Lus5Lul5ZCO5omn6KGM5pe25pu05Yqg6auY5pWIXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBvcHRpbWl6ZURpcmVjdGl2ZXM6IGZ1bmN0aW9uIG9wdGltaXplRGlyZWN0aXZlcygpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSB0aGlzLmRpcmVjdGl2ZXNbaSsrXTspIHtcbiAgICAgICAgICAgICAgICBlbC5jYWxsYmFjayA9IGRpcmVjdGl2ZXNbZWwudHlwZV0udXBkYXRlO1xuICAgICAgICAgICAgICAgIGVsLnVwZGF0ZSA9IG5ld1VwZGF0ZTtcbiAgICAgICAgICAgICAgICBlbC5faXNTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSB0aGlzLmRpcmVjdGl2ZXNbaSsrXTspIHtcbiAgICAgICAgICAgICAgICBlbC51cGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICog6ZSA5q+B5omA5pyJ5oyH5LukXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiBkaXNwb3NlKCkge1xuICAgICAgICAgICAgdmFyIGxpc3QgPSB0aGlzLmRpcmVjdGl2ZXMgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgZWw7IGVsID0gbGlzdFtpKytdOykge1xuICAgICAgICAgICAgICAgIGVsLmRpc3Bvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v6Ziy5q2i5YW25LuW5Zyw5pa555qEdGhpcy5pbm5lclJlbmRlciAmJiB0aGlzLmlubmVyUmVuZGVyLmRpc3Bvc2XmiqXplJlcbiAgICAgICAgICAgIGZvciAodmFyIF9pNSBpbiB0aGlzKSB7XG4gICAgICAgICAgICAgICAgaWYgKF9pNSAhPT0gJ2Rpc3Bvc2UnKSBkZWxldGUgdGhpc1tfaTVdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWwhuW+queOr+WMuuWfn+i9rOaNouS4umZvcuaMh+S7pFxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IGJlZ2luIOazqOmHiuiKgueCuVxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHNjb3BlXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gcGFyZW50Q2hpbGRyZW5cbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSB1c2VyQ2Ig5b6q546v57uT5p2f5Zue6LCDXG4gICAgICAgICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAgICAgICAqL1xuICAgICAgICBnZXRGb3JCaW5kaW5nOiBmdW5jdGlvbiBnZXRGb3JCaW5kaW5nKGJlZ2luLCBzY29wZSwgcGFyZW50Q2hpbGRyZW4sIHVzZXJDYikge1xuICAgICAgICAgICAgdmFyIGV4cHIgPSBiZWdpbi5ub2RlVmFsdWUucmVwbGFjZSgnbXMtZm9yOicsICcnKS50cmltKCk7XG4gICAgICAgICAgICBiZWdpbi5ub2RlVmFsdWUgPSAnbXMtZm9yOicgKyBleHByO1xuICAgICAgICAgICAgdmFyIG5vZGVzID0gZ2V0UmFuZ2UocGFyZW50Q2hpbGRyZW4sIGJlZ2luKTtcbiAgICAgICAgICAgIHZhciBlbmQgPSBub2Rlcy5lbmQ7XG4gICAgICAgICAgICB2YXIgZnJhZ21lbnQgPSBhdmFsb24udmRvbShub2RlcywgJ3RvSFRNTCcpO1xuICAgICAgICAgICAgcGFyZW50Q2hpbGRyZW4uc3BsaWNlKG5vZGVzLnN0YXJ0LCBub2Rlcy5sZW5ndGgpO1xuICAgICAgICAgICAgYmVnaW4ucHJvcHMgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmluZGluZ3MucHVzaChbYmVnaW4sIHNjb3BlLCB7XG4gICAgICAgICAgICAgICAgJ21zLWZvcic6IGV4cHJcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBiZWdpbjogYmVnaW4sXG4gICAgICAgICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgICAgICAgZXhwcjogZXhwcixcbiAgICAgICAgICAgICAgICB1c2VyQ2I6IHVzZXJDYixcbiAgICAgICAgICAgICAgICBmcmFnbWVudDogZnJhZ21lbnQsXG4gICAgICAgICAgICAgICAgcGFyZW50Q2hpbGRyZW46IHBhcmVudENoaWxkcmVuXG4gICAgICAgICAgICB9XSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvKipcbiAgICAgICAgICog5Zyo5bimbXMtZm9y5YWD57Sg6IqC54K55peB5re75Yqg5Lik5Liq5rOo6YeK6IqC54K5LOe7hOaIkOW+queOr+WMuuWfn1xuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHZkb21cbiAgICAgICAgICogQHBhcmFtIHt0eXBlfSBzY29wZVxuICAgICAgICAgKiBAcGFyYW0ge3R5cGV9IHBhcmVudENoaWxkcmVuXG4gICAgICAgICAqIEBwYXJhbSB7dHlwZX0gZXhwclxuICAgICAgICAgKiBAcmV0dXJucyB7dW5kZWZpbmVkfVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Rm9yQmluZGluZ0J5RWxlbWVudDogZnVuY3Rpb24gZ2V0Rm9yQmluZGluZ0J5RWxlbWVudCh2ZG9tLCBzY29wZSwgcGFyZW50Q2hpbGRyZW4sIGV4cHIpIHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHBhcmVudENoaWxkcmVuLmluZGV4T2YodmRvbSk7IC8v5Y6f5p2l5bimbXMtZm9y55qE5YWD57Sg6IqC54K5XG4gICAgICAgICAgICB2YXIgcHJvcHMgPSB2ZG9tLnByb3BzO1xuICAgICAgICAgICAgdmFyIGJlZ2luID0ge1xuICAgICAgICAgICAgICAgIG5vZGVOYW1lOiAnI2NvbW1lbnQnLFxuICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogJ21zLWZvcjonICsgZXhwclxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5zbG90KSB7XG4gICAgICAgICAgICAgICAgYmVnaW4uc2xvdCA9IHByb3BzLnNsb3Q7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHByb3BzLnNsb3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZW5kID0ge1xuICAgICAgICAgICAgICAgIG5vZGVOYW1lOiAnI2NvbW1lbnQnLFxuICAgICAgICAgICAgICAgIG5vZGVWYWx1ZTogJ21zLWZvci1lbmQ6J1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHBhcmVudENoaWxkcmVuLnNwbGljZShpbmRleCwgMSwgYmVnaW4sIHZkb20sIGVuZCk7XG4gICAgICAgICAgICB0aGlzLmdldEZvckJpbmRpbmcoYmVnaW4sIHNjb3BlLCBwYXJlbnRDaGlsZHJlbiwgcHJvcHNbJ2RhdGEtZm9yLXJlbmRlcmVkJ10pO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgdmlld0lEO1xuXG4gICAgZnVuY3Rpb24gbmV3VXBkYXRlKCkge1xuICAgICAgICB2YXIgb2xkVmFsID0gdGhpcy5iZWZvcmVVcGRhdGUoKTtcbiAgICAgICAgdmFyIG5ld1ZhbCA9IHRoaXMudmFsdWUgPSB0aGlzLmdldCgpO1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFjayAmJiB0aGlzLmRpZmYobmV3VmFsLCBvbGRWYWwpKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubm9kZSwgdGhpcy52YWx1ZSk7XG4gICAgICAgICAgICB2YXIgdm0gPSB0aGlzLnZtO1xuICAgICAgICAgICAgdmFyICRyZW5kZXIgPSB2bS4kcmVuZGVyO1xuICAgICAgICAgICAgdmFyIGxpc3QgPSB2bS4kZXZlbnRzWydvblZpZXdDaGFuZ2UnXTtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgaWYgKGxpc3QgJiYgJHJlbmRlciAmJiAkcmVuZGVyLnJvb3QgJiYgIWF2YWxvbi52aWV3Q2hhbmdpbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAodmlld0lEKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh2aWV3SUQpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3SUQgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2aWV3SUQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChlbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWwuY2FsbGJhY2suY2FsbCh2bSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2aWV3Y2hhbmdlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6ICRyZW5kZXIucm9vdCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2bW9kZWw6IHZtXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5faXNTY2hlZHVsZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnRzID0gJ29uSW5pdCxvblJlYWR5LG9uVmlld0NoYW5nZSxvbkRpc3Bvc2Usb25FbnRlcixvbkxlYXZlJztcbiAgICB2YXIgY29tcG9uZW50RXZlbnRzID0gYXZhbG9uLm9uZU9iamVjdChldmVudHMpO1xuXG4gICAgZnVuY3Rpb24gdG9PYmplY3QodmFsdWUpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gcGxhdGZvcm0udG9Kc29uKHZhbHVlKTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICB2YXIgdiA9IHt9O1xuICAgICAgICAgICAgdmFsdWUuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICBlbCAmJiBhdmFsb24uc2hhZG93Q29weSh2LCBlbCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB2O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgdmFyIGNvbXBvbmVudFF1ZXVlID0gW107XG4gICAgYXZhbG9uLmRpcmVjdGl2ZSgnd2lkZ2V0Jywge1xuICAgICAgICBkZWxheTogdHJ1ZSxcbiAgICAgICAgcHJpb3JpdHk6IDQsXG4gICAgICAgIGRlZXA6IHRydWUsXG4gICAgICAgIGluaXQ6IGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgICAgICAgICAvL2NhY2hlZOWxnuaAp+W/hemhu+WumuS5ieWcqOe7hOS7tuWuueWZqOmHjOmdoizkuI3mmK90ZW1wbGF0ZeS4rVxuICAgICAgICAgICAgdmFyIHZkb20gPSB0aGlzLm5vZGU7XG4gICAgICAgICAgICB0aGlzLmNhY2hlVm0gPSAhIXZkb20ucHJvcHMuY2FjaGVkO1xuICAgICAgICAgICAgaWYgKHZkb20uZG9tICYmIHZkb20ubm9kZU5hbWUgPT09ICcjY29tbWVudCcpIHtcbiAgICAgICAgICAgICAgICB2YXIgY29tbWVudCA9IHZkb20uZG9tO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy5nZXRWYWx1ZSgpO1xuICAgICAgICAgICAgdmFyIHZhbHVlID0gdG9PYmplY3Qob2xkVmFsdWUpO1xuICAgICAgICAgICAgLy/lpJbpg6hWTeS4juWGhemDqFZNXG4gICAgICAgICAgICAvLyDvvJ3vvJ3vvJ3liJvlu7rnu4Tku7bnmoRWTe+8ne+8nUJFR0lO77yd77yd77ydXG4gICAgICAgICAgICB2YXIgaXMgPSB2ZG9tLnByb3BzLmlzIHx8IHZhbHVlLmlzO1xuICAgICAgICAgICAgdGhpcy5pcyA9IGlzO1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IGF2YWxvbi5jb21wb25lbnRzW2lzXTtcbiAgICAgICAgICAgIC8v5aSW6YOo5Lyg5YWl55qE5oC75aSn5LqO5YaF6YOoXG4gICAgICAgICAgICBpZiAoISgnZnJhZ21lbnQnIGluIHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF2ZG9tLmlzVm9pZFRhZykge1xuICAgICAgICAgICAgICAgICAgICAvL+aPkOWPlue7hOS7tuWuueWZqOWGhemDqOeahOS4nOilv+S9nOS4uuaooeadv1xuICAgICAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IHZkb20uY2hpbGRyZW5bMF07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ZXh0ICYmIHRleHQubm9kZVZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gdGV4dC5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZyYWdtZW50ID0gYXZhbG9uLnZkb20odmRvbS5jaGlsZHJlbiwgJ3RvSFRNTCcpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5mcmFnbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8v5aaC5p6c57uE5Lu26L+Y5rKh5pyJ5rOo5YaM77yM6YKj5LmI5bCG5Y6f5YWD57Sg5Y+Y5oiQ5LiA5Liq5Y2g5L2N55So55qE5rOo6YeK6IqC54K5XG4gICAgICAgICAgICBpZiAoIWNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IDA7XG4gICAgICAgICAgICAgICAgdmRvbS5ub2RlTmFtZSA9ICcjY29tbWVudCc7XG4gICAgICAgICAgICAgICAgdmRvbS5ub2RlVmFsdWUgPSAndW5yZXNvbHZlZCBjb21wb25lbnQgcGxhY2Vob2xkZXInO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB2ZG9tLmRvbTtcbiAgICAgICAgICAgICAgICBhdmFsb24uQXJyYXkuZW5zdXJlKGNvbXBvbmVudFF1ZXVlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5aaC5p6c5piv6Z2e56m65YWD57Sg77yM5q+U5aaC6K+0eG1wLCBtcy0qLCB0ZW1wbGF0ZVxuICAgICAgICAgICAgdmFyIGlkID0gdmFsdWUuaWQgfHwgdmFsdWUuJGlkO1xuICAgICAgICAgICAgdmFyIGhhc0NhY2hlID0gYXZhbG9uLnZtb2RlbHNbaWRdO1xuICAgICAgICAgICAgdmFyIGZyb21DYWNoZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8gdGhpcy5yZWFkeVN0YXRlID0gMVxuICAgICAgICAgICAgaWYgKGhhc0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgY29tVm0gPSBoYXNDYWNoZTtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbVZtID0gY29tVm07XG4gICAgICAgICAgICAgICAgcmVwbGFjZVJvb3QodGhpcywgY29tVm0uJHJlbmRlcik7XG4gICAgICAgICAgICAgICAgZnJvbUNhY2hlID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb21wb25lbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50ID0gbmV3IGNvbXBvbmVudCh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBjb21WbSA9IGNyZWF0ZUNvbXBvbmVudFZtKGNvbXBvbmVudCwgdmFsdWUsIGlzKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSAxO1xuICAgICAgICAgICAgICAgIGZpcmVDb21wb25lbnRIb29rKGNvbVZtLCB2ZG9tLCAnSW5pdCcpO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tVm0gPSBjb21WbTtcblxuICAgICAgICAgICAgICAgIC8vIO+8ne+8ne+8neWIm+W7uue7hOS7tueahFZN77yd77ydRU5E77yd77yd77ydXG4gICAgICAgICAgICAgICAgdmFyIGlubmVyUmVuZGVyID0gYXZhbG9uLnNjYW4oY29tcG9uZW50LnRlbXBsYXRlLCBjb21WbSk7XG4gICAgICAgICAgICAgICAgY29tVm0uJHJlbmRlciA9IGlubmVyUmVuZGVyO1xuICAgICAgICAgICAgICAgIHJlcGxhY2VSb290KHRoaXMsIGlubmVyUmVuZGVyKTtcbiAgICAgICAgICAgICAgICB2YXIgbm9kZXNXaXRoU2xvdCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBkaXJlY3RpdmVzJCQxID0gW107XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZnJhZ21lbnQgfHwgY29tcG9uZW50LnNvbGVTbG90KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJWTSA9IHRoaXMuZnJhZ21lbnQgPyB0aGlzLnZtIDogY29tVm07XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJUZXh0ID0gdGhpcy5mcmFnbWVudCB8fCAne3sjIycgKyBjb21wb25lbnQuc29sZVNsb3QgKyAnfX0nO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRCb3NzID0gYXZhbG9uLnNjYW4oJzxkaXY+JyArIGN1clRleHQgKyAnPC9kaXY+JywgY3VyVk0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVzV2l0aFNsb3QgPSB0aGlzLnJvb3QuY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkaXJlY3RpdmVzJCQxID0gY2hpbGRCb3NzLmRpcmVjdGl2ZXM7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hpbGRCb3NzID0gY2hpbGRCb3NzO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGNoaWxkQm9zcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNoaWxkQm9zc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShpbm5lclJlbmRlci5kaXJlY3RpdmVzLCBkaXJlY3RpdmVzJCQxKTtcblxuICAgICAgICAgICAgICAgIHZhciBhcnJheVNsb3QgPSBbXSxcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0U2xvdCA9IHt9O1xuICAgICAgICAgICAgICAgIC8v5LuO55So5oi35YaZ55qE5YWD57Sg5YaF6YOoIOaUtumbhuimgeenu+WKqOWIsCDmlrDliJvlu7rnmoTnu4Tku7blhoXpg6jnmoTlhYPntKBcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50LnNvbGVTbG90KSB7XG4gICAgICAgICAgICAgICAgICAgIGFycmF5U2xvdCA9IG5vZGVzV2l0aFNsb3Q7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXNXaXRoU2xvdC5mb3JFYWNoKGZ1bmN0aW9uIChlbCwgaSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy/opoHmsYLluKZzbG905bGe5oCnXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZWwuc2xvdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBub2RlcyA9IGdldFJhbmdlKG5vZGVzV2l0aFNsb3QsIGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBub2Rlcy5wdXNoKG5vZGVzLmVuZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9kZXMudW5zaGlmdChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0U2xvdFtlbC5zbG90XSA9IG5vZGVzO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlbC5wcm9wcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuYW1lID0gZWwucHJvcHMuc2xvdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZWwucHJvcHMuc2xvdDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0U2xvdFtuYW1lXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFNsb3RbbmFtZV0ucHVzaChlbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RTbG90W25hbWVdID0gW2VsXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8v5bCG5Y6f5p2l5YWD57Sg55qE5omA5pyJ5a2p5a2Q77yM5YWo6YOo56e75Yqo5paw55qE5YWD57Sg55qE56ys5LiA5Liqc2xvdOeahOS9jee9ruS4ilxuICAgICAgICAgICAgICAgIGlmIChjb21wb25lbnQuc29sZVNsb3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zZXJ0QXJyYXlTbG90KGlubmVyUmVuZGVyLnZub2RlcywgYXJyYXlTbG90KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpbnNlcnRPYmplY3RTbG90KGlubmVyUmVuZGVyLnZub2Rlcywgb2JqZWN0U2xvdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29tbWVudCkge1xuICAgICAgICAgICAgICAgIHZhciBkb20gPSBhdmFsb24udmRvbSh2ZG9tLCAndG9ET00nKTtcbiAgICAgICAgICAgICAgICBjb21tZW50LnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKGRvbSwgY29tbWVudCk7XG4gICAgICAgICAgICAgICAgY29tVm0uJGVsZW1lbnQgPSBpbm5lclJlbmRlci5yb290LmRvbSA9IGRvbTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5yZUluaXQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8v5aSE55CGRE9N6IqC54K5XG5cbiAgICAgICAgICAgIGR1bXBUcmVlKHZkb20uZG9tKTtcbiAgICAgICAgICAgIGNvbVZtLiRlbGVtZW50ID0gdmRvbS5kb207XG4gICAgICAgICAgICBncm91cFRyZWUodmRvbS5kb20sIHZkb20uY2hpbGRyZW4pO1xuICAgICAgICAgICAgaWYgKGZyb21DYWNoZSkge1xuICAgICAgICAgICAgICAgIGZpcmVDb21wb25lbnRIb29rKGNvbVZtLCB2ZG9tLCAnRW50ZXInKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmlyZUNvbXBvbmVudEhvb2soY29tVm0sIHZkb20sICdSZWFkeScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBkaWZmOiBmdW5jdGlvbiBkaWZmKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgICAgICAgICBpZiAoY3NzRGlmZi5jYWxsKHRoaXMsIG5ld1ZhbCwgb2xkVmFsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKHZkb20sIHZhbHVlKSB7XG4gICAgICAgICAgICAvL3RoaXMub2xkVmFsdWUgPSB2YWx1ZSAvL+KYheKYhemYsuatoumAkuW9klxuXG4gICAgICAgICAgICBzd2l0Y2ggKHRoaXMucmVhZHlTdGF0ZSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmVJbml0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSsrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWFkeVN0YXRlKys7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVhZHlTdGF0ZSsrO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY29tVm0gPSB0aGlzLmNvbVZtO1xuICAgICAgICAgICAgICAgICAgICBhdmFsb24udmlld0NoYW5naW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYXZhbG9uLnRyYW5zYWN0aW9uKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29tVm0uaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWVbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21WbVtpXSA9IHZhbHVlW2ldLmNvbmNhdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tVm1baV0gPSB2YWx1ZVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy/opoHkv53or4HopoHlhYjop6blj5HlranlrZDnmoRWaWV3Q2hhbmdlIOeEtuWQjuWGjeWIsOWug+iHquW3seeahFZpZXdDaGFuZ2VcbiAgICAgICAgICAgICAgICAgICAgZmlyZUNvbXBvbmVudEhvb2soY29tVm0sIHZkb20sICdWaWV3Q2hhbmdlJyk7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBhdmFsb24udmlld0NoYW5naW5nO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMudmFsdWUgPSBhdmFsb24ubWl4KHRydWUsIHt9LCB2YWx1ZSk7XG4gICAgICAgIH0sXG4gICAgICAgIGJlZm9yZURpc3Bvc2U6IGZ1bmN0aW9uIGJlZm9yZURpc3Bvc2UoKSB7XG4gICAgICAgICAgICB2YXIgY29tVm0gPSB0aGlzLmNvbVZtO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNhY2hlVm0pIHtcbiAgICAgICAgICAgICAgICBmaXJlQ29tcG9uZW50SG9vayhjb21WbSwgdGhpcy5ub2RlLCAnRGlzcG9zZScpO1xuICAgICAgICAgICAgICAgIGNvbVZtLiRoYXNoY29kZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBhdmFsb24udm1vZGVsc1tjb21WbS4kaWRdO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5uZXJSZW5kZXIgJiYgdGhpcy5pbm5lclJlbmRlci5kaXNwb3NlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpcmVDb21wb25lbnRIb29rKGNvbVZtLCB0aGlzLm5vZGUsICdMZWF2ZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiByZXBsYWNlUm9vdChpbnN0YW5jZSwgaW5uZXJSZW5kZXIpIHtcbiAgICAgICAgaW5zdGFuY2UuaW5uZXJSZW5kZXIgPSBpbm5lclJlbmRlcjtcbiAgICAgICAgdmFyIHJvb3QkJDEgPSBpbm5lclJlbmRlci5yb290O1xuICAgICAgICB2YXIgdmRvbSA9IGluc3RhbmNlLm5vZGU7XG4gICAgICAgIHZhciBzbG90ID0gdmRvbS5wcm9wcy5zbG90O1xuICAgICAgICBmb3IgKHZhciBpIGluIHJvb3QkJDEpIHtcbiAgICAgICAgICAgIHZkb21baV0gPSByb290JCQxW2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2ZG9tLnByb3BzICYmIHNsb3QpIHtcbiAgICAgICAgICAgIHZkb20ucHJvcHMuc2xvdCA9IHNsb3Q7XG4gICAgICAgIH1cbiAgICAgICAgaW5uZXJSZW5kZXIucm9vdCA9IHZkb207XG4gICAgICAgIGlubmVyUmVuZGVyLnZub2Rlc1swXSA9IHZkb207XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmlyZUNvbXBvbmVudEhvb2sodm0sIHZkb20sIG5hbWUpIHtcbiAgICAgICAgdmFyIGxpc3QgPSB2bS4kZXZlbnRzWydvbicgKyBuYW1lXTtcbiAgICAgICAgaWYgKGxpc3QpIHtcbiAgICAgICAgICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZWwpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZWwuY2FsbGJhY2suY2FsbCh2bSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogbmFtZS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB2ZG9tLmRvbSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZtb2RlbDogdm1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNvbXBvbmVudFZtKGNvbXBvbmVudCwgdmFsdWUsIGlzKSB7XG4gICAgICAgIHZhciBob29rcyA9IFtdO1xuICAgICAgICB2YXIgZGVmYXVsdHMgPSBjb21wb25lbnQuZGVmYXVsdHM7XG4gICAgICAgIGNvbGxlY3RIb29rcyhkZWZhdWx0cywgaG9va3MpO1xuICAgICAgICBjb2xsZWN0SG9va3ModmFsdWUsIGhvb2tzKTtcbiAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpIGluIGRlZmF1bHRzKSB7XG4gICAgICAgICAgICB2YXIgdmFsID0gdmFsdWVbaV07XG4gICAgICAgICAgICBpZiAodmFsID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBvYmpbaV0gPSBkZWZhdWx0c1tpXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2JqW2ldID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9iai4kaWQgPSB2YWx1ZS5pZCB8fCB2YWx1ZS4kaWQgfHwgYXZhbG9uLm1ha2VIYXNoQ29kZShpcyk7XG4gICAgICAgIGRlbGV0ZSBvYmouaWQ7XG4gICAgICAgIHZhciBkZWYgPSBhdmFsb24ubWl4KHRydWUsIHt9LCBvYmopO1xuICAgICAgICB2YXIgdm0gPSBhdmFsb24uZGVmaW5lKGRlZik7XG4gICAgICAgIGhvb2tzLmZvckVhY2goZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgICAgICB2bS4kd2F0Y2goZWwudHlwZSwgZWwuY2IpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZtO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbGxlY3RIb29rcyhhLCBsaXN0KSB7XG4gICAgICAgIGZvciAodmFyIGkgaW4gYSkge1xuICAgICAgICAgICAgaWYgKGNvbXBvbmVudEV2ZW50c1tpXSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYVtpXSA9PT0gJ2Z1bmN0aW9uJyAmJiBpLmluZGV4T2YoJ29uJykgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdC51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IGksXG4gICAgICAgICAgICAgICAgICAgICAgICBjYjogYVtpXVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9kZWxldGUgYVtpXSDov5nph4zkuI3og73liKDpmaQs5Lya5a+86Ie05YaN5qyh5YiH5o2i5pe25rKh5pyJb25SZWFkeVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRQYXJlbnRDaGlsZHJlbihub2RlcywgYXJyKSB7XG4gICAgICAgIHZhciBkaXIgPSBhcnIgJiYgYXJyWzBdICYmIGFyclswXS5mb3JEaXI7XG4gICAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgICAgIGRpci5wYXJlbnRDaGlsZHJlbiA9IG5vZGVzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zZXJ0QXJyYXlTbG90KG5vZGVzLCBhcnIpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGVsOyBlbCA9IG5vZGVzW2ldOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlbC5ub2RlTmFtZSA9PT0gJ3Nsb3QnKSB7XG4gICAgICAgICAgICAgICAgcmVzZXRQYXJlbnRDaGlsZHJlbihub2RlcywgYXJyKTtcbiAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UuYXBwbHkobm9kZXMsIFtpLCAxXS5jb25jYXQoYXJyKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVsLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgaW5zZXJ0QXJyYXlTbG90KGVsLmNoaWxkcmVuLCBhcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5zZXJ0T2JqZWN0U2xvdChub2Rlcywgb2JqKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBub2Rlc1tpXTsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZWwubm9kZU5hbWUgPT09ICdzbG90Jykge1xuICAgICAgICAgICAgICAgIHZhciBuYW1lID0gZWwucHJvcHMubmFtZTtcbiAgICAgICAgICAgICAgICByZXNldFBhcmVudENoaWxkcmVuKG5vZGVzLCBvYmpbbmFtZV0pO1xuICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZS5hcHBseShub2RlcywgW2ksIDFdLmNvbmNhdChvYmpbbmFtZV0pKTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZWwuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpbnNlcnRPYmplY3RTbG90KGVsLmNoaWxkcmVuLCBvYmopO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXZhbG9uLmNvbXBvbmVudHMgPSB7fTtcbiAgICBhdmFsb24uY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUsIGNvbXBvbmVudCkge1xuXG4gICAgICAgIGNvbXBvbmVudC5leHRlbmQgPSBjb21wb25lbnRFeHRlbmQ7XG4gICAgICAgIHJldHVybiBhZGRUb1F1ZXVlKG5hbWUsIGNvbXBvbmVudCk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBhZGRUb1F1ZXVlKG5hbWUsIGNvbXBvbmVudCkge1xuICAgICAgICBhdmFsb24uY29tcG9uZW50c1tuYW1lXSA9IGNvbXBvbmVudDtcbiAgICAgICAgZm9yICh2YXIgZWwsIGkgPSAwOyBlbCA9IGNvbXBvbmVudFF1ZXVlW2ldOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChlbC5pcyA9PT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIGNvbXBvbmVudFF1ZXVlLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBlbC5yZUluaXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBlbC52YWx1ZTtcbiAgICAgICAgICAgICAgICBlbC51cGRhdGUoKTtcbiAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNvbXBvbmVudDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb21wb25lbnRFeHRlbmQoY2hpbGQpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBjaGlsZC5kaXNwbGF5TmFtZTtcbiAgICAgICAgZGVsZXRlIGNoaWxkLmRpc3BsYXlOYW1lO1xuICAgICAgICB2YXIgb2JqID0geyBkZWZhdWx0czogYXZhbG9uLm1peCh0cnVlLCB7fSwgdGhpcy5kZWZhdWx0cywgY2hpbGQuZGVmYXVsdHMpIH07XG4gICAgICAgIGlmIChjaGlsZC5zb2xlU2xvdCkge1xuICAgICAgICAgICAgb2JqLnNvbGVTbG90ID0gY2hpbGQuc29sZVNsb3Q7XG4gICAgICAgIH1cbiAgICAgICAgb2JqLnRlbXBsYXRlID0gY2hpbGQudGVtcGxhdGUgfHwgdGhpcy50ZW1wbGF0ZTtcbiAgICAgICAgcmV0dXJuIGF2YWxvbi5jb21wb25lbnQobmFtZSwgb2JqKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXZhbG9uO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L2F2YWxvbjIvZGlzdC9hdmFsb24uanNcbi8vIG1vZHVsZSBpZCA9IDBcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cdC8qXG5cdCAqIFxuXHQgKiB2ZXJzaW9uIDEuMFxuXHQgKiBidWlsdCBpbiAyMDE1LjExLjE5XG5cdCAqIFxuXHQgKiB2MC45LjZcblx0ICog5L+u5q2jZ2FzQXR0cmlidXRlIHR5cG9cblx0ICog5L+u5q2jbW1IaXN0b3J5IGRvY3VtZW50LndyaXRlIEJVR1xuXHQgKiBcblx0ICogXG5cdCAqL1xuXG5cdHZhciBtbUhpc3RvcnkgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDYpXG5cdHZhciBzdG9yYWdlID0gX193ZWJwYWNrX3JlcXVpcmVfXyg3KVxuXG5cdGZ1bmN0aW9uIFJvdXRlcigpIHtcblx0ICAgIHRoaXMucnVsZXMgPSBbXVxuXHR9XG5cblxuXHR2YXIgcGxhY2Vob2xkZXIgPSAvKFs6Kl0pKFxcdyspfFxceyhcXHcrKSg/OlxcOigoPzpbXnt9XFxcXF0rfFxcXFwufFxceyg/Oltee31cXFxcXSt8XFxcXC4pKlxcfSkrKSk/XFx9L2dcblx0Um91dGVyLnByb3RvdHlwZSA9IHN0b3JhZ2Vcblx0YXZhbG9uLm1peChzdG9yYWdlLCB7XG5cdCAgICBlcnJvcjogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cdCAgICAgICAgdGhpcy5lcnJvcmJhY2sgPSBjYWxsYmFja1xuXHQgICAgfSxcblx0ICAgIF9wYXRoVG9SZWdFeHA6IGZ1bmN0aW9uIChwYXR0ZXJuLCBvcHRzKSB7XG5cdCAgICAgICAgdmFyIGtleXMgPSBvcHRzLmtleXMgPSBbXSxcblx0ICAgICAgICAgICAgICAgIC8vICAgICAgc2VnbWVudHMgPSBvcHRzLnNlZ21lbnRzID0gW10sXG5cdCAgICAgICAgICAgICAgICBjb21waWxlZCA9ICdeJywgbGFzdCA9IDAsIG0sIG5hbWUsIHJlZ2V4cCwgc2VnbWVudDtcblxuXHQgICAgICAgIHdoaWxlICgobSA9IHBsYWNlaG9sZGVyLmV4ZWMocGF0dGVybikpKSB7XG5cdCAgICAgICAgICAgIG5hbWUgPSBtWzJdIHx8IG1bM107IC8vIElFWzc4XSByZXR1cm5zICcnIGZvciB1bm1hdGNoZWQgZ3JvdXBzIGluc3RlYWQgb2YgbnVsbFxuXHQgICAgICAgICAgICByZWdleHAgPSBtWzRdIHx8IChtWzFdID09ICcqJyA/ICcuKicgOiAnc3RyaW5nJylcblx0ICAgICAgICAgICAgc2VnbWVudCA9IHBhdHRlcm4uc3Vic3RyaW5nKGxhc3QsIG0uaW5kZXgpO1xuXHQgICAgICAgICAgICB2YXIgdHlwZSA9IHRoaXMuJHR5cGVzW3JlZ2V4cF1cblx0ICAgICAgICAgICAgdmFyIGtleSA9IHtcblx0ICAgICAgICAgICAgICAgIG5hbWU6IG5hbWVcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICBpZiAodHlwZSkge1xuXHQgICAgICAgICAgICAgICAgcmVnZXhwID0gdHlwZS5wYXR0ZXJuXG5cdCAgICAgICAgICAgICAgICBrZXkuZGVjb2RlID0gdHlwZS5kZWNvZGVcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICBrZXlzLnB1c2goa2V5KVxuXHQgICAgICAgICAgICBjb21waWxlZCArPSBxdW90ZVJlZ0V4cChzZWdtZW50LCByZWdleHAsIGZhbHNlKVxuXHQgICAgICAgICAgICAvLyAgc2VnbWVudHMucHVzaChzZWdtZW50KVxuXHQgICAgICAgICAgICBsYXN0ID0gcGxhY2Vob2xkZXIubGFzdEluZGV4XG5cdCAgICAgICAgfVxuXHQgICAgICAgIHNlZ21lbnQgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0KTtcblx0ICAgICAgICBjb21waWxlZCArPSBxdW90ZVJlZ0V4cChzZWdtZW50KSArIChvcHRzLnN0cmljdCA/IG9wdHMubGFzdCA6IFwiXFwvP1wiKSArICckJztcblx0ICAgICAgICB2YXIgc2Vuc2l0aXZlID0gdHlwZW9mIG9wdHMuY2FzZUluc2Vuc2l0aXZlID09PSBcImJvb2xlYW5cIiA/IG9wdHMuY2FzZUluc2Vuc2l0aXZlIDogdHJ1ZVxuXHQgICAgICAgIC8vICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xuXHQgICAgICAgIG9wdHMucmVnZXhwID0gbmV3IFJlZ0V4cChjb21waWxlZCwgc2Vuc2l0aXZlID8gJ2knIDogdW5kZWZpbmVkKTtcblx0ICAgICAgICByZXR1cm4gb3B0c1xuXG5cdCAgICB9LFxuXHQgICAgLy/mt7vliqDkuIDkuKrot6/nlLHop4TliJlcblx0ICAgIGFkZDogZnVuY3Rpb24gKHBhdGgsIGNhbGxiYWNrLCBvcHRzKSB7XG5cdCAgICAgICAgdmFyIGFycmF5ID0gdGhpcy5ydWxlc1xuXHQgICAgICAgIGlmIChwYXRoLmNoYXJBdCgwKSAhPT0gXCIvXCIpIHtcblx0ICAgICAgICAgICAgYXZhbG9uLmVycm9yKFwiYXZhbG9uLnJvdXRlci5hZGTnmoTnrKzkuIDkuKrlj4LmlbDlv4Xpobvku6Uv5byA5aS0XCIpXG5cdCAgICAgICAgfVxuXHQgICAgICAgIG9wdHMgPSBvcHRzIHx8IHt9XG5cdCAgICAgICAgb3B0cy5jYWxsYmFjayA9IGNhbGxiYWNrXG5cdCAgICAgICAgaWYgKHBhdGgubGVuZ3RoID4gMiAmJiBwYXRoLmNoYXJBdChwYXRoLmxlbmd0aCAtIDEpID09PSBcIi9cIikge1xuXHQgICAgICAgICAgICBwYXRoID0gcGF0aC5zbGljZSgwLCAtMSlcblx0ICAgICAgICAgICAgb3B0cy5sYXN0ID0gXCIvXCJcblx0ICAgICAgICB9XG5cdCAgICAgICAgYXZhbG9uLkFycmF5LmVuc3VyZShhcnJheSwgdGhpcy5fcGF0aFRvUmVnRXhwKHBhdGgsIG9wdHMpKVxuXHQgICAgfSxcblx0ICAgIC8v5Yik5a6a5b2T5YmNVVJM5LiO5bey5pyJ54q25oCB5a+56LGh55qE6Lev55Sx6KeE5YiZ5piv5ZCm56ym5ZCIXG5cdCAgICByb3V0ZTogZnVuY3Rpb24gKHBhdGgsIHF1ZXJ5KSB7XG5cdCAgICAgICAgcGF0aCA9IHBhdGgudHJpbSgpXG5cdCAgICAgICAgdmFyIHJ1bGVzID0gdGhpcy5ydWxlc1xuXHQgICAgICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBydWxlc1tpKytdOyApIHtcblx0ICAgICAgICAgICAgdmFyIGFyZ3MgPSBwYXRoLm1hdGNoKGVsLnJlZ2V4cClcblx0ICAgICAgICAgICAgaWYgKGFyZ3MpIHtcblx0ICAgICAgICAgICAgICAgIGVsLnF1ZXJ5ID0gcXVlcnkgfHwge31cblx0ICAgICAgICAgICAgICAgIGVsLnBhdGggPSBwYXRoXG5cdCAgICAgICAgICAgICAgICBlbC5wYXJhbXMgPSB7fVxuXHQgICAgICAgICAgICAgICAgdmFyIGtleXMgPSBlbC5rZXlzXG5cdCAgICAgICAgICAgICAgICBhcmdzLnNoaWZ0KClcblx0ICAgICAgICAgICAgICAgIGlmIChrZXlzLmxlbmd0aCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHRoaXMuX3BhcnNlQXJncyhhcmdzLCBlbClcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIHJldHVybiAgZWwuY2FsbGJhY2suYXBwbHkoZWwsIGFyZ3MpXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cdCAgICAgICAgaWYgKHRoaXMuZXJyb3JiYWNrKSB7XG5cdCAgICAgICAgICAgIHRoaXMuZXJyb3JiYWNrKClcblx0ICAgICAgICB9XG5cdCAgICB9LFxuXHQgICAgX3BhcnNlQXJnczogZnVuY3Rpb24gKG1hdGNoLCBzdGF0ZU9iaikge1xuXHQgICAgICAgIHZhciBrZXlzID0gc3RhdGVPYmoua2V5c1xuXHQgICAgICAgIGZvciAodmFyIGogPSAwLCBqbiA9IGtleXMubGVuZ3RoOyBqIDwgam47IGorKykge1xuXHQgICAgICAgICAgICB2YXIga2V5ID0ga2V5c1tqXVxuXHQgICAgICAgICAgICB2YXIgdmFsdWUgPSBtYXRjaFtqXSB8fCAnJ1xuXHQgICAgICAgICAgICBpZiAodHlwZW9mIGtleS5kZWNvZGUgPT09ICdmdW5jdGlvbicpIHsvL+WcqOi/memHjOWwneivlei9rOaNouWPguaVsOeahOexu+Wei1xuXHQgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGtleS5kZWNvZGUodmFsdWUpXG5cdCAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICB0cnkge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhbCA9IEpTT04ucGFyc2UodmFsdWUpXG5cdCAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdmFsID0gdmFsdWVcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICBtYXRjaFtqXSA9IHN0YXRlT2JqLnBhcmFtc1trZXkubmFtZV0gPSB2YWxcblx0ICAgICAgICB9XG5cdCAgICB9LFxuXHQgICAgLypcblx0ICAgICAqICBAaW50ZXJmYWNlIGF2YWxvbi5yb3V0ZXIubmF2aWdhdGUg6K6+572u5Y6G5Y+yKOaUueWPmFVSTClcblx0ICAgICAqICBAcGFyYW0gaGFzaCDorr/pl67nmoR1cmwgaGFzaCAgIFxuXHQgICAgICovXG5cdCAgICBuYXZpZ2F0ZTogZnVuY3Rpb24gKGhhc2gsIG1vZGUpIHtcblx0ICAgICAgICB2YXIgcGFyc2VkID0gcGFyc2VRdWVyeShoYXNoKVxuXHQgICAgICAgIHZhciBuZXdIYXNoID0gdGhpcy5yb3V0ZShwYXJzZWQucGF0aCwgcGFyc2VkLnF1ZXJ5KVxuXHQgICAgICAgIGlmKGlzTGVnYWxQYXRoKG5ld0hhc2gpKXtcblx0ICAgICAgICAgICAgaGFzaCA9IG5ld0hhc2hcblx0ICAgICAgICB9XG5cdCAgICAgICAgLy/kv53lrZjliLDmnKzlnLDlgqjlrZjmiJZjb29raWVcblx0ICAgICAgICBhdmFsb24ucm91dGVyLnNldExhc3RQYXRoKGhhc2gpXG5cdCAgICAgICAgLy8g5qih5byPMCwg5LiN5pS55Y+YVVJMLCDkuI3kuqfnlJ/ljoblj7Llrp7kvZMsIOaJp+ihjOWbnuiwg1xuXHQgICAgICAgIC8vIOaooeW8jzEsIOaUueWPmFVSTCwg5LiN5Lqn55Sf5Y6G5Y+y5a6e5L2TLCAgIOaJp+ihjOWbnuiwg1xuXHQgICAgICAgIC8vIOaooeW8jzIsIOaUueWPmFVSTCwg5Lqn55Sf5Y6G5Y+y5a6e5L2TLCAgICDmiafooYzlm57osINcblx0ICAgICAgICBpZiAobW9kZSA9PT0gMSkge1xuXHQgICAgICAgICAgXG5cdCAgICAgICAgICAgIGF2YWxvbi5oaXN0b3J5LnNldEhhc2goaGFzaCwgdHJ1ZSlcblx0ICAgICAgICB9IGVsc2UgaWYgKG1vZGUgPT09IDIpIHtcblx0ICAgICAgICAgICAgYXZhbG9uLmhpc3Rvcnkuc2V0SGFzaChoYXNoKVxuXHQgICAgICAgIH1cblx0ICAgICAgICByZXR1cm4gaGFzaFxuXHQgICAgfSxcblx0ICAgIC8qXG5cdCAgICAgKiAgQGludGVyZmFjZSBhdmFsb24ucm91dGVyLndoZW4g6YWN572u6YeN5a6a5ZCR6KeE5YiZXG5cdCAgICAgKiAgQHBhcmFtIHBhdGgg6KKr6YeN5a6a5ZCR55qE6KGo6L6+5byP77yM5Y+v5Lul5piv5a2X56ym5Liy5oiW6ICF5pWw57uEXG5cdCAgICAgKiAgQHBhcmFtIHJlZGlyZWN0IOmHjeWumuWQkeeahOihqOekuuW8j+aIluiAhXVybFxuXHQgICAgICovXG5cdCAgICB3aGVuOiBmdW5jdGlvbiAocGF0aCwgcmVkaXJlY3QpIHtcblx0ICAgICAgICB2YXIgbWUgPSB0aGlzLFxuXHQgICAgICAgICAgICAgICAgcGF0aCA9IHBhdGggaW5zdGFuY2VvZiBBcnJheSA/IHBhdGggOiBbcGF0aF1cblx0ICAgICAgICBhdmFsb24uZWFjaChwYXRoLCBmdW5jdGlvbiAoaW5kZXgsIHApIHtcblx0ICAgICAgICAgICAgbWUuYWRkKHAsIGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICAgICAgICAgIHZhciBpbmZvID0gbWUudXJsRm9ybWF0ZShyZWRpcmVjdCwgdGhpcy5wYXJhbXMsIHRoaXMucXVlcnkpXG5cdCAgICAgICAgICAgICAgICBtZS5uYXZpZ2F0ZShpbmZvLnBhdGggKyBpbmZvLnF1ZXJ5KVxuXHQgICAgICAgICAgICB9KVxuXHQgICAgICAgIH0pXG5cdCAgICAgICAgcmV0dXJuIHRoaXNcblx0ICAgIH0sXG5cdCAgICB1cmxGb3JtYXRlOiBmdW5jdGlvbiAodXJsLCBwYXJhbXMsIHF1ZXJ5KSB7XG5cdCAgICAgICAgdmFyIHF1ZXJ5ID0gcXVlcnkgPyBxdWVyeVRvU3RyaW5nKHF1ZXJ5KSA6IFwiXCIsXG5cdCAgICAgICAgICAgICAgICBoYXNoID0gdXJsLnJlcGxhY2UocGxhY2Vob2xkZXIsIGZ1bmN0aW9uIChtYXQpIHtcblx0ICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbWF0LnJlcGxhY2UoL1tcXHtcXH1dL2csICcnKS5zcGxpdChcIjpcIilcblx0ICAgICAgICAgICAgICAgICAgICBrZXkgPSBrZXlbMF0gPyBrZXlbMF0gOiBrZXlbMV1cblx0ICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyYW1zW2tleV0gIT09IHVuZGVmaW5lZCA/IHBhcmFtc1trZXldIDogJydcblx0ICAgICAgICAgICAgICAgIH0pLnJlcGxhY2UoL15cXC8vZywgJycpXG5cdCAgICAgICAgcmV0dXJuIHtcblx0ICAgICAgICAgICAgcGF0aDogaGFzaCxcblx0ICAgICAgICAgICAgcXVlcnk6IHF1ZXJ5XG5cdCAgICAgICAgfVxuXHQgICAgfSxcblx0ICAgIC8qICpcblx0ICAgICBgJy9oZWxsby8nYCAtIOWMuemFjScvaGVsbG8vJ+aIlicvaGVsbG8nXG5cdCAgICAgYCcvdXNlci86aWQnYCAtIOWMuemFjSAnL3VzZXIvYm9iJyDmiJYgJy91c2VyLzEyMzQhISEnIOaIliAnL3VzZXIvJyDkvYbkuI3ljLnphY0gJy91c2VyJyDkuI4gJy91c2VyL2JvYi9kZXRhaWxzJ1xuXHQgICAgIGAnL3VzZXIve2lkfSdgIC0g5ZCM5LiKXG5cdCAgICAgYCcvdXNlci97aWQ6W14vXSp9J2AgLSDlkIzkuIpcblx0ICAgICBgJy91c2VyL3tpZDpbMC05YS1mQS1GXXsxLDh9fSdgIC0g6KaB5rGCSUTljLnphY0vWzAtOWEtZkEtRl17MSw4fS/ov5nkuKrlrZDmraPliJlcblx0ICAgICBgJy9maWxlcy97cGF0aDouKn0nYCAtIE1hdGNoZXMgYW55IFVSTCBzdGFydGluZyB3aXRoICcvZmlsZXMvJyBhbmQgY2FwdHVyZXMgdGhlIHJlc3Qgb2YgdGhlXG5cdCAgICAgcGF0aCBpbnRvIHRoZSBwYXJhbWV0ZXIgJ3BhdGgnLlxuXHQgICAgIGAnL2ZpbGVzLypwYXRoJ2AgLSBkaXR0by5cblx0ICAgICAqL1xuXHQgICAgLy8gYXZhbG9uLnJvdXRlci5nZXQoXCIvZGRkLzpkZGRJRC9cIixjYWxsYmFjaylcblx0ICAgIC8vIGF2YWxvbi5yb3V0ZXIuZ2V0KFwiL2RkZC97ZGRkSUR9L1wiLGNhbGxiYWNrKVxuXHQgICAgLy8gYXZhbG9uLnJvdXRlci5nZXQoXCIvZGRkL3tkZGRJRDpbMC05XXs0fX0vXCIsY2FsbGJhY2spXG5cdCAgICAvLyBhdmFsb24ucm91dGVyLmdldChcIi9kZGQve2RkZElEOmludH0vXCIsY2FsbGJhY2spXG5cdCAgICAvLyDmiJHku6znlJroh7Plj6/ku6XlnKjov5nph4zmt7vliqDmlrDnmoTnsbvlnovvvIxhdmFsb24ucm91dGVyLiR0eXBlLmQ0ID0geyBwYXR0ZXJuOiAnWzAtOV17NH0nLCBkZWNvZGU6IE51bWJlcn1cblx0ICAgIC8vIGF2YWxvbi5yb3V0ZXIuZ2V0KFwiL2RkZC97ZGRkSUQ6ZDR9L1wiLGNhbGxiYWNrKVxuXHQgICAgJHR5cGVzOiB7XG5cdCAgICAgICAgZGF0ZToge1xuXHQgICAgICAgICAgICBwYXR0ZXJuOiBcIlswLTldezR9LSg/OjBbMS05XXwxWzAtMl0pLSg/OjBbMS05XXxbMS0yXVswLTldfDNbMC0xXSlcIixcblx0ICAgICAgICAgICAgZGVjb2RlOiBmdW5jdGlvbiAodmFsKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUodmFsLnJlcGxhY2UoL1xcLS9nLCBcIi9cIikpXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXHQgICAgICAgIHN0cmluZzoge1xuXHQgICAgICAgICAgICBwYXR0ZXJuOiBcIlteXFxcXC9dKlwiLFxuXHQgICAgICAgICAgICBkZWNvZGU6IGZ1bmN0aW9uICh2YWwpIHtcblx0ICAgICAgICAgICAgICAgIHJldHVybiB2YWw7XG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9LFxuXHQgICAgICAgIGJvb2w6IHtcblx0ICAgICAgICAgICAgZGVjb2RlOiBmdW5jdGlvbiAodmFsKSB7XG5cdCAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCkgPT09IDAgPyBmYWxzZSA6IHRydWU7XG5cdCAgICAgICAgICAgIH0sXG5cdCAgICAgICAgICAgIHBhdHRlcm46IFwiMHwxXCJcblx0ICAgICAgICB9LFxuXHQgICAgICAgICdpbnQnOiB7XG5cdCAgICAgICAgICAgIGRlY29kZTogZnVuY3Rpb24gKHZhbCkge1xuXHQgICAgICAgICAgICAgICAgcmV0dXJuIHBhcnNlSW50KHZhbCwgMTApO1xuXHQgICAgICAgICAgICB9LFxuXHQgICAgICAgICAgICBwYXR0ZXJuOiBcIlxcXFxkK1wiXG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHR9KVxuXG5cblx0bW9kdWxlLmV4cG9ydHMgPSBhdmFsb24ucm91dGVyID0gbmV3IFJvdXRlclxuXG5cblx0ZnVuY3Rpb24gcGFyc2VRdWVyeSh1cmwpIHtcblx0ICAgIHZhciBhcnJheSA9IHVybC5zcGxpdChcIj9cIiksIHF1ZXJ5ID0ge30sIHBhdGggPSBhcnJheVswXSwgcXVlcnlzdHJpbmcgPSBhcnJheVsxXVxuXHQgICAgaWYgKHF1ZXJ5c3RyaW5nKSB7XG5cdCAgICAgICAgdmFyIHNlZyA9IHF1ZXJ5c3RyaW5nLnNwbGl0KFwiJlwiKSxcblx0ICAgICAgICAgICAgICAgIGxlbiA9IHNlZy5sZW5ndGgsIGkgPSAwLCBzO1xuXHQgICAgICAgIGZvciAoOyBpIDwgbGVuOyBpKyspIHtcblx0ICAgICAgICAgICAgaWYgKCFzZWdbaV0pIHtcblx0ICAgICAgICAgICAgICAgIGNvbnRpbnVlXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgcyA9IHNlZ1tpXS5zcGxpdChcIj1cIilcblx0ICAgICAgICAgICAgcXVlcnlbZGVjb2RlVVJJQ29tcG9uZW50KHNbMF0pXSA9IGRlY29kZVVSSUNvbXBvbmVudChzWzFdKVxuXHQgICAgICAgIH1cblx0ICAgIH1cblx0ICAgIHJldHVybiB7XG5cdCAgICAgICAgcGF0aDogcGF0aCxcblx0ICAgICAgICBxdWVyeTogcXVlcnlcblx0ICAgIH1cblx0fVxuXHRmdW5jdGlvbiBpc0xlZ2FsUGF0aChwYXRoKXtcblx0ICAgIGlmKHBhdGggPT09ICcvJylcblx0ICAgICAgICByZXR1cm4gdHJ1ZVxuXHQgICAgaWYodHlwZW9mIHBhdGggPT09ICdzdHJpbmcnICYmIHBhdGgubGVuZ3RoID4gMSAmJiBwYXRoLmNoYXJBdCgwKSA9PT0gJy8nKXtcblx0ICAgICAgICByZXR1cm4gdHJ1ZVxuXHQgICAgfVxuXHR9XG5cblx0ZnVuY3Rpb24gcXVlcnlUb1N0cmluZyhvYmopIHtcblx0ICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJylcblx0ICAgICAgICByZXR1cm4gb2JqXG5cdCAgICB2YXIgc3RyID0gW11cblx0ICAgIGZvciAodmFyIGkgaW4gb2JqKSB7XG5cdCAgICAgICAgaWYgKGkgPT09IFwicXVlcnlcIilcblx0ICAgICAgICAgICAgY29udGludWVcblx0ICAgICAgICBzdHIucHVzaChpICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtpXSkpXG5cdCAgICB9XG5cdCAgICByZXR1cm4gc3RyLmxlbmd0aCA/ICc/JyArIHN0ci5qb2luKFwiJlwiKSA6ICcnXG5cdH1cblxuXG5cdGZ1bmN0aW9uIHF1b3RlUmVnRXhwKHN0cmluZywgcGF0dGVybiwgaXNPcHRpb25hbCkge1xuXHQgICAgdmFyIHJlc3VsdCA9IHN0cmluZy5yZXBsYWNlKC9bXFxcXFxcW1xcXVxcXiQqKz8uKCl8e31dL2csIFwiXFxcXCQmXCIpO1xuXHQgICAgaWYgKCFwYXR0ZXJuKVxuXHQgICAgICAgIHJldHVybiByZXN1bHQ7XG5cdCAgICB2YXIgZmxhZyA9IGlzT3B0aW9uYWwgPyAnPycgOiAnJztcblx0ICAgIHJldHVybiByZXN1bHQgKyBmbGFnICsgJygnICsgcGF0dGVybiArICcpJyArIGZsYWc7XG5cdH1cblxuXG4vKioqLyB9LFxuLyogMSAqLyxcbi8qIDIgKi8sXG4vKiAzICovLFxuLyogNCAqLyxcbi8qIDUgKi8sXG4vKiA2ICovXG4vKioqLyBmdW5jdGlvbihtb2R1bGUsIGV4cG9ydHMpIHtcblxuXHQvKiFcblx0ICogbW1IaXN0b3J5XG5cdCAqIOeUqOS6juebkeWQrOWcsOWdgOagj+eahOWPmOWMllxuXHQgKiBodHRwczovL2dpdGh1Yi5jb20vZmxhdGlyb24vZGlyZWN0b3IvYmxvYi9tYXN0ZXIvbGliL2RpcmVjdG9yL2Jyb3dzZXIuanNcblx0ICogaHR0cHM6Ly9naXRodWIuY29tL3Zpc2lvbm1lZGlhL3BhZ2UuanMvYmxvYi9tYXN0ZXIvcGFnZS5qc1xuXHQgKi9cblxuXHR2YXIgbG9jYXRpb24gPSBkb2N1bWVudC5sb2NhdGlvblxuXHR2YXIgb2xkSUUgPSBhdmFsb24ubXNpZSA8PSA3XG5cdHZhciBzdXBwb3J0UHVzaFN0YXRlID0gISEod2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKVxuXHR2YXIgc3VwcG9ydEhhc2hDaGFuZ2UgPSAhIShcIm9uaGFzaGNoYW5nZVwiIGluIHdpbmRvdyAmJiAoIXdpbmRvdy5WQkFycmF5IHx8ICFvbGRJRSkpXG5cdHZhciBkZWZhdWx0cyA9IHtcblx0ICAgIHJvb3Q6IFwiL1wiLFxuXHQgICAgaHRtbDU6IGZhbHNlLFxuXHQgICAgaGFzaFByZWZpeDogXCIhXCIsXG5cdCAgICBpZnJhbWVJRDogbnVsbCwgLy9JRTYtN++8jOWmguaenOacieWcqOmhtemdouWGmeatu+S6huS4gOS4qmlmcmFtZe+8jOi/meagt+S8vOS5juWIt+aWsOeahOaXtuWAmeS4jeS8muS4ouaOieS5i+WJjeeahOWOhuWPslxuXHQgICAgaW50ZXJ2YWw6IDUwLCAvL0lFNi03LOS9v+eUqOi9ruivou+8jOi/meaYr+WFtuaXtumXtOaXtumalCxcblx0ICAgIGF1dG9TY3JvbGw6IGZhbHNlXG5cdH1cblx0dmFyIG1tSGlzdG9yeSA9IHtcblx0ICAgIGhhc2g6IGdldEhhc2gobG9jYXRpb24uaHJlZiksXG5cdCAgICBjaGVjazogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgdmFyIGggPSBnZXRIYXNoKGxvY2F0aW9uLmhyZWYpXG5cdCAgICAgICAgaWYgKGggIT09IHRoaXMuaGFzaCkge1xuXHQgICAgICAgICAgICB0aGlzLmhhc2ggPSBoXG5cdCAgICAgICAgICAgIHRoaXMub25IYXNoQ2hhbmdlZCgpXG5cdCAgICAgICAgfVxuXHQgICAgfSxcblx0ICAgIHN0YXJ0OiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdCAgICAgICAgaWYgKHRoaXMuc3RhcnRlZClcblx0ICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhdmFsb24uaGlzdG9yeSBoYXMgYWxyZWFkeSBiZWVuIHN0YXJ0ZWQnKVxuXHQgICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWVcblx0ICAgICAgICAgICAgLy/nm5HlkKzmqKHlvI9cblx0ICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJykge1xuXHQgICAgICAgICAgICBvcHRpb25zID0ge1xuXHQgICAgICAgICAgICAgICAgaHRtbDU6IG9wdGlvbnNcblx0ICAgICAgICAgICAgfVxuXHQgICAgICAgIH1cblxuXHQgICAgICAgIG9wdGlvbnMgPSBhdmFsb24ubWl4KHt9LCBkZWZhdWx0cywgb3B0aW9ucyB8fCB7fSlcblx0ICAgICAgICBpZiAob3B0aW9ucy5maXJlQW5jaG9yKSB7XG5cdCAgICAgICAgICAgIG9wdGlvbnMuYXV0b1Njcm9sbCA9IHRydWVcblx0ICAgICAgICB9XG5cdCAgICAgICAgdmFyIHJvb3RQYXRoID0gb3B0aW9ucy5yb290XG5cdCAgICAgICAgaWYgKCEvXlxcLy8udGVzdChyb290UGF0aCkpIHtcblx0ICAgICAgICAgICAgYXZhbG9uLmVycm9yKCdyb2906YWN572u6aG55b+F6aG75LulL+Wtl+espuW8gOWniywg5Lul6Z2eL+Wtl+espue7k+adnycpXG5cdCAgICAgICAgfVxuXHQgICAgICAgIGlmIChyb290UGF0aC5sZW5ndGggPiAxKSB7XG5cdCAgICAgICAgICAgIG9wdGlvbnMucm9vdCA9IHJvb3RQYXRoLnJlcGxhY2UoL1xcLyQvLCAnJylcblx0ICAgICAgICB9XG5cdCAgICAgICAgdmFyIGh0bWw1TW9kZSA9IG9wdGlvbnMuaHRtbDVcblx0ICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zXG5cdCAgICAgICAgdGhpcy5tb2RlID0gaHRtbDVNb2RlID8gXCJwb3BzdGF0ZVwiIDogXCJoYXNoY2hhbmdlXCJcblx0ICAgICAgICBpZiAoIXN1cHBvcnRQdXNoU3RhdGUpIHtcblx0ICAgICAgICAgICAgaWYgKGh0bWw1TW9kZSkge1xuXHQgICAgICAgICAgICAgICAgYXZhbG9uLndhcm4oXCLmtY/op4jlmajkuI3mlK/mjIFIVE1MNSBwdXNoU3RhdGXvvIzlubPnqLPpgIDljJbliLBvbmhhc2hjaGFuZ2UhXCIpXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgdGhpcy5tb2RlID0gXCJoYXNoY2hhbmdlXCJcblx0ICAgICAgICB9XG5cdCAgICAgICAgaWYgKCFzdXBwb3J0SGFzaENoYW5nZSkge1xuXHQgICAgICAgICAgICB0aGlzLm1vZGUgPSBcImlmcmFtZXBvbGxcIlxuXHQgICAgICAgIH1cblx0ICAgICAgICBhdmFsb24ubG9nKCdhdmFsb24gcnVuIG1tSGlzdG9yeSBpbiB0aGUgJywgdGhpcy5tb2RlLCAnbW9kZScpXG5cdCAgICAgICAgICAgIC8vIOaUr+aMgXBvcHN0YXRlIOWwseebkeWQrHBvcHN0YXRlXG5cdCAgICAgICAgICAgIC8vIOaUr+aMgWhhc2hjaGFuZ2Ug5bCx55uR5ZCsaGFzaGNoYW5nZShJRTgsSUU5LEZGMylcblx0ICAgICAgICAgICAgLy8g5ZCm5YiZ55qE6K+d5Y+q6IO95q+P6ZqU5LiA5q615pe26Ze06L+b6KGM5qOA5rWL5LqGKElFNiwgSUU3KVxuXHQgICAgICAgIHN3aXRjaCAodGhpcy5tb2RlKSB7XG5cdCAgICAgICAgICAgIGNhc2UgXCJwb3BzdGF0ZVwiOlxuXHQgICAgICAgICAgICAgICAgLy8gQXQgbGVhc3QgZm9yIG5vdyBIVE1MNSBoaXN0b3J5IGlzIGF2YWlsYWJsZSBmb3IgJ21vZGVybicgYnJvd3NlcnMgb25seVxuXHQgICAgICAgICAgICAgICAgLy8gVGhlcmUgaXMgYW4gb2xkIGJ1ZyBpbiBDaHJvbWUgdGhhdCBjYXVzZXMgb25wb3BzdGF0ZSB0byBmaXJlIGV2ZW5cblx0ICAgICAgICAgICAgICAgIC8vIHVwb24gaW5pdGlhbCBwYWdlIGxvYWQuIFNpbmNlIHRoZSBoYW5kbGVyIGlzIHJ1biBtYW51YWxseSBpbiBpbml0KCksXG5cdCAgICAgICAgICAgICAgICAvLyB0aGlzIHdvdWxkIGNhdXNlIENocm9tZSB0byBydW4gaXQgdHdpc2UuIEN1cnJlbnRseSB0aGUgb25seVxuXHQgICAgICAgICAgICAgICAgLy8gd29ya2Fyb3VuZCBzZWVtcyB0byBiZSB0byBzZXQgdGhlIGhhbmRsZXIgYWZ0ZXIgdGhlIGluaXRpYWwgcGFnZSBsb2FkXG5cdCAgICAgICAgICAgICAgICAvLyBodHRwOi8vY29kZS5nb29nbGUuY29tL3AvY2hyb21pdW0vaXNzdWVzL2RldGFpbD9pZD02MzA0MFxuXHQgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0ICAgICAgICAgICAgICAgICAgICB3aW5kb3cub25wb3BzdGF0ZSA9IG1tSGlzdG9yeS5vbkhhc2hDaGFuZ2VkXG5cdCAgICAgICAgICAgICAgICB9LCA1MDApXG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgICAgICBjYXNlIFwiaGFzaGNoYW5nZVwiOlxuXHQgICAgICAgICAgICAgICAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IG1tSGlzdG9yeS5vbkhhc2hDaGFuZ2VkXG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgICAgICBjYXNlIFwiaWZyYW1lcG9sbFwiOlxuXHQgICAgICAgICAgICAgICAgLy/kuZ/mnInkurrov5nmoLfnjqkgaHR0cDovL3d3dy5jbmJsb2dzLmNvbS9tZXRlb3JpY19jcnkvYXJjaGl2ZS8yMDExLzAxLzExLzE5MzMxNjQuaHRtbFxuXHQgICAgICAgICAgICAgICAgYXZhbG9uLnJlYWR5KGZ1bmN0aW9uKCkge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKVxuXHQgICAgICAgICAgICAgICAgICAgIGlmcmFtZS5pZCA9IG9wdGlvbnMuaWZyYW1lSURcblx0ICAgICAgICAgICAgICAgICAgICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJ1xuXHQgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoaWZyYW1lKVxuXHQgICAgICAgICAgICAgICAgICAgIG1tSGlzdG9yeS5pZnJhbWUgPSBpZnJhbWVcblx0ICAgICAgICAgICAgICAgICAgICBtbUhpc3Rvcnkud3JpdGVGcmFtZSgnJylcblx0ICAgICAgICAgICAgICAgICAgICBpZiAoYXZhbG9uLm1zaWUpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gb25Qcm9wZXJ0eUNoYW5nZSgpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChldmVudC5wcm9wZXJ0eU5hbWUgPT09ICdsb2NhdGlvbicpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtbUhpc3RvcnkuY2hlY2soKVxuXHQgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXHQgICAgICAgICAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmF0dGFjaEV2ZW50KCdvbnByb3BlcnR5Y2hhbmdlJywgb25Qcm9wZXJ0eUNoYW5nZSlcblx0ICAgICAgICAgICAgICAgICAgICAgICAgbW1IaXN0b3J5Lm9uUHJvcGVydHlDaGFuZ2UgPSBvblByb3BlcnR5Q2hhbmdlXG5cdCAgICAgICAgICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgICAgICAgICAgbW1IaXN0b3J5LmludGVydmFsSUQgPSB3aW5kb3cuc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgICAgIG1tSGlzdG9yeS5jaGVjaygpXG5cdCAgICAgICAgICAgICAgICAgICAgfSwgb3B0aW9ucy5pbnRlcnZhbClcblxuXHQgICAgICAgICAgICAgICAgfSlcblx0ICAgICAgICAgICAgICAgIGJyZWFrXG5cdCAgICAgICAgfVxuXHQgICAgICAgIC8v6aG16Z2i5Yqg6L295pe26Kem5Y+Rb25IYXNoQ2hhbmdlZFxuXHQgICAgICAgIHRoaXMub25IYXNoQ2hhbmdlZCgpXG5cdCAgICB9LFxuXHQgICAgc3RvcDogZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcblx0ICAgICAgICAgICAgY2FzZSBcInBvcHN0YXRlXCI6XG5cdCAgICAgICAgICAgICAgICB3aW5kb3cub25wb3BzdGF0ZSA9IGF2YWxvbi5ub29wXG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgICAgICBjYXNlIFwiaGFzaGNoYW5nZVwiOlxuXHQgICAgICAgICAgICAgICAgd2luZG93Lm9uaGFzaGNoYW5nZSA9IGF2YWxvbi5ub29wXG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgICAgICBjYXNlIFwiaWZyYW1lcG9sbFwiOlxuXHQgICAgICAgICAgICAgICAgaWYgKHRoaXMuaWZyYW1lKSB7XG5cdCAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmlmcmFtZSlcblx0ICAgICAgICAgICAgICAgICAgICB0aGlzLmlmcmFtZSA9IG51bGxcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIGlmICh0aGlzLm9uUHJvcGVydHlDaGFuZ2UpIHtcblx0ICAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5kZXRhY2hFdmVudCgnb25wcm9wZXJ0eWNoYW5nZScsIHRoaXMub25Qcm9wZXJ0eUNoYW5nZSlcblx0ICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElEKVxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICB9XG5cdCAgICAgICAgdGhpcy5zdGFydGVkID0gZmFsc2Vcblx0ICAgIH0sXG5cdCAgICBzZXRIYXNoOiBmdW5jdGlvbihzLCByZXBsYWNlKSB7XG5cdCAgICAgICAgc3dpdGNoICh0aGlzLm1vZGUpIHtcblx0ICAgICAgICAgICAgY2FzZSAnaWZyYW1lcG9sbCc6XG5cdCAgICAgICAgICAgICAgICBpZiAocmVwbGFjZSkge1xuXHQgICAgICAgICAgICAgICAgICAgIHZhciBpZnJhbWUgPSB0aGlzLmlmcmFtZVxuXHQgICAgICAgICAgICAgICAgICAgIGlmIChpZnJhbWUpIHtcblx0ICAgICAgICAgICAgICAgICAgICAgICAgLy9jb250ZW50V2luZG93IOWFvOWuueWQhOS4qua1j+iniOWZqO+8jOWPr+WPluW+l+WtkOeql+WPo+eahCB3aW5kb3cg5a+56LGh44CCXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIC8vY29udGVudERvY3VtZW50IEZpcmVmb3gg5pSv5oyB77yMPiBpZTgg55qEaWXmlK/mjIHjgILlj6/lj5blvpflrZDnqpflj6PnmoQgZG9jdW1lbnQg5a+56LGh44CCXG5cdCAgICAgICAgICAgICAgICAgICAgICAgIGlmcmFtZS5jb250ZW50V2luZG93Ll9oYXNoID0gc1xuXHQgICAgICAgICAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cdCAgICAgICAgICAgICAgICAgICAgdGhpcy53cml0ZUZyYW1lKHMpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgICAgICBjYXNlICdwb3BzdGF0ZSc6XG5cdCAgICAgICAgICAgICAgICB2YXIgcGF0aCA9ICh0aGlzLm9wdGlvbnMucm9vdCArICcvJyArIHMpLnJlcGxhY2UoL1xcLysvZywgJy8nKVxuXHQgICAgICAgICAgICAgICAgdmFyIG1ldGhvZCA9IHJlcGxhY2UgPyAncmVwbGFjZVN0YXRlJyA6ICdwdXNoU3RhdGUnXG5cdCAgICAgICAgICAgICAgICBoaXN0b3J5W21ldGhvZF0oe30sIGRvY3VtZW50LnRpdGxlLCBwYXRoKVxuXHQgICAgICAgICAgICAgICAgICAgIC8vIOaJi+WKqOinpuWPkW9ucG9wc3RhdGUgZXZlbnRcblx0ICAgICAgICAgICAgICAgIHRoaXMub25IYXNoQ2hhbmdlZCgpXG5cdCAgICAgICAgICAgICAgICBicmVha1xuXHQgICAgICAgICAgICBkZWZhdWx0OlxuXHQgICAgICAgICAgICAgICAgLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzkyMzUzMDQvaG93LXRvLXJlcGxhY2UtdGhlLWxvY2F0aW9uLWhhc2gtYW5kLW9ubHkta2VlcC10aGUtbGFzdC1oaXN0b3J5LWVudHJ5XG5cdCAgICAgICAgICAgICAgICB2YXIgbmV3SGFzaCA9IHRoaXMub3B0aW9ucy5oYXNoUHJlZml4ICsgc1xuXHQgICAgICAgICAgICAgICAgaWYgKHJlcGxhY2UgJiYgbG9jYXRpb24uaGFzaCAhPT0gbmV3SGFzaCkge1xuXHQgICAgICAgICAgICAgICAgICAgIGhpc3RvcnkuYmFjaygpXG5cdCAgICAgICAgICAgICAgICB9XG5cdCAgICAgICAgICAgICAgICBsb2NhdGlvbi5oYXNoID0gbmV3SGFzaFxuXHQgICAgICAgICAgICAgICAgYnJlYWtcblx0ICAgICAgICB9XG5cdCAgICB9LFxuXHQgICAgd3JpdGVGcmFtZTogZnVuY3Rpb24ocykge1xuXHQgICAgICAgIC8vIElFIHN1cHBvcnQuLi5cblx0ICAgICAgICB2YXIgZiA9IG1tSGlzdG9yeS5pZnJhbWVcblx0ICAgICAgICB2YXIgZCA9IGYuY29udGVudERvY3VtZW50IHx8IGYuY29udGVudFdpbmRvdy5kb2N1bWVudFxuXHQgICAgICAgIGQub3BlbigpXG5cdCAgICAgICAgdmFyIGVuZCA9XCIvc2NyaXB0XCJcblx0ICAgICAgICBkLndyaXRlKFwiPHNjcmlwdD5faGFzaCA9ICdcIiArIHMgKyBcIic7IG9ubG9hZCA9IHBhcmVudC5hdmFsb24uaGlzdG9yeS5zeW5jSGFzaDs8XCIrZW5kK1wiPlwiKVxuXHQgICAgICAgIGQuY2xvc2UoKVxuXHQgICAgfSxcblx0ICAgIHN5bmNIYXNoOiBmdW5jdGlvbigpIHtcblx0ICAgICAgICAvLyBJRSBzdXBwb3J0Li4uXG5cdCAgICAgICAgdmFyIHMgPSB0aGlzLl9oYXNoXG5cdCAgICAgICAgaWYgKHMgIT09IGdldEhhc2gobG9jYXRpb24uaHJlZikpIHtcblx0ICAgICAgICAgICAgbG9jYXRpb24uaGFzaCA9IHNcblx0ICAgICAgICB9XG5cdCAgICAgICAgcmV0dXJuIHRoaXNcblx0ICAgIH0sXG5cblx0ICAgIGdldFBhdGg6IGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIHZhciBwYXRoID0gbG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSh0aGlzLm9wdGlvbnMucm9vdCwgJycpXG5cdCAgICAgICAgaWYgKHBhdGguY2hhckF0KDApICE9PSAnLycpIHtcblx0ICAgICAgICAgICAgcGF0aCA9ICcvJyArIHBhdGhcblx0ICAgICAgICB9XG5cdCAgICAgICAgcmV0dXJuIHBhdGhcblx0ICAgIH0sXG5cdCAgICBvbkhhc2hDaGFuZ2VkOiBmdW5jdGlvbihoYXNoLCBjbGlja01vZGUpIHtcblx0ICAgICAgICBpZiAoIWNsaWNrTW9kZSkge1xuXHQgICAgICAgICAgICBoYXNoID0gbW1IaXN0b3J5Lm1vZGUgPT09ICdwb3BzdGF0ZScgPyBtbUhpc3RvcnkuZ2V0UGF0aCgpIDpcblx0ICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYucmVwbGFjZSgvLiojIT8vLCAnJylcblx0ICAgICAgICB9XG5cdCAgICAgICAgaGFzaCA9IGRlY29kZVVSSUNvbXBvbmVudChoYXNoKVxuXHQgICAgICAgIGhhc2ggPSBoYXNoLmNoYXJBdCgwKSA9PT0gJy8nID8gaGFzaCA6ICcvJyArIGhhc2hcblx0ICAgICAgICBpZiAoaGFzaCAhPT0gbW1IaXN0b3J5Lmhhc2gpIHtcblx0ICAgICAgICAgICAgbW1IaXN0b3J5Lmhhc2ggPSBoYXNoXG5cblx0ICAgICAgICAgICAgaWYgKGF2YWxvbi5yb3V0ZXIpIHsgLy/ljbNtbVJvdXRlclxuXHQgICAgICAgICAgICAgICAgaGFzaCA9IGF2YWxvbi5yb3V0ZXIubmF2aWdhdGUoaGFzaCwgMClcblx0ICAgICAgICAgICAgfVxuXG5cdCAgICAgICAgICAgIGlmIChjbGlja01vZGUpIHtcblx0ICAgICAgICAgICAgICAgIG1tSGlzdG9yeS5zZXRIYXNoKGhhc2gpXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICAgICAgaWYgKGNsaWNrTW9kZSAmJiBtbUhpc3Rvcnkub3B0aW9ucy5hdXRvU2Nyb2xsKSB7XG5cdCAgICAgICAgICAgICAgICBhdXRvU2Nyb2xsKGhhc2guc2xpY2UoMSkpXG5cdCAgICAgICAgICAgIH1cblx0ICAgICAgICB9XG5cblx0ICAgIH1cblx0fVxuXG5cdGZ1bmN0aW9uIGdldEhhc2gocGF0aCkge1xuXHQgICAgLy8gSUU255u05o6l55SobG9jYXRpb24uaGFzaOWPlmhhc2jvvIzlj6/og73kvJrlj5blsJHkuIDpg6jliIblhoXlrrlcblx0ICAgIC8vIOavlOWmgiBodHRwOi8vd3d3LmNuYmxvZ3MuY29tL3J1Ynlsb3V2cmUjc3RyZWFtL3h4eHh4P2xhbmc9emhfY1xuXHQgICAgLy8gaWU2ID0+IGxvY2F0aW9uLmhhc2ggPSAjc3RyZWFtL3h4eHh4XG5cdCAgICAvLyDlhbbku5bmtY/op4jlmaggPT4gbG9jYXRpb24uaGFzaCA9ICNzdHJlYW0veHh4eHg/bGFuZz16aF9jXG5cdCAgICAvLyBmaXJlZm94IOS8muiHquS9nOWkmuaDheWvuWhhc2jov5vooYxkZWNvZGVVUklDb21wb25lbnRcblx0ICAgIC8vIOWPiOavlOWmgiBodHRwOi8vd3d3LmNuYmxvZ3MuY29tL3J1Ynlsb3V2cmUvIyEvaG9tZS9xPXslMjJ0aGVkYXRlJTIyOiUyMjIwMTIxMDEwfjIwMTIxMDEwJTIyfVxuXHQgICAgLy8gZmlyZWZveCAxNSA9PiAjIS9ob21lL3E9e1widGhlZGF0ZVwiOlwiMjAxMjEwMTB+MjAxMjEwMTBcIn1cblx0ICAgIC8vIOWFtuS7lua1j+iniOWZqCA9PiAjIS9ob21lL3E9eyUyMnRoZWRhdGUlMjI6JTIyMjAxMjEwMTB+MjAxMjEwMTAlMjJ9XG5cdCAgICB2YXIgaW5kZXggPSBwYXRoLmluZGV4T2YoXCIjXCIpXG5cdCAgICBpZiAoaW5kZXggPT09IC0xKSB7XG5cdCAgICAgICAgcmV0dXJuICcnXG5cdCAgICB9XG5cdCAgICByZXR1cm4gZGVjb2RlVVJJKHBhdGguc2xpY2UoaW5kZXgpKVxuXHR9XG5cblxuXG5cdC8v5Yqr5oyB6aG16Z2i5LiK5omA5pyJ54K55Ye75LqL5Lu277yM5aaC5p6c5LqL5Lu25rqQ5p2l6Ieq6ZO+5o6l5oiW5YW25YaF6YOo77yMXG5cdC8v5bm25LiU5a6D5LiN5Lya6Lez5Ye65pys6aG177yM5bm25LiU5LulXCIjL1wi5oiWXCIjIS9cIuW8gOWktO+8jOmCo+S5iOinpuWPkXVwZGF0ZUxvY2F0aW9u5pa55rOVXG5cdGF2YWxvbi5iaW5kKGRvY3VtZW50LCBcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcblx0ICAgIC8vaHR0cHM6Ly9naXRodWIuY29tL2FzdWFsL2pxdWVyeS1hZGRyZXNzL2Jsb2IvbWFzdGVyL3NyYy9qcXVlcnkuYWRkcmVzcy5qc1xuXHQgICAgLy9odHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvbWFzdGVyL3NyYy9uZy9sb2NhdGlvbi5qc1xuXHQgICAgLy/kuIvpnaLljYHnp43mg4XlhrXlsIbpmLvmraLov5vlhaXot6/nlLHns7vliJdcblx0ICAgIC8vMS4g6Lev55Sx5Zmo5rKh5pyJ5ZCv5YqoXG5cdCAgICBpZiAoIW1tSGlzdG9yeS5zdGFydGVkKSB7XG5cdCAgICAgICAgcmV0dXJuXG5cdCAgICB9XG5cdCAgICAvLzIuIOS4jeaYr+W3pumUrueCueWHu+aIluS9v+eUqOe7hOWQiOmUrlxuXHQgICAgaWYgKGUuY3RybEtleSB8fCBlLm1ldGFLZXkgfHwgZS5zaGlmdEtleSB8fCBlLndoaWNoID09PSAyICkge1xuXHQgICAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgLy8zLiDmraTkuovku7blt7Lnu4/ooqvpmLvmraJcblx0ICAgIGlmIChlLnJldHVyblZhbHVlID09PSBmYWxzZSkge1xuXHQgICAgICAgIHJldHVyblxuXHQgICAgfVxuXHQgICAgLy80LiDnm67moIflhYPntKDkuI1B5qCH562+LOaIluS4jeWcqEHmoIfnrb7kuYvlhoVcblx0ICAgIHZhciBlbCA9IGUucGF0aCA/IGUucGF0aFswXSA6IChlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQgfHwge30pXG5cdCAgICB3aGlsZSAoZWwubm9kZU5hbWUgIT09IFwiQVwiKSB7XG5cdCAgICAgICAgZWwgPSBlbC5wYXJlbnROb2RlXG5cdCAgICAgICAgaWYgKCFlbCB8fCBlbC50YWdOYW1lID09PSBcIkJPRFlcIikge1xuXHQgICAgICAgICAgICByZXR1cm5cblx0ICAgICAgICB9XG5cdCAgICB9XG5cdCAgICAvLzUuIOayoeacieWumuS5iWhyZWblsZ7mgKfmiJblnKhoYXNo5qih5byP5LiLLOWPquacieS4gOS4qiNcblx0ICAgIC8vSUU2Lzfnm7TmjqXnlKhnZXRBdHRyaWJ1dGXov5Tlm57lrozmlbTot6/lvoRcblx0ICAgIHZhciBocmVmID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJywgMikgfHwgZWwuZ2V0QXR0cmlidXRlKFwieGxpbms6aHJlZlwiKSB8fCAnJ1xuXHQgICAgaWYgKGhyZWYuc2xpY2UoMCwgMikgIT09ICcjIScpIHtcblx0ICAgICAgICByZXR1cm5cblx0ICAgIH1cblxuXHQgICAgLy82LiDnm67moIfpk77mjqXmmK/nlKjkuo7kuIvovb3otYTmupDmiJbmjIflkJHlpJbpg6hcblx0ICAgIGlmIChlbC5nZXRBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgIT0gbnVsbCB8fCBlbC5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnKVxuXHQgICAgICAgIHJldHVyblxuXG5cdCAgICAvLzcuIOWPquaYr+mCrueuseWcsOWdgFxuXHQgICAgaWYgKGhyZWYuaW5kZXhPZignbWFpbHRvOicpID4gLTEpIHtcblx0ICAgICAgICByZXR1cm5cblx0ICAgIH1cblx0ICAgIC8vOC4g55uu5qCH6ZO+5o6l6KaB5paw5byA56qX5Y+jXG5cdCAgICBpZiAoZWwudGFyZ2V0ICYmIGVsLnRhcmdldCAhPT0gJ19zZWxmJykge1xuXHQgICAgICAgIHJldHVyblxuXHQgICAgfVxuXG5cdCAgICBlLnByZXZlbnREZWZhdWx0KClcblx0ICAgICAgICAvL+e7iOS6jui+vuWIsOebrueahOWcsFxuXHQgICAgbW1IaXN0b3J5Lm9uSGFzaENoYW5nZWQoaHJlZi5yZXBsYWNlKCcjIScsICcnKSwgdHJ1ZSlcblxuXHR9KVxuXG5cdC8v5b6X5Yiw6aG16Z2i56ys5LiA5Liq56ym5ZCI5p2h5Lu255qEQeagh+etvlxuXHRmdW5jdGlvbiBnZXRGaXJzdEFuY2hvcihuYW1lKSB7XG5cdCAgICB2YXIgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdBJylcblx0ICAgIGZvciAodmFyIGkgPSAwLCBlbDsgZWwgPSBsaXN0W2krK107KSB7XG5cdCAgICAgICAgaWYgKGVsLm5hbWUgPT09IG5hbWUpIHtcblx0ICAgICAgICAgICAgcmV0dXJuIGVsXG5cdCAgICAgICAgfVxuXHQgICAgfVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0T2Zmc2V0KGVsZW0pIHtcblx0ICAgIHZhciBwb3NpdGlvbiA9IGF2YWxvbihlbGVtKS5jc3MoJ3Bvc2l0aW9uJyksXG5cdCAgICAgICAgb2Zmc2V0XG5cdCAgICBpZiAocG9zaXRpb24gIT09ICdmaXhlZCcpIHtcblx0ICAgICAgICBvZmZzZXQgPSAwXG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAgIG9mZnNldCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuYm90dG9tXG5cdCAgICB9XG5cblx0ICAgIHJldHVybiBvZmZzZXRcblx0fVxuXG5cdGZ1bmN0aW9uIGF1dG9TY3JvbGwoaGFzaCkge1xuXHQgICAgLy/lj5blvpfpobXpnaLmi6XmnInnm7jlkIxJROeahOWFg+e0oFxuXHQgICAgdmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChoYXNoKVxuXHQgICAgaWYgKCFlbGVtKSB7XG5cdCAgICAgICAgLy/lj5blvpfpobXpnaLmi6XmnInnm7jlkIxuYW1l55qEQeWFg+e0oFxuXHQgICAgICAgIGVsZW0gPSBnZXRGaXJzdEFuY2hvcihoYXNoKVxuXHQgICAgfVxuXHQgICAgaWYgKGVsZW0pIHtcblx0ICAgICAgICBlbGVtLnNjcm9sbEludG9WaWV3KClcblx0ICAgICAgICB2YXIgb2Zmc2V0ID0gZ2V0T2Zmc2V0KGVsZW0pXG5cdCAgICAgICAgaWYgKG9mZnNldCkge1xuXHQgICAgICAgICAgICB2YXIgZWxlbVRvcCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wXG5cdCAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeSgwLCBlbGVtVG9wIC0gb2Zmc2V0LnRvcClcblx0ICAgICAgICB9XG5cdCAgICB9IGVsc2Uge1xuXHQgICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLCAwKVxuXHQgICAgfVxuXHR9XG5cblxuXHRtb2R1bGUuZXhwb3J0cyA9IGF2YWxvbi5oaXN0b3J5ID0gbW1IaXN0b3J5XG5cblxuLyoqKi8gfSxcbi8qIDcgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdFxuXHRmdW5jdGlvbiBzdXBwb3J0TG9jYWxTdG9yYWdlKCkge1xuXHQgICAgdHJ5IHsvL+eci+aYr+WQpuaUr+aMgWxvY2FsU3RvcmFnZVxuXHQgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiYXZhbG9uXCIsIDEpXG5cdCAgICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJhdmFsb25cIilcblx0ICAgICAgICByZXR1cm4gdHJ1ZVxuXHQgICAgfSBjYXRjaCAoZSkge1xuXHQgICAgICAgIHJldHVybiBmYWxzZVxuXHQgICAgfVxuXHR9XG5cdGZ1bmN0aW9uIGVzY2FwZUNvb2tpZSh2YWx1ZSkge1xuXHQgICAgcmV0dXJuIFN0cmluZyh2YWx1ZSkucmVwbGFjZSgvWyw7XCJcXFxcPVxccyVdL2csIGZ1bmN0aW9uIChjaGFyYWN0ZXIpIHtcblx0ICAgICAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGNoYXJhY3Rlcilcblx0ICAgIH0pO1xuXHR9XG5cdHZhciByZXQgPSB7fVxuXHRpZiAoc3VwcG9ydExvY2FsU3RvcmFnZSgpKSB7XG5cdCAgICByZXQuZ2V0TGFzdFBhdGggPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAgICAgcmV0dXJuIGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdtc0xhc3RQYXRoJylcblx0ICAgIH1cblx0ICAgIHZhciBjb29raWVJRFxuXHQgICAgcmV0LnNldExhc3RQYXRoID0gZnVuY3Rpb24gKHBhdGgpIHtcblx0ICAgICAgICBpZiAoY29va2llSUQpIHtcblx0ICAgICAgICAgICAgY2xlYXJUaW1lb3V0KGNvb2tpZUlEKVxuXHQgICAgICAgICAgICBjb29raWVJRCA9IG51bGxcblx0ICAgICAgICB9XG5cdCAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJtc0xhc3RQYXRoXCIsIHBhdGgpXG5cdCAgICAgICAgY29va2llSUQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsvL+aooeaLn+i/h+acn+aXtumXtFxuXHQgICAgICAgICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZJdGVtKFwibXNMYXN0UGF0aFwiKVxuXHQgICAgICAgIH0sIDEwMDAgKiA2MCAqIDYwICogMjQpXG5cdCAgICB9XG5cdH0gZWxzZSB7XG5cblx0ICAgIHJldC5nZXRMYXN0UGF0aCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgICAgICByZXR1cm4gZ2V0Q29va2llLmdldEl0ZW0oJ21zTGFzdFBhdGgnKVxuXHQgICAgfVxuXHQgICAgcmV0LnNldExhc3RQYXRoID0gZnVuY3Rpb24gKHBhdGgpIHtcblx0ICAgICAgICBzZXRDb29raWUoJ21zTGFzdFBhdGgnLCBwYXRoKVxuXHQgICAgfVxuXHQgICAgZnVuY3Rpb24gc2V0Q29va2llKGtleSwgdmFsdWUpIHtcblx0ICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCkvL+WwhmRhdGXorr7nva7kuLox5aSp5Lul5ZCO55qE5pe26Ze0IFxuXHQgICAgICAgIGRhdGUuc2V0VGltZShkYXRlLmdldFRpbWUoKSArIDEwMDAgKiA2MCAqIDYwICogMjQpXG5cdCAgICAgICAgZG9jdW1lbnQuY29va2llID0gZXNjYXBlQ29va2llKGtleSkgKyAnPScgKyBlc2NhcGVDb29raWUodmFsdWUpICsgJztleHBpcmVzPScgKyBkYXRlLnRvR01UU3RyaW5nKClcblx0ICAgIH1cblx0ICAgIGZ1bmN0aW9uIGdldENvb2tpZShuYW1lKSB7XG5cdCAgICAgICAgdmFyIG0gPSBTdHJpbmcoZG9jdW1lbnQuY29va2llKS5tYXRjaChuZXcgUmVnRXhwKCcoPzpefCApJyArIG5hbWUgKyAnKD86KD86PShbXjtdKikpfDt8JCknKSkgfHwgW1wiXCIsIFwiXCJdXG5cdCAgICAgICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChtWzFdKVxuXHQgICAgfVxuXHR9XG5cblx0bW9kdWxlLmV4cG9ydHMgPSByZXRcblxuLyoqKi8gfVxuLyoqKioqKi8gXSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9+L21tUm91dGVyL2Rpc3QvbW1Sb3V0ZXIuanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwidmFyIGF2YWxvbiA9IHJlcXVpcmUoXCJhdmFsb24yXCIpXG5yZXF1aXJlKFwibW1Sb3V0ZXJcIilcbmxldCB2bSA9IGF2YWxvbi5kZWZpbmUoe1xuICAgICRpZDogXCJhcHBcIixcbiAgICBhZ2U6IDE4LFxuICAgIGh0bWw6IFwiPGgxPmhlbGxvIHdvcmxkPC9oMT5cIixcbiAgICBzaG93TG9nOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdm0uYWdlICs9IDEwO1xuICAgICAgICBjb25zb2xlLmxvZyhcInRoaXMgaXMgbG9nXCIpO1xuXG4gICAgfVxufSk7XG4vLyBjb25zb2xlLmxvZyhhdmFsb24sIGF2YWxvbi5yb3V0ZXIsIGF2YWxvbi5yb3V0ZXIuYWRkKVxuYXZhbG9uLnJvdXRlci5hZGQoXCIvYWFhXCIsIGZ1bmN0aW9uKGEpIHtcbiAgICB2bS5jdXJyUGF0aCA9IHRoaXMucGF0aFxuICAgICAgICAvLyB0aGlz6YeM6Z2i6IO95ou/5Yiw5aaC5LiL5Lic6KW/OlxuICAgICAgICAvLyBwYXRoOiDot6/lvoRcbiAgICAgICAgLy8gcXVlcnk6IOS4gOS4quWvueixoe+8jOWwseaYr++8n+WQjumdoueahOS4nOilv+i9rOaNouaIkOeahOWvueixoVxuICAgICAgICAvLyBwYXJhbXM6IOS4gOS4quWvueixoe+8jCDmiJHku6zlnKjlrprkuYnot6/nlLHop4TliJnml7bvvIzpgqPkupvku6XlhpLlj7flvIDlp4vnmoTlj4LmlbDnu4TmiJDnmoTlr7nosaFcbn0pO1xuYXZhbG9uLnJvdXRlci5hZGQoXCIvdGFiMVwiLCBmdW5jdGlvbigpIHtcbiAgICAvLyB2bS5odG1sID0gcmVxdWlyZShcIi4vanMvdGFiMS90YWIxLmh0bWxcIik7XG4gICAgdm0uaHRtbCA9IHJlcXVpcmUoXCIuL2pzL3RhYjEvdGFiMVwiKTtcbn0pO1xuYXZhbG9uLnJvdXRlci5hZGQoXCIvdGFiMlwiLCBmdW5jdGlvbigpIHtcbiAgICB2bS5odG1sID0gXCI8aDE+dGFiMjwvaDE+XCJcbn0pO1xuYXZhbG9uLnJvdXRlci5hZGQoXCIvdGFiM1wiLCBmdW5jdGlvbigpIHtcbiAgICB2bS5odG1sID0gXCI8aDE+dGFiMzwvaDE+XCJcbn0pO1xuLy/lkK/liqjot6/nlLHnm5HlkKxcbmF2YWxvbi5oaXN0b3J5LnN0YXJ0KHtcbiAgICByb290OiBcIi9hdmFsb25UZXN0L1wiXG59KTtcbi8vIGRlYnVnZ2VyOy9cbmF2YWxvbi5zY2FuKCk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9pbmRleC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJ2YXIgZztcclxuXHJcbi8vIFRoaXMgd29ya3MgaW4gbm9uLXN0cmljdCBtb2RlXHJcbmcgPSAoZnVuY3Rpb24oKSB7XHJcblx0cmV0dXJuIHRoaXM7XHJcbn0pKCk7XHJcblxyXG50cnkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgZXZhbCBpcyBhbGxvd2VkIChzZWUgQ1NQKVxyXG5cdGcgPSBnIHx8IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKSB8fCAoMSxldmFsKShcInRoaXNcIik7XHJcbn0gY2F0Y2goZSkge1xyXG5cdC8vIFRoaXMgd29ya3MgaWYgdGhlIHdpbmRvdyByZWZlcmVuY2UgaXMgYXZhaWxhYmxlXHJcblx0aWYodHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIilcclxuXHRcdGcgPSB3aW5kb3c7XHJcbn1cclxuXHJcbi8vIGcgY2FuIHN0aWxsIGJlIHVuZGVmaW5lZCwgYnV0IG5vdGhpbmcgdG8gZG8gYWJvdXQgaXQuLi5cclxuLy8gV2UgcmV0dXJuIHVuZGVmaW5lZCwgaW5zdGVhZCBvZiBub3RoaW5nIGhlcmUsIHNvIGl0J3NcclxuLy8gZWFzaWVyIHRvIGhhbmRsZSB0aGlzIGNhc2UuIGlmKCFnbG9iYWwpIHsgLi4ufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBnO1xyXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAod2VicGFjaykvYnVpbGRpbi9nbG9iYWwuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiZGVmaW5lKFtcbiAgICAncmVxdWlyZScsXG4gICAgJ2F2YWxvbjInXG5dLCBmdW5jdGlvbihyZXF1aXJlLCBhdmFsb24yKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIGxldCB2bSA9IGF2YWxvbjIuZGVmaW5lKHtcbiAgICAgICAgJGlkOiBcInRhYjFcIixcbiAgICAgICAgbmFtZTogXCLlr4zlvLrjgIHmsJHkuLvjgIHmlofmmI7jgIHlkozosJDjgIHoh6rnlLHjgIHlubPnrYnjgIHlhazmraPjgIHms5XmsrvjgIHniLHlm73jgIHmlazkuJrjgIHor5rkv6HjgIHlj4vlloQxXCIsXG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBnZXRIdG1sKCkge1xuICAgICAgICByZXR1cm4gXCI8ZGl2IG1zLWNvbnRyb2xsZXI9J3RhYjEnPlwiICtcbiAgICAgICAgICAgIFwiPGRpdj57e0BuYW1lfX08L2Rpdj5cIiArXG4gICAgICAgICAgICBcIjwvZGl2PlwiO1xuICAgIH1cbiAgICByZXR1cm4gZ2V0SHRtbCgpO1xufSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9qcy90YWIxL3RhYjEuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==