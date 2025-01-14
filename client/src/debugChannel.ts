import * as vscode from 'vscode';

let debugChannel: vscode.OutputChannel | null = null;

function getDebugChannel(): vscode.OutputChannel {
    if (debugChannel === null) {
        debugChannel = vscode.window.createOutputChannel('Epilog Language Server - Debug');
    }
    return debugChannel;
}

export function setDebugChannel(channel: vscode.OutputChannel) {
    debugChannel = channel;
}

export function writeToDebugChannel(message: string) {
    getDebugChannel().appendLine(message);
}
