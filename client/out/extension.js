"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const path = require("path");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const epilog_runScript_1 = require("./commands/epilog_runScript");
const language_ids_js_1 = require("../../common/out/language_ids.js");
let client;
function activate(context) {
    // The server is implemented in node
    const serverModule = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    // The debug options for the server
    // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
    let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions = {
        run: {
            module: serverModule,
            transport: node_1.TransportKind.ipc
        },
        debug: {
            module: serverModule,
            transport: node_1.TransportKind.ipc,
            options: debugOptions
        }
    };
    // Options to control the language client
    const clientOptions = {
        // Register the server for epilog documents
        documentSelector: [
            { scheme: 'file', language: language_ids_js_1.EPILOG_LANGUAGE_ID },
            { scheme: 'file', language: language_ids_js_1.EPILOG_RULESET_LANGUAGE_ID },
            { scheme: 'file', language: language_ids_js_1.EPILOG_DATASET_LANGUAGE_ID },
            { scheme: 'file', language: language_ids_js_1.EPILOG_METADATA_LANGUAGE_ID },
            { scheme: 'file', language: language_ids_js_1.EPILOG_SCRIPT_LANGUAGE_ID }
        ],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: vscode_1.workspace.createFileSystemWatcher('**/.clientrc')
        },
        outputChannel: vscode.window.createOutputChannel('Epilog Language Server')
    };
    // Create the language client and start the client.
    client = new node_1.LanguageClient('epilogLanguageServer', 'Epilog Language Server', serverOptions, clientOptions);
    let disposable = vscode.commands.registerCommand('epilog.runScript', () => {
        (0, epilog_runScript_1.epilogCmd_runScript)(client);
    });
    context.subscriptions.push(disposable);
    // Start the client. This will also launch the server
    client.start();
    console.log("client started");
}
exports.activate = activate;
function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map