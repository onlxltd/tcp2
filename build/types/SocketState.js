"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocketState = void 0;
var SocketState;
(function (SocketState) {
    SocketState["Connected"] = "connected";
    SocketState["Connecting"] = "connecting";
    SocketState["Offline"] = "offline";
})(SocketState || (exports.SocketState = SocketState = {}));
exports.default = SocketState;
