"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _Socket__host, _Socket__port, _Socket__config, _Socket__socket, _Socket__reconnect, _Socket__connectTimeout, _Socket__socketState;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketState = exports.Socket = void 0;
const net_1 = require("net");
const events_1 = require("events");
const SocketError_1 = __importDefault(require("./types/SocketError"));
const SocketState_1 = __importDefault(require("./types/SocketState"));
exports.SocketState = SocketState_1.default;
class Socket extends events_1.EventEmitter {
    constructor(host, port, config = undefined) {
        super();
        _Socket__host.set(this, void 0);
        _Socket__port.set(this, void 0);
        _Socket__config.set(this, void 0);
        _Socket__socket.set(this, void 0);
        _Socket__reconnect.set(this, void 0);
        _Socket__connectTimeout.set(this, void 0);
        _Socket__socketState.set(this, SocketState_1.default.Offline);
        __classPrivateFieldSet(this, _Socket__host, host, "f");
        __classPrivateFieldSet(this, _Socket__port, port, "f");
        __classPrivateFieldSet(this, _Socket__config, config, "f");
        __classPrivateFieldSet(this, _Socket__socket, new net_1.Socket(), "f");
        __classPrivateFieldGet(this, _Socket__socket, "f").on('connect', () => {
            if (__classPrivateFieldGet(this, _Socket__connectTimeout, "f") !== undefined)
                clearTimeout(__classPrivateFieldGet(this, _Socket__connectTimeout, "f"));
            this.updateConnectedState(SocketState_1.default.Connected);
            this.emit('connect');
        });
        __classPrivateFieldGet(this, _Socket__socket, "f").on('data', (data) => this.emit('data', data));
        __classPrivateFieldGet(this, _Socket__socket, "f").on('error', ({ code }) => {
            switch (code) {
                case SocketError_1.default.ConnectionRefused:
                    this.handleReconnect(code);
                    break;
                case SocketError_1.default.ConnectionTimeout:
                    console.log(code);
                    break;
            }
        });
        __classPrivateFieldGet(this, _Socket__socket, "f").on('close', (hasError) => {
            if (hasError)
                return;
            this.handleReconnect(SocketError_1.default.DidClose);
        });
        this.connect();
    }
    connect() {
        __classPrivateFieldSet(this, _Socket__connectTimeout, setTimeout(() => {
            __classPrivateFieldGet(this, _Socket__socket, "f").end();
            this.handleReconnect(SocketError_1.default.ConnectionTimeout);
        }, this.config.timeout), "f");
        __classPrivateFieldGet(this, _Socket__socket, "f").connect({ host: __classPrivateFieldGet(this, _Socket__host, "f"), port: __classPrivateFieldGet(this, _Socket__port, "f") });
    }
    write(data) {
        __classPrivateFieldGet(this, _Socket__socket, "f").write(data);
    }
    request(data, wait = 50) {
        return new Promise((resolve, reject) => {
            let timeout = setTimeout(() => {
                reject(new Error(SocketError_1.default.RequestTimeout));
            }, wait + 100);
            let chunks = [];
            let handlerWait;
            let handler = (data) => {
                if (timeout !== undefined)
                    clearTimeout(timeout);
                if (handlerWait !== undefined)
                    clearTimeout(handlerWait);
                chunks.push(data);
                handlerWait = setTimeout(() => {
                    __classPrivateFieldGet(this, _Socket__socket, "f").off('data', handler);
                    resolve(Buffer.concat(chunks));
                }, wait);
            };
            __classPrivateFieldGet(this, _Socket__socket, "f").on('data', handler);
            __classPrivateFieldGet(this, _Socket__socket, "f").write(data);
        });
    }
    close() {
        __classPrivateFieldGet(this, _Socket__socket, "f").end();
    }
    destroy() {
        __classPrivateFieldGet(this, _Socket__socket, "f").destroy();
    }
    get connected() {
        return __classPrivateFieldGet(this, _Socket__socketState, "f");
    }
    updateConnectedState(state) {
        if (__classPrivateFieldGet(this, _Socket__socketState, "f") == state)
            return;
        this.emit('state', state);
        __classPrivateFieldSet(this, _Socket__socketState, state, "f");
    }
    handleReconnect(code = undefined) {
        if (!this.config.reconnect) {
            this.updateConnectedState(SocketState_1.default.Offline);
            return this.emit('fail', code);
        }
        this.updateConnectedState(SocketState_1.default.Connecting);
        if (__classPrivateFieldGet(this, _Socket__reconnect, "f") !== undefined)
            return;
        __classPrivateFieldSet(this, _Socket__reconnect, setTimeout(() => {
            this.connect();
            __classPrivateFieldSet(this, _Socket__reconnect, undefined, "f");
        }, this.config.reconnectDelay), "f");
    }
    get config() {
        let defaultConfig = {
            timeout: 1000,
            reconnect: true,
            reconnectDelay: 2000
        };
        return __classPrivateFieldGet(this, _Socket__config, "f") !== undefined ? { ...defaultConfig, ...__classPrivateFieldGet(this, _Socket__config, "f") } : defaultConfig;
    }
}
exports.Socket = Socket;
_Socket__host = new WeakMap(), _Socket__port = new WeakMap(), _Socket__config = new WeakMap(), _Socket__socket = new WeakMap(), _Socket__reconnect = new WeakMap(), _Socket__connectTimeout = new WeakMap(), _Socket__socketState = new WeakMap();
exports.default = Socket;
