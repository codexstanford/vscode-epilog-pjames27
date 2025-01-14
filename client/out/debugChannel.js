"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToDebugChannel = exports.setDebugChannel = void 0;
const vscode = require("vscode");
let debugChannel = null;
function getDebugChannel() {
    if (debugChannel === null) {
        debugChannel = vscode.window.createOutputChannel('Epilog Language Server - Debug');
    }
    return debugChannel;
}
function setDebugChannel(channel) {
    debugChannel = channel;
}
exports.setDebugChannel = setDebugChannel;
function writeToDebugChannel(message) {
    getDebugChannel().appendLine(message);
}
exports.writeToDebugChannel = writeToDebugChannel;
//# sourceMappingURL=debugChannel.js.map