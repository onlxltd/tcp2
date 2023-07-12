"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketError = void 0;
var SocketError;
(function (SocketError) {
    SocketError["DidClose"] = "EDIDCLOSE";
    SocketError["ConnectionRefused"] = "ECONNREFUSED";
    SocketError["ConnectionTimeout"] = "ETIMEDOUT";
    SocketError["RequestTimeout"] = "EREQUESTTIMEOUT";
})(SocketError || (exports.SocketError = SocketError = {}));
exports.default = SocketError;
