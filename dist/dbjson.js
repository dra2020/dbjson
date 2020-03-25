(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["dbjson"] = factory();
	else
		root["dbjson"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/all.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/all.ts":
/*!********************!*\
  !*** ./lib/all.ts ***!
  \********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(/*! ./dbjson */ "./lib/dbjson.ts"));


/***/ }),

/***/ "./lib/dbjson.ts":
/*!***********************!*\
  !*** ./lib/dbjson.ts ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// Shared libraries
const Util = __webpack_require__(/*! @dra2020/util */ "@dra2020/util");
const FSM = __webpack_require__(/*! @dra2020/fsm */ "@dra2020/fsm");
const Storage = __webpack_require__(/*! @dra2020/storage */ "@dra2020/storage");
const DB = __webpack_require__(/*! @dra2020/dbabstract */ "@dra2020/dbabstract");
// JSONDB Collection Options:
//  map: true if data is a map (object), false/nonexistent if an array
//  version: current state version (if undefined, value is directly contents of JSON blob)
//  name: if version specified, name is the property name of the value field in the JSON object
//  noobject: if set and true, indicates that the value is a direct value (string) rather than an object with fields
//
class JsonBlob extends Storage.StorageBlob {
    constructor(env, id, fsm, options) {
        if (id.indexOf('.json') == -1)
            id += '.json';
        super(env, id);
        this.options = options;
        this.value = null;
        this.fsm = fsm;
    }
    get env() { return this._env; }
    endSave(br) {
        if (br.result() != Storage.ESuccess) {
            this.env.log.error('jsondb: json save failed');
        }
        else {
            this.env.log.event('jsondb: save succeeded');
        }
    }
    endLoad(br) {
        if (br.result() != Storage.ESuccess) {
            // Special case our bootstrapping state
            if (br.result() === Storage.ENotFound) {
                if (this.options.FileOptions.map)
                    this.value = {};
                else
                    this.value = [];
                this.setLoaded(Storage.StorageStateClean);
                this.env.log.event('jsondb: initializing ${this.id} to empty state');
                this.fsm.setState(FSM.FSM_DONE);
            }
            else {
                this.env.log.error(`JsonBlob: load of ${this.id} failed: ${br.asError()}`);
                this.fsm.setState(FSM.FSM_ERROR);
                this.env.log.error('jsondb: load failed');
            }
        }
        else {
            this.fromString(br.asString());
            this.fsm.setState(FSM.FSM_DONE);
            this.env.log.event('jsondb: load succeeded');
        }
    }
    endDelete(br) {
        if (br.result() != Storage.ESuccess) {
            this.env.log.event('jsondb: delete failed');
        }
    }
    fromString(s) {
        try {
            let o = JSON.parse(s);
            if (this.options.FileOptions.version === undefined)
                this.value = o;
            else if (o.version != this.options.FileOptions.version)
                this.env.log.error(`jsonBlob: version mismatch for ${this.id}: expected ${this.options.FileOptions.version} != ${o.version}`);
            else if (o[this.options.FileOptions.name] === undefined)
                this.env.log.error(`jsonBlob: missing value for ${this.id}: expected ${this.options.FileOptions.name}`);
            else
                this.value = o[this.options.FileOptions.name];
            if (this.value) {
                if (this.options.FileOptions.map)
                    this.env.log.event(`jsondb: JsonBlob: successful load of ${this.id}: hashmap`);
                else
                    this.env.log.event(`INFO: JsonBlob: successful load of ${this.id}: array of ${this.value.length} items`);
            }
        }
        catch (err) {
            this.env.log.error(`JsonBlob: unexpected exception in JSON parse: ${err.message}`);
        }
    }
    asString() {
        let o;
        if (this.options.FileOptions.version !== undefined)
            o = { version: this.options.FileOptions.version, [this.options.FileOptions.name]: this.value };
        else
            o = this.value;
        return JSON.stringify(o);
    }
}
exports.JsonBlob = JsonBlob;
function create(env) { return new JsonClient(env); }
exports.create = create;
class JsonClient extends DB.DBClient {
    constructor(env) {
        super(env);
    }
    get env() { return this._env; }
    createCollection(name, options) {
        return new JsonCollection(this.env, this, name, options);
    }
    createUpdate(col, query, values) {
        return new JsonUpdate(this.env, col, query, values);
    }
    createUnset(col, query, values) {
        return new JsonUnset(this.env, col, query, values);
    }
    createDelete(col, query) {
        return new JsonDelete(this.env, col, query);
    }
    createFind(col, filter) {
        return new JsonFind(this.env, col, filter);
    }
    createQuery(col, filter) {
        return new JsonQuery(this.env, col, filter);
    }
    createIndex(col, uid) {
        return new JsonIndex(this.env, col, uid);
    }
    createClose() {
        return new JsonClose(this.env, this);
    }
    createStream(col) {
        return col.createStream();
    }
    closeStream(col) {
        col.closeStream();
    }
    tick() {
        if (this.ready && this.state == FSM.FSM_STARTING) {
            // All the work is done at the collection level
            this.setState(FSM.FSM_DONE);
        }
        if (this.state == DB.FSM_NEEDRELEASE) {
            this.setState(FSM.FSM_RELEASED);
            this.env.log.event(`jsondb: client closed`);
        }
    }
}
exports.JsonClient = JsonClient;
class KeySet {
    constructor() {
        this.reset();
    }
    reset() {
        this.set = {};
    }
    test(o) {
        if (o.id === undefined)
            return true;
        let b = this.set[o.id] !== undefined;
        this.set[o.id] = true;
        return b;
    }
}
class JsonCollection extends DB.DBCollection {
    constructor(env, client, name, options) {
        super(env, client, name, options);
        if (this.options.FileOptions === undefined)
            this.options.FileOptions = { map: true };
        this.waitOn(client);
        this.blob = new JsonBlob(env, name, this, options);
        this.save = this.save.bind(this);
        setTimeout(this.save, 30000);
        this.fsmStream = null;
    }
    createStream() {
        if (this.fsmStream == null)
            this.fsmStream = new FSM.FsmArray(this.env, new KeySet());
        return this.fsmStream;
    }
    closeStream() {
        if (this.fsmStream) {
            this.fsmStream.setState(FSM.FSM_DONE);
            this.fsmStream = null;
        }
    }
    addToStream(o) {
        if (this.fsmStream && o.id !== undefined)
            this.fsmStream.push(o);
    }
    save() {
        this.blob.checkSave(this.client.env.storageManager);
        setTimeout(this.save, 30000);
    }
    tick() {
        if (this.ready && this.state == FSM.FSM_STARTING) {
            this.setState(FSM.FSM_PENDING);
            this.blob.startLoad(this.client.env.storageManager); // Done or failed state set in endLoad
        }
    }
}
exports.JsonCollection = JsonCollection;
class JsonUpdate extends DB.DBUpdate {
    constructor(env, col, query, values) {
        super(env, col, query, values);
        this.waitOn(col);
    }
    get jcol() { return this.col; }
    get blob() { return this.jcol.blob; }
    tick() {
        if (this.ready && this.isDependentError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            this.jcol.addToStream(this.query);
            let value = this.blob.value;
            if (this.col.options.FileOptions.map) {
                let o = value[this.query.id];
                if (this.col.options.FileOptions.noobject) {
                    value[this.query.id] = Util.shallowCopy(this.values.value);
                }
                else {
                    if (o === undefined)
                        value[this.query.id] = Util.shallowCopy(this.values);
                    else
                        Util.shallowAssign(o, this.values);
                }
            }
            else {
                let o = undefined;
                for (let i = 0; o === undefined && i < value.length; i++)
                    if (value[i]['id'] == this.query.id)
                        o = value[i];
                if (o === undefined)
                    value.push(Util.shallowCopy(this.values));
                else
                    Util.shallowAssign(o, this.values);
            }
            this.blob.setDirty();
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonUpdate = JsonUpdate;
class JsonUnset extends DB.DBUnset {
    constructor(env, col, query, values) {
        super(env, col, query, values);
        this.waitOn(col);
    }
    get jcol() { return this.col; }
    get blob() { return this.jcol.blob; }
    tick() {
        if (this.ready && this.isDependentError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            this.jcol.addToStream(this.query);
            let value = this.blob.value;
            if (this.col.options.FileOptions.map) {
                let o = value[this.query.id];
                if (this.col.options.FileOptions.noobject) {
                    // No meaning
                }
                else {
                    if (o !== undefined)
                        Util.shallowDelete(o, this.values);
                }
            }
            else {
                let o = undefined;
                for (let i = 0; o === undefined && i < value.length; i++)
                    if (value[i]['id'] == this.query.id)
                        o = value[i];
                if (o !== undefined)
                    Util.shallowDelete(o, this.values);
            }
            this.blob.setDirty();
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonUnset = JsonUnset;
class JsonDelete extends DB.DBDelete {
    constructor(env, col, query) {
        super(env, col, query);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isDependentError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            let value = this.blob.value;
            if (this.col.options.FileOptions.map)
                delete value[this.query.id];
            else {
                for (let i = 0; i < value.length; i++)
                    if (value[i]['id'] == this.query.id) {
                        value.splice(i, 1);
                        break;
                    }
            }
            this.blob.setDirty();
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonDelete = JsonDelete;
class JsonFind extends DB.DBFind {
    constructor(env, col, filter) {
        super(env, col, filter);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isDependentError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            let value = this.blob.value;
            if (this.col.options.FileOptions.map) {
                if (this.filter.id !== undefined) {
                    let result = value[this.filter.id];
                    if (result && this.col.options.FileOptions.noobject)
                        result = { id: this.filter.id, value: result };
                    if (result !== undefined && Util.partialEqual(result, this.filter))
                        this.result = result;
                }
                else {
                    if (this.col.options.FileOptions.noobject)
                        throw 'error: cannot call Find without id property on noobject collection';
                    for (let id in value)
                        if (value.hasOwnProperty(id))
                            if (Util.partialEqual(value[id], this.filter)) {
                                this.result = value[id];
                                break;
                            }
                }
            }
            else {
                for (let i = 0; i < value.length; i++)
                    if (Util.partialEqual(value[i], this.filter)) {
                        this.result = value[i];
                        break;
                    }
            }
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonFind = JsonFind;
class JsonQuery extends DB.DBQuery {
    constructor(env, col, filter) {
        super(env, col, filter);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isDependentError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            let value = this.blob.value;
            if (this.col.options.FileOptions.map) {
                if (this.col.options.FileOptions.noobject)
                    throw 'error: cannot call Query on noobject collection';
                for (let id in value)
                    if (value.hasOwnProperty(id))
                        if (Util.partialEqual(value[id], this.filter))
                            this.fsmResult.push(value[id]);
            }
            else {
                for (let i = 0; i < value.length; i++)
                    if (Util.partialEqual(value[i], this.filter))
                        this.fsmResult.push(value[i]);
            }
            this.fsmResult.setState(FSM.FSM_DONE);
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonQuery = JsonQuery;
class JsonIndex extends DB.DBIndex {
    constructor(env, col, uid) {
        super(env, col, uid);
        this.waitOn(col);
    }
    tick() {
        if (this.ready && this.isDependentError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            // No index necessary - we do linear search
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonIndex = JsonIndex;
class JsonClose extends DB.DBClose {
    constructor(env, client) {
        super(env, client);
    }
}
exports.JsonClose = JsonClose;


/***/ }),

/***/ "@dra2020/dbabstract":
/*!**************************************!*\
  !*** external "@dra2020/dbabstract" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@dra2020/dbabstract");

/***/ }),

/***/ "@dra2020/fsm":
/*!*******************************!*\
  !*** external "@dra2020/fsm" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@dra2020/fsm");

/***/ }),

/***/ "@dra2020/storage":
/*!***********************************!*\
  !*** external "@dra2020/storage" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@dra2020/storage");

/***/ }),

/***/ "@dra2020/util":
/*!********************************!*\
  !*** external "@dra2020/util" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@dra2020/util");

/***/ })

/******/ });
});
//# sourceMappingURL=dbjson.js.map