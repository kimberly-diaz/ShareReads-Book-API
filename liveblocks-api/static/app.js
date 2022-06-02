(() => {
  // node_modules/@liveblocks/client/shared.mjs
  var ServerMsgCode;
  var ClientMsgCode;
  var CrdtType;
  var OpCode;
  var WebsocketCloseCodes;
  !function(ServerMsgCode2) {
    ServerMsgCode2[ServerMsgCode2.UPDATE_PRESENCE = 100] = "UPDATE_PRESENCE", ServerMsgCode2[ServerMsgCode2.USER_JOINED = 101] = "USER_JOINED", ServerMsgCode2[ServerMsgCode2.USER_LEFT = 102] = "USER_LEFT", ServerMsgCode2[ServerMsgCode2.BROADCASTED_EVENT = 103] = "BROADCASTED_EVENT", ServerMsgCode2[ServerMsgCode2.ROOM_STATE = 104] = "ROOM_STATE", ServerMsgCode2[ServerMsgCode2.INITIAL_STORAGE_STATE = 200] = "INITIAL_STORAGE_STATE", ServerMsgCode2[ServerMsgCode2.UPDATE_STORAGE = 201] = "UPDATE_STORAGE";
  }(ServerMsgCode || (ServerMsgCode = {})), function(ClientMsgCode2) {
    ClientMsgCode2[ClientMsgCode2.UPDATE_PRESENCE = 100] = "UPDATE_PRESENCE", ClientMsgCode2[ClientMsgCode2.BROADCAST_EVENT = 103] = "BROADCAST_EVENT", ClientMsgCode2[ClientMsgCode2.FETCH_STORAGE = 200] = "FETCH_STORAGE", ClientMsgCode2[ClientMsgCode2.UPDATE_STORAGE = 201] = "UPDATE_STORAGE";
  }(ClientMsgCode || (ClientMsgCode = {})), function(CrdtType2) {
    CrdtType2[CrdtType2.OBJECT = 0] = "OBJECT", CrdtType2[CrdtType2.LIST = 1] = "LIST", CrdtType2[CrdtType2.MAP = 2] = "MAP", CrdtType2[CrdtType2.REGISTER = 3] = "REGISTER";
  }(CrdtType || (CrdtType = {})), function(OpCode2) {
    OpCode2[OpCode2.INIT = 0] = "INIT", OpCode2[OpCode2.SET_PARENT_KEY = 1] = "SET_PARENT_KEY", OpCode2[OpCode2.CREATE_LIST = 2] = "CREATE_LIST", OpCode2[OpCode2.UPDATE_OBJECT = 3] = "UPDATE_OBJECT", OpCode2[OpCode2.CREATE_OBJECT = 4] = "CREATE_OBJECT", OpCode2[OpCode2.DELETE_CRDT = 5] = "DELETE_CRDT", OpCode2[OpCode2.DELETE_OBJECT_KEY = 6] = "DELETE_OBJECT_KEY", OpCode2[OpCode2.CREATE_MAP = 7] = "CREATE_MAP", OpCode2[OpCode2.CREATE_REGISTER = 8] = "CREATE_REGISTER";
  }(OpCode || (OpCode = {})), function(WebsocketCloseCodes2) {
    WebsocketCloseCodes2[WebsocketCloseCodes2.CLOSE_ABNORMAL = 1006] = "CLOSE_ABNORMAL", WebsocketCloseCodes2[WebsocketCloseCodes2.INVALID_MESSAGE_FORMAT = 4e3] = "INVALID_MESSAGE_FORMAT", WebsocketCloseCodes2[WebsocketCloseCodes2.NOT_ALLOWED = 4001] = "NOT_ALLOWED", WebsocketCloseCodes2[WebsocketCloseCodes2.MAX_NUMBER_OF_MESSAGES_PER_SECONDS = 4002] = "MAX_NUMBER_OF_MESSAGES_PER_SECONDS", WebsocketCloseCodes2[WebsocketCloseCodes2.MAX_NUMBER_OF_CONCURRENT_CONNECTIONS = 4003] = "MAX_NUMBER_OF_CONCURRENT_CONNECTIONS", WebsocketCloseCodes2[WebsocketCloseCodes2.MAX_NUMBER_OF_MESSAGES_PER_DAY_PER_APP = 4004] = "MAX_NUMBER_OF_MESSAGES_PER_DAY_PER_APP", WebsocketCloseCodes2[WebsocketCloseCodes2.MAX_NUMBER_OF_CONCURRENT_CONNECTIONS_PER_ROOM = 4005] = "MAX_NUMBER_OF_CONCURRENT_CONNECTIONS_PER_ROOM", WebsocketCloseCodes2[WebsocketCloseCodes2.CLOSE_WITHOUT_RETRY = 4999] = "CLOSE_WITHOUT_RETRY";
  }(WebsocketCloseCodes || (WebsocketCloseCodes = {}));
  var AbstractCrdt = class {
    get _doc() {
      return this.__doc;
    }
    get roomId() {
      return this.__doc ? this.__doc.roomId : null;
    }
    get _id() {
      return this.__id;
    }
    get _parent() {
      return this.__parent;
    }
    get _parentKey() {
      return this.__parentKey;
    }
    _apply(op, _isLocal) {
      return op.type === OpCode.DELETE_CRDT && this._parent != null && this._parentKey != null ? this._parent._detachChild(this) : {
        modified: false
      };
    }
    _setParentLink(parent, key) {
      if (this.__parent != null && this.__parent !== parent)
        throw new Error("Cannot attach parent if it already exist");
      this.__parentKey = key, this.__parent = parent;
    }
    _attach(id, doc) {
      if (this.__id || this.__doc)
        throw new Error("Cannot attach if CRDT is already attached");
      doc.addItem(id, this), this.__id = id, this.__doc = doc;
    }
    _detach() {
      this.__doc && this.__id && this.__doc.deleteItem(this.__id), this.__parent = void 0, this.__doc = void 0;
    }
  };
  function parseJson(rawMessage) {
    try {
      return JSON.parse(rawMessage);
    } catch (e) {
      return;
    }
  }
  function isJsonArray(data) {
    return Array.isArray(data);
  }
  function isJsonObject(data) {
    return data !== null && typeof data == "object" && !isJsonArray(data);
  }
  var LiveRegister = class extends AbstractCrdt {
    constructor(data) {
      super(), this._data = data;
    }
    get data() {
      return this._data;
    }
    static _deserialize([id, item], _parentToChildren, doc) {
      if (item.type !== CrdtType.REGISTER)
        throw new Error(`Tried to deserialize a map but item type is "${item.type}"`);
      const register = new LiveRegister(item.data);
      return register._attach(id, doc), register;
    }
    _serialize(parentId, parentKey, doc, intent) {
      if (this._id == null || parentId == null || parentKey == null)
        throw new Error("Cannot serialize register if parentId or parentKey is undefined");
      return [{
        type: OpCode.CREATE_REGISTER,
        opId: doc == null ? void 0 : doc.generateOpId(),
        id: this._id,
        intent,
        parentId,
        parentKey,
        data: this.data
      }];
    }
    _toSerializedCrdt() {
      var _a;
      return {
        type: CrdtType.REGISTER,
        parentId: (_a = this._parent) === null || _a === void 0 ? void 0 : _a._id,
        parentKey: this._parentKey,
        data: this.data
      };
    }
    _attachChild(_op, _isLocal) {
      throw new Error("Method not implemented.");
    }
    _detachChild(_crdt) {
      throw new Error("Method not implemented.");
    }
    _apply(op, isLocal) {
      return super._apply(op, isLocal);
    }
  };
  function makePosition(before, after) {
    return before == null && after == null ? pos([33]) : before != null && after == null ? function(before2) {
      const result = [], beforeCodes = posCodes(before2);
      for (let i = 0; i < beforeCodes.length; i++) {
        const code = beforeCodes[i];
        if (code !== 126) {
          result.push(code + 1);
          break;
        }
        if (result.push(code), beforeCodes.length - 1 === i) {
          result.push(33);
          break;
        }
      }
      return pos(result);
    }(before) : before == null && after != null ? function(after2) {
      const result = [], afterCodes = posCodes(after2);
      for (let i = 0; i < afterCodes.length; i++) {
        const code = afterCodes[i];
        if (!(code <= 33)) {
          result.push(code - 1);
          break;
        }
        if (result.push(32), afterCodes.length - 1 === i) {
          result.push(126);
          break;
        }
      }
      return pos(result);
    }(after) : pos(makePositionFromCodes(posCodes(before), posCodes(after)));
  }
  function makePositionFromCodes(before, after) {
    let index = 0;
    const result = [];
    for (; ; ) {
      const beforeDigit = before[index] || 32, afterDigit = after[index] || 126;
      if (beforeDigit > afterDigit)
        throw new Error(`Impossible to generate position between ${before} and ${after}`);
      if (beforeDigit === afterDigit) {
        result.push(beforeDigit), index++;
        continue;
      }
      if (afterDigit - beforeDigit == 1) {
        result.push(beforeDigit), result.push(...makePositionFromCodes(before.slice(index + 1), []));
        break;
      }
      const mid = afterDigit + beforeDigit >> 1;
      result.push(mid);
      break;
    }
    return result;
  }
  function posCodes(str) {
    const codes = [];
    for (let i = 0; i < str.length; i++)
      codes.push(str.charCodeAt(i));
    return codes;
  }
  function pos(codes) {
    return String.fromCharCode(...codes);
  }
  function comparePosition(posA, posB) {
    const aCodes = posCodes(posA), bCodes = posCodes(posB), maxLength = Math.max(aCodes.length, bCodes.length);
    for (let i = 0; i < maxLength; i++) {
      const a = aCodes[i] == null ? 32 : aCodes[i], b = bCodes[i] == null ? 32 : bCodes[i];
      if (a !== b)
        return a - b;
    }
    throw new Error(`Impossible to compare similar position "${posA}" and "${posB}"`);
  }
  var LiveList2 = class extends AbstractCrdt {
    constructor(items = []) {
      let position;
      super(), this._items = [];
      for (let i = 0; i < items.length; i++) {
        const newPosition = makePosition(position), item = selfOrRegister(items[i]);
        this._items.push([item, newPosition]), position = newPosition;
      }
    }
    static _deserialize([id], parentToChildren, doc) {
      const list = new LiveList2([]);
      list._attach(id, doc);
      const children = parentToChildren.get(id);
      if (children == null)
        return list;
      for (const entry of children) {
        const child = deserialize(entry, parentToChildren, doc);
        child._setParentLink(list, entry[1].parentKey), list._items.push([child, entry[1].parentKey]), list._items.sort((itemA, itemB) => comparePosition(itemA[1], itemB[1]));
      }
      return list;
    }
    _serialize(parentId, parentKey, doc, intent) {
      if (this._id == null)
        throw new Error("Cannot serialize item is not attached");
      if (parentId == null || parentKey == null)
        throw new Error("Cannot serialize list if parentId or parentKey is undefined");
      const ops = [], op = {
        id: this._id,
        opId: doc == null ? void 0 : doc.generateOpId(),
        intent,
        type: OpCode.CREATE_LIST,
        parentId,
        parentKey
      };
      ops.push(op);
      for (const [value, key] of this._items)
        ops.push(...value._serialize(this._id, key, doc));
      return ops;
    }
    _indexOfPosition(position) {
      return this._items.findIndex((item) => item[1] === position);
    }
    _attach(id, doc) {
      super._attach(id, doc);
      for (const [item] of this._items)
        item._attach(doc.generateId(), doc);
    }
    _detach() {
      super._detach();
      for (const [value] of this._items)
        value._detach();
    }
    _attachChild(op, isLocal) {
      var _a;
      if (this._doc == null)
        throw new Error("Can't attach child if doc is not present");
      const { id, parentKey, intent } = op, key = parentKey, child = creationOpToLiveStructure(op);
      if (this._doc.getItem(id) !== void 0)
        return {
          modified: false
        };
      child._attach(id, this._doc), child._setParentLink(this, key);
      const index = this._items.findIndex((entry) => entry[1] === key);
      let newKey = key;
      if (index !== -1) {
        if (intent === "set") {
          const existingItem = this._items[index][0];
          existingItem._detach();
          const storageUpdate = {
            node: this,
            type: "LiveList",
            updates: [{
              index,
              type: "set",
              item: child instanceof LiveRegister ? child.data : child
            }]
          };
          return this._items[index][0] = child, {
            modified: storageUpdate,
            reverse: existingItem._serialize(this._id, key, this._doc, "set")
          };
        }
        if (isLocal) {
          const before = this._items[index] ? this._items[index][1] : void 0, after = this._items[index + 1] ? this._items[index + 1][1] : void 0;
          newKey = makePosition(before, after), child._setParentLink(this, newKey);
        } else
          this._items[index][1] = makePosition(key, (_a = this._items[index + 1]) === null || _a === void 0 ? void 0 : _a[1]);
      }
      this._items.push([child, newKey]), this._items.sort((itemA, itemB) => comparePosition(itemA[1], itemB[1]));
      const newIndex = this._items.findIndex((entry) => entry[1] === newKey);
      return {
        reverse: [{
          type: OpCode.DELETE_CRDT,
          id
        }],
        modified: {
          node: this,
          type: "LiveList",
          updates: [{
            index: newIndex,
            type: "insert",
            item: child instanceof LiveRegister ? child.data : child
          }]
        }
      };
    }
    _detachChild(child) {
      if (child) {
        const reverse = child._serialize(this._id, child._parentKey, this._doc), indexToDelete = this._items.findIndex((item) => item[0] === child);
        this._items.splice(indexToDelete, 1), child._detach();
        return {
          modified: {
            node: this,
            type: "LiveList",
            updates: [{
              index: indexToDelete,
              type: "delete"
            }]
          },
          reverse
        };
      }
      return {
        modified: false
      };
    }
    _setChildKey(key, child, previousKey) {
      var _a;
      child._setParentLink(this, key);
      const previousIndex = this._items.findIndex((entry) => entry[0]._id === child._id), index = this._items.findIndex((entry) => entry[1] === key);
      index !== -1 && (this._items[index][1] = makePosition(key, (_a = this._items[index + 1]) === null || _a === void 0 ? void 0 : _a[1]));
      const item = this._items.find((item2) => item2[0] === child);
      item && (item[1] = key), this._items.sort((itemA, itemB) => comparePosition(itemA[1], itemB[1]));
      const newIndex = this._items.findIndex((entry) => entry[0]._id === child._id);
      return {
        modified: {
          node: this,
          type: "LiveList",
          updates: newIndex === previousIndex ? [] : [{
            index: newIndex,
            item: child instanceof LiveRegister ? child.data : child,
            previousIndex,
            type: "move"
          }]
        },
        reverse: [{
          type: OpCode.SET_PARENT_KEY,
          id: item == null ? void 0 : item[0]._id,
          parentKey: previousKey
        }]
      };
    }
    _apply(op, isLocal) {
      return super._apply(op, isLocal);
    }
    _toSerializedCrdt() {
      var _a;
      return {
        type: CrdtType.LIST,
        parentId: (_a = this._parent) === null || _a === void 0 ? void 0 : _a._id,
        parentKey: this._parentKey
      };
    }
    get length() {
      return this._items.length;
    }
    push(element) {
      return this.insert(element, this.length);
    }
    insert(element, index) {
      if (index < 0 || index > this._items.length)
        throw new Error(`Cannot insert list item at index "${index}". index should be between 0 and ${this._items.length}`);
      const position = makePosition(this._items[index - 1] ? this._items[index - 1][1] : void 0, this._items[index] ? this._items[index][1] : void 0), value = selfOrRegister(element);
      value._setParentLink(this, position), this._items.push([value, position]), this._items.sort((itemA, itemB) => comparePosition(itemA[1], itemB[1]));
      const newIndex = this._items.findIndex((entry) => entry[1] === position);
      if (this._doc && this._id) {
        const id = this._doc.generateId();
        value._attach(id, this._doc);
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(this._id, {
          node: this,
          type: "LiveList",
          updates: [{
            index: newIndex,
            item: value instanceof LiveRegister ? value.data : value,
            type: "insert"
          }]
        }), this._doc.dispatch(value._serialize(this._id, position, this._doc), [{
          type: OpCode.DELETE_CRDT,
          id
        }], storageUpdates);
      }
    }
    move(index, targetIndex) {
      if (targetIndex < 0)
        throw new Error("targetIndex cannot be less than 0");
      if (targetIndex >= this._items.length)
        throw new Error("targetIndex cannot be greater or equal than the list length");
      if (index < 0)
        throw new Error("index cannot be less than 0");
      if (index >= this._items.length)
        throw new Error("index cannot be greater or equal than the list length");
      let beforePosition = null, afterPosition = null;
      index < targetIndex ? (afterPosition = targetIndex === this._items.length - 1 ? void 0 : this._items[targetIndex + 1][1], beforePosition = this._items[targetIndex][1]) : (afterPosition = this._items[targetIndex][1], beforePosition = targetIndex === 0 ? void 0 : this._items[targetIndex - 1][1]);
      const position = makePosition(beforePosition, afterPosition), item = this._items[index], previousPosition = item[1];
      item[1] = position, item[0]._setParentLink(this, position), this._items.sort((itemA, itemB) => comparePosition(itemA[1], itemB[1]));
      const newIndex = this._items.findIndex((entry) => entry[1] === position);
      if (this._doc && this._id) {
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(this._id, {
          node: this,
          type: "LiveList",
          updates: [{
            index: newIndex,
            previousIndex: index,
            item: item[0],
            type: "move"
          }]
        }), this._doc.dispatch([{
          type: OpCode.SET_PARENT_KEY,
          id: item[0]._id,
          opId: this._doc.generateOpId(),
          parentKey: position
        }], [{
          type: OpCode.SET_PARENT_KEY,
          id: item[0]._id,
          parentKey: previousPosition
        }], storageUpdates);
      }
    }
    delete(index) {
      if (index < 0 || index >= this._items.length)
        throw new Error(`Cannot delete list item at index "${index}". index should be between 0 and ${this._items.length - 1}`);
      const item = this._items[index];
      if (item[0]._detach(), this._items.splice(index, 1), this._doc) {
        const childRecordId = item[0]._id;
        if (childRecordId) {
          const storageUpdates = /* @__PURE__ */ new Map();
          storageUpdates.set(this._id, {
            node: this,
            type: "LiveList",
            updates: [{
              index,
              type: "delete"
            }]
          }), this._doc.dispatch([{
            id: childRecordId,
            opId: this._doc.generateOpId(),
            type: OpCode.DELETE_CRDT
          }], item[0]._serialize(this._id, item[1]), storageUpdates);
        }
      }
    }
    clear() {
      if (this._doc) {
        const ops = [], reverseOps = [], updateDelta = [];
        let i = 0;
        for (const item of this._items) {
          item[0]._detach();
          const childId = item[0]._id;
          childId && (ops.push({
            id: childId,
            type: OpCode.DELETE_CRDT
          }), reverseOps.push(...item[0]._serialize(this._id, item[1])), updateDelta.push({
            index: i,
            type: "delete"
          })), i++;
        }
        this._items = [];
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(this._id, {
          node: this,
          type: "LiveList",
          updates: updateDelta
        }), this._doc.dispatch(ops, reverseOps, storageUpdates);
      } else {
        for (const item of this._items)
          item[0]._detach();
        this._items = [];
      }
    }
    set(index, item) {
      if (index < 0 || index >= this._items.length)
        throw new Error(`Cannot set list item at index "${index}". index should be between 0 and ${this._items.length - 1}`);
      const [existingItem, position] = this._items[index];
      existingItem._detach();
      const value = selfOrRegister(item);
      if (value._setParentLink(this, position), this._items[index][0] = value, this._doc && this._id) {
        const id = this._doc.generateId();
        value._attach(id, this._doc);
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(this._id, {
          node: this,
          type: "LiveList",
          updates: [{
            index,
            item: value instanceof LiveRegister ? value.data : value,
            type: "set"
          }]
        }), this._doc.dispatch(value._serialize(this._id, position, this._doc, "set"), existingItem._serialize(this._id, position, void 0, "set"), storageUpdates);
      }
    }
    toArray() {
      return this._items.map((entry) => selfOrRegisterValue(entry[0]));
    }
    every(predicate) {
      return this.toArray().every(predicate);
    }
    filter(predicate) {
      return this.toArray().filter(predicate);
    }
    find(predicate) {
      return this.toArray().find(predicate);
    }
    findIndex(predicate) {
      return this.toArray().findIndex(predicate);
    }
    forEach(callbackfn) {
      return this.toArray().forEach(callbackfn);
    }
    get(index) {
      if (!(index < 0 || index >= this._items.length))
        return selfOrRegisterValue(this._items[index][0]);
    }
    indexOf(searchElement, fromIndex) {
      return this.toArray().indexOf(searchElement, fromIndex);
    }
    lastIndexOf(searchElement, fromIndex) {
      return this.toArray().lastIndexOf(searchElement, fromIndex);
    }
    map(callback) {
      return this._items.map((entry, i) => callback(selfOrRegisterValue(entry[0]), i));
    }
    some(predicate) {
      return this.toArray().some(predicate);
    }
    [Symbol.iterator]() {
      return new LiveListIterator(this._items);
    }
  };
  var LiveListIterator = class {
    constructor(items) {
      this._innerIterator = items[Symbol.iterator]();
    }
    [Symbol.iterator]() {
      return this;
    }
    next() {
      const result = this._innerIterator.next();
      return result.done ? {
        done: true,
        value: void 0
      } : {
        value: selfOrRegisterValue(result.value[0])
      };
    }
  };
  var _emittedDeprecationWarnings = /* @__PURE__ */ new Set();
  function deprecate(message, key = message) {
    _emittedDeprecationWarnings.has(key) || (_emittedDeprecationWarnings.add(key), console.error(`DEPRECATION WARNING: ${message}`));
  }
  function deprecateIf(condition, message, key = message) {
    condition && deprecate(message, key);
  }
  var LiveMap = class extends AbstractCrdt {
    constructor(entries2) {
      if (super(), deprecateIf(entries2 === null, "Support for calling `new LiveMap(null)` will be removed in @liveblocks/client 0.18. Please call as `new LiveMap()`, or `new LiveMap([])`."), entries2) {
        const mappedEntries = [];
        for (const entry of entries2) {
          const value = selfOrRegister(entry[1]);
          value._setParentLink(this, entry[0]), mappedEntries.push([entry[0], value]);
        }
        this._map = new Map(mappedEntries);
      } else
        this._map = /* @__PURE__ */ new Map();
    }
    _serialize(parentId, parentKey, doc, intent) {
      if (this._id == null)
        throw new Error("Cannot serialize item is not attached");
      if (parentId == null || parentKey == null)
        throw new Error("Cannot serialize map if parentId or parentKey is undefined");
      const ops = [], op = {
        id: this._id,
        opId: doc == null ? void 0 : doc.generateOpId(),
        type: OpCode.CREATE_MAP,
        intent,
        parentId,
        parentKey
      };
      ops.push(op);
      for (const [key, value] of this._map)
        ops.push(...value._serialize(this._id, key, doc));
      return ops;
    }
    static _deserialize([id, item], parentToChildren, doc) {
      if (item.type !== CrdtType.MAP)
        throw new Error(`Tried to deserialize a map but item type is "${item.type}"`);
      const map = new LiveMap();
      map._attach(id, doc);
      const children = parentToChildren.get(id);
      if (children == null)
        return map;
      for (const entry of children) {
        const crdt = entry[1];
        if (crdt.parentKey == null)
          throw new Error("Tried to deserialize a crdt but it does not have a parentKey and is not the root");
        const child = deserialize(entry, parentToChildren, doc);
        child._setParentLink(map, crdt.parentKey), map._map.set(crdt.parentKey, child);
      }
      return map;
    }
    _attach(id, doc) {
      super._attach(id, doc);
      for (const [_key, value] of this._map)
        isCrdt(value) && value._attach(doc.generateId(), doc);
    }
    _attachChild(op, _isLocal) {
      if (this._doc == null)
        throw new Error("Can't attach child if doc is not present");
      const { id, parentKey } = op, key = parentKey, child = creationOpToLiveStructure(op);
      if (this._doc.getItem(id) !== void 0)
        return {
          modified: false
        };
      const previousValue = this._map.get(key);
      let reverse;
      return previousValue ? (reverse = previousValue._serialize(this._id, key), previousValue._detach()) : reverse = [{
        type: OpCode.DELETE_CRDT,
        id
      }], child._setParentLink(this, key), child._attach(id, this._doc), this._map.set(key, child), {
        modified: {
          node: this,
          type: "LiveMap",
          updates: {
            [key]: {
              type: "update"
            }
          }
        },
        reverse
      };
    }
    _detach() {
      super._detach();
      for (const item of this._map.values())
        item._detach();
    }
    _detachChild(child) {
      const reverse = child._serialize(this._id, child._parentKey, this._doc);
      for (const [key, value] of this._map)
        value === child && this._map.delete(key);
      child._detach();
      return {
        modified: {
          node: this,
          type: "LiveMap",
          updates: {
            [child._parentKey]: {
              type: "delete"
            }
          }
        },
        reverse
      };
    }
    _toSerializedCrdt() {
      var _a;
      return {
        type: CrdtType.MAP,
        parentId: (_a = this._parent) === null || _a === void 0 ? void 0 : _a._id,
        parentKey: this._parentKey
      };
    }
    get(key) {
      const value = this._map.get(key);
      if (value != null)
        return selfOrRegisterValue(value);
    }
    set(key, value) {
      const oldValue = this._map.get(key);
      oldValue && oldValue._detach();
      const item = selfOrRegister(value);
      if (item._setParentLink(this, key), this._map.set(key, item), this._doc && this._id) {
        const id = this._doc.generateId();
        item._attach(id, this._doc);
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(this._id, {
          node: this,
          type: "LiveMap",
          updates: {
            [key]: {
              type: "update"
            }
          }
        }), this._doc.dispatch(item._serialize(this._id, key, this._doc), oldValue ? oldValue._serialize(this._id, key) : [{
          type: OpCode.DELETE_CRDT,
          id
        }], storageUpdates);
      }
    }
    get size() {
      return this._map.size;
    }
    has(key) {
      return this._map.has(key);
    }
    delete(key) {
      const item = this._map.get(key);
      if (item == null)
        return false;
      if (item._detach(), this._map.delete(key), this._doc && item._id) {
        const storageUpdates = /* @__PURE__ */ new Map();
        storageUpdates.set(this._id, {
          node: this,
          type: "LiveMap",
          updates: {
            [key]: {
              type: "delete"
            }
          }
        }), this._doc.dispatch([{
          type: OpCode.DELETE_CRDT,
          id: item._id,
          opId: this._doc.generateOpId()
        }], item._serialize(this._id, key), storageUpdates);
      }
      return true;
    }
    entries() {
      const innerIterator = this._map.entries();
      return {
        [Symbol.iterator]: function() {
          return this;
        },
        next() {
          const iteratorValue = innerIterator.next();
          if (iteratorValue.done)
            return {
              done: true,
              value: void 0
            };
          return {
            value: [iteratorValue.value[0], selfOrRegisterValue(iteratorValue.value[1])]
          };
        }
      };
    }
    [Symbol.iterator]() {
      return this.entries();
    }
    keys() {
      return this._map.keys();
    }
    values() {
      const innerIterator = this._map.values();
      return {
        [Symbol.iterator]: function() {
          return this;
        },
        next() {
          const iteratorValue = innerIterator.next();
          return iteratorValue.done ? {
            done: true,
            value: void 0
          } : {
            value: selfOrRegisterValue(iteratorValue.value)
          };
        }
      };
    }
    forEach(callback) {
      for (const entry of this)
        callback(entry[1], entry[0], this);
    }
  };
  function remove(array, item) {
    for (let i = 0; i < array.length; i++)
      if (array[i] === item) {
        array.splice(i, 1);
        break;
      }
  }
  function compact(items) {
    return items.filter((item) => item != null);
  }
  function creationOpToLiveStructure(op) {
    switch (op.type) {
      case OpCode.CREATE_REGISTER:
        return new LiveRegister(op.data);
      case OpCode.CREATE_OBJECT:
        return new LiveObject(op.data);
      case OpCode.CREATE_MAP:
        return new LiveMap();
      case OpCode.CREATE_LIST:
        return new LiveList2();
    }
  }
  function isSameNodeOrChildOf(node, parent) {
    return node === parent || !!node._parent && isSameNodeOrChildOf(node._parent, parent);
  }
  function deserialize(entry, parentToChildren, doc) {
    switch (entry[1].type) {
      case CrdtType.OBJECT:
        return LiveObject._deserialize(entry, parentToChildren, doc);
      case CrdtType.LIST:
        return LiveList2._deserialize(entry, parentToChildren, doc);
      case CrdtType.MAP:
        return LiveMap._deserialize(entry, parentToChildren, doc);
      case CrdtType.REGISTER:
        return LiveRegister._deserialize(entry, parentToChildren, doc);
      default:
        throw new Error("Unexpected CRDT type");
    }
  }
  function isCrdt(obj) {
    return obj instanceof LiveObject || obj instanceof LiveMap || obj instanceof LiveList2 || obj instanceof LiveRegister;
  }
  function selfOrRegisterValue(obj) {
    return obj instanceof LiveRegister ? obj.data : obj;
  }
  function selfOrRegister(obj) {
    if (obj instanceof LiveObject || obj instanceof LiveMap || obj instanceof LiveList2)
      return obj;
    if (obj instanceof LiveRegister)
      throw new Error("Internal error. LiveRegister should not be created from selfOrRegister");
    return new LiveRegister(obj);
  }
  function getTreesDiffOperations(currentItems, newItems) {
    const ops = [];
    return currentItems.forEach((_, id) => {
      newItems.get(id) || ops.push({
        type: OpCode.DELETE_CRDT,
        id
      });
    }), newItems.forEach((crdt, id) => {
      const currentCrdt = currentItems.get(id);
      if (currentCrdt)
        crdt.type === CrdtType.OBJECT && JSON.stringify(crdt.data) !== JSON.stringify(currentCrdt.data) && ops.push({
          type: OpCode.UPDATE_OBJECT,
          id,
          data: crdt.data
        }), crdt.parentKey !== currentCrdt.parentKey && ops.push({
          type: OpCode.SET_PARENT_KEY,
          id,
          parentKey: crdt.parentKey
        });
      else
        switch (crdt.type) {
          case CrdtType.REGISTER:
            ops.push({
              type: OpCode.CREATE_REGISTER,
              id,
              parentId: crdt.parentId,
              parentKey: crdt.parentKey,
              data: crdt.data
            });
            break;
          case CrdtType.LIST:
            ops.push({
              type: OpCode.CREATE_LIST,
              id,
              parentId: crdt.parentId,
              parentKey: crdt.parentKey
            });
            break;
          case CrdtType.OBJECT:
            ops.push({
              type: OpCode.CREATE_OBJECT,
              id,
              parentId: crdt.parentId,
              parentKey: crdt.parentKey,
              data: crdt.data
            });
            break;
          case CrdtType.MAP:
            ops.push({
              type: OpCode.CREATE_MAP,
              id,
              parentId: crdt.parentId,
              parentKey: crdt.parentKey
            });
        }
    }), ops;
  }
  function mergeStorageUpdates(first, second) {
    return first ? first.type === "LiveObject" && second.type === "LiveObject" ? function(first2, second2) {
      const updates = first2.updates;
      for (const [key, value] of entries(second2.updates))
        updates[key] = value;
      return Object.assign(Object.assign({}, second2), {
        updates
      });
    }(first, second) : first.type === "LiveMap" && second.type === "LiveMap" ? function(first2, second2) {
      const updates = first2.updates;
      for (const [key, value] of entries(second2.updates))
        updates[key] = value;
      return Object.assign(Object.assign({}, second2), {
        updates
      });
    }(first, second) : first.type === "LiveList" && second.type === "LiveList" ? function(first2, second2) {
      const updates = first2.updates;
      return Object.assign(Object.assign({}, second2), {
        updates: updates.concat(second2.updates)
      });
    }(first, second) : second : second;
  }
  function isTokenValid(token) {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3)
      return false;
    const data = parseJson(atob(tokenParts[1]));
    if (data === void 0 || !isJsonObject(data) || typeof data.exp != "number")
      return false;
    return !(Date.now() / 1e3 > data.exp - 300);
  }
  function entries(obj) {
    return Object.entries(obj);
  }
  var LiveObject = class extends AbstractCrdt {
    constructor(obj = {}) {
      super(), this._propToLastUpdate = /* @__PURE__ */ new Map();
      for (const key in obj) {
        const value = obj[key];
        value instanceof AbstractCrdt && value._setParentLink(this, key);
      }
      this._map = new Map(Object.entries(obj));
    }
    _serialize(parentId, parentKey, doc, intent) {
      if (this._id == null)
        throw new Error("Cannot serialize item is not attached");
      const ops = [], op = {
        id: this._id,
        opId: doc == null ? void 0 : doc.generateOpId(),
        intent,
        type: OpCode.CREATE_OBJECT,
        parentId,
        parentKey,
        data: {}
      };
      ops.push(op);
      for (const [key, value] of this._map)
        value instanceof AbstractCrdt ? ops.push(...value._serialize(this._id, key, doc)) : op.data[key] = value;
      return ops;
    }
    static _deserialize([id, item], parentToChildren, doc) {
      if (item.type !== CrdtType.OBJECT)
        throw new Error(`Tried to deserialize a record but item type is "${item.type}"`);
      const liveObj = new LiveObject(item.data);
      return liveObj._attach(id, doc), this._deserializeChildren(liveObj, parentToChildren, doc);
    }
    static _deserializeChildren(liveObj, parentToChildren, doc) {
      const children = parentToChildren.get(liveObj._id);
      if (children == null)
        return liveObj;
      for (const entry of children) {
        const crdt = entry[1];
        if (crdt.parentKey == null)
          throw new Error("Tried to deserialize a crdt but it does not have a parentKey and is not the root");
        const child = deserialize(entry, parentToChildren, doc);
        child._setParentLink(liveObj, crdt.parentKey), liveObj._map.set(crdt.parentKey, child);
      }
      return liveObj;
    }
    _attach(id, doc) {
      super._attach(id, doc);
      for (const [_key, value] of this._map)
        value instanceof AbstractCrdt && value._attach(doc.generateId(), doc);
    }
    _attachChild(op, isLocal) {
      if (this._doc == null)
        throw new Error("Can't attach child if doc is not present");
      const { id, parentKey, opId } = op, key = parentKey, child = creationOpToLiveStructure(op);
      if (this._doc.getItem(id) !== void 0)
        return this._propToLastUpdate.get(key) === opId && this._propToLastUpdate.delete(key), {
          modified: false
        };
      if (isLocal)
        this._propToLastUpdate.set(key, opId);
      else if (this._propToLastUpdate.get(key) !== void 0)
        return this._propToLastUpdate.get(key) === opId ? (this._propToLastUpdate.delete(key), {
          modified: false
        }) : {
          modified: false
        };
      const previousValue = this._map.get(key);
      let reverse;
      return isCrdt(previousValue) ? (reverse = previousValue._serialize(this._id, key), previousValue._detach()) : reverse = previousValue === void 0 ? [{
        type: OpCode.DELETE_OBJECT_KEY,
        id: this._id,
        key
      }] : [{
        type: OpCode.UPDATE_OBJECT,
        id: this._id,
        data: {
          [key]: previousValue
        }
      }], this._map.set(key, child), child._setParentLink(this, key), child._attach(id, this._doc), {
        reverse,
        modified: {
          node: this,
          type: "LiveObject",
          updates: {
            [key]: {
              type: "update"
            }
          }
        }
      };
    }
    _detachChild(child) {
      if (child) {
        const reverse = child._serialize(this._id, child._parentKey, this._doc);
        for (const [key, value] of this._map)
          value === child && this._map.delete(key);
        child._detach();
        return {
          modified: {
            node: this,
            type: "LiveObject",
            updates: {
              [child._parentKey]: {
                type: "delete"
              }
            }
          },
          reverse
        };
      }
      return {
        modified: false
      };
    }
    _detachChildren() {
      for (const [key, value] of this._map)
        this._map.delete(key), value._detach();
    }
    _detach() {
      super._detach();
      for (const value of this._map.values())
        isCrdt(value) && value._detach();
    }
    _apply(op, isLocal) {
      return op.type === OpCode.UPDATE_OBJECT ? this._applyUpdate(op, isLocal) : op.type === OpCode.DELETE_OBJECT_KEY ? this._applyDeleteObjectKey(op) : super._apply(op, isLocal);
    }
    _toSerializedCrdt() {
      var _a;
      const data = {};
      for (const [key, value] of this._map)
        value instanceof AbstractCrdt == false && (data[key] = value);
      return {
        type: CrdtType.OBJECT,
        parentId: (_a = this._parent) === null || _a === void 0 ? void 0 : _a._id,
        parentKey: this._parentKey,
        data
      };
    }
    _applyUpdate(op, isLocal) {
      let isModified = false;
      const reverse = [], reverseUpdate = {
        type: OpCode.UPDATE_OBJECT,
        id: this._id,
        data: {}
      };
      reverse.push(reverseUpdate);
      for (const key in op.data) {
        const oldValue = this._map.get(key);
        oldValue instanceof AbstractCrdt ? (reverse.push(...oldValue._serialize(this._id, key)), oldValue._detach()) : oldValue !== void 0 ? reverseUpdate.data[key] = oldValue : oldValue === void 0 && reverse.push({
          type: OpCode.DELETE_OBJECT_KEY,
          id: this._id,
          key
        });
      }
      const updateDelta = {};
      for (const key in op.data) {
        if (isLocal)
          this._propToLastUpdate.set(key, op.opId);
        else {
          if (this._propToLastUpdate.get(key) != null) {
            if (this._propToLastUpdate.get(key) === op.opId) {
              this._propToLastUpdate.delete(key);
              continue;
            }
            continue;
          }
          isModified = true;
        }
        const oldValue = this._map.get(key);
        isCrdt(oldValue) && oldValue._detach(), isModified = true, updateDelta[key] = {
          type: "update"
        }, this._map.set(key, op.data[key]);
      }
      return Object.keys(reverseUpdate.data).length !== 0 && reverse.unshift(reverseUpdate), isModified ? {
        modified: {
          node: this,
          type: "LiveObject",
          updates: updateDelta
        },
        reverse
      } : {
        modified: false
      };
    }
    _applyDeleteObjectKey(op) {
      const key = op.key;
      if (this._map.has(key) === false)
        return {
          modified: false
        };
      if (this._propToLastUpdate.get(key) !== void 0)
        return {
          modified: false
        };
      const oldValue = this._map.get(key);
      let reverse = [];
      return isCrdt(oldValue) ? (reverse = oldValue._serialize(this._id, op.key), oldValue._detach()) : oldValue !== void 0 && (reverse = [{
        type: OpCode.UPDATE_OBJECT,
        id: this._id,
        data: {
          [key]: oldValue
        }
      }]), this._map.delete(key), {
        modified: {
          node: this,
          type: "LiveObject",
          updates: {
            [op.key]: {
              type: "delete"
            }
          }
        },
        reverse
      };
    }
    toObject() {
      return function(iterable) {
        const obj = {};
        for (const [key, val] of iterable)
          obj[key] = val;
        return obj;
      }(this._map);
    }
    set(key, value) {
      this.update({
        [key]: value
      });
    }
    get(key) {
      return this._map.get(key);
    }
    delete(key) {
      const keyAsString = key, oldValue = this._map.get(keyAsString);
      if (oldValue === void 0)
        return;
      if (this._doc == null || this._id == null)
        return oldValue instanceof AbstractCrdt && oldValue._detach(), void this._map.delete(keyAsString);
      let reverse;
      oldValue instanceof AbstractCrdt ? (oldValue._detach(), reverse = oldValue._serialize(this._id, keyAsString)) : reverse = [{
        type: OpCode.UPDATE_OBJECT,
        data: {
          [keyAsString]: oldValue
        },
        id: this._id
      }], this._map.delete(keyAsString);
      const storageUpdates = /* @__PURE__ */ new Map();
      storageUpdates.set(this._id, {
        node: this,
        type: "LiveObject",
        updates: {
          [key]: {
            type: "delete"
          }
        }
      }), this._doc.dispatch([{
        type: OpCode.DELETE_OBJECT_KEY,
        key: keyAsString,
        id: this._id,
        opId: this._doc.generateOpId()
      }], reverse, storageUpdates);
    }
    update(overrides) {
      if (this._doc == null || this._id == null) {
        for (const key in overrides) {
          const oldValue = this._map.get(key);
          oldValue instanceof AbstractCrdt && oldValue._detach();
          const newValue = overrides[key];
          newValue instanceof AbstractCrdt && newValue._setParentLink(this, key), this._map.set(key, newValue);
        }
        return;
      }
      const ops = [], reverseOps = [], opId = this._doc.generateOpId(), updatedProps = {}, reverseUpdateOp = {
        id: this._id,
        type: OpCode.UPDATE_OBJECT,
        data: {}
      }, updateDelta = {};
      for (const key in overrides) {
        const oldValue = this._map.get(key);
        oldValue instanceof AbstractCrdt ? (reverseOps.push(...oldValue._serialize(this._id, key)), oldValue._detach()) : oldValue === void 0 ? reverseOps.push({
          type: OpCode.DELETE_OBJECT_KEY,
          id: this._id,
          key
        }) : reverseUpdateOp.data[key] = oldValue;
        const newValue = overrides[key];
        if (newValue instanceof AbstractCrdt) {
          newValue._setParentLink(this, key), newValue._attach(this._doc.generateId(), this._doc);
          const newAttachChildOps = newValue._serialize(this._id, key, this._doc), createCrdtOp = newAttachChildOps.find((op) => op.parentId === this._id);
          createCrdtOp && this._propToLastUpdate.set(key, createCrdtOp.opId), ops.push(...newAttachChildOps);
        } else
          updatedProps[key] = newValue, this._propToLastUpdate.set(key, opId);
        this._map.set(key, newValue), updateDelta[key] = {
          type: "update"
        };
      }
      Object.keys(reverseUpdateOp.data).length !== 0 && reverseOps.unshift(reverseUpdateOp), Object.keys(updatedProps).length !== 0 && ops.unshift({
        opId,
        id: this._id,
        type: OpCode.UPDATE_OBJECT,
        data: updatedProps
      });
      const storageUpdates = /* @__PURE__ */ new Map();
      storageUpdates.set(this._id, {
        node: this,
        type: "LiveObject",
        updates: updateDelta
      }), this._doc.dispatch(ops, reverseOps, storageUpdates);
    }
  };

  // node_modules/@liveblocks/client/index.mjs
  var BACKOFF_RETRY_DELAYS = [250, 500, 1e3, 2e3, 4e3, 8e3, 1e4];
  var BACKOFF_RETRY_DELAYS_SLOW = [2e3, 3e4, 6e4, 3e5];
  function isValidRoomEventType(value) {
    return value === "my-presence" || value === "others" || value === "event" || value === "error" || value === "connection";
  }
  function makeOthers(userMap) {
    const users = Object.values(userMap).map((user) => function(s, e) {
      var t = {};
      for (var p in s)
        Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0 && (t[p] = s[p]);
      if (s != null && typeof Object.getOwnPropertySymbols == "function") {
        var i = 0;
        for (p = Object.getOwnPropertySymbols(s); i < p.length; i++)
          e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]) && (t[p[i]] = s[p[i]]);
      }
      return t;
    }(user, ["_hasReceivedInitialPresence"]));
    return {
      get count() {
        return users.length;
      },
      [Symbol.iterator]: () => users[Symbol.iterator](),
      map: (callback) => users.map(callback),
      toArray: () => users
    };
  }
  function makeStateMachine(state, context, mockedEffects) {
    const effects = mockedEffects || {
      authenticate(auth, createWebSocket) {
        const token = state.token;
        if (!token || !isTokenValid(token))
          return auth(context.roomId).then(({ token: token2 }) => {
            if (state.connection.state !== "authenticating")
              return;
            authenticationSuccess(parseToken(token2), createWebSocket(token2)), state.token = token2;
          }).catch((er) => function(error) {
            console.error("Call to authentication endpoint failed", error);
            state.token = null, updateConnection({
              state: "unavailable"
            }), state.numberOfRetry++, state.timeoutHandles.reconnect = effects.scheduleReconnect(getRetryDelay());
          }(er));
        authenticationSuccess(parseToken(token), createWebSocket(token));
      },
      send(messageOrMessages) {
        if (state.socket == null)
          throw new Error("Can't send message if socket is null");
        state.socket.send(JSON.stringify(messageOrMessages));
      },
      delayFlush: (delay) => setTimeout(tryFlushing, delay),
      startHeartbeatInterval: () => setInterval(heartbeat, 3e4),
      schedulePongTimeout: () => setTimeout(pongTimeout, 2e3),
      scheduleReconnect: (delay) => setTimeout(connect, delay)
    };
    function genericSubscribe(callback) {
      return state.listeners.storage.push(callback), () => remove(state.listeners.storage, callback);
    }
    function createOrUpdateRootFromMessage(message) {
      if (message.items.length === 0)
        throw new Error("Internal error: cannot load storage without items");
      state.root ? function(items) {
        if (!state.root)
          return;
        const currentItems = /* @__PURE__ */ new Map();
        state.items.forEach((liveCrdt, id) => {
          currentItems.set(id, liveCrdt._toSerializedCrdt());
        });
        const ops = getTreesDiffOperations(currentItems, new Map(items));
        notify(apply(ops, false).updates);
      }(message.items) : state.root = function(items) {
        const [root, parentToChildren] = function(items2) {
          const parentToChildren2 = /* @__PURE__ */ new Map();
          let root2 = null;
          for (const tuple of items2) {
            const parentId = tuple[1].parentId;
            if (parentId == null)
              root2 = tuple;
            else {
              const children = parentToChildren2.get(parentId);
              children != null ? children.push(tuple) : parentToChildren2.set(parentId, [tuple]);
            }
          }
          if (root2 == null)
            throw new Error("Root can't be null");
          return [root2, parentToChildren2];
        }(items);
        return LiveObject._deserialize(root, parentToChildren, {
          getItem,
          addItem,
          deleteItem,
          generateId,
          generateOpId,
          dispatch: storageDispatch,
          roomId: context.roomId
        });
      }(message.items);
      for (const key in state.defaultStorageRoot)
        state.root.get(key) == null && state.root.set(key, state.defaultStorageRoot[key]);
    }
    function addItem(id, item) {
      state.items.set(id, item);
    }
    function deleteItem(id) {
      state.items.delete(id);
    }
    function getItem(id) {
      return state.items.get(id);
    }
    function addToUndoStack(historyItem) {
      state.undoStack.length >= 50 && state.undoStack.shift(), state.isHistoryPaused ? state.pausedHistory.unshift(...historyItem) : state.undoStack.push(historyItem);
    }
    function storageDispatch(ops, reverse, storageUpdates) {
      state.isBatching ? (state.batch.ops.push(...ops), storageUpdates.forEach((value, key) => {
        state.batch.updates.storageUpdates.set(key, mergeStorageUpdates(state.batch.updates.storageUpdates.get(key), value));
      }), state.batch.reverseOps.push(...reverse)) : (addToUndoStack(reverse), state.redoStack = [], dispatch(ops), notify({
        storageUpdates
      }));
    }
    function notify({ storageUpdates = /* @__PURE__ */ new Map(), presence = false, others: otherEvents = [] }) {
      if (otherEvents.length > 0) {
        state.others = makeOthers(state.users);
        for (const event of otherEvents)
          for (const listener of state.listeners.others)
            listener(state.others, event);
      }
      if (presence)
        for (const listener of state.listeners["my-presence"])
          listener(state.me);
      if (storageUpdates.size > 0)
        for (const subscriber of state.listeners.storage)
          subscriber(Array.from(storageUpdates.values()));
    }
    function getConnectionId() {
      if (state.connection.state === "open" || state.connection.state === "connecting")
        return state.connection.id;
      if (state.lastConnectionId !== null)
        return state.lastConnectionId;
      throw new Error("Internal. Tried to get connection id but connection was never open");
    }
    function generateId() {
      return `${getConnectionId()}:${state.clock++}`;
    }
    function generateOpId() {
      return `${getConnectionId()}:${state.opClock++}`;
    }
    function apply(item, isLocal) {
      var _a;
      const result = {
        reverse: [],
        updates: {
          storageUpdates: /* @__PURE__ */ new Map(),
          presence: false
        }
      }, createdNodeIds = /* @__PURE__ */ new Set();
      for (const op of item)
        if (op.type === "presence") {
          const reverse = {
            type: "presence",
            data: {}
          };
          for (const key in op.data)
            reverse.data[key] = state.me[key];
          if (state.me = Object.assign(Object.assign({}, state.me), op.data), state.buffer.presence == null)
            state.buffer.presence = op.data;
          else
            for (const key in op.data)
              state.buffer.presence[key] = op.data[key];
          result.reverse.unshift(reverse), result.updates.presence = true;
        } else {
          isLocal && !op.opId && (op.opId = generateOpId());
          const applyOpResult = applyOp(op, isLocal);
          if (applyOpResult.modified) {
            const parentId = (_a = applyOpResult.modified.node._parent) === null || _a === void 0 ? void 0 : _a._id;
            createdNodeIds.has(parentId) || (result.updates.storageUpdates.set(applyOpResult.modified.node._id, mergeStorageUpdates(result.updates.storageUpdates.get(applyOpResult.modified.node._id), applyOpResult.modified)), result.reverse.unshift(...applyOpResult.reverse)), op.type !== OpCode.CREATE_LIST && op.type !== OpCode.CREATE_MAP && op.type !== OpCode.CREATE_OBJECT || createdNodeIds.add(applyOpResult.modified.node._id);
          }
        }
      return result;
    }
    function applyOp(op, isLocal) {
      switch (op.opId && state.offlineOperations.delete(op.opId), op.type) {
        case OpCode.DELETE_OBJECT_KEY:
        case OpCode.UPDATE_OBJECT:
        case OpCode.DELETE_CRDT: {
          const item = state.items.get(op.id);
          return item == null ? {
            modified: false
          } : item._apply(op, isLocal);
        }
        case OpCode.SET_PARENT_KEY: {
          const item = state.items.get(op.id);
          if (item == null)
            return {
              modified: false
            };
          if (item._parent instanceof LiveList2) {
            const previousKey = item._parentKey;
            return previousKey === op.parentKey ? {
              modified: false
            } : item._parent._setChildKey(op.parentKey, item, previousKey);
          }
          return {
            modified: false
          };
        }
        case OpCode.CREATE_OBJECT:
        case OpCode.CREATE_LIST:
        case OpCode.CREATE_MAP:
        case OpCode.CREATE_REGISTER: {
          const parent = state.items.get(op.parentId);
          return parent == null ? {
            modified: false
          } : parent._attachChild(op, isLocal);
        }
      }
    }
    function connect() {
      if (state.connection.state !== "closed" && state.connection.state !== "unavailable")
        return null;
      const auth = function(authentication, fetchPolyfill) {
        if (authentication.type === "public") {
          if (typeof window == "undefined" && fetchPolyfill == null)
            throw new Error("To use Liveblocks client in a non-dom environment with a publicApiKey, you need to provide a fetch polyfill.");
          return (room2) => fetchAuthEndpoint(fetchPolyfill || fetch, authentication.url, {
            room: room2,
            publicApiKey: authentication.publicApiKey
          });
        }
        if (authentication.type === "private") {
          if (typeof window == "undefined" && fetchPolyfill == null)
            throw new Error("To use Liveblocks client in a non-dom environment with a url as auth endpoint, you need to provide a fetch polyfill.");
          return (room2) => fetchAuthEndpoint(fetchPolyfill || fetch, authentication.url, {
            room: room2
          });
        }
        if (authentication.type === "custom")
          return authentication.callback;
        throw new Error("Internal error. Unexpected authentication type");
      }(context.authentication, context.fetchPolyfill), createWebSocket = function(liveblocksServer, WebSocketPolyfill) {
        if (typeof window == "undefined" && WebSocketPolyfill == null)
          throw new Error("To use Liveblocks client in a non-dom environment, you need to provide a WebSocket polyfill.");
        const ws = WebSocketPolyfill || WebSocket;
        return (token) => new ws(`${liveblocksServer}/?token=${token}`);
      }(context.liveblocksServer, context.WebSocketPolyfill);
      updateConnection({
        state: "authenticating"
      }), effects.authenticate(auth, createWebSocket);
    }
    function authenticationSuccess(token, socket) {
      socket.addEventListener("message", onMessage), socket.addEventListener("open", onOpen), socket.addEventListener("close", onClose), socket.addEventListener("error", onError), updateConnection({
        state: "connecting",
        id: token.actor,
        userInfo: token.info,
        userId: token.id
      }), state.idFactory = function(connectionId) {
        let count = 0;
        return () => `${connectionId}:${count++}`;
      }(token.actor), state.socket = socket;
    }
    function onUpdatePresenceMessage(message) {
      const user = state.users[message.actor];
      if (message.targetActor !== void 0 || user == null || user._hasReceivedInitialPresence)
        return state.users[message.actor] = user == null ? {
          connectionId: message.actor,
          presence: message.data,
          _hasReceivedInitialPresence: true
        } : {
          id: user.id,
          info: user.info,
          connectionId: message.actor,
          presence: Object.assign(Object.assign({}, user.presence), message.data),
          _hasReceivedInitialPresence: true
        }, {
          type: "update",
          updates: message.data,
          user: state.users[message.actor]
        };
    }
    function onUserLeftMessage(message) {
      const userLeftMessage = message, user = state.users[userLeftMessage.actor];
      return user ? (delete state.users[userLeftMessage.actor], {
        type: "leave",
        user
      }) : null;
    }
    function onRoomStateMessage(message) {
      const newUsers = {};
      for (const key in message.users) {
        const connectionId = Number.parseInt(key), user = message.users[key];
        newUsers[connectionId] = {
          connectionId,
          info: user.info,
          id: user.id
        };
      }
      return state.users = newUsers, {
        type: "reset"
      };
    }
    function onEvent(message) {
      for (const listener of state.listeners.event)
        listener({
          connectionId: message.actor,
          event: message.event
        });
    }
    function onUserJoinedMessage(message) {
      return state.users[message.actor] = {
        connectionId: message.actor,
        info: message.info,
        id: message.id,
        _hasReceivedInitialPresence: true
      }, state.me && (state.buffer.messages.push({
        type: ClientMsgCode.UPDATE_PRESENCE,
        data: state.me,
        targetActor: message.actor
      }), tryFlushing()), {
        type: "enter",
        user: state.users[message.actor]
      };
    }
    function parseServerMessage(data) {
      return isJsonObject(data) ? data : null;
    }
    function onMessage(event) {
      if (event.data === "pong")
        return void clearTimeout(state.timeoutHandles.pongTimeout);
      const messages = function(text2) {
        const data = parseJson(text2);
        return data === void 0 ? null : isJsonArray(data) ? compact(data.map((item) => parseServerMessage(item))) : compact([parseServerMessage(data)]);
      }(event.data);
      if (messages === null || messages.length === 0)
        return;
      const updates = {
        storageUpdates: /* @__PURE__ */ new Map(),
        others: []
      };
      for (const message of messages)
        switch (message.type) {
          case ServerMsgCode.USER_JOINED:
            updates.others.push(onUserJoinedMessage(message));
            break;
          case ServerMsgCode.UPDATE_PRESENCE: {
            const othersPresenceUpdate = onUpdatePresenceMessage(message);
            othersPresenceUpdate && updates.others.push(othersPresenceUpdate);
            break;
          }
          case ServerMsgCode.BROADCASTED_EVENT:
            onEvent(message);
            break;
          case ServerMsgCode.USER_LEFT: {
            const event2 = onUserLeftMessage(message);
            event2 && updates.others.push(event2);
            break;
          }
          case ServerMsgCode.ROOM_STATE:
            updates.others.push(onRoomStateMessage(message));
            break;
          case ServerMsgCode.INITIAL_STORAGE_STATE: {
            const offlineOps = new Map(state.offlineOperations);
            createOrUpdateRootFromMessage(message), applyAndSendOfflineOps(offlineOps), _getInitialStateResolver == null || _getInitialStateResolver();
            break;
          }
          case ServerMsgCode.UPDATE_STORAGE:
            apply(message.ops, false).updates.storageUpdates.forEach((value, key) => {
              updates.storageUpdates.set(key, mergeStorageUpdates(updates.storageUpdates.get(key), value));
            });
            break;
        }
      notify(updates);
    }
    function onClose(event) {
      if (state.socket = null, clearTimeout(state.timeoutHandles.pongTimeout), clearInterval(state.intervalHandles.heartbeat), state.timeoutHandles.flush && clearTimeout(state.timeoutHandles.flush), clearTimeout(state.timeoutHandles.reconnect), state.users = {}, notify({
        others: [{
          type: "reset"
        }]
      }), event.code >= 4e3 && event.code <= 4100) {
        updateConnection({
          state: "failed"
        });
        const error = new LiveblocksError(event.reason, event.code);
        for (const listener of state.listeners.error)
          listener(error);
        const delay = getRetryDelay(true);
        state.numberOfRetry++, console.error(`Connection to Liveblocks websocket server closed. Reason: ${error.message} (code: ${error.code}). Retrying in ${delay}ms.`), updateConnection({
          state: "unavailable"
        }), state.timeoutHandles.reconnect = effects.scheduleReconnect(delay);
      } else if (event.code === WebsocketCloseCodes.CLOSE_WITHOUT_RETRY)
        updateConnection({
          state: "closed"
        });
      else {
        const delay = getRetryDelay();
        state.numberOfRetry++, console.warn(`Connection to Liveblocks websocket server closed (code: ${event.code}). Retrying in ${delay}ms.`), updateConnection({
          state: "unavailable"
        }), state.timeoutHandles.reconnect = effects.scheduleReconnect(delay);
      }
    }
    function updateConnection(connection) {
      state.connection = connection;
      for (const listener of state.listeners.connection)
        listener(connection.state);
    }
    function getRetryDelay(slow = false) {
      return slow ? BACKOFF_RETRY_DELAYS_SLOW[state.numberOfRetry < BACKOFF_RETRY_DELAYS_SLOW.length ? state.numberOfRetry : BACKOFF_RETRY_DELAYS_SLOW.length - 1] : BACKOFF_RETRY_DELAYS[state.numberOfRetry < BACKOFF_RETRY_DELAYS.length ? state.numberOfRetry : BACKOFF_RETRY_DELAYS.length - 1];
    }
    function onError() {
    }
    function onOpen() {
      clearInterval(state.intervalHandles.heartbeat), state.intervalHandles.heartbeat = effects.startHeartbeatInterval(), state.connection.state === "connecting" && (updateConnection(Object.assign(Object.assign({}, state.connection), {
        state: "open"
      })), state.numberOfRetry = 0, state.lastConnectionId !== void 0 && (state.buffer.presence = state.me, tryFlushing()), state.lastConnectionId = state.connection.id, state.root && state.buffer.messages.push({
        type: ClientMsgCode.FETCH_STORAGE
      }), tryFlushing());
    }
    function heartbeat() {
      state.socket != null && (clearTimeout(state.timeoutHandles.pongTimeout), state.timeoutHandles.pongTimeout = effects.schedulePongTimeout(), state.socket.readyState === state.socket.OPEN && state.socket.send("ping"));
    }
    function pongTimeout() {
      reconnect();
    }
    function reconnect() {
      state.socket && (state.socket.removeEventListener("open", onOpen), state.socket.removeEventListener("message", onMessage), state.socket.removeEventListener("close", onClose), state.socket.removeEventListener("error", onError), state.socket.close(), state.socket = null), updateConnection({
        state: "unavailable"
      }), clearTimeout(state.timeoutHandles.pongTimeout), state.timeoutHandles.flush && clearTimeout(state.timeoutHandles.flush), clearTimeout(state.timeoutHandles.reconnect), clearInterval(state.intervalHandles.heartbeat), connect();
    }
    function applyAndSendOfflineOps(offlineOps) {
      if (offlineOps.size === 0)
        return;
      const messages = [], ops = Array.from(offlineOps.values()), result = apply(ops, true);
      messages.push({
        type: ClientMsgCode.UPDATE_STORAGE,
        ops
      }), notify(result.updates), effects.send(messages);
    }
    function tryFlushing() {
      const storageOps = state.buffer.storageOperations;
      if (storageOps.length > 0 && storageOps.forEach((op) => {
        state.offlineOperations.set(op.opId, op);
      }), state.socket == null || state.socket.readyState !== state.socket.OPEN)
        return void (state.buffer.storageOperations = []);
      const now = Date.now();
      if (now - state.lastFlushTime > context.throttleDelay) {
        const messages = function(state2) {
          const messages2 = [];
          state2.buffer.presence && messages2.push({
            type: ClientMsgCode.UPDATE_PRESENCE,
            data: state2.buffer.presence
          });
          for (const event of state2.buffer.messages)
            messages2.push(event);
          state2.buffer.storageOperations.length > 0 && messages2.push({
            type: ClientMsgCode.UPDATE_STORAGE,
            ops: state2.buffer.storageOperations
          });
          return messages2;
        }(state);
        if (messages.length === 0)
          return;
        effects.send(messages), state.buffer = {
          messages: [],
          storageOperations: [],
          presence: null
        }, state.lastFlushTime = now;
      } else
        state.timeoutHandles.flush != null && clearTimeout(state.timeoutHandles.flush), state.timeoutHandles.flush = effects.delayFlush(context.throttleDelay - (now - state.lastFlushTime));
    }
    function getPresence() {
      return state.me;
    }
    function dispatch(ops) {
      state.buffer.storageOperations.push(...ops), tryFlushing();
    }
    let _getInitialStatePromise = null, _getInitialStateResolver = null;
    return {
      onClose,
      onMessage,
      authenticationSuccess,
      heartbeat,
      onNavigatorOnline: function() {
        state.connection.state === "unavailable" && reconnect();
      },
      simulateSocketClose: function() {
        state.socket && state.socket.close();
      },
      simulateSendCloseEvent: function(event) {
        state.socket && onClose(event);
      },
      onVisibilityChange: function(visibilityState) {
        visibilityState === "visible" && state.connection.state === "open" && heartbeat();
      },
      getUndoStack: () => state.undoStack,
      getItemsCount: () => state.items.size,
      connect,
      disconnect: function() {
        state.socket && (state.socket.removeEventListener("open", onOpen), state.socket.removeEventListener("message", onMessage), state.socket.removeEventListener("close", onClose), state.socket.removeEventListener("error", onError), state.socket.close(), state.socket = null), updateConnection({
          state: "closed"
        }), state.timeoutHandles.flush && clearTimeout(state.timeoutHandles.flush), clearTimeout(state.timeoutHandles.reconnect), clearTimeout(state.timeoutHandles.pongTimeout), clearInterval(state.intervalHandles.heartbeat), state.users = {}, notify({
          others: [{
            type: "reset"
          }]
        }), function() {
          for (const key in state.listeners)
            state.listeners[key] = [];
        }();
      },
      subscribe: function(firstParam, listener, options) {
        if (firstParam instanceof AbstractCrdt)
          return function(crdt, innerCallback, options2) {
            return genericSubscribe((updates) => {
              const relatedUpdates = [];
              for (const update of updates)
                (options2 == null ? void 0 : options2.isDeep) && isSameNodeOrChildOf(update.node, crdt) ? relatedUpdates.push(update) : update.node._id === crdt._id && innerCallback(update.node);
              (options2 == null ? void 0 : options2.isDeep) && relatedUpdates.length > 0 && innerCallback(relatedUpdates);
            });
          }(firstParam, listener, options);
        if (typeof firstParam == "function")
          return genericSubscribe(firstParam);
        if (!isValidRoomEventType(firstParam))
          throw new Error(`"${firstParam}" is not a valid event name`);
        return state.listeners[firstParam].push(listener), () => {
          const callbacks = state.listeners[firstParam];
          remove(callbacks, listener);
        };
      },
      unsubscribe: function(event, callback) {
        if (console.warn("unsubscribe is depreacted and will be removed in a future version.\nuse the callback returned by subscribe instead.\nSee v0.13 release notes for more information.\n"), !isValidRoomEventType(event))
          throw new Error(`"${event}" is not a valid event name`);
        const callbacks = state.listeners[event];
        remove(callbacks, callback);
      },
      updatePresence: function(overrides, options) {
        const oldValues = {};
        state.buffer.presence == null && (state.buffer.presence = {});
        for (const key in overrides)
          state.buffer.presence[key] = overrides[key], oldValues[key] = state.me[key];
        state.me = Object.assign(Object.assign({}, state.me), overrides), state.isBatching ? ((options == null ? void 0 : options.addToHistory) && state.batch.reverseOps.push({
          type: "presence",
          data: oldValues
        }), state.batch.updates.presence = true) : (tryFlushing(), (options == null ? void 0 : options.addToHistory) && addToUndoStack([{
          type: "presence",
          data: oldValues
        }]), notify({
          presence: true
        }));
      },
      broadcastEvent: function(event, options = {
        shouldQueueEventIfNotReady: false
      }) {
        state.socket == null && options.shouldQueueEventIfNotReady == 0 || (state.buffer.messages.push({
          type: ClientMsgCode.BROADCAST_EVENT,
          event
        }), tryFlushing());
      },
      batch: function(callback) {
        if (state.isBatching)
          throw new Error("batch should not be called during a batch");
        state.isBatching = true;
        try {
          callback();
        } finally {
          state.isBatching = false, state.batch.reverseOps.length > 0 && addToUndoStack(state.batch.reverseOps), state.batch.ops.length > 0 && (state.redoStack = []), state.batch.ops.length > 0 && dispatch(state.batch.ops), notify(state.batch.updates), state.batch = {
            ops: [],
            reverseOps: [],
            updates: {
              others: [],
              storageUpdates: /* @__PURE__ */ new Map(),
              presence: false
            }
          }, tryFlushing();
        }
      },
      undo: function() {
        if (state.isBatching)
          throw new Error("undo is not allowed during a batch");
        const historyItem = state.undoStack.pop();
        if (historyItem == null)
          return;
        state.isHistoryPaused = false;
        const result = apply(historyItem, true);
        notify(result.updates), state.redoStack.push(result.reverse);
        for (const op of historyItem)
          op.type !== "presence" && state.buffer.storageOperations.push(op);
        tryFlushing();
      },
      redo: function() {
        if (state.isBatching)
          throw new Error("redo is not allowed during a batch");
        const historyItem = state.redoStack.pop();
        if (historyItem == null)
          return;
        state.isHistoryPaused = false;
        const result = apply(historyItem, true);
        notify(result.updates), state.undoStack.push(result.reverse);
        for (const op of historyItem)
          op.type !== "presence" && state.buffer.storageOperations.push(op);
        tryFlushing();
      },
      pauseHistory: function() {
        state.pausedHistory = [], state.isHistoryPaused = true;
      },
      resumeHistory: function() {
        state.isHistoryPaused = false, state.pausedHistory.length > 0 && addToUndoStack(state.pausedHistory), state.pausedHistory = [];
      },
      getStorage: function() {
        return state.root ? new Promise((resolve) => resolve({
          root: state.root
        })) : (_getInitialStatePromise == null && (state.buffer.messages.push({
          type: ClientMsgCode.FETCH_STORAGE
        }), tryFlushing(), _getInitialStatePromise = new Promise((resolve) => _getInitialStateResolver = resolve)), _getInitialStatePromise.then(() => ({
          root: state.root
        })));
      },
      selectors: {
        getConnectionState: function() {
          return state.connection.state;
        },
        getSelf: function() {
          return state.connection.state === "open" || state.connection.state === "connecting" ? {
            connectionId: state.connection.id,
            id: state.connection.userId,
            info: state.connection.userInfo,
            presence: getPresence()
          } : null;
        },
        getPresence,
        getOthers: function() {
          return state.others;
        }
      }
    };
  }
  function createRoom(options, context) {
    var _a, _b;
    const initialPresence = (_a = options.initialPresence) !== null && _a !== void 0 ? _a : options.defaultPresence, initialStorage = (_b = options.initialStorage) !== null && _b !== void 0 ? _b : options.defaultStorageRoot, machine = makeStateMachine(function(initialPresence2, initialStorage2) {
      return {
        connection: {
          state: "closed"
        },
        token: null,
        lastConnectionId: null,
        socket: null,
        listeners: {
          event: [],
          others: [],
          "my-presence": [],
          error: [],
          connection: [],
          storage: []
        },
        numberOfRetry: 0,
        lastFlushTime: 0,
        timeoutHandles: {
          flush: null,
          reconnect: 0,
          pongTimeout: 0
        },
        buffer: {
          presence: initialPresence2 == null ? {} : initialPresence2,
          messages: [],
          storageOperations: []
        },
        intervalHandles: {
          heartbeat: 0
        },
        me: initialPresence2 == null ? {} : initialPresence2,
        users: {},
        others: makeOthers({}),
        defaultStorageRoot: initialStorage2,
        idFactory: null,
        clock: 0,
        opClock: 0,
        items: /* @__PURE__ */ new Map(),
        root: void 0,
        undoStack: [],
        redoStack: [],
        isHistoryPaused: false,
        pausedHistory: [],
        isBatching: false,
        batch: {
          ops: [],
          updates: {
            storageUpdates: /* @__PURE__ */ new Map(),
            presence: false,
            others: []
          },
          reverseOps: []
        },
        offlineOperations: /* @__PURE__ */ new Map()
      };
    }(typeof initialPresence == "function" ? initialPresence(context.roomId) : initialPresence, typeof initialStorage == "function" ? initialStorage(context.roomId) : initialStorage), context), room2 = {
      id: context.roomId,
      getConnectionState: machine.selectors.getConnectionState,
      getSelf: machine.selectors.getSelf,
      subscribe: machine.subscribe,
      unsubscribe: machine.unsubscribe,
      getPresence: machine.selectors.getPresence,
      updatePresence: machine.updatePresence,
      getOthers: machine.selectors.getOthers,
      broadcastEvent: machine.broadcastEvent,
      getStorage: machine.getStorage,
      batch: machine.batch,
      history: {
        undo: machine.undo,
        redo: machine.redo,
        pause: machine.pauseHistory,
        resume: machine.resumeHistory
      },
      internalDevTools: {
        closeWebsocket: machine.simulateSocketClose,
        sendCloseEvent: machine.simulateSendCloseEvent
      }
    };
    return {
      connect: machine.connect,
      disconnect: machine.disconnect,
      onNavigatorOnline: machine.onNavigatorOnline,
      onVisibilityChange: machine.onVisibilityChange,
      room: room2
    };
  }
  var LiveblocksError = class extends Error {
    constructor(message, code) {
      super(message), this.code = code;
    }
  };
  function parseToken(token) {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3)
      throw new Error("Authentication error. Liveblocks could not parse the response of your authentication endpoint");
    const data = parseJson(atob(tokenParts[1]));
    if (data !== void 0 && isJsonObject(data) && typeof data.actor == "number" && (data.id === void 0 || typeof data.id == "string"))
      return {
        actor: data.actor,
        id: data.id,
        info: data.info
      };
    throw new Error("Authentication error. Liveblocks could not parse the response of your authentication endpoint");
  }
  function fetchAuthEndpoint(fetch2, endpoint, body) {
    return fetch2(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }).then((res) => {
      if (!res.ok)
        throw new AuthenticationError(`Expected a status 200 but got ${res.status} when doing a POST request on "${endpoint}"`);
      return res.json().catch((er) => {
        throw new AuthenticationError(`Expected a json when doing a POST request on "${endpoint}". ${er}`);
      });
    }).then((authResponse) => {
      if (typeof authResponse.token != "string")
        throw new AuthenticationError(`Expected a json with a string token when doing a POST request on "${endpoint}", but got ${JSON.stringify(authResponse)}`);
      return authResponse;
    });
  }
  var AuthenticationError = class extends Error {
    constructor(message) {
      super(message);
    }
  };
  function createClient(options) {
    const clientOptions = options, throttleDelay = function(options2) {
      if (options2.throttle === void 0)
        return 100;
      if (typeof options2.throttle != "number" || options2.throttle < 80 || options2.throttle > 1e3)
        throw new Error("throttle should be a number between 80 and 1000.");
      return options2.throttle;
    }(options), rooms = /* @__PURE__ */ new Map();
    return typeof window != "undefined" && window.addEventListener("online", () => {
      for (const [, room2] of rooms)
        room2.onNavigatorOnline();
    }), typeof document != "undefined" && document.addEventListener("visibilitychange", () => {
      for (const [, room2] of rooms)
        room2.onVisibilityChange(document.visibilityState);
    }), {
      getRoom: function(roomId2) {
        const internalRoom = rooms.get(roomId2);
        return internalRoom ? internalRoom.room : null;
      },
      enter: function(roomId2, options2 = {}) {
        let internalRoom = rooms.get(roomId2);
        return internalRoom || (deprecateIf(options2.defaultPresence, "Argument `defaultPresence` will be removed in @liveblocks/client 0.18. Please use `initialPresence` instead. For more info, see https://bit.ly/3Niy5aP", "defaultPresence"), deprecateIf(options2.defaultStorageRoot, "Argument `defaultStorageRoot` will be removed in @liveblocks/client 0.18. Please use `initialStorage` instead. For more info, see https://bit.ly/3Niy5aP", "defaultStorageRoot"), internalRoom = createRoom({
          initialPresence: options2.initialPresence,
          initialStorage: options2.initialStorage,
          defaultPresence: options2.defaultPresence,
          defaultStorageRoot: options2.defaultStorageRoot
        }, {
          roomId: roomId2,
          throttleDelay,
          WebSocketPolyfill: clientOptions.WebSocketPolyfill,
          fetchPolyfill: clientOptions.fetchPolyfill,
          liveblocksServer: clientOptions.liveblocksServer || "wss://liveblocks.net/v5",
          authentication: prepareAuthentication(clientOptions)
        }), rooms.set(roomId2, internalRoom), options2.DO_NOT_USE_withoutConnecting || internalRoom.connect()), internalRoom.room;
      },
      leave: function(roomId2) {
        const room2 = rooms.get(roomId2);
        room2 && (room2.disconnect(), rooms.delete(roomId2));
      }
    };
  }
  function prepareAuthentication(clientOptions) {
    if (typeof clientOptions.publicApiKey == "string")
      return {
        type: "public",
        publicApiKey: clientOptions.publicApiKey,
        url: clientOptions.publicAuthorizeEndpoint || "https://liveblocks.io/api/public/authorize"
      };
    if (typeof clientOptions.authEndpoint == "string")
      return {
        type: "private",
        url: clientOptions.authEndpoint
      };
    if (typeof clientOptions.authEndpoint == "function")
      return {
        type: "custom",
        callback: clientOptions.authEndpoint
      };
    throw new Error("Invalid Liveblocks client options. For more information: https://liveblocks.io/docs/api-reference/liveblocks-client#createClient");
  }

  // app.js
  var PUBLIC_KEY = "pk_live_eU3a0XPigqcID3l5AbrZW3Ak";
  var roomId = "javascript-live-cursors";
  overrideApiKeyAndRoomId();
  if (!/^pk_(live|test)/.test(PUBLIC_KEY)) {
    console.warn(`Replace "${PUBLIC_KEY}" by your public key from https://liveblocks.io/dashboard/apikeys.
Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/javascript-live-cursors#getting-started.`);
  }
  var client = createClient({
    publicApiKey: PUBLIC_KEY
  });
  var room = client.enter(roomId, { cursor: null });
  var cursorsContainer = document.getElementById("cursors-container");
  var text = document.getElementById("text");
  room.subscribe("my-presence", (presence) => {
    const cursor = presence?.cursor ?? null;
    text.innerHTML = cursor ? `${cursor.x} \xD7 ${cursor.y}` : "Move your cursor to broadcast its position to other people in the room.";
  });
  room.subscribe("others", (others, event) => {
    switch (event.type) {
      case "reset": {
        cursorsContainer.innerHTML = "";
        for (const user of others.toArray()) {
          updateCursor(user);
        }
        break;
      }
      case "leave": {
        deleteCursor(event.user);
        break;
      }
      case "enter":
      case "update": {
        updateCursor(event.user);
        break;
      }
    }
  });
  document.addEventListener("pointermove", (e) => {
    room.updatePresence({
      cursor: { x: Math.round(e.clientX), y: Math.round(e.clientY) }
    });
  });
  document.addEventListener("pointerleave", (e) => {
    room.updatePresence({ cursor: null });
  });
  var COLORS = ["#DC2626", "#D97706", "#059669", "#7C3AED", "#DB2777"];
  function updateCursor(user) {
    const cursor = getCursorOrCreate(user.connectionId);
    if (user.presence?.cursor) {
      cursor.style.transform = `translateX(${user.presence.cursor.x}px) translateY(${user.presence.cursor.y}px)`;
      cursor.style.opacity = "1";
    } else {
      cursor.style.opacity = "0";
    }
  }
  function getCursorOrCreate(connectionId) {
    let cursor = document.getElementById(`cursor-${connectionId}`);
    if (cursor == null) {
      cursor = document.getElementById("cursor-template").cloneNode(true);
      cursor.id = `cursor-${connectionId}`;
      cursor.style.fill = COLORS[connectionId % COLORS.length];
      cursorsContainer.appendChild(cursor);
    }
    return cursor;
  }
  function deleteCursor(user) {
    const cursor = document.getElementById(`cursor-${user.connectionId}`);
    if (cursor) {
      cursor.parentNode.removeChild(cursor);
    }
  }
  function overrideApiKeyAndRoomId() {
    const query = new URLSearchParams(window?.location?.search);
    const apiKey = query.get("apiKey");
    const roomIdSuffix = query.get("roomId");
    if (apiKey) {
      PUBLIC_KEY = apiKey;
    }
    if (roomIdSuffix) {
      roomId = `${roomId}-${roomIdSuffix}`;
    }
  }
  async function run() {
    let PUBLIC_KEY2 = "pk_live_eU3a0XPigqcID3l5AbrZW3Ak";
    let roomId2 = "javascript-todo-list";
    overrideApiKeyAndRoomId2();
    if (!/^pk_(live|test)/.test(PUBLIC_KEY2)) {
      console.warn(`Replace "${PUBLIC_KEY2}" by your public key from https://liveblocks.io/dashboard/apikeys.
Learn more: https://github.com/liveblocks/liveblocks/tree/main/examples/javascript-todo-list#getting-started.`);
    }
    const client2 = createClient({
      publicApiKey: PUBLIC_KEY2
    });
    const room2 = client2.enter(roomId2);
    const whoIsHere = document.getElementById("who_is_here");
    const todoInput = document.getElementById("todo_input");
    const someoneIsTyping = document.getElementById("someone_is_typing");
    const todosContainer = document.getElementById("todos_container");
    room2.subscribe("others", (others) => {
      whoIsHere.innerHTML = `There are ${others.count} other users online`;
      someoneIsTyping.innerHTML = others.toArray().some((user) => user.presence?.isTyping) ? "Someone is typing..." : "";
    });
    const { root } = await room2.getStorage();
    let todos = root.get("todos");
    if (todos == null) {
      todos = new LiveList();
      root.set("todos", todos);
    }
    todoInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        room2.updatePresence({ isTyping: false });
        todos.push({ text: todoInput.value });
        todoInput.value = "";
      } else {
        room2.updatePresence({ isTyping: true });
      }
    });
    todoInput.addEventListener("blur", () => {
      room2.updatePresence({ isTyping: false });
    });
    function render() {
      todosContainer.innerHTML = "";
      for (let i = 0; i < todos.length; i++) {
        const todo = todos.get(i);
        const todoContainer = document.createElement("div");
        todoContainer.classList.add("todo_container");
        const todoText = document.createElement("div");
        todoText.classList.add("todo");
        todoText.innerHTML = todo.text;
        todoContainer.appendChild(todoText);
        const deleteButton = document.createElement("button");
        deleteButton.classList.add("delete_button");
        deleteButton.innerHTML = "\u2715";
        deleteButton.addEventListener("click", () => {
          todos.delete(i);
        });
        todoContainer.appendChild(deleteButton);
        todosContainer.appendChild(todoContainer);
      }
    }
    room2.subscribe(todos, () => {
      render();
    });
    function overrideApiKeyAndRoomId2() {
      const query = new URLSearchParams(window?.location?.search);
      const apiKey = query.get("apiKey");
      const roomIdSuffix = query.get("roomId");
      if (apiKey) {
        PUBLIC_KEY2 = apiKey;
      }
      if (roomIdSuffix) {
        roomId2 = `${roomId2}-${roomIdSuffix}`;
      }
    }
    render();
  }
  run();
})();
