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
const Util = __webpack_require__(/*! @terrencecrowley/util */ "@terrencecrowley/util");
const Log = __webpack_require__(/*! @terrencecrowley/log */ "@terrencecrowley/log");
const FSM = __webpack_require__(/*! @terrencecrowley/fsm */ "@terrencecrowley/fsm");
const Storage = __webpack_require__(/*! @terrencecrowley/storage */ "@terrencecrowley/storage");
const DB = __webpack_require__(/*! @terrencecrowley/dbabstract */ "@terrencecrowley/dbabstract");
// JSONDB Collection Options:
//  map: true if data is a map (object), false/nonexistent if an array
//  version: current state version (if undefined, value is directly contents of JSON blob)
//  name: if version specified, name is the property name of the value field in the JSON object
//  noobject: if set and true, indicates that the value is a direct value (string) rather than an object with fields
//
class JsonBlob extends Storage.StorageBlob {
    constructor(id, fsm, options) {
        if (id.indexOf('.json') == -1)
            id += '.json';
        super(id);
        this.options = options;
        this.value = null;
        this.fsm = fsm;
    }
    endSave(br) {
        if (br.result() != Storage.ESuccess) {
            Log.error('jsondb: json save failed');
        }
        else {
            Log.event('jsondb: save succeeded');
        }
    }
    endLoad(br) {
        if (br.result() != Storage.ESuccess) {
            // Special case our bootstrapping state
            if (this.id == 'state.json') {
                this.value = {};
                this.setLoaded(Storage.StorageStateClean);
                Log.event('jsondb: initializing to empty session index state');
                this.fsm.setState(FSM.FSM_DONE);
            }
            else if (this.id == 'access.json') {
                this.value = {};
                this.setLoaded(Storage.StorageStateClean);
                Log.event('jsondb: initializing to empty access to session index state');
                this.fsm.setState(FSM.FSM_DONE);
            }
            else if (this.id == 'users.json') {
                this.value = [];
                this.setLoaded(Storage.StorageStateClean);
                Log.event('jsondb: initializing to empty user index state');
                this.fsm.setState(FSM.FSM_DONE);
            }
            else {
                Log.error(`JsonBlob: load of ${this.id} failed: ${br.asError()}`);
                this.fsm.setState(FSM.FSM_ERROR);
                Log.error('jsondb: load failed');
            }
        }
        else {
            this.fromString(br.asString());
            this.fsm.setState(FSM.FSM_DONE);
            Log.event('jsondb: load succeeded');
        }
    }
    endDelete(br) {
        if (br.result() != Storage.ESuccess) {
            Log.event('jsondb: delete failed');
        }
    }
    fromString(s) {
        try {
            let o = JSON.parse(s);
            if (this.options.version === undefined)
                this.value = o;
            else if (o.version != this.options.version)
                Log.error(`jsonBlob: version mismatch for ${this.id}: expected ${this.options.version} != ${o.version}`);
            else if (o[this.options.name] === undefined)
                Log.error(`jsonBlob: missing value for ${this.id}: expected ${this.options.name}`);
            else
                this.value = o[this.options.name];
            if (this.value) {
                if (this.options.map)
                    Log.event(`jsondb: JsonBlob: successful load of ${this.id}: hashmap`);
                else
                    Log.event(`INFO: JsonBlob: successful load of ${this.id}: array of ${this.value.length} items`);
            }
        }
        catch (err) {
            Log.error(`JsonBlob: unexpected exception in JSON parse: ${err.message}`);
        }
    }
    asString() {
        let o;
        if (this.options.version !== undefined)
            o = { version: this.options.version, [this.options.name]: this.value };
        else
            o = this.value;
        return JSON.stringify(o);
    }
}
exports.JsonBlob = JsonBlob;
class JsonClient extends DB.DBClient {
    constructor(storageManager) {
        super('JsonClient', storageManager);
    }
    createCollection(name, options) {
        return new JsonCollection('JsonCollection', this, name, options);
    }
    createUpdate(col, query, values) {
        return new JsonUpdate('JsonUpdate', col, query, values);
    }
    createDelete(col, query) {
        return new JsonDelete('JsonDelete', col, query);
    }
    createFind(col, filter) {
        return new JsonFind('JsonFind', col, filter);
    }
    createQuery(col, filter) {
        return new JsonQuery('JsonQuery', col, filter);
    }
    createIndex(col, uid) {
        return new JsonIndex('JsonIndex', col, uid);
    }
    createClose() {
        return new JsonClose('JsonClose', this);
    }
    tick() {
        if (this.ready && this.state == FSM.FSM_STARTING) {
            // All the work is done at the collection level
            this.setState(FSM.FSM_DONE);
        }
        if (this.state == DB.FSM_NEEDRELEASE) {
            this.setState(FSM.FSM_RELEASED);
            Log.event(`jsondb: client closed`);
        }
    }
}
exports.JsonClient = JsonClient;
class JsonCollection extends DB.DBCollection {
    constructor(typeName, client, name, options) {
        super(typeName, client, name, options);
        this.waitOn(client);
        this.blob = new JsonBlob(name, this, options);
        this.save = this.save.bind(this);
        setTimeout(this.save, 30000);
    }
    save() {
        this.blob.checkSave(this.client.storageManager);
        setTimeout(this.save, 30000);
    }
    tick() {
        if (this.ready && this.state == FSM.FSM_STARTING) {
            this.setState(FSM.FSM_PENDING);
            this.blob.startLoad(this.client.storageManager); // Done or failed state set in endLoad
        }
    }
}
exports.JsonCollection = JsonCollection;
class JsonUpdate extends DB.DBUpdate {
    constructor(typeName, col, query, values) {
        super(typeName, col, query, values);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isChildError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            let value = this.blob.value;
            if (this.col.options.map) {
                let o = value[this.query.id];
                if (this.col.options.noobject) {
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
class JsonDelete extends DB.DBDelete {
    constructor(typeName, col, query) {
        super(typeName, col, query);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isChildError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            let value = this.blob.value;
            if (this.col.options.map)
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
    constructor(typeName, col, filter) {
        super(typeName, col, filter);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isChildError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            let value = this.blob.value;
            if (this.col.options.map) {
                if (this.filter.id !== undefined) {
                    let result = value[this.filter.id];
                    if (result && this.col.options.noobject)
                        result = { id: this.filter.id, value: result };
                    if (result !== undefined && Util.partialEqual(result, this.filter))
                        this.result = result;
                }
                else {
                    if (this.col.options.noobject)
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
    constructor(typeName, col, filter) {
        super(typeName, col, filter);
        this.waitOn(col);
    }
    get blob() {
        let c = this.col;
        return c.blob;
    }
    tick() {
        if (this.ready && this.isChildError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            this.result = [];
            let value = this.blob.value;
            if (this.col.options.map) {
                if (this.col.options.noobject)
                    throw 'error: cannot call Query on noobject collection';
                for (let id in value)
                    if (value.hasOwnProperty(id))
                        if (Util.partialEqual(value[id], this.filter))
                            this.result.push(value[id]);
            }
            else {
                for (let i = 0; i < value.length; i++)
                    if (Util.partialEqual(value[i], this.filter))
                        this.result.push(value[i]);
            }
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonQuery = JsonQuery;
class JsonIndex extends DB.DBIndex {
    constructor(typeName, col, uid) {
        super(typeName, col, uid);
        this.waitOn(col);
    }
    tick() {
        if (this.ready && this.isChildError)
            this.setState(FSM.FSM_ERROR);
        else if (this.ready && this.state == FSM.FSM_STARTING) {
            // No index necessary - we do linear search
            this.setState(FSM.FSM_DONE);
        }
    }
}
exports.JsonIndex = JsonIndex;
class JsonClose extends DB.DBClose {
    constructor(typeName, client) {
        super(typeName, client);
    }
}
exports.JsonClose = JsonClose;


/***/ }),

/***/ "@terrencecrowley/dbabstract":
/*!**********************************************!*\
  !*** external "@terrencecrowley/dbabstract" ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@terrencecrowley/dbabstract");

/***/ }),

/***/ "@terrencecrowley/fsm":
/*!***************************************!*\
  !*** external "@terrencecrowley/fsm" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@terrencecrowley/fsm");

/***/ }),

/***/ "@terrencecrowley/log":
/*!***************************************!*\
  !*** external "@terrencecrowley/log" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@terrencecrowley/log");

/***/ }),

/***/ "@terrencecrowley/storage":
/*!*******************************************!*\
  !*** external "@terrencecrowley/storage" ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@terrencecrowley/storage");

/***/ }),

/***/ "@terrencecrowley/util":
/*!****************************************!*\
  !*** external "@terrencecrowley/util" ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@terrencecrowley/util");

/***/ })

/******/ });
});
//# sourceMappingURL=dbjson.js.map